import React, {ReactElement, ReactNode} from "react";
import {createPortal} from "react-dom";
import styles from "./menus.css";

type PopProps = {
    visible: boolean,
    children: ReactElement | ReactElement[],
}

/**
 * This component should always be on top, so it attaches to document.body.
 *
 * @param props
 * @constructor
 */
export default function Popup(props: PopProps): ReactElement | ReactElement[] {
    const {visible, children} = props;

    if (visible && document.body != null) {
        return createPortal((
            <div
                className={styles.popup}
            >
                {children}
            </div>
        ), document.body);
    }
    return <></>;
}
