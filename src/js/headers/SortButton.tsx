import React,  {ReactElement} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "../DataGrid.css";
import {SORT_DIRECTION_ASC} from "../constants";

type SortButtonProps = {
    active: boolean,
    sortDirection: string | undefined,
}
export default function SortButton(props: SortButtonProps): ReactElement {
    const {active, sortDirection} = props;
    return active
        ? (sortDirection === SORT_DIRECTION_ASC
            ? <FontAwesomeIcon className={styles.sortButton} icon="sort-up" />
            : <FontAwesomeIcon className={styles.sortButton} icon="sort-down" />)
        : <FontAwesomeIcon className={styles.sortButton} icon="sort" />;
}