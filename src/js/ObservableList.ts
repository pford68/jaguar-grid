import {Emitter} from "./Observable";
import {BiFunction, Predicate, Struct} from "../types/types";
import {v4 as uuid} from "uuid";
import {deepClone} from "./util/utils";


/**
 * The base class for data rows in the table model.
 *
 * @param T The type of data contained in the Record
 */
export class Record<T extends Struct> {
    #data: T;
    /** Whether the record has been marked for deletion */
    #deleted: boolean = false;
    readonly #id: string;

    constructor(data: T) {
        this.#data = data;
        this.#id = uuid();
    }

    getAll(): T {
        return this.#data;
    }

    get(key: string): unknown {
        return this.#data[key];
    }


    get id(): string {
        return this.#id;
    }


    /**
     * Sets a new value at the specified key, which does not need to exist beforehand.
     * @param key
     * @param value
     */
    set(key: string, value: unknown): void {
        this.#data = {...this.#data,  [key]: value};
    }

    /**
     * @returns {boolean} Whether the record has been marked for deletion.
     */
    get deleted(): boolean {
        return this.#deleted;
    }

    /**
     * If the value is true, it Marks the record for deletion.
     * @param value {boolean} Whether to mark the record for the deletion
     */
    set deleted(value: boolean) {
        this.#deleted = value;
    }

    update(partial: T): void {
        this.#data = {...this.#data, ...partial};
    }

    toString(): string {
        return JSON.stringify(this.#data);
    }

    clone(): Record<T> {
        return new Record(deepClone(this.getAll()));
    }

    copy(that: Record<T>): void {
        this.update(that.getAll());
    }
}


export type ListChangeType = "added" | "modified" | "deleted";
export type ListChange<T extends Struct> = {
    index: number,
    type: ListChangeType,
    record?: Record<T>,
}
export type ListItemUpdate<T extends Struct> = {
    index: number,
    record: Record<T>,
}
export type PartialUpdate<T extends Struct> = {
    index: number,
    value: T,
    record?: Record<T>,
    previous?: Record<T>,
}


/**
 * An array-like list that notifies listeners when its underlying data has changed.
 *
 * @param T The data of data contained in each Record in the list
 */
export default class ObservableList<T extends Struct> extends Emitter<ListChange<Struct>[]> {
    #data: Record<T>[];

    constructor(data: Record<T>[]) {
        super();
        this.#data = data;
    }

    get length(): number {
        return this.#data
            .filter(record => !record.deleted)
            .length;
    }

    get(index: number): Record<T> | undefined {
        return this.#data[index];
    }

    add(record: Record<T>): void {
        this.#data[this.#data.length] = record;
    }

    slice(startIndex: number, endIndex?: number): Record<T>[] {
        return this.#data.slice(startIndex, endIndex);
    }

    getAll(): Record<T>[] {
        return this.filter(record => !record.deleted);
    }

    /**
     * Inserts/replaces the specified Record at the specified index.  The Record can be
     * an updated version of the original.  Use this when you have an Record and want to
     * re-insert it to notify listeners that the list has been updated.
     *
     * @param index The index at which to insert the Record.
     * @param record The Record to insert
     */
    insertAt(index: number, record: Record<T>): boolean {
        this.#data[index] = record;
        this.emit("dataChanged", [{type: "modified", index, record}]);
        return true;
    }

    /**
     * Updates the record at the specified index.  Use this when you have
     * data to mix in, but don't have the Record itself.
     *
     * @param index
     * @param data
     */
    updateAt(index: number, data: T): boolean {
        const record = this.#data[index];
        record.update(data)
        this.emit("dataChanged", [{type: "modified", index, record}]);
        return true;
    }

    /**
     * Update multiple records at once.
     *
     * @param updates An array of ListItemUpdates
     */
    batchUpdate(updates: ListItemUpdate<T>[]): void {
        const results = updates
            .map(({index, record}) => {
                this.#data[index] = record
                const type:ListChangeType = "modified";
                return {
                    type,
                    record,
                    index,
                };
            });
        if (results.length > 0) {
            this.emit("dataChanged", results);
        }
    }

    deleteAt(index: number): boolean {
        const record = this.#data[index];
        if (record != undefined) {
            record.deleted = true;
            this.emit("dataChanged", [{type: "deleted", index}]);
            return true;
        }
        return false;
    }

    insertBefore(index: number, record: Record<T>): void {
        this.#data = [
            ...this.#data.slice(0, index),
            record,
            ...this.#data.slice(index)
        ];
    }

    sort(comparator: BiFunction<Record<T>, Record<T>, number>): void {
        this.#data.sort(comparator);
    }

    find(criteria: Predicate<Record<T>>): Record<T> | undefined {
        return this.#data.find(criteria);
    }

    findIndex(criteria: Predicate<Record<T>>): number | undefined {
        return this.#data.findIndex(criteria);
    }

    filter(criteria: Predicate<Record<T>>): Record<T>[] {
        return this.#data.filter(criteria);
    }
}




