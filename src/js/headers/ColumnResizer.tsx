import React, {
    ReactElement,
    DragEvent as ReactDragEvent,
    useRef,
    useContext,
    ReactNode,
    useState,
    RefObject,
} from "react";
import styles from "../DataGrid.css";
import {joinCss} from "../util/utils";
import {GridContext} from "../GridContext";
import {createPortal} from "react-dom";


type ColumnResizerProps = {
    onResize: (delta: number) => void,
    className?: string,
};

export default function ColumnResizer(props: ColumnResizerProps): ReactElement {
    const {onResize, className} = props;
    const start = useRef<number>(0);
    const end = useRef<number>(0);
    const [active, setActive] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const edgeRef = useRef<HTMLDivElement>(null);
    const gridContext = useContext(GridContext);
    const gridEl = gridContext.gridRef?.current;
    const outsideDragEnd = useRef<number | null>(null);

    const onDragOutside = (e: DragEvent) => {
        outsideDragEnd.current = e.clientX;
    }

    const onDragStart = (e: ReactDragEvent): void => {
        e.dataTransfer.effectAllowed = "move";
        start.current = e.clientX;
        document.body.addEventListener("dragover", onDragOutside);
        setActive(true);
    }

    const onDragEnd = (): void => {
        document.body.removeEventListener("dragover", onDragOutside);
        // TODO: Maybe I should use outsideDragEnd all of the time, but I'm not sold yet.
        const endX = end.current > 0 || outsideDragEnd?.current == null ? end.current : outsideDragEnd.current;
        /*
         Safari reports an incorrect clientX from onDragEnd.
         Using the clientX captured in onDrag instead.
         */
        const delta = endX - start.current; // Safari reports an incorrect clientX from onDragEnd.
        setActive(false);
        onResize(delta);
    }

    const onDrag = (e: ReactDragEvent): void => {
        /*
           Safari reports an incorrect clientX from onDragEnd.
           Using the clientX captured in onDrag
         */
        end.current = e.clientX;
        if (edgeRef.current instanceof HTMLElement) {
            const offsetLeft = gridEl?.offsetParent != document.body ? gridEl?.parentElement?.offsetLeft ?? gridEl?.offsetLeft ?? 0 : 0;
            const notScrolled =  (gridEl?.offsetWidth ?? 0) < (gridEl?.parentElement?.offsetWidth ?? 0);
            edgeRef.current.style.left = notScrolled ? `${e.pageX - offsetLeft}px` :`${e.clientX + (gridEl?.parentElement?.scrollLeft ?? 0) - offsetLeft}px`;
        }
    }


    return (
        <>
            <div
                ref={ref}
                className={joinCss(styles.columnResizer, className)}
                onDragStart={onDragStart}
                onDrag={onDrag}
                onDragEnd={onDragEnd}
                draggable={true}
            />
            <Edge edgeRef={edgeRef} visible={active} />
        </>
    );
}


type EdgeProps = {
    visible: boolean;
    edgeRef: RefObject<HTMLDivElement>,
}

function Edge(props: EdgeProps): ReactNode {
    const gridContext = useContext(GridContext);
    const gridEl = gridContext.gridRef?.current;
    if (props.visible && gridEl?.offsetParent) {
        const height = Math.min(gridEl.offsetParent?.clientHeight, gridEl.offsetHeight);
        return createPortal((
            <div
                ref={props.edgeRef}
                className={styles.edge}
                style={{height: `${height}px`, visibility: "visible" }}
            />), gridEl);
    }
    return "";
}
