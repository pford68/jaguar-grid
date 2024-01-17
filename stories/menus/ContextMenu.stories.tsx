import * as React from "react";
import {Meta, StoryObj} from "@storybook/react";
import ContextMenu from "../../src/js/menus/ContextMenu";
import styles from "../css/Popup.stories.css"
import {useRef} from "react";
import BaseCommand from "../../src/js/commands/BaseCommand";
import {Struct} from "../../src/types/types";
import CopyCommand from "../../src/js/commands/CopyCommand";
import {IconProp} from "@fortawesome/fontawesome-svg-core";


type PropsAndArgs = React.ComponentProps<typeof ContextMenu> & {
    width: number,
    height: number,
    left: number,
    top: number,
    bottom: number,
};


const meta: Meta<PropsAndArgs> = {
    title: "menus/ContextMenu",
    component: ContextMenu,
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
    get shortCut() { return "⌘+f"}
    execute(): boolean {

        return true;
    }
}

class PrintCommand extends BaseCommand<Struct>{
    get icon():IconProp { return "print"}
    get name():string { return "Print"}
    get shortCut() { return "⌘+p"}
    execute(): boolean {
        window.print();
        return true;
    }
}

class HighlightCommand extends BaseCommand<Struct>{
    get icon():IconProp { return "bomb"}
    get name() { return "Self-Destruct"}
    get shortCut() { return "⌘+h"}
    execute(): boolean {
        alert("Why would you select a menu item labeled \"self-destruct\"?");
        return true;
    }
}


const defaultRenderer = (args: PropsAndArgs) => {
    const props = {...args, width: undefined, height: undefined};
    const {left, top} = args;
    const ref = useRef(null);
    return (
        <div style={{position: "absolute", left: `${left}px`, top: `${top}px`}}>
            <div ref={ref}>This is a context.</div>
            <ContextMenu
                {...props}
                targetRef={ref}
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




