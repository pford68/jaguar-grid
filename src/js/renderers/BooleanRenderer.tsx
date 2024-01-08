import React from "react";
import {joinCss} from "../util/utils";
import styles from "../DataGrid.css";
import {BaseRendererProps} from "./types";
import {InputContainer as StatefulInput} from "./StatefulInput";
import Text from "./Text";

export type BooleanRendererProps = {
    format: "checkbox" | "switch" | "text",
} & BaseRendererProps<boolean>;

export default function BooleanRenderer(props: BooleanRendererProps): React.ReactElement {
    const {
        name,
        rendererRef,
        className,
        value,
        active,
        format,
        validator,
    } = props;

    const inputProps = {
        name,
        value: (value === true ? "true" : "false"),
        className: joinCss(styles.date, className),
        // "switch" is weeded out, but format == switch is handled later on.
        type: format,
        checked: value === true,
    };

    if (!active) {
        return <Text value={value} className={className} validator={validator} />;
    }

    if (format === "switch") {
        // TODO: return a switch
    }

    const finalFormat = format === "text" || format === "checkbox" ? format : "checkbox";

    return (
        <StatefulInput {...inputProps} ref={rendererRef} type={finalFormat}/>
    );
}

BooleanRenderer.defaultProps = {
    value: false,
}
