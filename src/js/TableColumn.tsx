import React, {ReactElement, useContext, useEffect, useRef, useState, DragEvent} from "react";
import {BiFunction, Command, Struct} from "../types/types";
import styles from "./DataGrid.css";
import {GridContext} from "./GridContext";
import {DataTypes} from "../types/types";
import {type ColumnConfigurableProps} from "./cells/CellFactory";
import SortButton from "./headers/SortButton";
import {MIN_COLUMN_WIDTH, SORT_DIRECTION_ASC, SORT_DIRECTION_DESC} from "./constants";
import ColumnResizer from "./headers/ColumnResizer";
import {joinCss} from "./util/utils";
import Pin from "./headers/Pin";
import usePushPin from "./headers/usePushPin";

type TableColumnState = {
    pushed: boolean,
    offset?: number,
}

/**
 * Extends ColumnConfigurableProps so that the CellFactory can be configured from the TableColumn.
 * @augments ColumnConfigurableProps
 *
 * @param T The data type of the data contained in the Record that supplies row data.
 */
export type TableColumnProps<T extends Struct> = {
    /**
     * Whether the column is sortable.
     * @default false
     */
    sortable: boolean,
    /**
     * Whether to render the column initially.
     * @default true
     */
    visible: boolean,
    /**
     * Whether the column is initially pinned.
     * @default false
     */
    sticky: boolean,
    /**
     * A custom sort function.
     * Use cases include values that are complex objects and sorting by multiple columns
     */
    comparator: BiFunction<unknown, unknown, number>,
    /**
     * The data type of the values in the column.
     * Must be one of the registered types or will revert to string.
     */
    type?: DataTypes,
    /** The header text. Defaults to the value of the name prop. */
    text?: string,
    /**
     * Used to customize the header
     * @todo
     */
    headerRenderer?: ReactElement,
    /**
     * For showing the full header text if abbreviated.
     * @todo
     */
    altText?: string,
    /**
     * Adds the column with a column group.
     * @todo
     */
    group?: string | string[],
    resizable?: boolean,
    /**
     * Handler for custom resize events.
     * @todo
     */
    onResize?: (colName: string, delta: number) => void,
    /** The HTML title attribute */
    title: boolean,
    contextMenu?: Command<T>[],
} & ColumnConfigurableProps<T>;


/**
 * Creates column headers and configures cells in its column.  This is the primary interface for
 * configuring cells.
 *
 * @param props {TableColumnProps}
 * @constructor
 */
export default function TableColumn<T extends Struct>(props: TableColumnProps<T>): ReactElement {
    const {
        text,
        name,
        sortable,
        resizable,
        wrap,
        title,
        sticky,
        type,
    } = props;

    const ref = useRef<HTMLDivElement>(null);
    const gridContext = useContext(GridContext);
    const initialState: TableColumnState = {
        pushed: sticky,
    }
    const [pin, setPin] = useState(initialState);
    const {
        gridDispatch,
        stickyHeaders,
        sortColumns,
    } = gridContext;
    const focusModel = gridContext.focusModel?.current;
    const selectionModel = gridContext.selectionModel?.current;
    const active = sortColumns?.[0] === name;
    let sortDirection = gridContext.sortDirection;


    useEffect(() => {
        if (pin.pushed) {
            usePushPin({
                el: ref.current,
                pushed: !pin.pushed,
                updater: setPin,
            });
        }
    }, [ref.current, gridContext.pinned]);


    useEffect(() => {
        const el = ref.current;
        if (el != null && pin.pushed) {
            gridDispatch?.({type: "pin", payload: {name, value: pin.offset}});
        } else if (el != null && !pin.pushed) {
            gridDispatch?.({type: "unpin", payload: {name}});
        }
    }, [
        pin.pushed,
        pin.offset,
        ref.current
    ]); // Must watch all of these.  Offsets was required for column 0 to pin at
        // the correct position when other columns were pinned first.


    const onSortClicked = () => {
        focusModel?.clear();
        selectionModel?.clearSelections();
        if (gridDispatch == null) return;
        if (sortColumns?.[0] !== name) {
            gridDispatch({type: "sort", payload: {name}});
        } else if (sortDirection === SORT_DIRECTION_ASC) {
            sortDirection = SORT_DIRECTION_DESC;
        } else {
            sortDirection = SORT_DIRECTION_ASC;
        }
        gridDispatch({
            type: "reverseSort",
            payload: {name, value: String(sortDirection)}
        });
    }

    const colIndex = gridContext.columnNames
        .findIndex(col => col === name);

    const handleResize = (delta: number) => {
        if (ref.current != null) {
            const width = ref.current.offsetWidth;
            let newWidth = width + delta;
            newWidth = newWidth < MIN_COLUMN_WIDTH ? MIN_COLUMN_WIDTH : newWidth;
            ref.current.style.width = `${newWidth}px`;
            gridContext.columnWidths.set(name, newWidth);
            gridDispatch?.({type: "update"});
        }
    }

    return  (
        <div
            ref={ref}
            onFocus={() => focusModel?.clear()}
            className={joinCss(
                styles.header,
                !wrap ? styles.nowrap : "",
                resizable ? styles.resizable : "",
                stickyHeaders ? styles.stickyHeaders : "",
                pin.pushed ? styles.stickyColumn : "",
                gridContext.pinned.size - 1 === colIndex ? styles.divider : "",
                type != null && styles[type] ? styles[type] : "",
            )}
            data-col-index={colIndex}
            onDragOver={onDragOver}
        >
            <div
                className={styles.title}
                onClick={sortable ? onSortClicked : undefined}
            >
                <span title={title ? text : undefined}>{text}</span>
                {sortable ? <SortButton active={active} sortDirection={sortDirection} /> : ""}
            </div>
            <Pin parentRef={ref} name={name} active={pin.pushed} updater={setPin}/>
            {resizable ? (
                <ColumnResizer
                    onResize={handleResize}
                    className={(ref.current?.offsetWidth ?? Number.POSITIVE_INFINITY) <= MIN_COLUMN_WIDTH
                        ? styles.tooSmall
                        : (ref.current?.offsetWidth ?? MIN_COLUMN_WIDTH) >= 300 ? styles.tooLarge : ""}
                />
            ) : ""}
        </div>
    );
}
TableColumn.defaultProps = {
    editable: false,
    readonly: false,
    value: undefined,
    visible: true,
    sortable: true,
    secondary: false,
    active: false,
    sticky: false,
    sortDirection: SORT_DIRECTION_ASC,
    altText: undefined,
    comparator: defaultComparator,
    precision: undefined,
    row: undefined,
    index: undefined,
    onResize: undefined,
    resizable: true,
    placeholder: "NULL",
    wrap: false,
    title: true,
};


/* ============================================ Private */
function defaultComparator(a: unknown, b: unknown) {
   if (typeof a === "number" && typeof b === "number") {
       return a -b;
   }
   return String(a).localeCompare(String(b));
}

function onDragOver(e: DragEvent): void {
    e.preventDefault();
}

