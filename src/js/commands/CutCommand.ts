import CopyCommand from "./CopyCommand";
import {Struct} from "../../types/types";
import {Record} from "../ObservableList";

export default class CutCommand<T extends Struct> extends CopyCommand<T> {

    readonly #previous: {id: string, clone: Record<T>}[];

    constructor(selectedItems: Record<T>[]) {
        super(selectedItems);
        this.#previous = [];
    }

    redo(): boolean {
        super.execute();
        return this.#execute(false);
    }

    undo(): boolean {
        this.#previous.forEach((prevRecord) => {
            const record = this.selectedItems.find(record => record.id === prevRecord.id);
            record?.copy(prevRecord.clone);
        });

        return true;
    }

    execute(): boolean {
        super.execute();
        return this.#execute(true);
    }

    #execute(doClone: boolean): boolean {
        const params = this.getParameters();
        const param = params[params.length - 1];
        const {columnNames} = param;
        this.selectedItems.forEach(item => {
            if (doClone) this.#previous.push({id: item.id, clone: item.clone()});

            columnNames.forEach(name => {
                item.set(name, null);
            })
        });
        return true;
    }

}