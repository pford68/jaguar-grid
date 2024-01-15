import {Emitter} from "./Observable";
import {Coordinates} from "../types/types";

/**
 * Separates focus details from the view. We need this, in short,
 * because we'll need cells that don't exist yet to render and come
 * into focus.
 */
export default class FocusModel extends Emitter<Coordinates> {
    #focused: Coordinates | null;
    #maxRowIndex: number;
    #maxColIndex: number;

    constructor(rowCount: number, columnCount: number) {
        super();
        this.#focused = null;
        this.#maxRowIndex = rowCount > 0 ? rowCount - 1 : 0;
        this.#maxColIndex = columnCount > 0 ? columnCount - 1 : 0;
    }

    get focused(): Coordinates | null {
        return this.#focused;
    }

    get rowCount(): number {
        return this.#maxRowIndex + 1;
    }

    set rowCount(value: number) {
        this.#maxRowIndex = value - 1;
    }

    get columnCount(): number {
        return this.#maxColIndex + 1;
    }

    set columnCount(value: number) {
        this.#maxColIndex = value - 1;
    }

    /**
     * Requests that the cell at rowIndex/colIndex come up to focus.
     *
     * @param rowIndex The row of the cell to focus
     * @param colIndex The column of the cell to focus
     * @emits focusChanged
     */
    focus(rowIndex: number, colIndex: number): void {
        if (rowIndex >= 0
            && colIndex >= 0
            && rowIndex <= this.#maxRowIndex
            && colIndex <= this.#maxColIndex
        ) {
            this.#focused = {rowIndex, colIndex};
            this.emit("focusChanged", this.#focused);
        }
    }

    /**
     * <p>When we click o cell, that will bring the cell into focus, but the FocusModel
     * won't know anything about that, unless we tell it that a new cell is in focus.
     * Otherwise, the FocusModel only knows that a new cell has been requested to focus,
     * and it passes that request along. This method should be used to keep clicks
     * and programmatic focusing in sync.</p>
     *
     * <p>This method does not emit messages. It is used to keep clicks and programmatic
     * focus in sync <strong>silently</strong>.</p>
     *
     * @param rowIndex The row of the cell in focus
     * @param colIndex The column of the cell in focus
     */
    sync(rowIndex: number, colIndex: number): void {
        this.#focused = {rowIndex, colIndex};
    }

    isFocused(rowIndex: number, colIndex: number): boolean {
        return this.#focused != null
            && this.#focused.rowIndex === rowIndex
            && this.#focused.colIndex === colIndex;
    }

    clear(): void {
        this.#focused = null;
        this.emit("focusChanged", undefined);
    }
}
