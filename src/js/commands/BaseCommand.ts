import {Command} from "../../types/types";

/**
 * Base class for Commands
 * @param T The parameter type used by the Command
 */
export default class BaseCommand<T>  implements Command<T>{
    readonly #params: T[];

    constructor() {
        this.#params = [];
    }

    setParameter(value: T): void {
        this.#params.push(value);
    }

    getParameters(): T[] {
        return this.#params;
    }

    execute(): boolean {
        return false;
    }

    redo(): boolean {
        return false;
    }

    undo(): boolean {
        return false;
    }
}