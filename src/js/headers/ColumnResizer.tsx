import React, {
    ReactElement,
    DragEvent,
    useRef,
    useContext,
    ReactNode,
    useState,
    RefObject,
    MouseEvent,
    useEffect
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

    const onDragStart = (e: DragEvent): void => {
        e.dataTransfer.effectAllowed = "move";
        start.current = e.clientX;
        setActive(true);
        //hideDragImage(e, gridEl, ref);
    }

    const onDragEnd = (): void => {
        /*
         Safari reports an incorrect clientX from onDragEnd.
         Using the clientX captured in onDrag
         */
        const delta = end.current - start.current; // Safari reports an incorrect clientX from onDragEnd.
        //cleanup(gridEl);
        setActive(false);
        onResize(delta);
    }

    const onDrag = (e: DragEvent): void => {
        /*
           Safari reports an incorrect clientX from onDragEnd.
           Using the clientX captured in onDrag
         */
        end.current = e.clientX;
        if (edgeRef.current instanceof HTMLElement) {
            const offsetLeft = gridEl?.offsetParent != document.body ? gridEl?.parentElement?.offsetLeft ?? gridEl?.offsetLeft ?? 0 : 0;
            //console.log({scrollLeft: gridEl?.parentElement?.scrollLeft, offsetLeft, pageX: e.pageX, clientX: e.clientX})
            //const pageOffset = e.pageX - e.clientX;
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


const hideDragImage = (e: DragEvent, gridEl: HTMLElement | null | undefined, ref: RefObject<HTMLDivElement>) => {
    if (ref.current instanceof HTMLElement) {
        const clone = ref.current.cloneNode();
        if (clone instanceof HTMLElement) {
            gridEl?.appendChild(clone);
            clone.style.visibility = "hidden";
            clone.setAttribute("data-drag-image", "true");
            e.dataTransfer.setDragImage(clone, 0, 0);
        }
    }
}

const cleanup = (gridEl: HTMLElement | undefined | null) => {
    const dragImage = gridEl?.querySelector("[data-drag-image]");
    if (dragImage != null) {
        gridEl?.removeChild(dragImage);
    }
}
