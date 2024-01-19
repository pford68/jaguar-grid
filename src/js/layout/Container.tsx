import React, {createContext, ReactElement, RefObject, useRef} from "react";
import styles from "./Container.css";
import {joinCss} from "../util/utils";


type ContainerProps = {
    height: number,
    resizable: boolean,
    children: ReactElement,
    border?: boolean,
    width?: number,
    className?: string,
}

/**
 *
 * @param props
 * @constructor
 */
export default function Container(props: ContainerProps) {
    const {
        height,
        resizable,
        width,
        children,
        className,
        border,
    } = props;

    const ref = useRef<HTMLDivElement | null>(null);

    return (
        <div
            ref={ref}
            className={joinCss(
                styles.container,
                resizable ? styles.resizable : "",
                border === true ? styles.border : styles.borderless,
                className
            )}
            style={{height: `${height}px`, width: `${width != null ? `${width}px` : "auto"}`}}
        >
            <ContainerContext.Provider value={{
                ...initialContext,
                containerRef: ref,
            }}>
                {children}
            </ContainerContext.Provider>
        </div>
    );
}
Container.defaultProps = {
    resizable: false,
}


type ContainerContextType = {
    resizable: boolean,
    containerRef?: RefObject<HTMLElement>,
    height?: number,
    width?: number,
}
const initialContext: ContainerContextType = {
    resizable: false,
}
export const ContainerContext = createContext<ContainerContextType>(initialContext)