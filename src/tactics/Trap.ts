import { Chess, Move, Square } from "chess.js";
import {
    PIECE_VALUES,
    colorToPlay,
    SequenceInterpreter,
    materialAdvantageAfterTradesAtSquare,
    getEscapeSquares,
    getBlockingMoves,
    invertTurn,
} from "@utils";
import { DefaultTacticContext, Fen, TacticClassifier } from "@types";

class TrapTactics implements TacticClassifier {
    isTactic(context: DefaultTacticContext): any | null {
        const { position, evaluation } = context;
        const chessCopy = new Chess(position);
        const currentMove = chessCopy.move(evaluation.move);
        const cosmeticTrap = this.getCosmeticTrap(position, currentMove);
        const si = new SequenceInterpreter(position, evaluation);
        const tacticalSequence = si.identifyWinningSequence(
            [currentMove.to],
            cosmeticTrap?.trappingSquares ?? []
        );
        if (tacticalSequence) {
            return {
                type: "trap",
                attackingMove: currentMove,
                attackedPieces: [],
                //piece: cosmeticTrap.trappedPiece,
                ...tacticalSequence,
                description: "",
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

            if (this.pieceIsTrapped(fen, m)) {
                if (m.captured && PIECE_VALUES[m.piece] < PIECE_VALUES[m.captured]) {
                    return {
                        trappedPiece: m.captured,
                        trappingSquares: capturingMoves.map((m) => m.to),
                    };
                } else {
                    const chessCopy = new Chess(chess.fen());
                    invertTurn(chessCopy);
                    if (
                        materialAdvantageAfterTradesAtSquare(
                            chessCopy.fen(),
                            m.to,
                            chessCopy.turn()
                        ) > 0
                    ) {
                        return {
                            trappedPiece: m.captured,
                            trappingSquares: capturingMoves.map((m) => m.to),
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
        const chessCopy = new Chess(position);
        chessCopy.move(currentMove);
        invertTurn(chessCopy);

        const possibleMoves = chessCopy.moves({ verbose: true });
        let targetedPieces: Array<Move> = [];
        for (const m of possibleMoves) {
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
