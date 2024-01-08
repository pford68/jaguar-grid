/**
 * Base class for Commands
 * @param T The parameter type used by the Command
 */
export default class BaseCommand<T> {
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
}