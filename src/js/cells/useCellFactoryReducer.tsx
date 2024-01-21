import {Dispatch, RefObject, useContext, useReducer} from "react";
import {CellFactoryAction, CellFactoryState} from "./types";
import SaveCommand from "../commands/SaveCommand";
import {GridContext} from "../GridContext";
import {useParserRegistry} from "./useRegistry";

type useReducerProps = {
    /** The reducer uses the value from this element. */
    ref: RefObject<HTMLInputElement>,
    /** The rowIndex of the cell. */
    rowIndex: number,
    /** The name of the cell data from the data row. */
    name: string,
}

export default function useCellFactoryReducer(props: useReducerProps): [CellFactoryState, Dispatch<CellFactoryAction>] {

    const {ref, name, rowIndex} = props;
    const gridContext = useContext(GridContext);
    const {
        items,
        undoStack,
        redoStack,
    } = gridContext;
    const getParserByType = useParserRegistry();

    const reducer = (state: CellFactoryState, action: CellFactoryAction) => {
        switch (action.type) {
            case "activate":
            case "clear":
                return {...state, active: true, task: action.type};
            case "deactivate": { // Sends to focused mode and flushes changes.
                const type = ref.current?.type ?? "string";
                const value = ref.current?.value;
                if (items != null && value != null && !(value.trim().length === 0 && !gridContext.nullable)) {
                    const parsedValue = getParserByType(value, type);
                    const cmd = new SaveCommand(items);
                    cmd.setParameter({index: rowIndex, value: {[name]: parsedValue}})
                    cmd.execute();
                    redoStack?.clear();
                    undoStack?.push(cmd);
                }
                return {...state, active: false};
            }
            case "discard": { // Moves to focus mode and discards changes.
                return {...state, active: false};
            }
            case "invalidate": {
                return {...state, valid: false};
            }
            case "validated": {
                return {...state, valid: true};
            }
            default:
                throw(new Error());
        }
    }

    const initState: CellFactoryState = {active: false, valid: true};
    return useReducer(reducer, initState);
}
