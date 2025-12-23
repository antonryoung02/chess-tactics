import { Chess, Move } from "chess.js";

export type FEN = string;

export const PIECE_VALUES = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: Infinity,
};

// TODO package method positionAtEndOfSequence
export function fenAtEndOfSequence(startFen: FEN, sequence: string[] | null) {
    if (!sequence) return startFen;
    const chess = new Chess(startFen);
    sequence.forEach((m) => {
        chess.move(m);
    });

    return chess.fen();
}
