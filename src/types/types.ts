import {ReactNode} from "react";
import {IconProp} from "@fortawesome/fontawesome-svg-core";

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
    shortCut?: ReactNode,
}




