import {createContext, Dispatch} from "react";
import FocusModel from "./FocusModel";
import SelectionModel from "./SelectionModel";
import ObservableList from "./ObservableList";
import {Struct} from "../types/types";
import {GridAction} from "./DataGrid";
import {CommandStack} from "./util/CommandStack";

export type GridContextType = {
    items: ObservableList<Struct> | undefined,
    columnNames: string[],
    sortColumns: string[],
    sortDirection: string,
    resizedBy: number,
    gridDispatch?: Dispatch<GridAction>,
    focusModel?: FocusModel,
    selectionModel?: SelectionModel,
    stickyHeaders?: boolean,
    nullable?: boolean,
    undoStack?: CommandStack,
    redoStack?: CommandStack,
    pinned: Set<string>,
    unpinned: Set<string>,
    widths: Map<string, number>,
    offsets: Map<string, number>,
}
export const initialGridContext: GridContextType = {
    resizedBy: 0,
    sortColumns: [],
    sortDirection: "",
    items: undefined,
    columnNames: [],
    stickyHeaders: true,
    nullable: false,
    pinned: new Set<string>(),
    unpinned: new Set<string>(),
    offsets: new Map(),
    widths: new Map(),
}
export const GridContext = createContext(initialGridContext);
