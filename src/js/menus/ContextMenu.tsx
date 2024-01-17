import React, {ReactElement, RefObject, useEffect, useRef, useState} from "react";
import {Command} from "../../types/types";
import Popup from "./Popup";
import MenuItem from "./MenuItem";
import {joinCss} from "../util/utils";
import styles from "./menus.css";

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

    useEffect(() => {
        const onContextMenu = (e: MouseEvent):void => {
            e.preventDefault();
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
            <Popup
                visible={state.visible}
                top={state.top}
                left={state.left}
                className={joinCss(styles.menu, className)}
                onClickOutside={() => setState({...state, visible: false})}
                noContextMenu
            >
                {commands.map((c, index) => <MenuItem key={index} command={c} />)}
            </Popup>
        );
    }
    return <></>;
}
