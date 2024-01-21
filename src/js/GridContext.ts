import {createContext, Dispatch, ReactElement, RefObject, useRef} from "react";
import FocusModel from "./FocusModel";
import SelectionModel from "./SelectionModel";
import ObservableList from "./ObservableList";
import {Command, Struct} from "../types/types";
import {GridAction} from "./DataGrid";
import {CommandStack} from "./util/CommandStack";

export type GridContextType = {
    items: ObservableList<Struct> | undefined,
    columns: ReactElement[],
    sortColumns: string[],
    sortDirection: string,
    alternateRows: boolean,
    pinned: Set<string>,
    columnWidths: Map<string, number>,
    columnSizing: "auto" | "equal" | "max-content",
    offsets: Map<string, number>,
    gridDispatch?: Dispatch<GridAction>,
    focusModel?: RefObject<FocusModel>,
    selectionModel?: RefObject<SelectionModel>,
    stickyHeaders?: boolean,
    nullable?: boolean,
    undoStack?: CommandStack,
    redoStack?: CommandStack,
    gridRef?: RefObject<HTMLDivElement>,
    contextMenuItems?: Command<Struct>[],
}
export const initialGridContext: GridContextType = {
    columns: [],
    sortColumns: [],
    sortDirection: "",
    items: undefined,
    stickyHeaders: true,
    nullable: false,
    pinned: new Set<string>(),
    offsets: new Map(),
    columnWidths: new Map(),
    columnSizing: "auto",
    alternateRows: false,
}
export const GridContext = createContext(initialGridContext);
