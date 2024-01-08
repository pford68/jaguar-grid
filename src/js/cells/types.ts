export type CellFactoryState = {
    active: boolean,
    valid: boolean,
    task?: string,
};

export type CellFactoryAction = {
    type: "activate"
        | "deactivate"
        | "discard"
        | "invalidate"
        | "validated"
        | "clear"
        | "undo"
        | "redo",
    payload?: boolean,
}