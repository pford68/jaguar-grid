import {Record} from "../../src/js/ObservableList";
import {Struct} from "../../src/types/types";

export type Measurements = {
    height: number,
    weight: number,
}
export default class Person extends Record<Struct> {

    set(key: string, value: unknown): void {
        if (key === "measurements") {
            const measurements = this.get(key);
            (measurements as Measurements).height = Number(value);
        } else {
            super.set(key, value);
        }
    }
}