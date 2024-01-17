import React, {ReactElement, KeyboardEvent, useReducer, useRef, useCallback, useEffect} from "react";
import PageFactory from "./PageFactory";
import ObservableList, {Record} from "./ObservableList";
import type {Command, Struct} from "../types/types";
import styles from "./DataGrid.css";
import {joinCss} from "./util/utils";
import {GridContext} from "./GridContext";
import FocusModel from "./FocusModel";
import SelectionModel from "./SelectionModel";
import {SORT_DIRECTION_ASC} from "./constants";
import ColumnStyle from "./layout/ColumnStyle";
import {CommandStack} from "./util/CommandStack";
import {useStorageClipboard} from "./clipboard/useStorageClipboard";
import TableColumn from "./TableColumn";
import TableFooter from "./TableFooter";


export type DataGridProps = {
    /**
     * The data to display in the grid.
     */
    data: ObservableList<Struct>,
    /**
     * TableColumns and TableFooters are allowed.
     */
    children: ReactElement | ReactElement[],
    /**
     * Whether to use alternate row colors.
     * @default false
     */
    alternateRows: boolean,
    stickyHeaders: boolean,
    /**
     * Whether a cell is allowed to display null or undefined.
     * If false, a placholer appears instead.
     *
     * @default false
     */
    nullable: boolean,
    /**
     * The height of a row (in pixels) in the grid.
     * @type number
     * @default 48
     */
    rowHeight: number,
    /**
     * The number of rows in a page of data. It is used for virtualization.
     * @default 15
     */
    pageSize: number,
    /**
     * <p>Used for auto-sizing columns:  setting the widths of columns that don't have a
     * <i>width</i> prop set.  The choices are: <br />
     * <ul>
     *     <li><i>auto</i>: width is determined by the longest value/header on the first page of data.
     *     For columns where the headers are longer than their values, the headers wain.</li>
     *     <li><i>equal</i>: the spaces is divided equally between columns (that don't have width props set).</li>
     *     <li><i>max-content</i>: width is determined by the longest value in the first page of data..</li>
     * </ul>
     * </p>
     */
    columnSizing: "auto" | "equal" | "max-content",
    className?: string,
    /**
     * The initial sort column.
     */
    sortColumn?: string,
    /**
     * Registers new type renderers for the current instance.
     * @todo
     */
    register?: Struct[],
    /**
     * @todo
     */
    secondarySort?: boolean,
    contextMenuItems?: Command<Struct>[],
}

export type GridState = {
    sortColumns: string[],
    sortDirection: string,
    undoStack: CommandStack,
    redoStack: CommandStack,
    pinned: Set<string>,
    unpinned: Set<string>,
    offsets: Map<string, number>,
    lastUpdated: number,
    fitContainer: boolean,
};

export type GridAction = {
    type: "sort" | "reverseSort" | "resize" | "undo" | "redo" | "pin" | "unpin" | "update" | "fitContainer",
    payload?: { name: string, value?: unknown },
}

/**
 * <p>Just another datagrid.</p>
 *
 * <p>Supports:
 *    <ul>
 *        <li>Large datasets</li>
 *        <li>Cell editing</li>
 *        <li>Sortable columns</li>
 *        <li>Secondary sort</li>
 *        <li>Resizable columns</li>
 *        <li>Sticky headers and columns</li>
 *        <li>Key navigation</li>
 *        <li>Adding/removing rows</li>
 *        <li>Showing/hiding columns</li>
 *        <li>Dragging columns</li>
 *    </ul>
 * </p>
 *
 * @param props
 * @constructor
 */
