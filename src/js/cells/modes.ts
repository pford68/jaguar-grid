import {Dispatch, KeyboardEvent, useContext} from "react";
import {CellFactoryAction} from "./types";
import {GridContextType} from "../GridContext";
import CopyCommand from "../commands/CopyCommand";
import PasteCommand from "../commands/PasteCommand";
import CutCommand from "../commands/CutCommand";
import {isTextSelected} from "../util/utils";

interface CellState {
    onKeyDown: (e: KeyboardEvent, dispatch: Dispatch<CellFactoryAction>) => void;
}


/**
 * An implementation of the state pattern. Determines the behavior
 * of various key commands when a cell is in "focus mode."
 */
export class FocusMode implements CellState {
    readonly #context: GridContextType;

    constructor(ctx: GridContextType) {
        this.#context = ctx;
    }

    onKeyDown = (e: KeyboardEvent, dispatch: Dispatch<CellFactoryAction>) => {
        const pattern = /^\w$/;
        const {key} = e;
        const ctrlKey = e.ctrlKey || e.metaKey;
        const {
            focusModel,
            selectionModel,
            items,
            columnNames,
            gridDispatch,
            undoStack,
            redoStack,
        } = this.#context;
        const focusedCell = focusModel?.focused;
        if (focusedCell == null || focusModel ==  null || selectionModel == null || items == null) return;

        const rowCount = items?.length;

        switch (key) {
            case "ArrowLeft": {
                e.preventDefault();
                if (ctrlKey) {
                    if (e.shiftKey) selectionModel.select(focusedCell.rowIndex, 0);
                    else focusModel.focus(focusedCell.rowIndex, 0);
                    return;
                }

                const newColIndex = focusedCell.colIndex - 1;
                focusModel?.focus(focusedCell.rowIndex, newColIndex);

                if (e.shiftKey) selectionModel.select(focusedCell.rowIndex, newColIndex);
                else selectionModel.reset(focusedCell.rowIndex, newColIndex);
                break;
            }
            case "ArrowRight": {
                e.preventDefault();
                if (ctrlKey) {
                    if (e.shiftKey) selectionModel.select(focusedCell.rowIndex, columnNames.length - 1);
                    else focusModel.focus(focusedCell.rowIndex, columnNames.length - 1);
                    return;
                }

                const newColIndex = focusedCell.colIndex + 1;
                focusModel?.focus(focusedCell.rowIndex, newColIndex);

                if (e.shiftKey) selectionModel.select(focusedCell.rowIndex, newColIndex);
                else selectionModel.reset(focusedCell.rowIndex, newColIndex);
                break;
            }
            case "ArrowUp": {
                e.preventDefault();
                if (ctrlKey) {
                    if (e.shiftKey) selectionModel.select(0, focusedCell.colIndex);
                    else focusModel.focus(0, focusedCell.colIndex);
                    return;
                }

                const newRowIndex = focusedCell.rowIndex - 1;
                focusModel?.focus(newRowIndex, focusedCell.colIndex);

                if (e.shiftKey)  selectionModel.select(newRowIndex, focusedCell.colIndex);
                else  selectionModel.reset(newRowIndex, focusedCell.colIndex);
                break;
            }
            case "ArrowDown": {
                e.preventDefault();
                if (ctrlKey) {
                    if (e.shiftKey) selectionModel.select(rowCount - 1, focusedCell.colIndex);
                    else focusModel.focus(rowCount - 1, focusedCell.colIndex);
                    return;
                }

                const newRowIndex = focusedCell.rowIndex + 1;
                focusModel?.focus(newRowIndex, focusedCell.colIndex);

                if (e.shiftKey) selectionModel.select(newRowIndex, focusedCell.colIndex);
                else selectionModel.reset(newRowIndex, focusedCell.colIndex);
                break;
            }
            case "Backspace":
                if (ctrlKey) return;
                dispatch({type: "clear"});
                break;
            case "Enter":
                if (ctrlKey) return;
                dispatch({type: "activate"});
                break;
            case "Copy":
            case "c":
            case "Cut":
            case "x": {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    const doCut = e.key === "x" || e.key ===" Cut";
                    const {columnNames} = this.#context;
                    const selectedItems = selectionModel?.getSelectedItems();
                    if (selectedItems != null && selectionModel?.edges != null) {
                        const cmd = doCut
                            ? new CutCommand(selectedItems)
                            : new CopyCommand(selectedItems);
                        const {left, right} = selectionModel.edges;
                        const selectedNames: string[] = columnNames.filter((name, index) => {
                            return index >= left && index <= right;
                        });
                        cmd.setParameter({columnNames: selectedNames});
                        const result = cmd.execute();
                        if (doCut && result) {
                            undoStack?.push(cmd);
                            gridDispatch?.({type: "update"});
                        }
                    }
                }
                break;
            }
            case "v": {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    if (selectionModel?.edges != null) {
                        const cmd = new PasteCommand(items);
                        const {left, top} = selectionModel.edges;
                        cmd.setParameter({rowIndex: top, colIndex: left, columnNames});
                        const result = cmd.execute();
                        if (result) {
                            undoStack?.push(cmd);
                            gridDispatch?.({type: "update"});
                        }
                    }
                }
                break;
            }
            default:
                if (!ctrlKey && e.key != null && pattern.test(e.key)) {
                    dispatch({type: "clear"});
                    e.stopPropagation();
                }
        }
    }
}


/**
 * An implementation of the state pattern.  Determines the behavior
 * of various key commands when a cell is in "edit mode."
 */
export class EditMode implements CellState {
    readonly #context: GridContextType;

    constructor(ctx: GridContextType) {
        this.#context = ctx;
    }

    onKeyDown = (e: KeyboardEvent, dispatch: Dispatch<CellFactoryAction>) => {
        switch (e.key) {
            case "Escape":
                e.preventDefault();
                e.stopPropagation();
                dispatch({type: "discard"});
                break;
            case "Enter":
                e.preventDefault();
                e.stopPropagation();
                dispatch({type: "deactivate"});
                break;
            case "Copy":
            case "c":
            case "Cut":
            case "x":
                if (e.ctrlKey || e.metaKey) {
                    e.stopPropagation();
                    return;
                }
                break;
            case "y":
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                break;
            case "z":
                if (e.ctrlKey || e.metaKey) {
                    // Let browser behavior take over.
                    e.stopPropagation();
                    return;
                }
                break;
            default:
            // Do nothing
        }
    }
}

