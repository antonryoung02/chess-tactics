import isTacticJSON from "./skewer__is_tactic.json";
import { logBoardSequence } from "tests/utils";
import { IsTacticTestCase } from "tests/types";
import { ChessTactics } from "@chess-tactics";

// Currently if you 'skewer' two pieces but the piece you used is capturable it is still a cosmetic skewer.
// May not be a problem if we are checking if the engine plays it (also positive it catches skewers in double checks)

describe("SkewerTactics.isTactic", () => {
    test.each(isTacticJSON)("passes json test cases", (t: IsTacticTestCase) => {
        const ct = new ChessTactics(["skewer"]);
        const result = ct.classify(t.context);

        const foundTactic = result.length === 1;
        if (foundTactic !== t.expected) {
            console.log(`Failure: ${t.description}. Expected: ${t.expected}`);
            logBoardSequence(t.context.position, []);
        }

        expect(foundTactic).toBe(t.expected);
        if (foundTactic) {
            expect(result[0].attackedPieces.length).toBe(2);
            expect(result[0].sequence.length).toBeGreaterThanOrEqual(3);
            expect(result[0].materialChange).toBeGreaterThanOrEqual(1);
            expect(result[0].startPosition).toBe(t.context.position);
            result[0].sequence.forEach((item, index) => {
                expect(item).not.toBeNull();
            });
        }
    });
});
