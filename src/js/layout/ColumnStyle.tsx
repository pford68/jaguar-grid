import React, {ReactElement, useContext, useEffect} from "react";
import styles from "../DataGrid.css";
import {GridContext, GridContextType} from "../GridContext";

type ColumnStyleProps = {
    type: "auto" | "equal",
    columns: ReactElement[],
    maxWidth?: number,
}

/**
 *
 * @param props
 * @constructor
 */
export default function ColumnStyle(props: ColumnStyleProps) {
    const {type, columns, maxWidth} = props;
    const gridContext = useContext(GridContext);

    useEffect(() => {
        console.log("width", gridContext.columnWidths)
        renderAutoStyle(columns, gridContext, maxWidth);
    }, [gridContext.columnWidths]);


    switch(type) {
        case "equal":
            return rendererEqualStyle(columns.length);
        default:
            return renderAutoStyle(columns, gridContext, maxWidth);
    }
}
ColumnStyle.defaultProps = {
    type: "auto",
}

function renderAutoStyle(columns: ReactElement[], ctx: GridContextType, maxWidth?: number): ReactElement {
    const widths = columns.map(col => {
        const {name, width: propWidth} = col.props;
        const width = propWidth ?? ctx.columnWidths.get(name);
        return width != null ? `${width}px` : "auto";
    })
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
            {maxWidth != null ? `.cell {max-width: ${maxWidth}px}` : ""}
        </style>
    );
}

function rendererEqualStyle(columnCount: number, maxWidth?: number): ReactElement {
    return (
        <style>
            {
               `.${styles.grid} {
                  grid-template-columns: repeat(${columnCount}, 1fr);
               }`
            }
            {
                `.${styles.row}, .${styles.page} {
                 grid-column: span ${columnCount};
              }`
            }
            {maxWidth != null ? `.cell {max-width: ${maxWidth}px}` : ""}
        </style>
    )
}