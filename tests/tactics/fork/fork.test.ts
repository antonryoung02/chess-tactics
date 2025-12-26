import { ForkTactics } from "@tactics";
import cosmeticForksJSON from "./fork__get_cosmetic_forks.json";
import isTacticJSON from "./fork__is_tactic.json";
import { restoreMoves, logBoardSequence } from "../../tactical_heuristics/base_tactic.test";
import { IsTacticTestCase } from "tests/types";

describe("ForkTactics.getCosmeticForks", () => {
    test.each(cosmeticForksJSON)("passes json test cases", (t) => {
        const forkTactic = new ForkTactics();
        const moveSequence = restoreMoves(t.start_fen, t.move_sequence);
        const result = forkTactic.getCosmeticForks(t.start_fen, moveSequence[0]);
        if (result.length !== t.expected) {
            console.log(`Failure: ${t.description}. Expected: ${t.expected}`);
            logBoardSequence(t.start_fen, moveSequence);
        }

        expect(result.length).toBe(t.expected);
    });
});

describe("ForkTactics.isTactic", () => {
    test.each(isTacticJSON)("passes json test cases", (t: IsTacticTestCase) => {
        const forkTactic = new ForkTactics();
        const result = forkTactic.isTactic(t.context);
        if ((result !== null) !== t.expected) {
            console.log(`Failure: ${t.description}. Expected: ${t.expected}. Recieved: ${result}`);
            logBoardSequence(t.context.position, []);
        }
        expect(result !== null).toBe(t.expected);
    });
});
