import React, {ReactElement} from "react";
import {Command} from "../../types/types";
import styles from "./menus.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

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
            <span className={styles.left}>
                <span className={styles.icon}>
                    {
                        typeof command.icon == "string"
                            ? <FontAwesomeIcon icon={command.icon} />
                            : ""
                    }
                </span>
                <span>{command.name}</span>
            </span>
            <span className={styles.shortCut}>{command.shortCut}</span>
        </div>
    )
}