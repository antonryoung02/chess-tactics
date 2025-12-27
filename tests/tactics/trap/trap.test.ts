import isTacticJSON from "./trap__is_tactic.json";
import { logBoardSequence } from "tests/utils";
import { IsTacticTestCase } from "tests/types";
import { TacticFactory } from "@chess-tactics";

describe("TrapTactics.isTactic", () => {
    test.each(isTacticJSON)("passes json test cases", (t: IsTacticTestCase) => {
        const trapTactic = TacticFactory.create("trap");
        const result = trapTactic.isTactic(t.context);
        if ((result !== null) !== t.expected) {
            console.log(`Failure: ${t.description}. Expected: ${t.expected}`);
            logBoardSequence(t.context.position, []);
        }
        expect(result !== null).toBe(t.expected);
    });
});
