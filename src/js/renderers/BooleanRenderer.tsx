import React from "react";
import {joinCss} from "../util/utils";
import styles from "./Renderers.css";
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

    const baseClassName = joinCss(styles.renderer, styles.boolean, className);

    const inputProps = {
        name,
        value: (value === true ? "true" : "false"),
        className: joinCss(baseClassName, styles.active),
        // "switch" is weeded out, but format == switch is handled later on.
        type: format,
        checked: value === true,
    };

    if (!active) {
        return <Text value={value} className={baseClassName} validator={validator} />;
    }

    if (format === "switch") {
        return (
            <label className={styles.switch}>
                <StatefulInput {...inputProps} ref={rendererRef} type="checkbox" />
                <span className={joinCss(styles.slider, styles.round)}></span>
            </label>
        )
    }

    const finalFormat = format === "text" || format === "checkbox" ? format : "checkbox";

    return (
        <StatefulInput {...inputProps} ref={rendererRef} type={finalFormat}/>
    );
}

BooleanRenderer.defaultProps = {
    value: false,
}
