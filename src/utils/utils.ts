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

export function fenAtEndOfSequence(startFen: FEN, sequence: string[] | null) {
    if (!sequence) return startFen;
    const chess = new Chess(startFen);
    sequence.forEach((m) => {
        chess.move(m);
    });

    return chess.fen();
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

export function materialValueInPosition(position: FEN): Record<Color, number> {
    const pieceCounts = pieceCountsInPosition(position);
    const values: Record<Color, number> = { w: 0, b: 0 };

    for (const [color, pieces] of Object.entries(pieceCounts) as [Color, any][]) {
        for (const [piece, count] of Object.entries(pieces) as [PieceSymbol, number][]) {
            if (piece !== "k") {
                values[color] += PIECE_VALUES[piece] * count;
            }
        }
    }
    return values;
}

export function pieceCountsInPosition(position: FEN): Record<Color, Record<PieceSymbol, number>> {
    const counts: Record<Color, Record<PieceSymbol, number>> = {
        w: { p: 0, b: 0, n: 0, q: 0, r: 0, k: 0 },
        b: { p: 0, b: 0, n: 0, q: 0, r: 0, k: 0 },
    };

    const pieces = position.split(" ")[0];
    for (const p of pieces as PieceSymbol) {
        if (!Object.keys(counts.w).includes(p.toLowerCase())) {
            continue;
        }
        const pieceKey = p.toLowerCase() as PieceSymbol;
        if (p === pieceKey) {
            counts.b[pieceKey] += 1;
        } else {
            counts.w[pieceKey] += 1;
        }
    }
    return counts;
}

export function materialWasGained(startFen: FEN, endFen: FEN, pieceColor: Color | string): boolean {
    const startMaterial = materialValueInPosition(startFen);
    const endMaterial = materialValueInPosition(endFen);
    const startAdvantage = startMaterial.w - startMaterial.b;
    const endAdvantage = endMaterial.w - endMaterial.b;
    if (pieceColor === "w") {
        return endAdvantage - startAdvantage > 0;
    }
    return endAdvantage - startAdvantage < 0;
}
