import {Record} from "./ObservableList";
import {Struct} from "../types/types";
import React, {ReactElement} from "react";
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

export default function RowFactory<T>(props: RowFactoryProps): ReactElement[] {
    const {
        row,
        rowIndex,
        columns,
        className,
        alternateRows,
    } = props;

    return columns.map((col, index) => (
        <CellFactory
            {...col.props}
            key={`${rowIndex}:${index}`}
            row={row}
            name={col.props.name}
            rowIndex={rowIndex}
            colIndex={index}
            className={joinCss(className, alternateRows && rowIndex % 2 > 0 ? styles.alternate : "")}
        />
    ));
}

RowFactory.defaultProps = {
    alternateRows: false,
}