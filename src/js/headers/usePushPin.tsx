import {Consumer} from "../../types/types";

type PinStatus = {
    pushed: boolean,
    offset?: number,
}

type PushPinProps = {
    el: HTMLElement | null,
    pushed: boolean,
    updater: Consumer<PinStatus>,
}

export default function usePushPin(props: PushPinProps) {
    const {el, pushed, updater} = props;
    if (el == null) return;

    if (pushed) {
        el.setAttribute("data-sticky", "false");
        el.style.left = "unset";
        updater({pushed: false});
        return;
    }

    let offset = 0;
    const prev = el.previousElementSibling;
    if (prev instanceof HTMLElement && prev.getAttribute("data-sticky") == "true") {
        offset += Number(prev.getAttribute("data-offset"));
        offset += prev.offsetWidth;
    }

    el.style.left = `${offset}px`;
    el.setAttribute("data-offset", String(offset));
    el.setAttribute("data-sticky", "true");
    updater({pushed: true, offset});
}