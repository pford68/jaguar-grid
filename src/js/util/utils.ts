import {Coordinates, Struct} from "../../types/types";

export function joinCss(...varargs: Array<string | undefined>): string {
    return varargs.filter((arg) => arg !== undefined).join(" ");
}

export function assert(condition: boolean, msg: string): void {
    if (!condition) throw new Error(msg);
}

export function warn(condition: boolean, msg: string): void {
    if (!condition) console.warn(msg);
}

export function drawBox(start: Coordinates, end: Coordinates): {[key: string]: number} {
    const {rowIndex: startRowIndex, colIndex: startColIndex} = start;
    const {rowIndex: endRowIndex, colIndex: endColIndex} = end;
    const top = startRowIndex <= endRowIndex ? startRowIndex : endRowIndex;
    const bottom = startRowIndex === top ? endRowIndex : startRowIndex;
    const left = startColIndex <= endColIndex ? startColIndex : endColIndex;
    const right = startColIndex === left ? endColIndex : startColIndex;
    return {top, right, bottom, left};
}

export function isSubSet(o1: Struct, o2: Struct): boolean {
   return Object.keys(o1).find(key => o1[key] != o2[key]) == null;
}

export function compose<T>(fn1: (a: T) => T, ...fns: Array<(a: T) => T>) {
    fns.reduce((prevFn, nextFn) => value => prevFn(nextFn(value)), fn1);
}

export function deepClone<T>(obj: T): T {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    let clone: T;
    if (Array.isArray(obj)) {
        clone = [] as unknown as T;
        obj.forEach((value, index) => {
            (clone as unknown as any[])[index] = deepClone(value);
        });
    } else {
        clone = {} as T;
        Object.getOwnPropertyNames(obj).forEach((prop) => {
            (clone as any)[prop] = deepClone((obj as any)[prop]);
        });
    }

    return clone;
}

export function isTextSelected(): boolean {
    const selection = getSelection();
    return selection != null && selection.type?.toLowerCase() === "range";
}

export function toISODateString(timestamp: number): string {
    return new Date(timestamp).toISOString().split("T")[0];
}
