import * as React from "react";
import {Meta, StoryObj} from "@storybook/react";
import Menu from "../../src/js/core/Menu";
import styles from "../css/Popup.stories.css"
import {useRef, useState} from "react";
import BaseCommand from "../../src/js/commands/BaseCommand";
import {Struct} from "../../src/types/types";
import {IconProp} from "@fortawesome/fontawesome-svg-core";


type PropsAndArgs = React.ComponentProps<typeof Menu> & {
    width: number,
    height: number,
    left: number,
    top: number,
    bottom: number,
};


const meta: Meta<PropsAndArgs> = {
    title: "core/Menu",
    component: Menu,
    args: {
        width: 800,
        height: 300,
        left: 50,
        top: 50,
        className: styles.popup,
    },
};

export default meta;

type Story = StoryObj<PropsAndArgs>;

class FileCommand extends BaseCommand<Struct>{
    get icon():IconProp { return "file"}
    get name() { return "File"}
    get accelerator() { return "⌘+f"}
    execute(): boolean {

        return true;
    }
}

class PrintCommand extends BaseCommand<Struct>{
    get icon():IconProp { return "print"}
    get name():string { return "Print"}
    get accelerator() { return "⌘+p"}
    execute(): boolean {
        window.print();
        return true;
    }
}

class HighlightCommand extends BaseCommand<Struct>{
    get icon():IconProp { return "bomb"}
    get name() { return "Self-Destruct"}
    get accelerator() { return "⌘+h"}
    execute(): boolean {
        alert("Why would you select a menu item labeled \"self-destruct\"?");
        return true;
    }
}


const defaultRenderer = (args: PropsAndArgs) => {
    const props = {...args, width: undefined, height: undefined};
    const {left, top} = args;
    const ref = useRef(null);
    const [state, setState] = useState({
        visible: false,
        top:0,
        left: 0
    });
    return (
        <div style={{position: "absolute", left: `${left}px`, top: `${top}px`}}
             onClick={() => {
                 setState({...state, visible: false})
             }}
        >
            <div
                ref={ref}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setState({visible: true, top: e.clientY, left: e.clientX});
                }}
            >
                This is a context.
            </div>
            <Menu
                {...props}
                visible={state.visible}
                top={state.top}
                left={state.left}
                commands={[
                    new FileCommand(),
                    new PrintCommand(),
                    new HighlightCommand(),
                ]}
            />
        </div>
    );
};


export const Primary: Story = {
    render: defaultRenderer,
};




