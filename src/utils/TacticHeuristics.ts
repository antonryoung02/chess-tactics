import { Fen } from "@types";
import { Chess, Move, Color, Square } from "chess.js";
import { PIECE_VALUES, colorToPlay, setTurn, invertTurn } from "@utils";

export function attackingSquareIsGood(
    fen: Fen,
    square: Square,
    startingMove: Move = null
): boolean {
    const advantage = materialAdvantageAfterTradesAtSquare(fen, square, startingMove);
    const color = colorToPlay(fen);
    if (color === "w") {
        return advantage > 0;
    }
    return advantage < 0;
}

export function attackingSquareIsBad(fen: Fen, square: Square, startingMove: Move = null): boolean {
    const advantage = materialAdvantageAfterTradesAtSquare(fen, square, startingMove);
    const color = colorToPlay(fen);
    if (color === "w") {
        return advantage < 0;
    }
    return advantage > 0;
}

export function materialAdvantageAfterTradesAtSquare(
    position: Fen,
    square: Square,
    startingMove: Move = null
): number {
    const chess = new Chess(position);
    let score = 0;
    if (startingMove) {
        chess.move(startingMove);
        if (startingMove.captured) {
            if (chess.turn() === "w") {
                score -= PIECE_VALUES[startingMove.captured];
            } else {
                score += PIECE_VALUES[startingMove.captured];
            }
        }
    }
    return helper(chess, square, score);
}

function helper(chess: Chess, square: Square, score: number): number {
    if (chess.turn() === "w" && score > 0) return score;
    if (chess.turn() === "b" && score < 0) return score;

    const possibleMoves = chess.moves({ verbose: true }).filter((m) => m.to === square);
    if (possibleMoves.length === 0) return score;

    const leastMaterialMove = possibleMoves.sort(
        (a, b) => PIECE_VALUES[a.piece] - PIECE_VALUES[b.piece]
    );
    const move = chess.move(leastMaterialMove[0]);
    if (chess.turn() === "w") {
        score -= PIECE_VALUES[move.captured];
    } else {
        score += PIECE_VALUES[move.captured];
    }
    return helper(chess, square, score);
}

export function getEscapeSquares(fen: Fen, square: Square) {
    const chess = new Chess(fen);
    const piece = chess.get(square);
    if (!piece) {
        throw new Error("function called on a square that is unoccupied!");
    }
    const moves = chess.moves({ square, verbose: true });
    const escapeSquares = [];
    for (let i = 0; i < moves.length; i++) {
        if (!attackingSquareIsBad(fen, moves[i].to, moves[i])) {
            escapeSquares.push(moves[i].to);
        }
    }

    return escapeSquares;
}

export function getBlockingMoves(fen: Fen, attackingSquare: Square, threatenedSquare: Square) {
    if (squaresAreNeighbors(attackingSquare, threatenedSquare)) {
        return [];
    }
    const chess = new Chess(fen);
    const attackingPiece = chess.get(attackingSquare);
    const threatenedPiece = chess.get(threatenedSquare);

    if (!attackingPiece || !threatenedPiece) {
        throw new Error(
            `The squares ${attackingSquare} or ${threatenedSquare} do not have pieces on them`
        );
    }
    if (attackingPiece.color === chess.turn()) {
        throw new Error("It should not be attacker's turn to move!");
    }
    if (threatenedPiece.color !== chess.turn()) {
        throw new Error("It needs to be defender's turn to move!");
    }
    chess.load(setTurn(chess.fen(), attackingPiece.color));
    if (
        chess
            .moves({ square: attackingSquare, verbose: true })
            .filter((m) => m.to === threatenedSquare).length === 0
    ) {
        throw new Error("attackingSquare doesn't even threaten threatenedSquare");
    }
    chess.load(setTurn(chess.fen(), threatenedPiece.color));

    const candidateMoves = chess
        .moves({ verbose: true })
        .filter((m) => m.from !== threatenedSquare)
        .filter((m) => {
            const chessCopy = new Chess(fen);
            chessCopy.move(m);
            return (
                chessCopy
                    .moves({ square: attackingSquare, verbose: true })
                    .filter((n) => n.to === threatenedSquare).length === 0
            );
        });
    const blockingMoves = [];
    for (let i = 0; i < candidateMoves.length; i++) {
        chess.load(fen);
        chess.move(candidateMoves[i]);
        let initialAdvantage = 0;
        const captured = candidateMoves[i].captured;
        if (captured) {
            initialAdvantage = PIECE_VALUES[captured];
        }
        const opponentAdvantage = materialAdvantageAfterTradesAtSquare(
            chess.fen(),
            candidateMoves[i].to
        );
        if (initialAdvantage - opponentAdvantage >= 0) {
            blockingMoves.push({ from: candidateMoves[i].from, to: candidateMoves[i].to });
        }
    }
    return blockingMoves;
}

function squaresAreNeighbors(sq1: Square, sq2: Square): boolean {
    if (sq1 === sq2) return false;
    const x1 = sq1.charCodeAt(0);
    const y1 = parseInt(sq1[1], 10);
    const x2 = sq2.charCodeAt(0);
    const y2 = parseInt(sq2[1], 10);
    const deltaX = Math.abs(x1 - x2);
    const deltaY = Math.abs(y1 - y2);
    return deltaX <= 1 && deltaY <= 1;
}

export function getMovesToSquare(fen: Fen, square: Square): Move[] {
    const chess = new Chess(fen, { skipValidation: true });
    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
        throw new Error(
            "Provided a square that is occupied by a piece of the player to play. This could cause unexpected behavior"
        );
    }
    const pieceMoves = chess
        .moves({ verbose: true })
        .filter((m) => m.to === square && m.piece !== "p");
    const pawnMoves = pawnsDefendingSquare(fen, square, chess.turn());
    chess.load(fen, { skipValidation: true });
    return pieceMoves.concat(pawnMoves);
}

function pawnsDefendingSquare(fen: Fen, square: Square, color: Color) {
    const chess = new Chess(setTurn(fen, color), { skipValidation: true });
    chess.put({ type: "q", color: color === "w" ? "b" : "w" }, square);
    chess.setTurn(color);
    const result = chess.moves({ verbose: true }).filter((m) => m.to === square && m.piece === "p");
    return result;
}

export function getThreateningMoves(position: Fen, currentMove: Move): Move[] {
    // game must be the initial position
    const chess = new Chess(position);
    chess.move(currentMove);
    invertTurn(chess);

    const possibleMoves = chess.moves({ square: currentMove.to, verbose: true });
    const threateningMoves = [];
    for (const m of possibleMoves) {
        for (const n of possibleMoves) {
            if (n.captured !== "k" && n.to !== m.to) chess.remove(n.to);
        }
        if (m.captured && attackingSquareIsGood(chess.fen(), m.to, m) && m.captured !== m.piece) {
            threateningMoves.push(m);
        }
        chess.load(position);
        chess.move(currentMove);
        invertTurn(chess);
    }

    return threateningMoves;
}
