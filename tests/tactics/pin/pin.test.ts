import isTacticJSON from "./pin__is_tactic.json";
import { logBoardSequence } from "tests/utils";
import { IsTacticTestCase } from "tests/types";
import { ChessTactics } from "@chess-tactics";

// describe("PinTactics.getCosmeticPins", () => {
//     test.each(cosmeticPinsJSON)("passes json test cases", (t) => {
//         const pinTactic = TacticFactory.create("pin")

//         const chess = new Chess(t.start_fen);
//         const moveSequence = restoreMoves(t.start_fen, t.move_sequence);
//         chess.move(moveSequence[0]);
//         const result = pinTactic.getCosmeticPins(t.start_fen, moveSequence[0]);
//         if (result.length !== t.expected) {
//             console.log(`Failure: ${t.description}`);
//             logBoardSequence(t.start_fen, moveSequence);
//         }

//         expect(result.length).toBe(t.expected);
//     });
// });

describe("PinTactics.isTactic", () => {
    test.each(isTacticJSON)("passes json test cases", (t: IsTacticTestCase) => {
        const ct = new ChessTactics(["pin"]);
        const result = ct.classify(t.context);

        if ((result !== null) !== t.expected) {
            console.log(`Failure: ${t.description}. ${t.expected}`);
            logBoardSequence(t.context.position, []);
        }

        expect(result !== null).toBe(t.expected);
    });
});
