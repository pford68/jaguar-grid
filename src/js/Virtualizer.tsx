import React, {ReactElement, RefObject, useEffect, useRef, useState} from "react";
import {Record} from "./ObservableList";
import {Struct} from "../types/types";
import styles from "./DataGrid.css";
import {Emitter, Observable} from "./Observable";
import {PageContext} from "./PageContext";

type Renderer = (data: Record<Struct>[]) => ReactElement[];

type VirtualizerProps<T extends Struct> = {
    data: Record<T>[],
    renderer: Renderer,
    pageSize: number,
    rowHeight: number,
    root?: HTMLElement | undefined | null,
    offset?: number,
    threshold?: number | number[],
}

export default function Virtualizer<T extends Struct>(props: VirtualizerProps<T>): ReactElement[] {
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
        <VirtualPage
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
Virtualizer.defaultProps = {
    threshold: 0,
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


type IntersectionResult = {
    visiblePages: Set<number>,
}

type PageProps<T extends Struct> = {
    data: Record<T>[],
    rowHeight: number,
    pageSize: number,
    renderer: Renderer,
    observer: IntersectionObserver,
    emitter: RefObject<Observable<IntersectionResult>>,
    index: number,
}

function VirtualPage<T extends Struct>(props: PageProps<T>): ReactElement {
    const {
        data,
        rowHeight,
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
                            {renderer(data)}
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