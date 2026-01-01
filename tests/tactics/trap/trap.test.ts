import isTacticJSON from "./trap__is_tactic.json";
import { logBoardSequence } from "tests/utils";
import { IsTacticTestCase } from "tests/types";
import { ChessTactics } from "@chess-tactics";

describe("TrapTactics.isTactic", () => {
    test.each(isTacticJSON)("passes json test cases", (t: IsTacticTestCase) => {
        const ct = new ChessTactics(["trap"]);
        const result = ct.classify(t.context);

        const foundTactic = result.length === 1;
        if (foundTactic !== t.expected) {
            console.log(`Failure: ${t.description}. Expected: ${t.expected}`);
            logBoardSequence(t.context.position, []);
        }
        expect(foundTactic).toBe(t.expected);
        if (foundTactic) {
            expect(result[0].attackedPieces.length).toBe(1);
            expect(result[0].sequence.length).toBeGreaterThanOrEqual(3);
            expect(result[0].materialChange).toBeGreaterThanOrEqual(1);
            expect(result[0].startPosition).toBe(t.context.position);
        }
    });
});
