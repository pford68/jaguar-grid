import React, {ReactElement, RefObject, useEffect, useRef, useState} from "react";
import {Command} from "../types/types";
import Popup from "./core/Popup";
import MenuItem from "./core/MenuItem";
import {joinCss} from "./util/utils";
import styles from "./core/menus.css";
import Menu from "./core/Menu";

type ContextMenuProps = {
    commands: Command<unknown>[],
    targetRef: RefObject<HTMLElement>,
    className?: string,
}


export default function ContextMenu(props: ContextMenuProps): ReactElement {
    const {
        commands,
        targetRef,
        className,
    } = props;
    const [state, setState] = useState({visible: false, top: 0, left:0 });
    const popupRef: RefObject<HTMLDivElement> = useRef(null);
    const eventTarget = useRef<HTMLElement>(null);

    useEffect(() => {
        const onContextMenu = (e: MouseEvent):void => {
            e.preventDefault();
            if (e.target instanceof HTMLElement) {
                // @ts-ignore
                eventTarget.current = e.target;
            }
            setState((prev => {
                return {
                    visible: !prev.visible,
                    top: e.clientY,
                    left: e.clientX,
                }
            }));
        }

        if (targetRef.current != null) {
            targetRef.current.addEventListener("contextmenu", onContextMenu)
        }

        return () => {
            if (targetRef.current != null) {
                targetRef.current.removeEventListener("contextmenu", onContextMenu)
            }
        }
    }, [targetRef.current, popupRef]);

    if (state.visible) {
        return (
            <Menu
                commands={commands}
                visible={state.visible}
                top={state.top}
                left={state.left}
                className={joinCss(styles.menu, className)}
            />
        );
    }
    return <></>;
}
