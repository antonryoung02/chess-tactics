import { Chess, Move } from "chess.js";
import { SkewerTactics } from "../../src/functions/skewer";
import getCosmeticSkewersJson from "./skewer__get_cosmetic_skewers.json";
import getIsTacticJson from "./skewer__is_tactic.json";
import {
    createMockEvalService,
    restoreMoves,
    logBoardSequence,
} from "../base_tactic/base_tactic.test";

// Currently if you 'skewer' two pieces but the piece you used is capturable it is still a cosmetic skewer.
// May not be a problem if we are checking if the engine plays it (also positive it catches skewers in double checks)

describe("getCosmeticSkewers", () => {
    test("passes json test cases", () => {
        const evalService = createMockEvalService();
        const skewerTactic = new SkewerTactics(evalService);

        getCosmeticSkewersJson.forEach((t) => {
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
});

describe("isTactic", () => {
    test("passes json test cases", () => {
        getIsTacticJson.forEach((t) => {
            const evalService = createMockEvalService();
            const skewerTactic = new SkewerTactics(evalService);
            const result = skewerTactic.isTactic(t.start_fen, t.evaluation);
            if ((result !== null) !== t.expected) {
                console.log(`Failure: ${t.description}. ${t.expected}`);
                logBoardSequence(t.start_fen, []);
            }

            expect(result !== null).toBe(t.expected);
        });
    });
});
