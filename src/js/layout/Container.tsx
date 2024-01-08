import React, {ReactElement} from "react";
import styles from "./Container.css";
import {joinCss} from "../util/utils";

export default function Container(props: ContainerProps) {
    const {
        height,
        resizable,
        width,
        children,
        className,
        border,
    } = props;

    return (
        <div
            className={joinCss(
                styles.container,
                resizable ? styles.resizable : "",
                border === true ? styles.border : styles.borderless,
                className
            )}
            style={{height: `${height}px`, width: `${width != null ? `${width}px` : "auto"}`}}
        >
            {children}
        </div>
    );
}

type ContainerProps = {
    height: number,
    resizable: boolean,
    children: ReactElement,
    border?: boolean,
    width?: number,
    className?: string,
}
Container.defaultProps = {
    resizable: false,
}