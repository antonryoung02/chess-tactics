import isTacticJSON from "./fork__is_tactic.json";
import { logBoardSequence } from "tests/utils";
import { IsTacticTestCase } from "tests/types";
import { ChessTactics } from "@chess-tactics";

describe("ForkTactics.isTactic", () => {
    test.each(isTacticJSON)("passes json test cases", (t: IsTacticTestCase) => {
        const ct = new ChessTactics(["fork"]);
        const result = ct.classify(t.context);
        if ((result !== null) !== t.expected) {
            console.log(`Failure: ${t.description}. Expected: ${t.expected}. Recieved: ${result}`);
            logBoardSequence(t.context.position, []);
        }
        expect(result !== null).toBe(t.expected);
    });
});
