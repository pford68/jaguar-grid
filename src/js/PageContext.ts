import {createContext} from "react";

export type PageContextType = {
   page: number,
   start: number,
   end?: number,
}
export const initialPageContext: PageContextType = {
   page: 0,
   start: 0,
}
export const PageContext = createContext(initialPageContext);
