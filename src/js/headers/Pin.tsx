import React, {ReactElement, RefObject} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./Pin.css";
import {joinCss} from "../util/utils";
import {Consumer} from "../../types/types";
import usePushPin from "./usePushPin";

type PinStatus = {
    pushed: boolean,
    offset?: number,
}

type PinProps = {
    name: string,
    active: boolean,
    parentRef: RefObject<HTMLElement>,
    updater: Consumer<PinStatus>,
}

export default function Pin(props: PinProps): ReactElement {
    const {active, name, updater, parentRef} = props;
    const params = {el: parentRef.current, pushed: active, updater};

    return (
        <FontAwesomeIcon
            size="xs"
            icon="thumbtack"
            className={joinCss(
                styles.pin,
                active ? styles.active : ""
            )}
            onClick={() => usePushPin(params)}
        />
    );
}
