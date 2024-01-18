import * as React from "react";
import {Meta, StoryObj} from "@storybook/react";
import DataGrid from "../src/js/DataGrid";
import TableColumn from "../src/js/TableColumn";
import ObservableList, {Record} from "../src/js/ObservableList";
import {RefObject, useRef} from "react";
import TableFooter from "../src/js/TableFooter";
import Person, {Measurements} from "../tests/models/Person";
import NumericRenderer from "../src/js/renderers/NumericRenderer";
import people from "../tests/fixtures/people.json";
import airlineSafety from "../tests/fixtures/airline_safety.json";
import Container from "../src/js/layout/Container";
import BaseCommand from "../src/js/commands/BaseCommand";
import {Struct} from "../src/types/types";
import {IconProp} from "@fortawesome/fontawesome-svg-core";


type PropsAndArgs = React.ComponentProps<typeof DataGrid> & {
    width: number,
    height: number,
    showRowCount?: boolean,
};


const meta: Meta<PropsAndArgs> = {
    title: "DataGrid",
    component: DataGrid,
    args: {
        alternateRows: false,
        nullable: false,
        stickyHeaders: true,
        columnSizing: "auto",
    }
};

export default meta;

type Story = StoryObj<PropsAndArgs>;


class LogCommand extends BaseCommand<{targetRef: RefObject<HTMLElement>}>{
    get icon():IconProp { return "pencil"}
    get name() { return "Log"}
    get accelerator() { return "⌘+l"}
    execute = (): boolean => {
        console.log("execute", this.getParameters()[0]);
        const param = this.getParameters().pop();
        const {targetRef} = param ?? {};
        if (targetRef?.current) {
            console.log("Value: ", targetRef.current.textContent);
        }
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
    const props = {...args, width: undefined};
    return (
        <DataGrid
            {...props}
            contextMenuItems={[
                new LogCommand(),
            ]}
        >
            <TableColumn name="firstName" text="First Name" validator={v => v != "Bob"} />
            <TableColumn name="lastName" text="Last Name" required />
            <TableColumn type="currency" name="amount" text="Amount" />
            <TableColumn type="number" name="age" text="Age" />
            <TableColumn name="active" text="Active" />
            <TableColumn type="date" name="lastUpdated" text="Last Updated" width={100} />
            <TableColumn
                name="measurements"
                text="Height"
                renderer={props => {
                    const measurements = props.row.get(props.name);
                    const {height} = (measurements as Measurements) ?? {};
                    return (
                        <NumericRenderer
                            active={props.active}
                            rendererRef={props.rendererRef}
                            name={props.name}
                            value={height}
                            className={props.className}
                        />
                    )
                }}
            />
        </DataGrid>
    );
};


const airlineSafetyRenderer = (args: PropsAndArgs) => {
    const props = {...args, width: undefined};
    const containerRef = useRef(null);

    return (
        <section ref={containerRef} style={{height: `${args.height}px`}}>
            <Container height={500} resizable border>
                <DataGrid {...props}>
                    <TableColumn type="string" name="airline" text="Airline" sticky />
                    <TableColumn type="number" name="avail_seat_km_per_week" text="Available Seats"   />
                    <TableColumn type="number" name="incidents_85_99" text="Incidents 1999" />
                    <TableColumn type="number" name="fatal_accidents_85_99" text="Fatal Accidents 1999" />
                    <TableColumn type="number" name="fatalities_85_99" text="Fatalities 1999"/>
                    <TableColumn type="number" name="incidents_00_14" text="Incidents 2014" />
                    <TableColumn type="number" name="fatal_accidents_00_14" text="Fatal Accidents 2014" />
                    <TableColumn type="number" name="fatalities_00_14" text="Fatalities 2014"/>
                    <TableFooter
                        showRowCount={args.showRowCount}
                        attachTo={containerRef}
                        citation={<a href="https://github.com/fivethirtyeight/data/tree/master/airline-safety">538</a>}
                    />
                </DataGrid>
            </Container>
        </section>
    );
};


export const Primary: Story = {
    args: {
        data: new ObservableList(people.map((item => new Person(item)))),
        sortColumn: "lastName",
    },
    render: defaultRenderer,
};

export const AirlineSafety: Story = {
    args: {
        data: new ObservableList(airlineSafety.map(item => new Record(item))),
        showRowCount: false,
    },
    render: airlineSafetyRenderer,
};



