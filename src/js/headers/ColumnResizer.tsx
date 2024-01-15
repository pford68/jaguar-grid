import React, {ReactElement, DragEvent, RefObject, useEffect, useRef} from "react";
import styles from "../DataGrid.css";
import {Consumer} from "../../types/types";
import {joinCss} from "../util/utils";

type Resizable = {
   width?: number,
   start: number,
   onResize: Consumer<number>,
};

type ColumnResizerProps = {
   targetRef: RefObject<HTMLElement>,
   onResize: (delta: number) => void,
   className?: string,
};

export default function ColumnResizer(props: ColumnResizerProps): ReactElement {
   const {targetRef, onResize, className} = props;

   const targetData = useRef<Resizable>({
      onResize,
      start: 0,
   });

   useEffect(() => {
      if (targetRef.current != null && targetData.current != null) {
         targetData.current.width = targetRef.current.getBoundingClientRect().width;
      }
   }, [
      targetRef.current,
      targetRef.current?.offsetWidth,
   ]);


   return (
       <div
           className={joinCss(styles.columnResizer, className)}
           onDragStart={(e) => onDragStart(targetData.current, e)}
           onDragEnd={(e) => onDragEnd(targetData.current, e)}
           draggable={true}
       />
   );
}

function onDragStart(targetData: Resizable, e: DragEvent): void {
   e.dataTransfer.effectAllowed = "move";
   targetData.start = e.clientX;
}

function onDragEnd(targetData: Resizable, e: DragEvent): void {
   const delta = e.clientX - targetData.start;
   targetData.onResize(delta);
}
