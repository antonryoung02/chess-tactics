import isTacticJson from "./sacrifice__is_tactic.json";
import { logBoardSequence } from "tests/utils";
import { IsTacticTestCase } from "tests/types";
import { TacticFactory } from "@chess-tactics";

describe("SacrificeTactics.isTactic", () => {
    test.each(isTacticJson)("passes json test cases", (t: IsTacticTestCase) => {
        const sacTactic = TacticFactory.create("sacrifice");
        const result = sacTactic.isTactic(t.context);
        if ((result !== null) !== t.expected) {
            console.log(`Failure: ${t.description}. Expected: ${t.expected}`);
            logBoardSequence(t.context.position, []);
        }

        expect(result !== null).toBe(t.expected);
    });
});
