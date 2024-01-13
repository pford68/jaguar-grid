import React, {ReactElement, DragEvent, RefObject, useEffect, useRef} from "react";
import styles from "../DataGrid.css";
import {Consumer} from "../../types/types";

type Resizable = {
   width?: number,
   start: number,
   onResize: Consumer<number>,
};

type ColumnResizerProps = {
   targetRef: RefObject<HTMLElement>,
   onResize: (delta: number) => void,
};

export default function ColumnResizer(props: ColumnResizerProps): ReactElement {
   const {targetRef, onResize} = props;

   const targetData = useRef<Resizable>({
      onResize,
      start: 0,
   });

   useEffect(() => {
      if (targetRef.current != null && targetData.current != null) {
         targetData.current.width = targetRef.current.getBoundingClientRect().width;
      }
   }, [targetRef.current]);


   return (
       <div
           className={styles.columnResizer}
           onDragStart={(e) => onDragStart(targetData.current, e)}
           onDragEnd={(e) => onDragEnd(targetData.current, e)}
           draggable={true}
       />
   );
}

function onDragStart(targetData: Resizable, e: DragEvent): void {
   targetData.start = e.clientX;
}

function onDragEnd(targetData: Resizable, e: DragEvent): void {
   if (targetData.width == null) return;
   const newWidth = targetData.width + (e.clientX - targetData.start);
   targetData.onResize(newWidth);
}