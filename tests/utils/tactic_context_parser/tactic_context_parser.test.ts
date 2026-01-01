import { DEFAULT_TACTIC_OPTIONS, TacticContextParser } from "@utils";
import moveEvaluationJSON from "./moveEvaluation.json";
import uciEvaluationJSON from "./uciEvaluation.json";
import { Move } from "chess.js";

// parser returns Chess.Move objects but test cases use a subset {from, to} for simplicity.
function movesAreEqual(
    move1: Move | { from: string; to: string },
    move2: Move | { from: string; to: string }
): boolean {
    return move1.from === move2.from && move1.to === move2.to;
}

describe("parse", () => {
    test.each(moveEvaluationJSON)("Correctly parse MoveEvaluation objects", (t: any) => {
        const context = t.context;
        const result = TacticContextParser.parse(context, DEFAULT_TACTIC_OPTIONS);
        for (let i = 0; i < result.evaluation.sequence.length; i++) {
            expect(movesAreEqual(result.evaluation.sequence[i], t.expected.sequence[i])).toBe(true);
        }
    });

    test.each(uciEvaluationJSON)("Correctly parse UciEvaluation objects", (t: any) => {
        const context = t.context;
        const result = TacticContextParser.parse(context, DEFAULT_TACTIC_OPTIONS);
        for (let i = 0; i < result.evaluation.sequence.length; i++) {
            expect(movesAreEqual(result.evaluation.sequence[i], t.expected.sequence[i])).toBe(true);
        }
    });
});
