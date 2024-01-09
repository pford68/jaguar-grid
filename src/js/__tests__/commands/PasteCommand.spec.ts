import people from "../../../../tests/fixtures/people.json";
import Person from "../../../../tests/models/Person";
import {Struct} from "../../../types/types";
import PasteCommand from "../../commands/PasteCommand";
import CopyCommand from "../../commands/CopyCommand";
import ObservableList from "../../ObservableList";

describe("PasteCommand", () => {
    let list:ObservableList<Struct>;
    let colNames: string[];

    beforeEach(() => {
        list = new ObservableList<Struct>(people.map(person => new Person(person)));
        const items = people.slice(4);
        const subItems = items.map(item => {
            return {
                active: item.active,
                age: item.age,
                lastName: item.lastName,
            };
        });
        colNames = ["active", "age", "lastName"];
        const data = JSON.stringify(subItems);
        sessionStorage.setItem(
            CopyCommand.TOKEN,
            `{"items": [{ "data": ${data}, "columnNames": ${JSON.stringify(colNames)} }]}`
        );
    });

    it("should update the selected records", () => {
        const cmd = new PasteCommand(list);
        cmd.setParameter({rowIndex: 0, colIndex: 1, columnNames: Object.keys(people[0])});
        cmd.execute();
        let record = list.get(0);
        expect(record?.get("lastName")).toBe(false);
        expect(record?.get("amount")).toBe(55);
        expect(record?.get("lastUpdated")).toBe("Sanders");

        record = list.get(1);
        expect(record?.get("lastName")).toBe(true);
        expect(record?.get("amount")).toBe(29);
        expect(record?.get("lastUpdated")).toBe("Garcia");
    });

    it("should not update the unselected records", () => {
        const cmd = new PasteCommand(list);
        cmd.setParameter({rowIndex: 0, colIndex: 1, columnNames: Object.keys(people[0])});
        cmd.execute();
        const record = list.get(2);
        expect(record?.get("lastName")).toBe("Seager");
        expect(record?.get("amount")).toBe(55.1);
        expect(record?.get("lastUpdated")).toBe(1704401089);
    });

    it("should not update unselected columns in selected records", () => {
        const cmd = new PasteCommand(list);
        cmd.setParameter({rowIndex: 0, colIndex: 1, columnNames: Object.keys(people[0])});
        cmd.execute();
        const record = list.get(0);
        expect(record?.get("firstName")).toBe("Philip");
        expect(record?.get("active")).toBe(true);
        expect(record?.get("age")).toBe(29);
    });
})