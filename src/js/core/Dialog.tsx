import React, {ReactElement, ReactNode, MouseEvent} from "react";
import {Consumer} from "../../types/types";
import Popup from "./Popup";
import styles from "./menus.css";
import {joinCss} from "../util/utils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

type DialogProps = {
    visible: boolean,
    children: ReactElement,
    onClose: Consumer<MouseEvent>,
    title?: ReactNode,
    className?: string,
    titleClass?: string,
    contentClass?: string,
}

export default function Dialog(props: DialogProps): ReactNode {
   const {
       children,
       visible,
       className,
       title,
       titleClass,
       contentClass,
       onClose,
   } = props;

   return (
       <Popup
           visible={visible}
           className={joinCss(styles.dialog, className)}
           center={true}
       >
           <div className={styles.titlebar}>
               <span className={styles.corner}></span>
               <span className={joinCss(styles.title, titleClass)}>{title}</span>
               <span
                   className={joinCss(styles.corner, styles.control)}
                   onClick={onClose}
               >
                   <FontAwesomeIcon icon="xmark" />
               </span>
           </div>
           <div className={joinCss(styles.content, contentClass)}>
                {children}
           </div>
       </Popup>
   )
}