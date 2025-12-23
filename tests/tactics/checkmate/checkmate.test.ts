import { CheckmateTactics } from "../../src/functions/checkmate";
import { restoreMoves, logBoardSequence } from "../../base_tactic/base_tactic.test";
import isTacticJson from "./checkmate_is_tactic.json";

describe("isTactic", () => {
    test("passes json test cases", () => {
        isTacticJson.forEach((t) => {
            const checkmateTactic = new CheckmateTactics();
            const result = checkmateTactic.isTactic(t.start_fen, t.evaluations, t.start_index);

            if ((result !== null) !== t.expected) {
                console.log(`Failure: ${t.description}. ${t.expected}`);
                logBoardSequence(t.start_fen, []);
            }

            expect(result !== null).toBe(t.expected);
        });
    });
});
