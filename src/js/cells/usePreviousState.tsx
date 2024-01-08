import {RefObject, useEffect, useRef} from "react";

type PreviousStateProps = {
    watch: unknown,
}


export default function usePreviousState(props: PreviousStateProps): RefObject<unknown> {
    const previous = useRef<unknown>(null);
    const {watch} = props;

    useEffect(() => {
        previous.current = watch;
    }, [watch]); //run this code when the value of count changes

    return previous;
}