export default function DataGrid(props: DataGridProps): ReactElement {
    const {
        data,
        className,
        stickyHeaders,
        nullable,
        alternateRows,
        columnSizing,
        rowHeight,
        pageSize,
        children,
        contextMenuItems,
    } = props;

    const containerWidth: number = 0, containerHeight: number = 0;
    const gridRef = useRef<HTMLDivElement>(null);

    //================================== Get visible columns once per render.
    const getChildArray = useCallback(
        () => {
            return Array.isArray(children) ? children : [children]
        },
        [children],
    );

    const getVisibleColumns = useCallback(
        () => {
            return getChildArray()
                .filter(child => child.type === TableColumn);
        },
        [children],
    );

    const getFooter = useCallback(
        () => {
                return getChildArray().find(child => child.type === TableFooter);
        },
        [children],
    );



    const visibleColumns = getVisibleColumns();
    const getMaxColumnWidth = useCallback(
        () => ((containerWidth ?? 0) / visibleColumns.length),
        [containerHeight, containerWidth, visibleColumns]
    );

    //=================================== State
    const colNames = visibleColumns.map(col => col.props.name);
    const rowCount = data.length;
    const selectionModel = useRef(new SelectionModel(data));
    const focusModel = useRef(new FocusModel(rowCount, colNames.length));
    const initSortColumn = props.sortColumn ?? visibleColumns[0].props.name;
    const initialGridState: GridState = {
        sortColumns: [initSortColumn],
        sortDirection: SORT_DIRECTION_ASC,
        undoStack: new CommandStack(),
        redoStack: new CommandStack(),
        pinned: new Set<string>(),
        unpinned: new Set<string>([...colNames]),
        offsets: new Map(),
        lastUpdated: new Date().getTime(),
        fitContainer: false,
    }

    const [state, gridDispatch] = useReducer(reducer, initialGridState);

    //====================================== Effects
    useStorageClipboard();

    useEffect(() => {
        if (rowCount != focusModel.current.rowCount) {
            focusModel.current.rowCount = data.length;
        }
        if (colNames.length != focusModel.current.columnCount) {
            focusModel.current.columnCount = colNames.length;
        }
    }, [
        data.length,
        colNames
    ]);


    //====================================== Event handlers
    const onKeyDown = (e: KeyboardEvent) => {
        const ctrlKey = e.ctrlKey || e.metaKey;
        switch (e.key) {
            case "y": {
                if (ctrlKey) {
                    e.stopPropagation();
                    e.preventDefault();  // cmd-y opens bookmarks in Chrome
                    gridDispatch({type: "redo"});
                }
                break;
            }
            case "z": {
                if (ctrlKey) {
                    gridDispatch({type: "undo"});
                }
                break;
            }
        }
    }

    //====================================== Rendering
    const wrappedComparator = (a: Record<Struct>, b: Record<Struct>): number => {
        const sortColumn = visibleColumns
            .find(col => col.props.name === state.sortColumns[0]);
        const {comparator, name} = sortColumn?.props ?? {};
        return state.sortDirection === SORT_DIRECTION_ASC
            ? comparator?.(a.get(name), b.get(name))
            : comparator?.(b.get(name), a.get(name));
    }

    // Sort data during render, the sort column's comparator.
    if (state.sortColumns.length > 0) {
        data.sort(wrappedComparator);
    }

    // Sorting columns based stickiness during render
    visibleColumns.sort((a, b) => {
        const {pinned} = state;
        const aName = a.props.name;
        const bName = b.props.name;
        return pinned.has(aName) && !pinned.has(bName) ? -1 :
            (!pinned.has(aName) && pinned.has(bName) ? 1 : 0);
    });

    const columnWidths = useRef(new Map(visibleColumns.map(col => [col.props.name, col.props.width])))
    const finalColumnSizing = columnSizing && !state.fitContainer ? columnSizing : "equal";

    return (
        <GridContext.Provider value={{
            ...state,
            gridRef,
            gridDispatch,
            items: data,
            columns: visibleColumns,
            columnNames: colNames,
            columnWidths: columnWidths.current,
            selectionModel,
            focusModel,
            stickyHeaders,
            nullable,
            columnSizing,
            alternateRows,
            contextMenuItems,
        }}>
            <ColumnStyle
                type={finalColumnSizing == "auto" || finalColumnSizing == "equal" ? finalColumnSizing : "auto"}
                columns={visibleColumns}
                maxWidth={getMaxColumnWidth()}
            />
            <div
                ref={gridRef}
                className={joinCss(
                    styles.grid,
                    finalColumnSizing === "max-content" ? styles.columnSizing : "",
                    className
                )}
                onKeyDown={onKeyDown}
            >
                <div className={joinCss(
                    styles.row,
                    stickyHeaders ? styles.stickyHeaders : ""
                )}>
                    {visibleColumns}
                </div>
                <PageFactory
                    data={data.getAll()}
                    root={gridRef.current?.parentElement}
                    offset={pageSize * rowHeight}
                    pageSize={8}
                    rowHeight={rowHeight}
                />
            </div>
            {getFooter() ?? ""}
        </GridContext.Provider>
    )
}
DataGrid.defaultProps = {
    alternateRows: false,
    stickyHeaders: true,
    scrollable: false,
    nullable: false,
    pageSize: 15,
    rowHeight: 48, // TODO: Sync with grid-template rows,
}


// ==================================== Private

function reducer(state: GridState, action: GridAction): GridState {
    const {type, payload} = action;
    const err = "Payload missing.This shouldn't happen.";
    switch (type) {
        case 'sort': {
            if (payload == null) {
                console.warn(`sort action: ${err}`);
                return state;
            }
            const sortColumns = [...state.sortColumns];
            sortColumns.pop();
            sortColumns.unshift(payload.name);
            return {...state, sortColumns};
        }
        case 'reverseSort':
            if (payload == null) {
                console.warn(`reverse sort action: ${err}`);
                return state;
            }
            return {...state, sortDirection: String(payload.value)};
        case 'undo': {
            const undoStack = state.undoStack.clone();
            const redoStack = state.redoStack.clone();
            const cmd = undoStack?.pop();
            cmd?.undo();
            if (cmd != null) redoStack.push(cmd);
            return {...state, undoStack, redoStack};
        }
        case 'redo': {
            const undoStack = state.undoStack.clone();
            const redoStack = state.redoStack.clone();
            const cmd = redoStack?.pop();
            cmd?.redo();
            if (cmd != null) undoStack.push(cmd);
            return {...state, undoStack, redoStack};
        }
        case "pin": {
            const {payload} = action;
            if (payload != null) {
                const {pinned, unpinned, offsets} = state;
                unpinned.delete(payload.name);
                pinned.add(payload.name);
                offsets.set(payload.name, Number(payload.value));
                return {...state, pinned: new Set(pinned), unpinned: new Set(unpinned), offsets};
            }
            return state;
        }
        case "unpin": {
            const {payload} = action;
            if (payload != null) {
                const {pinned, unpinned, offsets} = state;
                pinned.delete(payload.name);
                unpinned.add(payload.name);
                offsets.delete(payload.name);
                return {...state, pinned: new Set(pinned), unpinned: new Set(unpinned), offsets};
            }
            return state;
        }
        case "update": {
            return {...state, lastUpdated: new Date().getTime()}
        }
        case "fitContainer": {
            return {...state, fitContainer: true};
        }
        default:
            throw new Error();
    }
}



