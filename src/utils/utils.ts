import { PieceSymbol, Color } from "chess.js";

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
