import React, {ReactElement, ReactNode, MouseEvent, useState, useCallback} from "react";
import Popup from "./Popup";
import styles from "./menus.css";
import {joinCss} from "../util/utils";

type TooltipProps = {
    text: ReactNode,
    children: ReactElement | ReactElement[],
    className?: string,
}

export default function Tooltip(props: TooltipProps): ReactElement {
    const {text, children, className} = props;
    const [state, setState] = useState({
        visible: false,
        top: 0,
        left: 0,
    });

    const onMouseover = useCallback(
        (e: MouseEvent) => {
            setState((prev) => {
                return {
                    visible: true,
                    top: e.clientY,
                    left: e.clientX,
                }
            })
        },
        [setState],
    );

    const onMouseout = useCallback(
        (e: MouseEvent) => {
            setState({
                visible: false,
                top: e.clientY,
                left: e.clientX,
            })
        },
        [setState],
    );



    return (
        <>
            <Popup
                visible={state.visible}
                top={state.top}
                left={state.left}
                offsetLeft={5}
                offsetTop={5}
                className={joinCss(styles.tooltip, className)}
                modal={false}
            >
                {text}
            </Popup>
            <div
                onMouseOver={onMouseover}
                onMouseOut={onMouseout}
            >
                {children}
            </div>
        </>
    );
}