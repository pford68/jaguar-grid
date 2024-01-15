import React, {ReactElement, RefObject, useEffect, useRef, useState, useContext} from "react";
import {Record} from "./ObservableList";
import {Coordinates, Struct} from "../types/types";
import styles from "./DataGrid.css";
import {Emitter, Observable} from "./Observable";
import {PageContext} from "./PageContext";
import RowFactory from "./RowFactory";
import {GridContext} from "./GridContext";

type IntersectionResult = {
    visiblePages: Set<number>,
};

type PageFactoryProps<T extends Struct> = {
    data: Record<T>[],
    pageSize: number,
    rowHeight: number,
    root?: HTMLElement | undefined | null,
    offset?: number,
    threshold?: number | number[],
};

/**
 * Divides the dataset between "pages" and renders only the data for pages
 * currently visible in the viewport.  In other words, this component virtualizes
 * the datagrid.
 *
 * @param props
 * @constructor
 */
export default function PageFactory<T extends Struct>(props: PageFactoryProps<T>): ReactElement[] {
    const {
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
    for (let i = 0; i < data.length; i += pageSize) {
        initBuckets.push([i, i + pageSize]);
    }
    const buckets = useRef<number[][]>(initBuckets);

    return buckets.current?.map((bucket, index) => (
        <Page
            key={`${new Date().getTime()}:${index}`}
            rows={data.slice(...bucket)}
            rowHeight={rowHeight}
            pageSize={pageSize}
            observer={observer.current}
            emitter={emitter}
            pageIndex={index}
        />
    ));
}
PageFactory.defaultProps = {
    threshold: 0,
}




type PageProps<T extends Struct> = {
    rows: Record<T>[],
    rowHeight: number,
    pageSize: number,
    observer: IntersectionObserver,
    emitter: RefObject<Observable<IntersectionResult>>,
    pageIndex: number,
};

/**
 *
 * @param props
 * @constructor
 */
function Page<T extends Struct>(props: PageProps<T>): ReactElement {
    const {
        rows,
        rowHeight,
        pageSize,
        observer,
        pageIndex,
        emitter,
    } = props;
    const gridContext = useContext(GridContext);
    const selectionModel = gridContext.selectionModel?.current;
    const focusModel = gridContext.focusModel?.current;
    const [visible, setVisible] = useState(false);
    const height = rowHeight * rows.length;
    const ref =  useRef<HTMLDivElement>(null);
    const start = pageIndex * pageSize;
    const end = (start + rows.length);

    /*
     When focus jumps to a non-visible page, this scrolls the page into view,
     causing the page to intersect and fill with data.
    */
    useEffect(() => {
        const onFocusChanged = (coords: Coordinates | undefined) => {
            const {rowIndex} = coords ?? {};
            if (rowIndex != null && !visible && rowIndex >= start && rowIndex <= end) {
                ref.current?.scrollIntoView(false);
            }
        }

        focusModel?.on("focusChanged", onFocusChanged);

        return () => {
            focusModel?.off("focusChanged", onFocusChanged);
        }
    }, [visible]);


    useEffect(() => {
        const onIntersecting = (result: IntersectionResult | undefined):void => {
            setVisible(result?.visiblePages?.has(pageIndex) ?? false);
        }
        emitter.current?.on("intersected", onIntersecting);

        return () => {
            emitter.current?.off("intersected", onIntersecting);
        };
    }, [emitter.current]);


    /* IntersectionObserver */
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
            page: pageIndex,
            start,
            end,
        }}>
            {
                visible
                    ? (
                        <div
                            ref={ref}
                            className={styles.page}
                            style={{height: `${height}px`}}
                            data-page-index={pageIndex}
                        >
                            {rows.map((row, rowIndex) => (
                                <RowFactory
                                    key={rowIndex}
                                    rowIndex={start + rowIndex}
                                    row={row}
                                />
                            ))}
                        </div>
                    )
                    : (
                        <div
                            ref={ref}
                            className={styles.page}
                            style={{display: "block", height: `${height}px`, minHeight: `${height}px`}}
                            data-page-index={pageIndex}
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