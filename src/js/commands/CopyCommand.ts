import {Command, Struct} from "../../types/types";
import {v4 as uuid} from "uuid";
import BaseCommand from "./BaseCommand";
import {Record} from "../ObservableList";
import {isTextSelected} from "../util/utils";

type CopyParameter<T extends Struct> = {
    /** The order of column names in the data. */
    columnNames: string[],
    data?: T[],
}

export default class CopyCommand<T extends Struct>
    extends BaseCommand<CopyParameter<T>>
    implements Command<CopyParameter<T>>
{
    icon: string = "copy";
    name: string = "Copy";
    readonly shortCut: string = "&#8984+c";
    readonly #selectedItems: Record<T>[];
    static TOKEN: string = uuid();

    constructor(selectedItems: Record<T>[]) {
        super();
        this.#selectedItems = selectedItems;
    }

    execute(): boolean {
        // For now, I am using session storage as the clipboard.
        // Not all browsers can write to the clipboard with Javascript.
        const items = { items: this.getParameters() }
        sessionStorage.setItem(CopyCommand.TOKEN, JSON.stringify(items));
        return true;
    }

    redo(): boolean {
        return false;
    }

    undo(): boolean {
        return false;
    }


    setParameter(value: CopyParameter<T>) {
        const names: string[] = value.columnNames;
        if (value.data === undefined) {
            value.data = [];
        }
        this.selectedItems.forEach(record => {
            const data: {[key:string]: unknown} = {};
            names.forEach(name => {
                data[name] = isTextSelected() ? getSelection()?.toString() : record.get(name);
            });
            // @ts-expect-error:{ [key: string]: unknown; } is assignable to T: T could be a different subtype of Struct.
            value.data?.push(data)
        });
        this.getParameters().push(value);
    }

    get selectedItems(): Record<T>[] {
        return this.#selectedItems;
    }
}