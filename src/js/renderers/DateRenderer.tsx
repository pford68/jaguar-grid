import React from "react";
import {joinCss, toISODateString} from "../util/utils";
import styles from "./Renderers.css";
import {BaseRendererProps} from "./types";
import Text from "./Text";
import {InputContainer as StatefulInput} from "./StatefulInput";

export type DateRendererProps = BaseRendererProps<number> & Record<string, never> & {
    addTime: boolean,
};

export default function DateRenderer(props: DateRendererProps): React.ReactElement {
    const {
        name,
        value,
        active,
        className,
        validator,
        addTime,
        rendererRef,
    } = props;

    const baseClassName = joinCss(styles.renderer, styles.date, className);

    const nextProps = {
        name,
        className: joinCss(baseClassName, styles.active),
    };

    const formattedValue = addTime ? new Date(Number(value)).toISOString() : toISODateString(Number(value))

    if (!active) {
        return <Text value={formattedValue} className={baseClassName} validator={validator} />;
    }

    return (
        <StatefulInput {...nextProps} type="date" ref={rendererRef} value={formattedValue} />
    );
}
DateRenderer.defaultProps = {
    addTime: false,
}


