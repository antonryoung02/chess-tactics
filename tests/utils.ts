import { Chess, Move } from "chess.js";

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
