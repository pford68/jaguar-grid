import React, {ReactElement} from "react";
import styles from "../DataGrid.css";

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

    switch(type) {
        case "equal":
            return rendererEqualStyle(columns.length);
        default:
            return renderAutoStyle(columns, maxWidth);
    }
}
ColumnStyle.defaultProps = {
    type: "auto",
}

function renderAutoStyle(columns: ReactElement[], maxWidth?: number): ReactElement {
    const widths = columns.map(col => {
        return col.props.width != null ? `${col.props.width}px` : "auto";
    })
    return (
        <style>
            {
              `.${styles.grid} {
                 grid-template-columns: ${widths.join(" ")};
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
            {maxWidth != null ? `.cell {max-width: ${maxWidth}px}` : ""}
        </style>
    )
}