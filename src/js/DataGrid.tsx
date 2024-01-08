import React, {ReactElement, KeyboardEvent, useEffect, useReducer, useRef} from "react";
import Virtualizer from "./Virtualizer";
import ObservableList, {Record} from "./ObservableList";
import type {Struct} from "../types/types";
import styles from "./DataGrid.css";
import {joinCss} from "./util/utils";
import {GridContext} from "./GridContext";
import FocusModel from "./FocusModel";
import SelectionModel from "./SelectionModel";
import {SORT_DIRECTION_ASC} from "./constants";
import ColumnStyle from "./layout/ColumnStyle";
import RowFactory from "./RowFactory";
import {CommandStack} from "./util/CommandStack";
import {LayoutManager} from "./layout/LayoutManager";
import CopyCommand from "./commands/CopyCommand";


export type DataGridProps = {
    data: ObservableList<Struct>,
    children: ReactElement | ReactElement[],
    alternateRows: boolean,
    stickyHeaders: boolean,
    scrollable: boolean,
    nullable: boolean,
    rowHeight: number,
    pageSize: number,
    height?: number,
    className?: string,
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
}

export type GridState = {
    sortColumns: string[],
    sortDirection: string,
    resizedBy: number,
    focusModel: FocusModel,
    undoStack: CommandStack,
    redoStack: CommandStack,
    pinned: Set<string>,
    unpinned: Set<string>,
    offsets: Map<string, number>,
    widths: Map<string, number>,
    lastUpdated: number,
};

export type GridAction = {
    type: "sort" | "reverseSort" | "resize" | "undo" | "redo" | "pin" | "unpin" | "update",
    payload?: {name: string, value?: unknown},
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
export default function DataGrid<T>(props:DataGridProps): ReactElement {
    const {
        data,
        className,
        stickyHeaders,
        scrollable,
        nullable,
        alternateRows,
    } = props;

    const gridRef = useRef<HTMLDivElement>(null);

    //================================== Get visible columns once per render.
    const layoutManager = new LayoutManager(props);
    let columns = layoutManager.visibleColumns;
    columns = columns.map((col, index) => React.cloneElement(col, {
        key: `header-${index}`,
    }));

    //=================================== State
    const colNames = columns.map(col => col.props.name);
    const rowCount = data.length;
    const selectionModel = new SelectionModel(data)
    const initSortColumn = props.sortColumn ?? columns[0].props.name;
    const initialGridState: GridState = {
        sortColumns: [initSortColumn],
        sortDirection: SORT_DIRECTION_ASC,
        resizedBy: 0,
        undoStack: new CommandStack(),
        redoStack: new CommandStack(),
        focusModel: new FocusModel(rowCount, colNames.length),
        pinned: new Set<string>(),
        unpinned: new Set<string>([...colNames]),
        offsets: new Map(),
        widths: new Map(),
        lastUpdated: new Date().getTime(),
    }

    const [state, gridDispatch] = useReducer(reducer, initialGridState);

    //====================================== Effects
    useEffect(() => {

        const clearClipboard = () => {
            sessionStorage.removeItem(CopyCommand.TOKEN);
        };

        window.addEventListener("unload", clearClipboard);
        return () => {
            window.removeEventListener("unload", clearClipboard);
        };
    }, []);

    useEffect(() => {
        if (gridRef.current != null) {
            layoutManager.setContainerSize(gridRef.current);
        }
    }, [gridRef.current]);


    //====================================== Event handlers
    const onKeyDown = (e: KeyboardEvent) => {
        const ctrlKey = e.ctrlKey || e.metaKey;
        switch(e.key) {
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
        const sortColumn = columns
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
    columns.sort((a, b) => {
        const {pinned} = state;
        const aName = a.props.name;
        const bName = b.props.name;
        return pinned.has(aName) && !pinned.has(bName) ? -1 :
            (!pinned.has(aName) && pinned.has(bName) ? 1 : 0);
    });

    const {width: containerWidth, height: containerHeight} = layoutManager.containerSize;


    return (
        <GridContext.Provider value={{
            ...state,
            gridDispatch,
            items: data,
            columnNames: colNames,
            selectionModel,
            stickyHeaders,
            nullable,
        }}>
            <ColumnStyle type="auto" columns={columns} />
            <div
                ref={gridRef}
                className={joinCss(
                    styles.grid,
                    scrollable ? styles.scrollable : "",
                    className
                )}
                onKeyDown={onKeyDown}
            >
                {columns}
                <Virtualizer data={data}>
                    {rows => renderRows(rows, columns, alternateRows)}
                </Virtualizer>
            </div>
            {layoutManager.getFooter() ?? ""}
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
function renderRows(rows: ObservableList<Struct>, columns: ReactElement[], alternate: boolean): ReactElement[] {
    return rows.getAll().map((row, index) => (
        <RowFactory
            key={index}
            rowIndex={index}
            row={row}
            columns={columns}
            alternateRows={alternate}
        />
    ));
}


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
        default:
            throw new Error();
    }
}


