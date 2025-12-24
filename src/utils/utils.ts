import { PieceSymbol, Color, Chess, Move } from "chess.js";
import { FEN } from "@types";

export const PIECE_VALUES: Record<PieceSymbol, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: Infinity,
};

export function isWhiteToPlay(x: number | string) {
    if (typeof x === "number") {
        return x % 2 === 0;
    } else {
        return x.split(" ")[1] === "w";
    }
}

export function colorToPlay(x: number | string): Color {
    const isWhite = isWhiteToPlay(x);
    return isWhite ? "w" : "b";
}

export function sanToUci(position: FEN, san: string): string {
    const m = sanToMove(position, san);
    return `${m.from}${m.to}`;
}

export function uciToSan(position: FEN, uci: string): string {
    const m = uciToMove(position, uci);
    return m.san;
}

export function uciToMove(position: FEN, uci: string): Move {
    const chess = new Chess(position);
    return chess.move(uci);
}

export function sanToMove(position: FEN, san: string): Move {
    const chess = new Chess(position);
    return chess.move(san);
}

export function moveToUci(move: Move | { from: string; to: string }) {
    return `${move.from}${move.to}`;
}
