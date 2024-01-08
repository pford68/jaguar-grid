import React, {ReactElement} from "react";
import {Predicate} from "../../types/types";
import {joinCss} from "../util/utils";
import styles from "./Renderers.css";

export type TextProps = {
    value: unknown,
    className?: string,
    validator?: Predicate<string>,
}

export default function Text(props: TextProps): ReactElement {
    const {value, className, validator} = props;
    const finalClass = joinCss(
        !(validator?.(String(value)) ?? true) ? styles.invalid :  "",
        className,
    )

    return <div className={finalClass}>{String(value)}</div>
}
