import {Adapter} from "../../types/types";
import {ReactElement} from "react";
import StringRenderer from "../renderers/StringRenderer";
import NumericRenderer from "../renderers/NumericRenderer";
import DateRenderer, {DateTimeRenderer} from "../renderers/DateRenderer";
import BooleanRenderer from "../renderers/BooleanRenderer";

export default function useRegistry(): (value: unknown, type: string | undefined) => Adapter<any, ReactElement> {
    return (value: unknown, type: string | undefined): Adapter<any, ReactElement> => {
        const registry: { [key: string]: Adapter<any, ReactElement> } = {
            "string": StringRenderer,
            "number": NumericRenderer,
            "date": DateRenderer,
            "datetime": DateTimeRenderer,
            "boolean": BooleanRenderer,
            /*
            object: StructRenderer,
            array: ArrayRenderer,
            map: MapRenderer,
            enum: EnumRenderer,
            */
        }

        let _type = type;
        if (_type == null) {
            _type = value?.constructor?.name.toLowerCase();
            if (_type == null) {
                _type = typeof value;
            }
        }
        return registry[_type] ?? StringRenderer;
    };
}