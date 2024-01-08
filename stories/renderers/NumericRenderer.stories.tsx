import * as React from "react";
import {Meta} from "@storybook/react";
import NumericRenderer from "../../src/js/renderers/NumericRenderer";

type PropsAndArgs = React.ComponentProps<typeof NumericRenderer> & {width: number};

const meta: Meta<PropsAndArgs> = {
    title: "renderers/NumericValue",
    component: NumericRenderer,
    args: {
        width: 800,
        name: "Number",
        value: 1992478144,
    },
};

export default meta;

const renderDefault = (args: PropsAndArgs) => {
    const props = {...args, width: undefined};
    return (
        <div style={{width: "800px"}}>
            <form style={{width: "50%"}}>
                <label>
                    {props.name}
                    <NumericRenderer {...props} />
                </label>
            </form>
        </div>
    );
};

export const Primary = {
    render: renderDefault,
}
