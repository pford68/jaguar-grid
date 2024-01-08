import peopleData from "../../../tests/fixtures/people.json";
import Person from "../../../tests/models/Person";
import ObservableList, {Record} from "..//ObservableList";
import {Struct} from "../../types/types";
import {deepClone} from "../util/utils";

function testAllKeys(r: Record<Struct>) {
    expect(r.get("firstName")).toBe("Adolis");
    expect(r.get("lastName")).toBe("Garcia");
    expect(r.get("age")).toBe(29);
    expect(r.get("active")).toBe(true);
    expect(r.get("lastUpdated")).toBe(1704401089);
    const m = r.get("measurements");
    // @ts-ignore
    expect(m.height).toBe(70);
}
describe("Record", () => {
    let record: Record<Struct>;
    let people: Struct[];

    beforeEach(() => {
        people = deepClone(peopleData);
        record = new Record(people[5]);
    });

    describe("get", () => {
        it("should return the value for the specified key", () => {
            expect(record.get("firstName")).toBe("Adolis");
        });

        it("should return undefined if the key does not exist", () => {
            expect(record.get("benchpress")).toBeUndefined()
        });
    });

    describe("getAll", () => {
        it("should return the entire set of data in the record as key/value pairs (an Object)", () => {
            const result = record.getAll();
            expect(result["firstName"]).toBe("Adolis");
            expect(result["lastName"]).toBe("Garcia");
            expect(result["age"]).toBe(29);
            expect(result["active"]).toBe(true);
            expect(result["lastUpdated"]).toBe(1704401089);
            expect(result["measurements"]).not.toBeUndefined();
        })
    })

    describe("set", () => {
        it("should replace the value at the specified key", () => {
            record.set("firstName", "Fred");
            expect(record.get("firstName")).toBe("Fred");
            expect(record.get("lastName")).toBe("Garcia");
            expect(record.get("age")).toBe(29);
            expect(record.get("active")).toBe(true);
            expect(record.get("lastUpdated")).toBe(1704401089);
        });

        it("should be extensible to know how to save changes to complex properties", () => {
            const person = new Person(people[5]);
            person.set("measurements", 900);
            // @ts-ignore
            expect(person.get("measurements").height).toBe(900);
        })
    });

    describe("clone", () => {
        it("should create a new Record with all data from the cloned Record", () => {
            const clone = record.clone();
            testAllKeys(clone);
        });

        it("should create a new id for the new Record", () => {
            const clone = record.clone();
            expect(clone.id).not.toEqual(record.id);
        })
    });

    describe("copy", () => {
        it("should copy all data from the specified Record", () => {
            const newRecord = new Record<Struct>(people[1]);
            newRecord.copy(record);
            testAllKeys(newRecord);
        });

        it("should augment this Record", () => {
            const newRecord = new Record<Struct>({
                country: "US",
                HR: "a lot",
                state: "Texas",
            });
            newRecord.copy(record)
            expect(newRecord.get("state")).toBe("Texas");
            expect(newRecord.get("HR")).toBe("a lot");
            expect(newRecord.get("country")).toBe("US");
            testAllKeys(newRecord);
        });
    });

    describe("The `deleted` property", () => {
        it("should be readable", () => {
            expect(record.deleted).toBeFalsy();
        });

        it("should be writable", () => {
            record.deleted = true;
            expect(record.deleted).toBeTruthy();
        });
    });

    describe("The `id` property", () => {
        it("should be readable", () => {
            expect(record.id).not.toBeUndefined();
        });

        it("should not be writable", () => {
            try {
                // @ts-ignore
                record.id = "gjfkghgh";
                fail("We should not reach this point.")
            } catch (e:any) {
                console.warn(e.message);
            }
        });
    });
});



describe("ObservableList", () => {
    let list: ObservableList<Struct>;
    let people: Struct[];

    beforeEach(() => {
        people = deepClone(peopleData);
        list = new ObservableList((people.map(person => new Person(person))));
    });

    describe("get", () => {
        it("should get the Record at the specified index", () => {
            const record = list.get(5);
            expect(record instanceof Record).toBeTruthy();
        });

        it("should get the Record at the specified index", () => {
            const record = list.get(5);
            expect(record).toBeDefined();
            if (record != null) {
                testAllKeys(record);
            } else {
                fail("The record should have been found.")
            }
        });
    });

    describe("getAll", () => {
        it("should return all non-deleted items in the list", () => {
            expect(list.getAll().length).toBe(6);
            const record = list.get(1);
            if (record != null) {
                record.deleted = true;
                expect(list.getAll().length).toBe(5);
            } else {
                fail("The record should have been found.")
            }
        });
    })

    describe("updateAt", () => {
        it("should take an updated record and insert it at the specified index", () => {
            const record = list.get(2);
            if (record != null) {
                record.set("firstName", "Jack");
                list.updateAt(2, record);
                expect(record.get("firstName")).toBe("Jack");
            } else {
                fail("The record should have been found.")
            }
        });
    });

    describe("batchUpdate", () => {
        it("should take a list of  updated records and insert each at the specified index", () => {
            const [first, second] = list.slice(2, 4);
            if (first != null && second != null) {
                first.set("firstName", "Jack");
                second.set("firstName", "aaaak");
                const updates = [
                    {index: 2, record: first},
                    {index: 3, record: second},
                ]
                list.batchUpdate(updates);
                expect(list?.get(2)?.get("firstName")).toBe("Jack");
                expect(list?.get(3)?.get("firstName")).toBe("aaaak");
            } else {
                fail("The record should have been found.")
            }
        });
    });

    describe("find", () => {
        it("should return the first Record that matches the criteria", () => {
            let record = list
                .find((item) => item.get("firstName") == "Adolis");
            expect(record).toBeDefined();
            // @ts-ignore: we test for undefined above.
            testAllKeys(record);

            record = list
                .find((item) => item.get("active") == true);
            expect(record?.get("firstName")).toBe("Philip");
        });
    });

    describe("findIndex", () => {
        it("should return the index first Record that matches the criteria", () => {
            let index = list
                .findIndex((item) => item.get("firstName") == "Adolis");
            expect(index).toBe(5);

            index = list
                .findIndex((item) => item.get("active") == true);
            expect(index).toBe(0);
        });
    });

    describe("filter", () => {
        it("should only the records matching the criteria", () => {
            const records = list.filter(item => item.get("active") === true);
            expect(records.length).toBe(4);
        });
    });

    describe("deleteAt", () => {
        it("should flag the item at the specified index for deletion", () => {
            const record = list.get(1);
            list.deleteAt(1);
            expect(record?.deleted).toBeTruthy();
            expect(list.length).toBe(5);
        });

        it("should perform a soft delete that is reversible", () => {
            const record = list.get(1);
            list.deleteAt(1);
            if (record != null) {
                record.deleted = false;
                expect(list.length).toBe(6);
            } else {
                fail("The record should have been found.")
            }
        });
    });

    describe("slice", () => {
        it("should return the Records between the specified indices exclusive", () => {
            const records = list.slice(1,4);
            expect(records.length).toBe(3);
        });
    });
})