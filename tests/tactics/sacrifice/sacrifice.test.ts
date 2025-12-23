import isTacticJson from "./sacrifice__is_tactic.json";
import { SacrificeTactics } from "../../src/functions/sacrifice";

import {
    createMockEvalService,
    restoreMoves,
    logBoardSequence,
} from "../base_tactic/base_tactic.test";

describe("Sacrifice.isTactic", () => {
    test("passes json test cases", () => {
        const evalService = createMockEvalService();
        const sacTactic = new SacrificeTactics(evalService);

        isTacticJson.forEach((t) => {
            if (t.debug) {
                debugger;
            }
            const result = sacTactic.isTactic(t.start_fen, t.evaluation);
            if ((result !== null) !== t.expected) {
                console.log(`Failure: ${t.description}. ${t.expected}`);
                logBoardSequence(t.start_fen, []);
            }

            expect(result !== null).toBe(t.expected);
        });
    });
});
