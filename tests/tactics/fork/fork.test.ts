import { Chess, Move } from "chess.js";
import { ForkTactics } from "../../src/functions/fork";
import getCosmeticForksJson from "./fork__get_cosmetic_forks.json";
import getIsTacticJson from "./fork__is_tactic.json";
import {
    createMockEvalService,
    restoreMoves,
    logBoardSequence,
} from "../base_tactic/base_tactic.test";

describe("getCosmeticForks", () => {
    test("passes json test cases", () => {
        const evalService = createMockEvalService();
        const forkTactic = new ForkTactics(evalService);
        getCosmeticForksJson.forEach((t) => {
            const chess = new Chess(t.start_fen);
            const moveSequence = restoreMoves(t.start_fen, t.move_sequence);
            chess.move(moveSequence[0]);
            const result = forkTactic.getCosmeticForks(t.start_fen, moveSequence[0]);
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
            const forkTactic = new ForkTactics(evalService);
            const result = forkTactic.isTactic(t.start_fen, t.evaluation);

            if ((result !== null) !== t.expected) {
                console.log(`Failure: ${t.description}. ${t.expected}`);
                logBoardSequence(t.start_fen, []);
            }

            expect(result !== null).toBe(t.expected);
        });
    });
});
