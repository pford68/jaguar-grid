import React, {ReactElement} from "react";
import styles from "../DataGrid.css";

type ColumnStyleProps = {
    type: "auto" | "equal",
    columns: ReactElement[],
}

export default function ColumnStyle(props: ColumnStyleProps) {
    const {type, columns} = props;

    switch(type) {
        case "equal":
            return rendererEqualStyle(columns.length);
        default:
            return renderAutoStyle(columns);
    }
}

function renderAutoStyle(columns: ReactElement[]): ReactElement {
    const widths = columns.map(col => {
        return col.props.width != null ? `${col.props.width}px` : "auto";
    })
    return (
        <style>
            {`
                  .${styles.grid} {
                     grid-template-columns: ${widths.join(" ")};
                  }
               `}
        </style>
    );
}

function rendererEqualStyle(columnCount: number): ReactElement {
    return (
        <style>
            {`
                   .${styles.grid} {
                      grid-template-columns: repeat(${columnCount}, 1fr);
                   }
                `}
        </style>
    )
}