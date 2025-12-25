import { BaseTactic } from "@utils/base_tactic";
import { Chess, Move } from "chess.js";
import isSquareUndefendedJson from "./base_tactic__is_square_undefended.json";
import { materialWasGained } from "@utils/utils";

export function restoreMoves(startFen: string, rawMoves: { from: string; to: string }[]): Move[] {
    // JSON.stringify(Move) does not keep the Move interface
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

describe("invertTurn", () => {
    test("inverts white to play", () => {
        const baseTactic = new BaseTactic();

        const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        const chess = new Chess(initialFen);
        baseTactic.invertTurn(chess);
        expect(chess.fen()).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1");
    });

    test("is inverse of self", () => {
        const baseTactic = new BaseTactic();

        const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        const chess = new Chess(initialFen);
        baseTactic.invertTurn(chess);
        baseTactic.invertTurn(chess);
        expect(chess.fen()).toBe(initialFen);
    });
});

describe("isSquareUndefended", () => {
    test("passes json test cases", () => {
        const baseTactic = new BaseTactic();

        isSquareUndefendedJson.forEach((t) => {
            const chess = new Chess(t.start_fen);
            const moveSequence = restoreMoves(t.start_fen, t.move_sequence);
            const move = moveSequence[0];
            const result = baseTactic.isSquareUndefended(chess, move.to, move);

            if (result !== t.expected) {
                console.log(`Failure: ${t.description}`);
                logBoardSequence(t.start_fen, moveSequence);
            }

            expect(result).toBe(t.expected);
        });
    });
});

describe("materialWasGained", () => {
    test("change of 0 returns false for both colors", () => {
        const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

        const whiteGained = materialWasGained(initialFen, initialFen, "w");
        const blackGained = materialWasGained(initialFen, initialFen, "b");

        expect(whiteGained).toBe(false);
        expect(blackGained).toBe(false);
    });

    test("white advantage returns true for white", () => {
        const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        const fenWithExtraQueen = "rnbqkbnr/pppppppp/8/8/8/8/QPPPPPPP/RNBQKBNR w KQkq - 0 1";

        const whiteGained = materialWasGained(initialFen, fenWithExtraQueen, "w");
        const blackGained = materialWasGained(initialFen, fenWithExtraQueen, "b");

        expect(whiteGained).toBe(true);
        expect(blackGained).toBe(false);
    });
});
