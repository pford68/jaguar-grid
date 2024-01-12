import React, {ReactElement} from "react";
import {Command} from "../../types/types";
import styles from "./menus.css";

type MenuItemProps<T>= {
    command: Command<T>,
}

export default function MenuItem<T>(props: MenuItemProps<T>): ReactElement {
    const {command} = props;

    return (
        <div
            className={styles.menuItem}
            onClick={command.execute}
        >
            <span>{command.icon}</span>
            <span>{command.name}</span>
        </div>
    )
}