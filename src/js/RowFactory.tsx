import React, {ReactElement, useContext} from "react";
import {Record} from "./ObservableList";
import {Struct} from "../types/types";
import CellFactory from "./cells/CellFactory";
import {joinCss} from "./util/utils";
import styles from "./DataGrid.css";
import {GridContext} from "./GridContext";

type RowFactoryProps = {
    row: Record<Struct>,
    rowIndex: number,
    className?: string,
}

export default function RowFactory(props: RowFactoryProps): ReactElement {
    const {
        row,
        rowIndex,
        className,
    } = props;

    const gridContext = useContext(GridContext);
    const {columns, alternateRows} = gridContext;

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