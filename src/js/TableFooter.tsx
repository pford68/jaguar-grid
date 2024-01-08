import React, {ReactElement, ReactNode, RefObject, useContext, useEffect, useRef, useState} from "react";
import styles from "./DataGrid.css";
import {GridContext} from "./GridContext";
import {createPortal} from "react-dom";

type BaseTableFooterProps = {
    showRowCount?: boolean,
    /**
     * A RefObject for the node to attach the footer too.
     * For cases when you have a scrollable container: you don't want
     * the footer to show inside the container.
     */
    attachTo?: RefObject<HTMLElement>,
    /** The source for the data displayed in the grid */
    citation?: ReactNode,
}

type TableFooterProps = {
    /**
     * Custom renderer for the footer. Has access to all props available to the footer,
     * plus the row count from the grid, and excluding the renderer itself.
     *
     * @param props
     * @todo untested
     */
    renderer?: (props: BaseTableFooterProps & {rowCount?: number}) => ReactElement,
} & BaseTableFooterProps;


export default function TableFooter(props: TableFooterProps): React.ReactElement {
    const {
        showRowCount,
        citation,
        attachTo,
        renderer,
    } = props;
    const gridContext = useContext(GridContext);
    const ref = useRef(null);
    const [state, setState] = useState({parent: null});

    useEffect(() => {
        if (attachTo?.current != null) {
            // @ts-ignore
            setState({parent: attachTo.current})
        }
    }, [attachTo?.current]);


    const renderFooter = () => {
        if (typeof renderer === "function") {
            return renderer({
                rowCount: gridContext.items?.length,
                showRowCount,
                citation,
                attachTo,
            });
        }

        return (
            <div ref={ref} className={styles.footer}>
                {showRowCount === true ? <div>Rows:  {gridContext.items?.length ?? 0}</div>: ""}
                {citation != null ? (
                    <div>
                        <cite>Source: {citation}</cite>
                    </div>
                ) : ""}
            </div>
        );
    };

    if (state.parent!= null) {
        return createPortal(renderFooter(), state.parent);
    }

    return renderFooter();
}

