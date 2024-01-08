import * as React from "react";
import {Meta} from "@storybook/react";
import BooleanRenderer from "../../src/js/renderers/BooleanRenderer";

type PropsAndArgs = React.ComponentProps<typeof BooleanRenderer> & {
    width: number,
};

const meta: Meta<PropsAndArgs> = {
    title: "renderers/BooleanRenderer",
    component: BooleanRenderer,
    args: {
        width: 800,
    },
    argTypes: {
        value: {
            control: {type: "boolean"}
        }
    }
};

export default meta;


const defaultRenderer = (args: PropsAndArgs) => {
    const props = {...args, width: undefined};
    return (
        <div style={{width: "800px"}}>
            <form style={{width: "50%"}}>
                <label>
                    {props.name}
                    <BooleanRenderer {...props} />
                </label>
            </form>
        </div>
    );
};

export const Primary = {
    render: defaultRenderer,
}
