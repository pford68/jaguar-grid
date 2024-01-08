import React, {ReactElement} from "react";
import ObservableList from "./ObservableList";
import {Struct} from "../types/types";

type VirtualizerProps<T> = {
    data: ObservableList<Struct>,
    children: (data: ObservableList<Struct>) => ReactElement[],
}
export default function Virtualizer<P>(props: VirtualizerProps<P>): ReactElement[] {
    const {children, data} = props;
    // TODO:  pass a slice of rows from the dataset, based on the intersecting buckets
    return children(data);
}