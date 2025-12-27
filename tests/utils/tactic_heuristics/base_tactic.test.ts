import { isSquareUndefended } from "@utils";
import { Chess, Move } from "chess.js";
import { logBoardSequence, restoreMoves } from "tests/utils";
import isSquareUndefendedJson from "./is_square_undefended.json";

describe("isSquareUndefended", () => {
    test("passes json test cases", () => {
        isSquareUndefendedJson.forEach((t) => {
            const chess = new Chess(t.start_fen);
            const moveSequence = restoreMoves(t.start_fen, t.move_sequence);
            const move = moveSequence[0];
            const result = isSquareUndefended(chess, move.to, move);

            if (result !== t.expected) {
                console.log(`Failure: ${t.description}`);
                logBoardSequence(t.start_fen, moveSequence);
            }

            expect(result).toBe(t.expected);
        });
    });
});
