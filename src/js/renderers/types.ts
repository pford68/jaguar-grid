import {RefObject, FocusEvent, MouseEvent, KeyboardEvent} from "react";
import type {Consumer, Predicate} from "../../types/types";

export type BaseRendererProps<T> = {
    /**
     * Boolean for whether the value should be rendered in an editable node (e.g. input)
     * or within a readonly DIV.
     */
    active: boolean,
    /**
     * The unformatted value to be displayed by the renderer.
     */
    value?: unknown,
    /** The name of a property used to supply the value. */
    name: string,
    className?: string,
    onChange?: Consumer<string>,
    onFocus?: Consumer<FocusEvent>,
    onBlur?: Consumer<FocusEvent>,
    onKeyDown?: Consumer<KeyboardEvent>,
    onClick?: Consumer<MouseEvent>,
    readonly?: boolean,
    disabled?: boolean,
    /**
     * A function for validating the value. Executed during onChange events.
     * @returns {boolean} Whether the input value is valid.
     */
    validator?: Predicate<T | string | unknown>,
    /** Whether a value is required. If true, the renderer will be marked as invalid if a value is missing. */
    required?: boolean,
    format?: string,
    autoFocus?: boolean,
    /** If true, the renderer autocompletes */
    autocomplete?: boolean,
    /** The list of options for autocompletes. If present, the renderer supports autocompletes. */
    items?: {[key: string] :T}[],
    /**
     * Whether the renderer accepts multiple values. This has an effect only on
     * renderers that support using multiple values.
     */
    multiple?: boolean,
    placeholder?: string,
    rendererRef?: RefObject<HTMLInputElement>,
};

