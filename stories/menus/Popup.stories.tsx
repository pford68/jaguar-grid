import * as React from "react";
import {Meta, StoryObj} from "@storybook/react";
import Popup from "../../src/js/menus/Popup";
import styles from "../css/Popup.stories.css"


type PropsAndArgs = React.ComponentProps<typeof Popup> & {
    width: number,
    height: number,
};


const meta: Meta<PropsAndArgs> = {
    title: "menus/Popup",
    component: Popup,
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
        <Popup {...props} >
            <div>This is a popup.  This is the base component for dropdowns and menus.</div>
        </Popup>
    );
};


export const Primary: Story = {
    render: defaultRenderer,
};




