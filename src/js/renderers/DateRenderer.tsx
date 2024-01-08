import React from "react";
import {joinCss} from "../util/utils";
import styles from "./Renderers.css";
import {BaseRendererProps} from "./types";
import Text from "./Text";

export type DateRendererProps = BaseRendererProps<number> & {};
export type DateTimeRendererProps = DateRendererProps & {};

export default function DateRenderer(props: DateRendererProps): React.ReactElement {
    const {
        value,
        active,
        className,
        validator,
    } = props;
    const nextProps = {
        className: joinCss(styles.date, props.className),
    };

    if (!active) {
        return <Text value={value} className={className} validator={validator} />;
    }

    return (
        <input {...nextProps} type="date"/>
    );
}


export function DateTimeRenderer(props: DateTimeRendererProps): React.ReactElement {
    const nextProps = {
        className: joinCss(styles.date, props.className),
    };

    return (
        <input {...nextProps} type="date"/>
    );
}

