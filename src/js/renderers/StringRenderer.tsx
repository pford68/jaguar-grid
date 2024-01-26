import React from "react";
import {InputContainer as StatefulInput} from "./StatefulInput";
import {BaseRendererProps} from "./types";
import {COMMON_DEFAULT_PROPS} from "../constants";
import Text from "./Text";
import {joinCss} from "../util/utils";
import styles from "./Renderers.css";


export type StringProps = BaseRendererProps<string> & {
    autocomplete?: boolean,
};

export default function StringRenderer(props: StringProps): React.ReactElement {
    const {
        name,
        active,
        value,
        rendererRef,
        className,
        validator,
        readonly,
    } = props;

    const baseClassName = joinCss(styles.renderer, styles.text, className);

    const nextProps = {
        ...props,
        name,
        readonly,
        value: value != null ? String(value) : undefined,
        placeholder: String(props.placeholder),
        className: joinCss(baseClassName, styles.active),
    }

    if (!active) {
        return <Text value={value} className={baseClassName} validator={validator} />;
    }

    return <StatefulInput {...nextProps} ref={rendererRef} type="text"/>;
}

StringRenderer.defaultProps = {
    ...COMMON_DEFAULT_PROPS,
    placeholder: "",
}