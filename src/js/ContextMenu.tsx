import React, {ReactElement, RefObject, useContext, useEffect, useRef, useState} from "react";
import {Command} from "../types/types";
import {joinCss} from "./util/utils";
import styles from "./core/menus.css";
import Menu from "./core/Menu";
import {GridContext} from "./GridContext";

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
    const eventTarget = useRef<HTMLElement | null>(null);
    const gridContext = useContext(GridContext);

    useEffect(() => {
        const onBodyClick = () => setState({...state, visible: false});
        document.body?.addEventListener("click", onBodyClick);
        return () => {
            document.body?.removeEventListener("click", onBodyClick);
        };
    }, []);


    useEffect(() => {
        const onContextMenu = (e: MouseEvent):void => {
            e.preventDefault();
            e.stopPropagation();  // Allows nested menus

            if (e.target instanceof HTMLElement) {
                eventTarget.current = e.target;
                const focused = gridContext.focusModel?.current?.focused;
                if (focused != null) {
                    gridContext.selectionModel?.current?.reset(focused?.rowIndex, focused?.colIndex);
                }
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
            targetRef.current.addEventListener("contextmenu", onContextMenu);
        }

        return () => {
            if (targetRef.current != null) {
                targetRef.current.removeEventListener("contextmenu", onContextMenu)
            }
        }
    }, [targetRef.current, popupRef]);

    if (state.visible) {
        commands.forEach((c => {
            c.setParameter({
                targetRef: eventTarget,
                selectionModel: gridContext.selectionModel?.current,
                items: gridContext.items,
            })
        }))
        return (
            <Menu
                commands={commands}
                visible={state.visible}
                top={state.top}
                left={state.left}
                className={joinCss(styles.contextmenu, className)}
                onClick={() => setState({...state, visible: false})}
            />
        );
    }
    return <></>;
}
