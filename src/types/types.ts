import {ReactNode, RefObject} from "react";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import ObservableList, {Record} from "../js/ObservableList";

export type Consumer<T> = (value: T) => void;
export type BiConsumer<T, U> = (value1:T, value2:U) => void;
export type Operator<T> = (value:T) => T;
export type Predicate<T> = (value:T) => boolean;
export type Supplier<T> = () => T;
export type Adapter<T, R> = (value:T) => R;
export type BiFunction<T, U, R> = (value1:T, value2:U) => R;
export type Struct = {[key:string]: unknown};
export type Coordinates = {rowIndex: number, colIndex: number};
export type DataTypes =
    | "string"
    | "number"
    | "currency"
    | "date"
    | "datetime"
    | "boolean"
    | "object"
    | "array"
    | "map"
    | "enum";

export interface Command<T> {
    execute(): boolean;
    undo(): boolean,
    redo(): boolean,
    setParameter(param: T): void;
    getParameters(): T[];
    icon?: IconProp,
    name?: string,
    accelerator?: ReactNode,
}

interface ISelectionModel {
    getSelectedItem(): Record<Struct>,
    getSelectedItems(): Record<Struct>[],
}

export type ContextMenuParameter = {
    targetRef: RefObject<HTMLElement>,
    selectionModel: ISelectionModel,
    items: ObservableList<Struct>,
}

export type Role = "scrollbar"
    | "searchbox"
    | "separator"
    | "slider"
    | "switch"
    | "tab"
    | "tabpanel"
    | "treeitem"
    | "combobox"
    | "menu"
    | "menubar"
    | "tablist"
    | "tree"
    | "treegrid"
    | "dialog"
    | "main"
    | "region"
    | "navigation"
    | "search"
    | "form"
    | "toolbar"
    | "tooltip"
;



