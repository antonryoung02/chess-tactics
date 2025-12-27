import isTacticJSON from "./hanging_piece__is_tactic.json";
import { logBoardSequence } from "tests/utils";
import { PositionComparisonTacticContext } from "@types";
import { IsTacticTestCase } from "tests/types";
import { TacticFactory } from "@chess-tactics";

describe("HangingPieceTactics.isTactic", () => {
    test.each(isTacticJSON)("passes json test cases", (t: IsTacticTestCase) => {
        const hangingPieceTactic = TacticFactory.create("hanging");
        const context = t.context as PositionComparisonTacticContext;
        const result = hangingPieceTactic.isTactic(context);
        if ((result !== null) !== t.expected) {
            console.log(`Failure: ${t.description}. ${t.expected}`);
            logBoardSequence(context.position, []);
        }

        expect(result !== null).toBe(t.expected);
    });
});
