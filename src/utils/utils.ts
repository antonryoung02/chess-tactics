import { PieceSymbol, Color, Chess, Move } from "chess.js";
import { Fen } from "@types";

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

// Note: this is needed over chess.setTurn because it allows color change when in check
export function setTurn(position: Fen, color: Color) {
    let fenSplit = position.split(" ");
    fenSplit[1] = color;
    return fenSplit.join(" ");
}

export function invertTurn(chess: Chess): void {
    let fenSplit = chess.fen().split(" ");
    fenSplit[1] = fenSplit[1] === "w" ? "b" : "w";
    fenSplit[3] = "-";

    chess.load(fenSplit.join(" "));
}

export function fenAtEndOfSequence(startFen: Fen, sequence: string[] | null) {
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

export function sanToUci(position: Fen, san: string): string {
    const m = sanToMove(position, san);
    return `${m.from}${m.to}`;
}

export function uciToSan(position: Fen, uci: string): string {
    const m = uciToMove(position, uci);
    return m.san;
}

export function uciToMove(position: Fen, uci: string): Move {
    const chess = new Chess(position);
    return chess.move(uci);
}

export function sanToMove(position: Fen, san: string): Move {
    const chess = new Chess(position);
    return chess.move(san);
}

export function moveToUci(move: Move | { from: string; to: string }) {
    return `${move.from}${move.to}`;
}

export function materialValueInPosition(position: Fen): Record<Color, number> {
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

export function pieceCountsInPosition(position: Fen): Record<Color, Record<PieceSymbol, number>> {
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

export function materialWasGained(startFen: Fen, endFen: Fen, pieceColor: Color | string): number {
    const startMaterial = materialValueInPosition(startFen);
    const endMaterial = materialValueInPosition(endFen);
    const startAdvantageWhite = startMaterial.w - startMaterial.b;
    const endAdvantageWhite = endMaterial.w - endMaterial.b;
    if (pieceColor === "w") {
        return endAdvantageWhite - startAdvantageWhite;
    }
    return startAdvantageWhite - endAdvantageWhite;
}

export function getMoveDiff(originalMoves: Move[], newMoves: Move[]): Move[] {
    return newMoves.filter(
        (m) => originalMoves.map((n) => n.to).includes(m.to) === false && m.captured
    );
}
