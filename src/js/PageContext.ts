import {createContext} from "react";

export type PageContextType = {
   page: number,
}
export const initialPageContext: PageContextType = {
   page: 0,
}
export const PageContext = createContext(initialPageContext);
