import React, {
    FocusEvent,
    KeyboardEvent,
    MouseEvent,
    forwardRef,
    ReactElement,
    Ref,
    useState,
    useEffect
} from "react";
import {Consumer, Predicate} from "../../types/types";
import {joinCss} from "../util/utils";
import styles from "./Renderers.css";


type StatefulInputProps = {
    name: string,
    type: "text" | "date" | "checkbox" | "radio" | "number" | "multiline" | "email" | "tel" | "range" | "url";
    value: string,
    onChange?: Consumer<string>,
    onFocus?: Consumer<FocusEvent>,
    onBlur?: Consumer<FocusEvent>,
    onKeyDown?: Consumer<KeyboardEvent>,
    onClick?: Consumer<MouseEvent>,
    readonly?: boolean,
    className?: string,
    validator?: Predicate<string>,
    autofocus?: boolean,
    required?: boolean,
    placeholder?: string,
    disabled?: boolean,
    checked?: boolean,
}

/**
 * Input elements with a local state, allow them to retain uncommitted changes.
 * StatefulInput can be passed as-is to forwardRef() to expose the input element to
 * components higher up in the tree.  Use InputContainer to do soo, instead of
 * invoked forwardRef directly.
 *
 * @param props
 * @param [ref]
 * @constructor
 */
export default function StatefulInput(props: StatefulInputProps, ref?: Ref<HTMLInputElement>): ReactElement {
    const {
        name,
        value: initValue,
        type,
        onChange,
        validator,
        className,
        required,
        onFocus,
        onBlur,
        onKeyDown,
        placeholder,
        readonly,
        disabled,
        checked,
    } = props;
    const [value, setValue] = useState(initValue);
    const [valid, setValid] = useState(true);

    const nextProps= {
        type,
        name,
        value,
        onFocus,
        onBlur,
        onKeyDown,
        required,
        className,
        placeholder,
        readOnly: readonly,
        disabled,
        checked,
    }

    useEffect(() => {
        if (!(validator?.(value) ?? true)) {
            setValid(false);
        }
    }, []);


    return (
        <input
            {...nextProps}
            // @ts-expect-error: refs type is not recognized.  It's a todo.
            ref={ref?.current !== undefined ? ref : undefined}
            value={value ?? initValue}
            onInput={e => {
                const {target} = e;
                if (target instanceof HTMLInputElement) {
                    const updatedValue = target.value ?? null;
                    const result = validator?.(updatedValue) ?? true;
                    setValid(result);
                    setValue(updatedValue);
                    if (result) {
                        onChange?.(updatedValue);
                    }
                }
            }}
            className={joinCss(!valid ? styles.invalid : "", className)}
        />
    );
}


/**
 * A higher-order component for StatefulInput that exposes the underlying input field through the ref.
 */
export const InputContainer = forwardRef<HTMLInputElement, StatefulInputProps>(StatefulInput);
