import React, {ReactElement} from "react";
import {Record} from "./ObservableList";
import {Struct} from "../types/types";
import CellFactory from "./cells/CellFactory";
import {joinCss} from "./util/utils";
import styles from "./DataGrid.css";

type RowFactoryProps = {
    row: Record<Struct>,
    rowIndex: number,
    alternateRows: boolean,
    columns: ReactElement[],
    className?: string,
}

export default function RowFactory(props: RowFactoryProps): ReactElement {
    const {
        row,
        rowIndex,
        columns,
        className,
        alternateRows,
    } = props;

    return (
        <div className={joinCss(styles.row, alternateRows && rowIndex % 2 !== 0 ? styles.alternate : "")}>
            {columns.map((col, index) => (
                <CellFactory
                    {...col.props}
                    key={`${rowIndex}:${index}`}
                    row={row}
                    name={col.props.name}
                    rowIndex={rowIndex}
                    colIndex={index}
                    className={className}
                />
            ))}
        </div>
    )
}

RowFactory.defaultProps = {
    alternateRows: false,
}