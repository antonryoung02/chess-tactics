import { Chess } from "chess.js";
import { SkewerTactics } from "@tactics";
import cosmeticSkewersJSON from "./skewer__get_cosmetic_skewers.json";
import isTacticJSON from "./skewer__is_tactic.json";
import { restoreMoves, logBoardSequence } from "../../tactical_heuristics/base_tactic.test";
import { IsTacticTestCase } from "tests/types";

// Currently if you 'skewer' two pieces but the piece you used is capturable it is still a cosmetic skewer.
// May not be a problem if we are checking if the engine plays it (also positive it catches skewers in double checks)

describe("SkewerTactics.getCosmeticSkewers", () => {
    test.each(cosmeticSkewersJSON)("passes json test cases", (t) => {
        const skewerTactic = new SkewerTactics();

        const chess = new Chess(t.start_fen);
        const moveSequence = restoreMoves(t.start_fen, t.move_sequence);
        chess.move(moveSequence[0]);
        const result = skewerTactic.getCosmeticSkewers(t.start_fen, moveSequence[0]);

        if (result.length !== t.expected) {
            console.log(`Failure: ${t.description}`);
            logBoardSequence(t.start_fen, moveSequence);
        }

        expect(result.length).toBe(t.expected);
    });
});

describe("SkewerTactics.isTactic", () => {
    test.each(isTacticJSON)("passes json test cases", (t: IsTacticTestCase) => {
        const skewerTactic = new SkewerTactics();
        const result = skewerTactic.isTactic(t.context);
        if ((result !== null) !== t.expected) {
            console.log(`Failure: ${t.description}. Expected: ${t.expected}`);
            logBoardSequence(t.context.position, []);
        }

        expect(result !== null).toBe(t.expected);
    });
});
