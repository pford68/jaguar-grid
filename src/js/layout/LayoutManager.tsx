import {ReactElement} from "react";
import {DataGridProps} from "../DataGrid";

/**
 * DataGrid's delegates much of the work of measuring various elements is delegated to this class.
 */
export class LayoutManager {
    #containerHeight: number | undefined;
    #containerWidth: number | undefined;

    constructor() {

    }

    get containerSize(): Size {
        return {
            height: this.#containerHeight,
            width: this.#containerWidth
        };
    }

    setContainerSize(el: HTMLElement): void {
        const {height, width} = (el.parentElement ?? document.body).getBoundingClientRect();
        this.#containerHeight = height;
        this.#containerWidth = width;
    }

    fitContainer(el: HTMLElement): boolean {
        const {width} = el.getBoundingClientRect();
        this.setContainerSize(el);
        const {width: containerWidth} = this.containerSize;
        return width < (containerWidth ?? 0);
    }

}

type Size = {
    height: number | undefined,
    width: number | undefined,
}