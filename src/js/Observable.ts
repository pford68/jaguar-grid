import {Consumer} from "../types/types";

/**
 * Implemented by classes that allow others to listen to changes
 * in their state. Usually you would extend/mixin Emitter
 * instead of implementing Observable directly.
 */
export interface Observable<T> {
    on(evt: string, listener: Consumer<T | undefined>): void;
    off(evt: string, listener: Consumer<T | undefined>): void;
}

/**
 * Allows listeners to subscribe to changes in an object's state.
 */
export class Emitter<T> implements Observable<T> {
    #events: Map<string, string>;
    #subscribers: Map<string, Consumer<T | undefined>[]>;

    constructor() {
        this.#events = new Map();
        this.#subscribers = new Map();
    }

    on(evt: string, listener: Consumer<T | undefined>): void {
        if (this.#events.get(evt) == null) {
            this.#events.set(evt, evt);
            this.#subscribers.set(evt, []);
        }
        const subscribers = this.#subscribers.get(evt);
        if (subscribers?.find((s) => s == listener) == null) {
            subscribers?.push(listener);
        }
    }

    off(evt: string, listener: Consumer<T | undefined>): void {
        if (this.#events.get(evt) == null) {
            return;
        }
        const subscribers = this.#subscribers.get(evt);
        if (subscribers?.find((s) => s == listener) != null) {
            this.#subscribers
                .set(evt, subscribers?.filter((s) => s != listener));
        }
    }

    emit(evt: string, value?: T | undefined): void {
        this.#subscribers
            .get(evt)
            ?.forEach((s) => s(value));
    }
}