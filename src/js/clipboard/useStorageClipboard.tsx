import {useEffect} from "react";
import CopyCommand from "../commands/CopyCommand";


export function useStorageClipboard(): void {
    useEffect(() => {

        const clearClipboard = () => {
            sessionStorage.removeItem(CopyCommand.TOKEN);
        };

        window.addEventListener("unload", clearClipboard);

        return () => {
            window.removeEventListener("unload", clearClipboard);
        };
    }, []);
}