import React, {ReactElement, RefObject, MouseEvent} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./Pin.css";
import {joinCss} from "../util/utils";
import {Consumer} from "../../types/types";

type PinProps = {
    active: boolean,
    updater: Consumer<MouseEvent>,
}

export default function Pin(props: PinProps): ReactElement {
    const {active, updater} = props;

    return (
        <FontAwesomeIcon
            size="xs"
            icon="thumbtack"
            className={joinCss(
                styles.pin,
                active ? styles.active : ""
            )}
            onClick={updater}
        />
    );
}
