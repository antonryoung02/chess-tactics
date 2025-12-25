import { TrapTactics } from "@tactics";
import isTacticJSON from "./trap__is_tactic.json";
import { logBoardSequence } from "../../base_tactic/base_tactic.test";
import { IsTacticTestCase } from "tests/types";

describe("TrapTactics.isTactic", () => {
    test.each(isTacticJSON)("passes json test cases", (t: IsTacticTestCase) => {
        const trapTactic = new TrapTactics();
        const result = trapTactic.isTactic(t.context);
        if ((result !== null) !== t.expected) {
            console.log(`Failure: ${t.description}. Expected: ${t.expected}`);
            logBoardSequence(t.context.position, []);
        }

        expect(result !== null).toBe(t.expected);
    });
});
