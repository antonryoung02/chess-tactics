import { TrapTactics } from "../../src/functions/trap";
import getIsTacticJson from "./trap__is_tactic.json";
import {
    createMockEvalService,
    restoreMoves,
    logBoardSequence,
} from "../base_tactic/base_tactic.test";

describe("isTactic", () => {
    test("passes json test cases", () => {
        getIsTacticJson.forEach((t) => {
            const evalService = createMockEvalService();
            const trapTactic = new TrapTactics(evalService);
            if (t?.debug) {
                debugger;
            }
            const result = trapTactic.isTactic(t.start_fen, t.evaluation);

            if ((result !== null) !== t.expected) {
                console.log(`Failure: ${t.description}. ${t.expected}`);
                logBoardSequence(t.start_fen, []);
            }

            expect(result !== null).toBe(t.expected);
        });
    });
});
