import React, {ReactElement, DragEvent, useRef} from "react";
import styles from "../DataGrid.css";
import {joinCss} from "../util/utils";

type ColumnResizerProps = {
   onResize: (delta: number) => void,
   className?: string,
};

export default function ColumnResizer(props: ColumnResizerProps): ReactElement {
   const { onResize, className} = props;
   const start = useRef<number>(0);
   const end = useRef<number>(0);

  const onDragStart = (e: DragEvent): void => {
      e.dataTransfer.effectAllowed = "move";
      start.current = e.clientX;
   }

   const onDragEnd = (): void => {
      /*
       Safari reports an incorrect clientX from onDragEnd.
       Using the clientX captured in onDrag
       */
      const delta = end.current - start.current; // Safari reports an incorrect clientX from onDragEnd.
      onResize(delta);
   }

   const onDrag = (e: DragEvent): void => {
       /*
          Safari reports an incorrect clientX from onDragEnd.
          Using the clientX captured in onDrag
        */
      end.current = e.clientX;
   }

   return (
       <div
           className={joinCss(styles.columnResizer, className)}
           onDragStart={onDragStart}
           onDrag={onDrag}
           onDragEnd={onDragEnd}
           draggable={true}
       />
   );
}

