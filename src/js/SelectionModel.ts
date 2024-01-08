import {Emitter} from "./Observable";
import {Coordinates, Struct} from "../types/types";
import ObservableList, {type Record} from "./ObservableList";
import {drawBox} from "./util/utils";

export type SelectionChange = {
    type: "selected" | "deselected",
    coordinates: Coordinates,
}

/**
 * "Selection" means two things here: (1) the item currently focused
 * (which equals FocusModel.focused) or (2) one of the items chosen
 * for drawing a box.  The point of this class originally was the latter.
 * However, it has evolved to allow access to the data at the selected row.
 */
export default class SelectionModel extends Emitter<SelectionChange>{
    #selected: Coordinates[];
    #items: ObservableList<Struct>;

    constructor(data: ObservableList<Struct>) {
        super();
        this.#selected = [];
        this.#items = data;
    }

    /**
     * Adds the selected cell to the set of cells that can form a selection box.
     * No more than two selections are allowed.  The first cell is the basis
     * for the box; then next is the opposite corner of the box.  After 2 are added,
     * the next selected cell replaces the <strong>cell</strong>. In this way,
     * each time you select a cell, the first is redrawn from the first cell to
     * the last selected cell.
     *
     * @param rowIndex The row of the selected cell
     * @param colIndex The column of the selected cell
     */
    select(rowIndex: number, colIndex: number): void {
        if (this.#selected.length > 1) {
            this.#selected.pop();
        }
        this.#selected.push({rowIndex, colIndex});
        this.emit("selectionChanged", { type: "selected", coordinates: {rowIndex, colIndex}});
    }

    /**
     * Removes specified cell from the selected list.
     * @param rowIndex
     * @param colIndex
     */
    deselect(rowIndex: number, colIndex: number): void {
        this.#selected = this.#selected
            .filter(item => !(item.rowIndex === rowIndex && item.colIndex === colIndex));
        this.emit("selectionChanged", { type: "deselected", coordinates: {rowIndex, colIndex}});
    }

    /**
     * Returns the selected rowIndex.
     */
    getSelectedIndex(): number {
        const {rowIndex} = this.#selected[0];
        return rowIndex;
    }

    getSelectedIndices(): number[] {
        return this.#selected.map(item => item.rowIndex);
    }

    /**
     * Returns the data row associated with selected rowIndex.
     */
    getSelectedItem(): Record<Struct> | undefined {
        const {rowIndex} = this.#selected[0];
        return this.#items.get(rowIndex);
    }

    /**
     * Returns the data rows between the two selected row indices. (inclusive)
     */
    getSelectedItems(): Record<Struct>[] {
        const edges = this.edges;
        if (edges == null) return [];
        const {top, bottom} = edges;

        return this.#items.getAll()
            .filter((item, index) => index >= top && index <= bottom);
    }

    isMultipleSelected(): boolean {
        return this.#selected.length > 1;
    }

    clearSelections(): void {
        this.#selected = [];
    }

    /**
     * When we draw a box, then click a cell outside the box (without selecting),
     * we want the box to be erased. At that point, the new cell can become the start
     * of a new box. This method must be called during such actions in order to
     * erase the old box, and to prime the SelectionModel to start a new box.
     *
     * @param rowIndex
     * @param colIndex
     */
    reset(rowIndex: number, colIndex: number): void {
        this.clearSelections();
        this.#selected.push({rowIndex, colIndex});
        this.emit("selectionChanged");
    }

    isSelected(rowIndex: number, colIndex: number): boolean {
        return this.#selected
            .find(item => item.rowIndex == rowIndex && item.colIndex == colIndex) != null;
    }

    /**
     * Returns boolean for whether the specified coordinates are contained in the
     * selection box.
     *
     * @param rowIndex
     * @param colIndex
     * @returns {boolean}
     */
    isContained(rowIndex: number, colIndex: number): boolean {
        if (this.#selected.length < 2) return false;
        const edges = this.edges;
        if (edges == null) return false;
        const {top, right, bottom, left} = edges ;
        return rowIndex >= top && rowIndex <= bottom && colIndex >= left && colIndex <= right;
    }

    /**
     * Returns the sides of the selection box: top, right, bottom, left.
     * @returns {[key:string]: number}
     */
    get edges(): {[key:string]: number} | null {
        const len = this.#selected.length;
        if (len === 0) return null;
        return drawBox(this.#selected[0], this.#selected[len - 1]);
    }
}