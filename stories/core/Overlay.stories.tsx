import * as React from "react";
import {Meta, StoryObj} from "@storybook/react";
import Overlay from "../../src/js/core/Overlay";
import styles from "../css/Popup.stories.css"


type PropsAndArgs = React.ComponentProps<typeof Overlay> & {
    width: number,
    height: number,
};


const meta: Meta<PropsAndArgs> = {
    title: "core/Overlay",
    component: Overlay,
    args: {
        visible: true,
        top: 10,
        left: 50,
        width: 800,
        height: 300,
        className: styles.popup,
    },
};

export default meta;

type Story = StoryObj<PropsAndArgs>;


const defaultRenderer = (args: PropsAndArgs) => {
    const props = {...args, width: undefined, height: undefined};
    return (
        <Overlay {...props} >
            <div>This is a popup.  This is the base component for dropdowns and menus.</div>
        </Overlay>
    );
};


export const Primary: Story = {
    render: defaultRenderer,
};




