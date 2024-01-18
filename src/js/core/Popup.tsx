import React, {ReactNode, useCallback, useEffect, useRef} from "react";
import {createPortal} from "react-dom";
import styles from "./menus.css";
import {joinCss} from "../util/utils";
import {Consumer} from "../../types/types";

type PopProps = {
    visible: boolean,
    children: ReactNode | ReactNode[],
    offsetLeft: number,
    offsetTop: number,
    top?: number,
    left?: number,
    noContextMenu?: boolean,
    className?: string;
    onClickOutside?: Consumer<void>,
    modal: boolean,
    center: boolean,
}

/**
 * This component should always be on top, so it attaches to document.body.
 *
 * @param props
 * @constructor
 */
export default function Popup(props: PopProps): ReactNode | ReactNode[] {
    const {
        visible,
        children,
        top,
        left,
        className,
        onClickOutside,
        offsetTop,
        offsetLeft,
        noContextMenu,
        modal,
        center,
    } = props;

    const ref = useRef<HTMLDivElement | null>(null);

    const normalizePosition = useCallback(
        (): {left?: number, top?: number} => {
            if (ref.current != null && left != null && top != null) {
                const result = {left, top};
                if (window.innerWidth - left < (ref.current.offsetWidth + offsetLeft)) {
                    result.left = left - ref.current.offsetWidth - offsetLeft;
                } else {
                    result.left += offsetLeft;
                }
                if (window.innerHeight - top < ref.current.offsetHeight + offsetTop) {
                    result.top = top - ref.current.offsetHeight - offsetTop;
                } else {
                    result.top += offsetTop;
                }
                return result;
            }
            return {};
        },
        [left, top, ref, offsetLeft, offsetTop],
    );


    useEffect(() => {
        if (onClickOutside != null) {
            const onBodyClick = (e: MouseEvent) => {
                if (e.target instanceof HTMLElement
                    && ref.current != null
                    && !ref.current.contains(e.target)) {
                    onClickOutside();
                }
            }
            if (document.body != null) {
                document.body.addEventListener("click", onBodyClick);
            }

            return () => {
                if (document.body != null) {
                    document.body.removeEventListener("click", onBodyClick);
                }
            }
        }
    }, []);

    useEffect(() => {
        if (noContextMenu && ref.current) {
            const onContextMenu = (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
            }
            ref.current?.addEventListener("contextmenu", onContextMenu);


            return () => {
                ref.current?.removeEventListener("contextmenu", onContextMenu);
            }
        }
    }, []);

    useEffect(() => {
        if (ref.current != null) {
            const {left: normalizedLeft, top: normalizedTop} = normalizePosition();
            ref.current.style.top = `${normalizedTop}px`;
            ref.current.style.left = `${normalizedLeft}px`
        }
    }, [visible]);



    if (visible && document.body != null) {
        return createPortal((
            <div
                className={joinCss(
                    styles.layer,
                    !modal ? styles.nonModal : "",
                    center ? styles.center : "",
                )}
            >
                <div
                    ref={ref}
                    className={joinCss(styles.popup, className)}
                    style={{top: `${top}px`, left: `${left}px`}}
                >
                    {children}
                </div>
            </div>
        ), document.body);
    }
    return "";
}
Popup.defaultProps = {
    offsetLeft: 0,
    offsetTop: 0,
    modal: true,
    center: false,
}
