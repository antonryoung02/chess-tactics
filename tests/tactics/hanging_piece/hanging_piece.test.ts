import { HangingPieceTactics } from "@tactics/HangingPiece";
import getIsHangingPieceJson from "./hanging_piece__is_tactic.json";
import { logBoardSequence } from "../../base_tactic/base_tactic.test";
import { PositionComparisonTacticContext } from "@types";

describe("isTactic", () => {
    test("passes json test cases", () => {
        getIsHangingPieceJson.forEach((t) => {
            if (t.debug) {
                debugger;
            }
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
});
