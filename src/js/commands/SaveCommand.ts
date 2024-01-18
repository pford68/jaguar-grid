import BaseCommand from "./BaseCommand";
import {Command, Struct} from "../../types/types";
import ObservableList, {PartialUpdate} from "../ObservableList";
import {isSubSet} from "../util/utils";
import {IconProp} from "@fortawesome/fontawesome-svg-core";


/**
 * For making/undoing changes to existing Records.
 */
export default class SaveCommand<T extends Struct>
    extends BaseCommand<PartialUpdate<T>>
    implements Command<PartialUpdate<T>>
{
    readonly icon: IconProp = "save";
    readonly name: string = "Save";
    readonly accelerator: string = "⌘+s";
    readonly #items: ObservableList<T>;

    constructor(items: ObservableList<T>) {
        super();
        this.#items = items;
    }

    get items(): ObservableList<T> {
        return this.#items;
    }

    redo(): boolean {
        return this.execute();
    }

    undo(): boolean {
        this.getParameters()
            .forEach(({record, previous}) => {
                if (previous != null) {
                    record?.copy(previous);
                }
            });

        return true;
    }

    execute(): boolean {
        const updates = this.getParameters();
        if (updates.length === 0) {
            console.warn("No parameters loaded, nothing to execute.")
            return false;
        }

        updates.forEach(update => {
            for (const updateKey in update.value) {
                update.record?.set(updateKey, update.value[updateKey]);
            }
        });

        return true;
    }


    /**
     * Used to add a parameter to the command for later execution.
     *
     * @param param {PartialUpdate}
     * @override
     */
    setParameter(param: PartialUpdate<T>) {
        const {index, value} = param;
        const current = this.items.get(index);
        // Don't update unless there are changes.
        if (current == null || isSubSet(value, current?.getAll() ?? {})) return;
        param.record = current;
        param.previous = current.clone();  // Use the clone to restore the record if needed.
        this.getParameters().push(param);
    }

}