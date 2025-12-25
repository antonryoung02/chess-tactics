import { HangingPieceTactics } from "@tactics";
import isTacticJSON from "./hanging_piece__is_tactic.json";
import { logBoardSequence } from "../../base_tactic/base_tactic.test";
import { PositionComparisonTacticContext } from "@types";
import { IsTacticTestCase } from "tests/types";

describe("HangingPieceTactics.isTactic", () => {
    test.each(isTacticJSON)("passes json test cases", (t: IsTacticTestCase) => {
        const hangingPieceTactic = new HangingPieceTactics();
        const context = t.context as PositionComparisonTacticContext;
        const result = hangingPieceTactic.isTactic(context);
        if ((result !== null) !== t.expected) {
            console.log(`Failure: ${t.description}. ${t.expected}`);
            logBoardSequence(context.position, []);
        }

        expect(result !== null).toBe(t.expected);
    });
});
