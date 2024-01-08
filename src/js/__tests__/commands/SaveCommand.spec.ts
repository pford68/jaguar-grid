import {describe, expect, it} from '@jest/globals';
import SaveCommand from '../../commands/SaveCommand';
import people from "../../../../tests/fixtures/people.json";
import Person from "../../../../tests/models/Person";
import ObservableList, {Record} from "../../ObservableList";
import {Struct} from "../../../types/types";


describe('SaveCommand', () => {
    let list:ObservableList<Struct>;

    beforeEach(() => {
        list = new ObservableList(people.map(person => new Person(person)));
    })

    it('should update an ObservableList', () => {
        const cmd = new SaveCommand(list);
        cmd.setParameter({index: 1, value:{firstName: "Bob"}});
        cmd.execute();
        expect(list.get(1)?.get("firstName")).toBe("Bob");
    });

    it('should undo an update to an ObservableList', () => {
        const cmd = new SaveCommand(list);
        cmd.setParameter({index: 1, value:{firstName: "Bob"}});
        cmd.execute();
        cmd.undo();
        expect(list.get(1)?.get("firstName")).toBe("John");
    });

    it('should undo an update to an ObservableList', () => {
        const cmd = new SaveCommand(list);
        const id = list.get(1)?.id;
        cmd.setParameter({index: 1, value:{firstName: "Bob"}});
        cmd.execute();
        list.sort((a, b) => Number(a.get("age")) - Number(b.get("age")));
        cmd.undo();
        const record = list.find((r: Record<Struct>) => r.id === id);
        expect(list.findIndex((r: Record<Struct>) => r.id === id)).not.toBe(1);
        expect(record?.get("firstName")).toBe("John")
    });

    it('should still undo an update to an ObservableList after sorting', () => {
        const cmd = new SaveCommand(list);
        cmd.setParameter({index: 1, value:{firstName: "Bill"}});
        cmd.execute();
        cmd.undo();
        cmd.redo();
        expect(list.get(1)?.get("firstName")).toBe("Bill");
    });

    it('should redo an update to an ObservableList', () => {
        const cmd = new SaveCommand(list);
        const id = list.get(1)?.id;
        cmd.setParameter({index: 1, value:{firstName: "Bill"}});
        cmd.execute();
        list.sort((a, b) => Number(a.get("age")) - Number(b.get("age")));
        cmd.undo();
        cmd.redo();
        const record = list.find((r: Record<Struct>) => r.id === id);
        expect(list.findIndex((r: Record<Struct>) => r.id === id)).not.toBe(1);
        expect(record?.get("firstName")).toBe("Bill")
    });
});