import React, {ReactElement, useContext} from "react";
import styles from "../DataGrid.css";
import {GridContext} from "../GridContext";

type ColumnStyleProps = {
    type: "auto" | "equal",
    columns: ReactElement[],
    maxWidth?: number,
    minWidth?: number,
}

/**
 *
 * @param props
 * @constructor
 */
export default function ColumnStyle(props: ColumnStyleProps) {
    const gridContext = useContext(GridContext);
    const {
        type,
        columns,
        maxWidth,
        minWidth
    } = props;
    const widths = columns.map(col => {
        const {width, name} = col.props;
        const assignedWidth = gridContext.columnWidths.get(name) ?? width;
        return assignedWidth != null  ? `minmax(${minWidth}px, ${assignedWidth}px)` : (type === "equal" ? "1fr" : "auto");
    });

    return (
        <style>
            {
                `.${styles.grid} {
                 grid-template-columns: ${widths.join(" ")};
              }`
            }
            {
                `.${styles.row}, .${styles.page} {
                 grid-column: span ${columns.length};
              }`
            }
            {maxWidth != null ? `.cell {max-width: ${maxWidth}px; }` : ""}
            {`.header, .cell {min-width: ${minWidth}px; }`}
        </style>
    )
}
ColumnStyle.defaultProps = {
    type: "auto",
    minWidth: 32,
}
