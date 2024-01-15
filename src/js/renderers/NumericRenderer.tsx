import React from "react";
import {joinCss} from "../util/utils";
import styles from "./Renderers.css";
import {BaseRendererProps} from "./types";
import {COMMON_DEFAULT_PROPS} from "../constants";
import {InputContainer as StatefulInput} from "./StatefulInput";
import Text from "./Text";

export type NumericProps = BaseRendererProps<number> & {
    precision?: number,
};
export default function NumericRenderer(props: NumericProps): React.ReactElement {
    const {
        name,
        precision,
        value,
        active,
        rendererRef,
        className,
        validator,
    } = props;
    const baseClassName = joinCss(styles.renderer, styles.numeric, className);
    const numericValue = value != null ? Number(value) : null;
    const formattedValue = precision != null ? numericValue?.toFixed?.(precision) : value;
    const nextProps = {
        name,
        value: String(formattedValue),
        className: joinCss(baseClassName, styles.active),
    };

    if (!active) {
        return (
            <Text
                value={value}
                className={joinCss(baseClassName, styles.inactive)}
                validator={validator}
            />
        );
    }

    return (
        <StatefulInput {...nextProps} ref={rendererRef} type="number"/>
    );
}
NumericRenderer.defaultProps = {
    ...COMMON_DEFAULT_PROPS,
}