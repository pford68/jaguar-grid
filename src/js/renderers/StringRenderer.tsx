import React from "react";
import {InputContainer as StatefulInput} from "./StatefulInput";
import {BaseRendererProps} from "./types";
import {COMMON_DEFAULT_PROPS} from "../constants";
import Text from "./Text";


export type StringProps = BaseRendererProps<number> & {
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
    } = props;
    const nextProps = {
        ...props,
        name,
        value: String(value),
        placeholder: String(props.placeholder),
        className: props.className,
    }

    if (!active) {
        return <Text value={value} className={className} validator={validator} />;
    }

    return <StatefulInput {...nextProps} ref={rendererRef} type="text"/>;
}

StringRenderer.defaultProps = {
    ...COMMON_DEFAULT_PROPS,
    placeholder: "",
}