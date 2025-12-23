import { HangingPieceTactics } from "../../src/functions/hanging_piece";
import getIsHangingPieceJson from "./hanging_piece__is_tactic.json";
import { logBoardSequence } from "../base_tactic/base_tactic.test";

describe("isTactic", () => {
    test("passes json test cases", () => {
        getIsHangingPieceJson.forEach((t) => {
            if (t.debug) {
                debugger;
            }
            const hangingPieceTactic = new HangingPieceTactics();
            const result = hangingPieceTactic.isTactic(
                t.start_fen,
                t.prev_eval,
                t.curr_eval,
                t.prev_move as { from: string; to: string; captured: string }
            );
            if ((result !== null) !== t.expected) {
                console.log(`Failure: ${t.description}. ${t.expected}`);
                logBoardSequence(t.start_fen, []);
            }

            expect(result !== null).toBe(t.expected);
        });
    });
});
