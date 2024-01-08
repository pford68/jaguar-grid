import * as React from "react";
import StatefulInput from "../../src/js/renderers/StatefulInput";
import styles from "./Renderers.stories.css";
import {Meta} from "@storybook/react";

type PropsAndArgs = React.ComponentProps<typeof StatefulInput> & {width: number, name: string};

const meta: Meta<PropsAndArgs> = {
    title: "renderers/StatefulInput",
    component: StatefulInput,
    args: {
        width: 800,
        name: "Message",
        value: "Hello, world!",
        placeholder: "NULL",
        readonly: false,
        disabled: false,
    },
};
export default meta;

const renderDefault = (args: PropsAndArgs) => {
    const props = {...args, width: undefined};
    return (
        <div style={{width: "800px"}}>
            <form style={{width: "50%"}} className={styles.form}>
                <label>
                    {props.name}
                    <StatefulInput {...props} />
                </label>
            </form>
        </div>
    );
};

export const Primary = {
    render: renderDefault
}

export const Required  = {
    render: renderDefault,
    validator: (v:string) => v != null && v.trim().length > 0,
}

