import React, {
    ReactElement,
    MouseEvent,
    KeyboardEvent,
    FocusEvent,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import {Consumer, Coordinates, Predicate, Struct} from "../../types/types";
import {GridContext} from "../GridContext";
import {joinCss} from "../util/utils";
import styles from "../DataGrid.css";
import StringRenderer from "../renderers/StringRenderer";
import Text from "../renderers/Text";
import {type DataTypes} from "../../types/types";
import {type Record} from "../ObservableList";
import {BaseRendererProps} from "../renderers/types";
import {EditMode, FocusMode} from "./modes";
import useRegistry from "./useRegistry";
import useCellFactoryReducer from "./useCellFactoryReducer";
import usePreviousState from "./usePreviousState";


export type ColumnConfigurableProps<T extends Struct> = {
    /**
     * The column of data to render in the table column.
     * Where the data is an array of objects, the name corresponds to a key
     * in each object.
     *
     * @override
     */
    name: string,
    type?: DataTypes,
    /**
     * Whether the value can be edited.
     * @default false
     */
    editable: boolean,
    disabled?: boolean,
    onChange?: Consumer<string>,
    onFocus?: Consumer<FocusEvent>,
    onBlur?: Consumer<FocusEvent>,
    onKeyDown?: Consumer<KeyboardEvent>,
    onClick?: Consumer<MouseEvent>,
    validator?: Predicate<T | string | unknown>,
    required?: boolean,
    /**
     * Whether the column can be made editable.
     * @default false
     */
    readonly?: boolean,
    renderer?: (props: CustomRendererProps<T, unknown>) => ReactElement,
    /** The initial width of the column. */
    width?: number,
    className?: string,
    format?: string,
    placeholder?: string,
    /** Used by numeric renderers */
    precision?: number,
}

/**
 * CellFactoryProps does <strong>not</strong> extend BaseRendererProps. While
 * the CellFactory uses information passed down from the TableColumn to configure
 * its renderer, the CellFactory does not allow the props to trickle down. Its
 * props can be quite different from the props it ultimately sets on its renderer.
 */
export type CellFactoryProps<T extends Struct> = {
    rowIndex: number,
    colIndex: number,
    row: Record<T>,
} & ColumnConfigurableProps<T>;

export type CustomRendererProps<T extends Struct, V> = BaseRendererProps<V> & CellFactoryProps<T>;


/**
 * Responsible for rendering  cells and their content.
 *
 * @param props
 * @constructor
 */
export default function CellFactory<T extends Struct>(props: CellFactoryProps<T>): ReactElement {
    // ================================= Destructuring
    const {
        name,
        row,
        rowIndex,
        colIndex,
        className,
        renderer,
        editable,
        type,
        format,
        placeholder,
        onChange,
        onBlur,
        onFocus,
        onKeyDown: onKyDownProp,
        onClick: onClickProp,
        validator,
        required,
    } = props;
    const gridContext = useContext(GridContext);
    const {
        selectionModel,
        focusModel,
        nullable,
    } = gridContext;

    const focusMode = new FocusMode(gridContext);
    const editMode = new EditMode(gridContext);

    // =============================================== Refs
    const ref = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<HTMLInputElement>(null);

    // ================================================= State
    const [state, dispatch] = useCellFactoryReducer({
        ref: rendererRef,
        rowIndex,
        name,
    });
    const previousActiveState = usePreviousState({watch: state.active});
    const [selected, setSelected] = useState(false);
    const rowCount = gridContext.items?.length ?? 0;
    const value = gridContext.items?.get(rowIndex)?.get(name);

    //==================================================== Effects
    useEffect(() => {
        //@ts-ignore
        const deactivate = (e) => {
            if (ref.current != null && !ref.current?.contains(e.target) && previousActiveState.current === true) {
                //dispatch({type: "discard"});
            }
        }
        document.body?.addEventListener("click", deactivate);

        return () => {
            document.body?.removeEventListener("click", deactivate);
        };
    }, []);

    useEffect(() => {
        const onFocusChanged = (coords: Coordinates | undefined) => {
            if (coords?.colIndex === colIndex && coords?.rowIndex === rowIndex) {
                ref.current?.focus();
            } else if (previousActiveState.current === true) {
                // When we click on another cell, the currently active cell should deactivate.
                dispatch({type: "deactivate"});
            }
        }
        const onSelectionChanged = () => {
            const result = selectionModel?.isContained(rowIndex, colIndex) ?? false;
            setSelected(result);
        }

        focusModel?.on("focusChanged", onFocusChanged);
        selectionModel?.on("selectionChanged", onSelectionChanged);

        return () => {
            focusModel?.off("focusChanged", onFocusChanged);
            selectionModel?.off("selectionChanged", onSelectionChanged);
        };
    }, [
        selectionModel,
        focusModel,
    ]); // Must watch these to reset after re-rendering (e.g., sorting)

    useEffect(() => {
        if (state.active) {
            rendererRef.current?.focus();
            //@ts-ignore
            if (state.task === "clear") {
                rendererRef.current?.select();
            }
        } else if (gridContext.focusModel?.isFocused(rowIndex, colIndex)){
            ref.current?.focus();
        }
    }, [state.active, value]);


    useEffect(() => {
        const offset = gridContext.offsets.get(name);
        const el = ref.current?.parentElement;
        if (el != null && offset != null) el.style.left = `${offset}px`;
    }, [gridContext.pinned, focusModel?.focused, state.active])


    // ====================================== Event handlers
    const onClick = (e: MouseEvent) => {
        const {detail} = e;
        switch (detail) {
            case 2:
                if (state.active) return;
                dispatch?.({type: "activate"});
                break;
            default:
                e.preventDefault();
                if (e.shiftKey) {
                    selectionModel?.select(rowIndex, colIndex);
                } else if (!state.active) {
                    focusModel?.focus(rowIndex, colIndex);
                    selectionModel?.reset(rowIndex, colIndex);
                } else {
                    e.stopPropagation();
                }
        }
    }


    const onKeyDown = (e: KeyboardEvent) => {
        state.active
            ? editMode?.onKeyDown(e, dispatch)
            : focusMode?.onKeyDown(e, dispatch);
    }

    // ============================================= Rendering
    const {top, right, bottom, left} = selectionModel?.edges ?? {};
    const finalClass = joinCss(
        styles.cell,
        rowIndex === rowCount - 1 ? styles.lastRow : "",
        colIndex === gridContext.columnNames.length - 1 ? styles.lastColumn : "",
        selected ? styles.selected : "",
        rowIndex === top ? styles.top : "",
        rowIndex === bottom ? styles.bottom : "",
        colIndex === left ? styles.left : "",
        colIndex === right ? styles.right : "",
        state.active ? styles.active : "",
        gridContext.pinned.has(name) ? styles.stickyColumn : "",
        gridContext.pinned.size - 1 === colIndex ? styles.divider : "",
        className,
    );
    const rendererClass = joinCss(
        state.active ? styles.active : styles.inactive,
    )
    /*
    A custom renderer is like any other renderer, except that it needs the model row.
    So I separate the two Renderer types.
     */
    const CustomRenderer = renderer;
    const getRendererByType = useRegistry();
    let Renderer;
    if (CustomRenderer == null) {
        Renderer = getRendererByType(value, type);
    }

    const finalOnChange =  (value: unknown) => {
        const validate = (value:string): boolean => {
            if (required && value == null) return false;
            const result = validator?.(value) ?? true;
            if (result) onChange?.(value);
            return result;
        }
        if (!validate(String(value))) {
           dispatch({type: "invalidate", payload: false});
        } else {
            dispatch({type: "validated", payload: true});
        }
    }


    // Weeding out unwanted props from higher up, sending only true renderer props.
    const rendererProps = {
        name,
        editable,
        rendererRef,
        value,
        format,
        rowIndex,
        colIndex,
        type,
        onChange: finalOnChange,
        onBlur,
        onFocus,
        onClick: onClickProp,
        onKeyDown: onKyDownProp,
        className: rendererClass,
        active: state.active,
        precision: typeof value === "number" ? props.precision : undefined,
    }

    return (
        <div
            className={finalClass}
            tabIndex={0}
            data-row-index={rowIndex}
            data-col-index={colIndex}
            data-col-name={name}
            data-editable={state.active}
        >
            <div
                ref={ref}
                onFocus={() => focusModel?.sync(rowIndex, colIndex)}
                tabIndex={-1}
                onClick={onClick}
                onDoubleClick={onClick}
                onKeyDown={onKeyDown}
                className={!state.valid ? styles.invalid : ""}
            >
                {value == null && !nullable && !state.active ?
                    <Text value={placeholder} className={styles.null} validator={validator} /> :
                    (
                        CustomRenderer != null
                            ? <CustomRenderer {...rendererProps} row={row} active={state.active} />
                            : Renderer != null ? <Renderer {...rendererProps} /> :
                                <StringRenderer {...rendererProps} />
                    )
                }
            </div>
        </div>
    )
}
CellFactory.defaultProps = {
    type: "string",
}
