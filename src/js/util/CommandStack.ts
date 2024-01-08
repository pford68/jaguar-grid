import {Command, Struct} from "../../types/types";

export class CommandStack {
    #data: Command<Struct>[];

    constructor() {
        this.#data = [];
    }

    get length(): number {
        return this.#data.length;
    }

    clear(): void {
        this.#data = [];
    }

    push(item: Command<Struct>): void {
        this.#data.push(item);
    }

    pop(): Command<Struct> | undefined {
        return this.#data.pop();
    }

    clone(): CommandStack {
        const clone = new CommandStack();
        this.#data.forEach(item => clone.push(item));
        return clone;
    }
}