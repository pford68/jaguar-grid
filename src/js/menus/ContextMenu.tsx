import React, {ReactElement, RefObject, useEffect, useState} from "react";
import {Command} from "../../types/types";
import Popup from "./Popup";
import MenuItem from "./MenuItem";

type ContextMenuProps = {
    commands: Command<unknown>[],
    targetRef: RefObject<HTMLElement>,
}
export default function ContextMenu(props: ContextMenuProps): ReactElement {
    const {commands, targetRef} = props;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onContextMenu = (e: MouseEvent):void => {
            e.preventDefault();
            setVisible(true);
        }
        if (targetRef.current != null) {
            targetRef.current.addEventListener("contextmenu", onContextMenu)
        }

        return () => {
            if (targetRef.current != null) {
                targetRef.current.removeEventListener("contextmenu", onContextMenu)
            }
        }
    }, [targetRef.current]);

    if (visible) {
        return (
            <Popup visible={visible}>
                {commands.map(c => <MenuItem command={c} />)}
            </Popup>
        );
    }
    return <></>;
}