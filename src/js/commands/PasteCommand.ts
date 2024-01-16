import {Command, Struct} from "../../types/types";
import CopyCommand from "./CopyCommand";
import ObservableList, {Record} from "../ObservableList";
import BaseCommand from "./BaseCommand";
import {IconProp} from "@fortawesome/fontawesome-svg-core";

type PasteParameter = {
    rowIndex: number,
    colIndex: number,
    /** columnNames should be the current total column order at the time of the paste.*/
    columnNames: string[],
}

export default class PasteCommand<T extends Struct>
    extends BaseCommand<PasteParameter>
    implements Command<PasteParameter>
{
    readonly icon: IconProp = "paste";
    readonly name: string = "Paste";
    readonly shortCut: string = "⌘+v";
    readonly #previous: {id: string, clone: Record<T>}[];
    #items: ObservableList<T>;

    constructor(items: ObservableList<T>) {
        super();
        this.#items = items;
        this.#previous = [];
    }

    redo(): boolean {
        return this.#execute(false);
    }

    undo(): boolean {
        this.#previous.forEach((prevRecord) => {
            const record = this.#items.find(record => record.id === prevRecord.id);
            record?.copy(prevRecord.clone);
        });

        return true;
    }

    execute(): boolean {
        return this.#execute(true);
    }

    #execute(doClone: boolean): boolean {
        const clipboardItems = sessionStorage.getItem(CopyCommand.TOKEN);
        if (clipboardItems == null) return false;

        const params = this.getParameters();
        const param = params[params.length - 1];
        if (param == null) return false;

        const {rowIndex: startRowIndex, colIndex: startColumnIndex, columnNames} = param;
        const updates = JSON.parse(clipboardItems);
        const update = updates.items.pop();
        if (update == null) return false;

        const {data} = update;
        data.forEach((item: T, index: number) => {
            const recordIndex = startRowIndex + index;
            const record = this.#items.get(recordIndex);
            if (doClone && record != null) this.#previous.push({id: record.id, clone: record.clone()});

            let currentColIndex = startColumnIndex;
            update.columnNames.forEach((copiedCol: string) => {
                const destName = columnNames[currentColIndex];
                if (destName != null) {
                    record?.set(destName, item[copiedCol]);
                }
                currentColIndex++;
            });
        });
        return true;
    }
}