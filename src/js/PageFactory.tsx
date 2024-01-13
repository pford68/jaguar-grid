import React, {ReactElement, RefObject, useEffect, useRef, useState} from "react";
import {Record} from "./ObservableList";
import {Struct} from "../types/types";
import styles from "./DataGrid.css";
import {Emitter, Observable} from "./Observable";
import {PageContext} from "./PageContext";

export type PageData = {
    data: Record<Struct>[],
    pageIndex: number,
    pageSize: number,
};

type Renderer = (pageData: PageData) => ReactElement[];

type IntersectionResult = {
    visiblePages: Set<number>,
};

type PageFactoryProps<T extends Struct> = {
    data: Record<T>[],
    renderer: Renderer,
    pageSize: number,
    rowHeight: number,
    root?: HTMLElement | undefined | null,
    offset?: number,
    threshold?: number | number[],
};

/**
 *
 * @param props
 * @constructor
 */
export default function PageFactory<T extends Struct>(props: PageFactoryProps<T>): ReactElement[] {
    const {
        renderer,
        data,
        rowHeight,
        pageSize,
        root,
        offset,
        threshold,
    } = props;

    const visiblePages = useRef<Set<number>>(new Set([]));
    const emitter = useRef<Emitter<IntersectionResult>>(new Emitter());
    const observer = useRef(new IntersectionObserver(intersectionCallback.bind(null, emitter, visiblePages), {
        root,
        rootMargin: `${offset}px 0px`,
        threshold,
    }));

    const initBuckets = [];
    for (let i = 0; i < data.length; i += pageSize + 1) {
        initBuckets.push([i, i + pageSize]);
    }
    const buckets = useRef<number[][]>(initBuckets);

    return buckets.current?.map((bucket, index) => (
        <Page
            key={`${new Date().getTime()}:${index}`}
            data={data.slice(...bucket)}
            rowHeight={rowHeight}
            pageSize={pageSize}
            renderer={renderer}
            observer={observer.current}
            emitter={emitter}
            index={index}
        />
    ))
}
PageFactory.defaultProps = {
    threshold: 0,
}




type PageProps<T extends Struct> = {
    data: Record<T>[],
    rowHeight: number,
    pageSize: number,
    renderer: Renderer,
    observer: IntersectionObserver,
    emitter: RefObject<Observable<IntersectionResult>>,
    index: number,
};

/**
 *
 * @param props
 * @constructor
 */
function Page<T extends Struct>(props: PageProps<T>): ReactElement {
    const {
        data,
        rowHeight,
        pageSize,
        renderer,
        observer,
        index,
        emitter,
    } = props;
    const [visible, setVisible] = useState(false);
    const height = rowHeight * data.length;
    const ref =  useRef(null);

    useEffect(() => {
        const onIntersecting = (result: IntersectionResult | undefined):void => {
            setVisible(result?.visiblePages?.has(index) ?? false);
        }
        emitter.current?.on("intersected", onIntersecting);

        return () => {
            emitter.current?.off("intersected", onIntersecting);
        };
    }, [emitter.current]);

    useEffect(() => {
        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [observer, ref.current]);


    return (
        <PageContext.Provider value={{
            page: index,
        }}>
            {
                visible
                    ? (
                        <div
                            ref={ref}
                            className={styles.page}
                            style={{height: `${height}px`}}
                            data-page-index={index}
                        >
                            {renderer({data, pageIndex: index, pageSize})}
                        </div>
                    )
                    : (
                        <div
                            ref={ref}
                            className={styles.page}
                            style={{display: "block", height: `${height}px`, minHeight: `${height}px`}}
                            data-page-index={index}
                        />
                    )
            }
        </PageContext.Provider>
    );
}


function intersectionCallback(
    emitter: RefObject<Emitter<IntersectionResult>>,
    visiblePages: RefObject<Set<number>>,
    entries: IntersectionObserverEntry[]
) {
    entries.forEach(entry => {
        const el = entry.target;
        const index = el.getAttribute("data-page-index");
        if (entry.isIntersecting) {
            visiblePages.current?.add(Number(index));
        } else {
            visiblePages.current?.delete(Number(index));
        }
    });
    emitter.current?.emit("intersected",{visiblePages: visiblePages.current ?? new Set()});
}