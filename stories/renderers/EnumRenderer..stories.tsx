import * as React from "react";
import {Meta} from "@storybook/react";
import EnumRenderer from "../../src/js/renderers/EnumRenderer";

type PropsAndArgs = React.ComponentProps<typeof EnumRenderer> & {
    width: number,
};

const meta: Meta<PropsAndArgs> = {
    title: "renderers/EnumRenderer",
    component: EnumRenderer,
    args: {
        width: 800,
        role: "combobox",
        listItems: [
            "green",
            "blue",
            "red",
            "yellow",
            "black",
            "sliver",
            "copper",
            "gold",
        ],
    },
};

export default meta;


const defaultRenderer = (args: PropsAndArgs) => {
    const props = {...args, width: undefined};
    return (
        <div style={{width: "800px"}}>
            <EnumRenderer {...props} />
        </div>
    );
};

export const Primary = {
    render: defaultRenderer
}
