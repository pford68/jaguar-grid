import React, {ReactElement} from "react";
import {Command} from "../../types/types";
import Popup from "./Popup";
import MenuItem from "./MenuItem";
import {joinCss} from "../util/utils";
import styles from "./menus.css";

type MenuProps = {
    commands: Command<unknown>[],
    visible: boolean,
    top: number,
    left: number,
    className?: string,
}

export default function Menu(props: MenuProps): ReactElement {
    const {
        commands,
        className,
        visible,
        top,
        left,
    } = props;

    const popupProps = {
        visible,
        top,
        left,
    }


    return (
        <Popup
            {...popupProps}
            className={joinCss(styles.menu, className)}
            noContextMenu
        >
            {commands.map((c, index) => {
                return <MenuItem key={index} command={c}/>;
            })}
        </Popup>
    );
}
