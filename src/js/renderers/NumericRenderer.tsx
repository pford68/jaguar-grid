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
    const numericValue = value != null ? Number(value) : null;
    const formattedValue = precision != null ? numericValue?.toFixed?.(precision) : value;
    const nextProps = {
        name,
        value: String(formattedValue),
        className: joinCss(styles.numeric, props.className),
    };

    if (!active) {
        return <Text value={value} className={className} validator={validator} />;
    }

    return (
        <StatefulInput {...nextProps} ref={rendererRef} type="number"/>
    );
}
NumericRenderer.defaultProps = {
    ...COMMON_DEFAULT_PROPS,
}