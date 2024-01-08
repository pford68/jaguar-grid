import * as React from "react";
import {Meta} from "@storybook/react";
import StringRenderer from "../../src/js/renderers/StringRenderer";

type PropsAndArgs = React.ComponentProps<typeof StringRenderer> & {
    width: number,
};

const meta:Meta<PropsAndArgs> = {
    title: "renderers/StringRenderer",
    component: StringRenderer,
    args: {
        width: 800,
        name: "First Name",
        value: "Luka",
    },
};

export default meta;



const defaultRenderer = (args: PropsAndArgs) => {
    const props = {...args, width: undefined};
    return (
        <div style={{width: "800px"}}>
            <form style={{width: "50%"}}>
                <label>
                    {props.name}
                    <StringRenderer {...props} />
                </label>
            </form>
        </div>
    );
};

export const Primary = {
    render: defaultRenderer
}
