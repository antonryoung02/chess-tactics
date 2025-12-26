import { isSquareUndefended, materialWasGained } from "@utils";
import { Chess, Move } from "chess.js";
import isSquareUndefendedJson from "./base_tactic__is_square_undefended.json";

export function restoreMoves(startFen: string, rawMoves: { from: string; to: string }[]): Move[] {
    const chess = new Chess(startFen);
    const restoredMoves: Move[] = [];

    for (const { from, to } of rawMoves) {
        const move = chess.move({ from, to });
        if (!move)
            throw new Error(`Invalid move: from ${from} to ${to} at position: ${chess.fen()}`);
        restoredMoves.push(move);
    }
    return restoredMoves;
}

export function logBoardSequence(startFen: string, moveSequence: Move[]) {
    const chess = new Chess(startFen);
    console.log(chess.ascii());
    moveSequence.forEach((m) => {
        chess.move(m);
        console.log(chess.ascii());
    });
}

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
