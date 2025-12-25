import isTacticJson from "./sacrifice__is_tactic.json";
import { SacrificeTactics } from "@tactics";
import { logBoardSequence } from "../../base_tactic/base_tactic.test";
import { IsTacticTestCase } from "tests/types";

describe("SacrificeTactics.isTactic", () => {
    test.each(isTacticJson)("passes json test cases", (t: IsTacticTestCase) => {
        const sacTactic = new SacrificeTactics();
        const result = sacTactic.isTactic(t.context);
        if ((result !== null) !== t.expected) {
            console.log(`Failure: ${t.description}. Expected: ${t.expected}`);
            logBoardSequence(t.context.position, []);
        }

        expect(result !== null).toBe(t.expected);
    });
});
