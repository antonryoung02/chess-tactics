import isTacticJson from "./sacrifice__is_tactic.json";
import { logBoardSequence } from "tests/utils";
import { IsTacticTestCase } from "tests/types";
import { ChessTactics } from "@chess-tactics";

describe("SacrificeTactics.isTactic", () => {
    test.each(isTacticJson)("passes json test cases", (t: IsTacticTestCase) => {
        const ct = new ChessTactics(["sacrifice"]);
        const result = ct.classify(t.context);

        const foundTactic = result.length === 1;
        if (foundTactic !== t.expected) {
            console.log(`Failure: ${t.description}. Expected: ${t.expected}`);
            logBoardSequence(t.context.position, []);
        }

        expect(foundTactic).toBe(t.expected);
        if (foundTactic) {
            expect(result[0].attackedPieces.length).toBeGreaterThanOrEqual(1);
            expect(result[0].sequence.length).toBeGreaterThanOrEqual(1);
            expect(result[0].startPosition).toBe(t.context.position);
            result[0].sequence.forEach((item, index) => {
                expect(item).not.toBeNull();
            });
        }
    });
});
