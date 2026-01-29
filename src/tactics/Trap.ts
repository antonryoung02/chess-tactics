import { Chess, Move, Square } from "chess.js";
import {
    PIECE_VALUES,
    getEscapeSquares,
    getBlockingMoves,
    invertTurn,
    attackingSquareIsGood,
    getMoveDiff,
} from "@utils";
import { Fen, Tactic } from "@types";
import { BaseTactic } from "@tactics";
import { _DefaultTacticContext } from "src/_types";

class TrapTactics extends BaseTactic {
    isTactic(context: _DefaultTacticContext): Partial<Tactic> | null {
        const { position, evaluation } = context;
        const chess = new Chess(position);
        const currentMove = chess.move(evaluation.sequence[0]);
        const cosmeticTrap = this.getCosmeticTrap(position, currentMove);
        if (!cosmeticTrap) return null;
        const tacticalSequence = this.sequenceInterpreter.identifyWinningSequence(
            [currentMove.to],
            [cosmeticTrap.square],
        );
        if (tacticalSequence) {
            return {
                type: "trap",
                attackedPieces: [
                    {
                        square: cosmeticTrap.square,
                        piece: cosmeticTrap.piece,
                    },
                ],
                ...tacticalSequence,
            };
        }
        return null;
    }

    getCosmeticTrap(position: Fen, currentMove: Move): any | null {
        const chess = new Chess(position);
        const capturingMoves = this.getCapturablePieces(currentMove, position);

        // the position after currentMove is a check
        if (capturingMoves.filter((m) => m.captured === "k").length > 0) return null;

        for (let i = 0; i < capturingMoves.length; i++) {
            chess.load(position);
            chess.move(currentMove);
            const m = capturingMoves[i];
            const fen = chess.fen();
            // There are cases where previously trapped pieces are classified on the next move.
            // The current move should reveal or directly attack the piece of interest
            // TODO
            // Add testcases where piece is trapped, and moving away from an opponent's one check threat triggers the 'trap' on the unrelated piece
            if (this.pieceIsTrapped(fen, m)) {
                if (m.captured && PIECE_VALUES[m.piece] < PIECE_VALUES[m.captured]) {
                    return {
                        square: m.to,
                        piece: { type: m.captured, color: m.color === "w" ? "b" : "w" },
                    };
                } else {
                    // piece doesn't move. can we capture it?
                    const chessCopy = new Chess(chess.fen());
                    invertTurn(chessCopy);
                    if (attackingSquareIsGood(chessCopy.fen(), m.to)) {
                        return {
                            square: m.to,
                            piece: { type: m.captured, color: m.color === "w" ? "b" : "w" },
                        };
                    }
                }
            }
        }
        return null;
    }

    private pieceIsTrapped(position: Fen, move: Move): boolean {
        const attackingSquare = move.from;
        const threatenedSquare = move.to;
        const escapeSquares = getEscapeSquares(position, threatenedSquare);
        const blockingMoves = getBlockingMoves(position, attackingSquare, threatenedSquare);
        // can't trap a pawn, any pinned piece should not be a 'trap'
        if (move.captured === "p" || this.piecePinnedToKing(position, move.to)) return false;
        return escapeSquares.length === 0 && blockingMoves.length === 0;
    }

    private getCapturablePieces(currentMove: Move, position: Fen): Array<Move> {
        // A capturable piece is one that can be taken. No other assumptions
        // game must be the initial position
        const chess = new Chess(position);
        const originalMoves = chess.moves({ verbose: true });
        const chessCopy = new Chess(position);
        chessCopy.move(currentMove);
        invertTurn(chessCopy);

        const possibleMoves = chessCopy.moves({ verbose: true });
        // moveDiff ensures the move you made is responsible for revealing the trap, either directly or indirectly
        const moveDiff = getMoveDiff(originalMoves, possibleMoves);
        let targetedPieces: Array<Move> = [];
        for (const m of moveDiff) {
            if (m.captured) {
                targetedPieces.push(m);
            }
        }
        return targetedPieces;
    }

    private piecePinnedToKing(fen: Fen, square: Square): boolean {
        const chess = new Chess(fen);
        const color = chess.get(square)?.color;
        const parts = fen.split(" ");
        fen = parts[0] + " " + color + " " + parts.slice(2).join(" ");
        chess.load(fen, { skipValidation: true });
        if (chess.inCheck()) {
            return false;
        }
        chess.remove(square);
        return chess.inCheck();
    }
}

export { TrapTactics };
