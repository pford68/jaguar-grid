import * as React from "react";
import {ReactElement} from "react";
import styles from "../DataGrid.css";

type ColumnResizerProps = {
   name: string,
};

export default function ColumnResizer(prop: ColumnResizerProps): ReactElement {
   return <div className={styles.columnResizer} />;
}