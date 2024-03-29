import people from "../../../../tests/fixtures/people.json";
import Person from "../../../../tests/models/Person";
import CopyCommand from "../../commands/CopyCommand";

describe("CopyCommand", () => {
    let list:Person[];

    beforeEach(() => {
        //mockStore = {};
        list = people.map(person => new Person(person));
    });

    describe("setParameters()", () => {
        let selectedItems: Person[];
        beforeEach(() => {
            selectedItems = list.slice(1,4);
        });

        it("should add the values at the specified columns to the parameter list", () => {
            const cmd = new CopyCommand(selectedItems);
            cmd.setParameter({columnNames: ["firstName", "lastName", "age"]});
            const [param] = cmd.getParameters();
            expect(param.data?.[0]["firstName"]).toBe("John");
            expect(param.data?.[0]["lastName"]).toBe("Smith");
            expect(param.data?.[0]["age"]).toBe(44);
            expect(param.data?.[1]["firstName"]).toBe("Corey");
            expect(param.data?.[1]["lastName"]).toBe("Seager");
            expect(param.data?.[1]["age"]).toBe(32);
            expect(param.data?.[2]["firstName"]).toBe("Luka");
            expect(param.data?.[2]["lastName"]).toBe("Doncic");
            expect(param.data?.[2]["age"]).toBe(23);
        });
    })

    describe("execute()", () => {
        let selectedItems: Person[];

        beforeEach(() => {
            selectedItems = list.slice(1,4);
        });

        it("should add the parameters to sessionStorage", () => {
            const cmd = new CopyCommand(selectedItems);
            cmd.setParameter({columnNames: ["firstName", "lastName", "age"]});
            cmd.execute();
            const item = sessionStorage.getItem(CopyCommand.TOKEN);
            expect(item).toBeDefined();
            expect(typeof item).toBe("string");
            expect(item?.includes("Corey")).toBeTruthy();
            expect(item?.includes("Seager")).toBeTruthy();
            expect(item?.includes("Luka")).toBeTruthy();
            expect(item?.includes("Doncic")).toBeTruthy();
            expect(item?.includes("John")).toBeTruthy();
            expect(item?.includes("Smith")).toBeTruthy();
            expect(item?.match(/columnNames/g)?.length).toBe(1);
            expect(item?.match(/data/g)?.length).toBe(1);
            expect(item?.match(/firstName/g)?.length).toBe(4);  // 3 entries, plus 1 from columnNames
            expect(item?.match(/lastName/g)?.length).toBe(4);
            expect(item?.match(/"age"/g)?.length).toBe(4);
        });
    })
})