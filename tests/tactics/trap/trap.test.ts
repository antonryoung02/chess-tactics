import isTacticJSON from "./trap__is_tactic.json";
import { logBoardSequence } from "tests/utils";
import { IsTacticTestCase } from "tests/types";
import { ChessTactics } from "@chess-tactics";

describe("TrapTactics.isTactic", () => {
    test.each(isTacticJSON)("passes json test cases", (t: IsTacticTestCase) => {
        const ct = new ChessTactics(["trap"]);
        if (t.debug) {
            debugger;
        }
        const result = ct.classify(t.context);
        if (result.length > 0 !== t.expected) {
            console.log(`Failure: ${t.description}. Expected: ${t.expected}`);
            logBoardSequence(t.context.position, []);
        }
        expect(result.length > 0).toBe(t.expected);
    });
});
