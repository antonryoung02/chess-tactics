import { Chess, Move, Square } from "chess.js";
import { BaseTactic } from "../utils/base_tactic.js";
import { Evaluation, FEN, TacticClassifier, TacticContext } from "../types.js";
import { ChessHelper } from "../utils/chess_helper.js";
import { PIECE_VALUES } from "./utils.js";
import { colorToPlay } from "../utils/utils.js";

const baseTactic = new BaseTactic();
class TrapTactics implements TacticClassifier {
    isTactic(context: TacticContext): any | null {
        const { position, evaluation } = context;
        const chessCopy = new Chess(position);
        const currentMove = chessCopy.move(evaluation.move);
        const cosmeticTrap = this.getCosmeticTrap(position, currentMove);
        if (!cosmeticTrap) {
            return null;
        }
        // add a 'was this piece actually captured by the engine'
        return {
            type: "trap",
            piece: cosmeticTrap[1].captured,
            startFen: position,
            sequence: [cosmeticTrap[0].san],
        };
    }

    getCosmeticTrap(position: FEN, currentMove: Move): Move[] | null {
        const chess = new Chess(position);
        const capturingMoves = this.getCapturablePieces(currentMove, position);

        // the position after currentMove is a check
        if (capturingMoves.filter((m) => m.captured === "k").length > 0) return null;

        for (let i = 0; i < capturingMoves.length; i++) {
            const ch = new ChessHelper();
            chess.load(position);
            chess.move(currentMove);
            const m = capturingMoves[i];
            const fen = chess.fen();

            if (this.pieceIsTrapped(fen, m)) {
                if (m.captured && PIECE_VALUES[m.piece] < PIECE_VALUES[m.captured]) {
                    return [currentMove, m]; //trapping move, move that captures trapped piece
                } else {
                    const chessCopy = new Chess(chess.fen());
                    baseTactic.invertTurn(chessCopy);
                    if (
                        ch.materialAdvantageAfterTradesAtSquare(
                            chessCopy.fen(),
                            m.to,
                            colorToPlay(chessCopy.fen())
                        ) > 0
                    ) {
                        return [currentMove, m]; //trapping move, move that captures trapped piece
                    }
                }
            }
        }
        return null;
    }

    private pieceIsTrapped(position: FEN, move: Move): boolean {
        const ch = new ChessHelper();
        const attackingSquare = move.from;
        const threatenedSquare = move.to;
        const escapeSquares = ch.getEscapeSquares(position, threatenedSquare);
        const blockingMoves = ch.getBlockingMoves(position, attackingSquare, threatenedSquare);
        // can't trap a pawn, any pinned piece should not be a 'trap'
        if (move.captured === "p" || ch.piecePinnedToKing(position, move.to)) return false;
        return escapeSquares.length === 0 && blockingMoves.length === 0;
    }

    private getCapturablePieces(currentMove: Move, position: FEN): Array<Move> {
        // A capturable piece is one that can be taken. No other assumptions
        // game must be the initial position
        const chessCopy = new Chess(position);
        chessCopy.move(currentMove);
        baseTactic.invertTurn(chessCopy);

        const possibleMoves = chessCopy.moves({ verbose: true });
        let targetedPieces: Array<Move> = [];
        for (const m of possibleMoves) {
            if (m.captured) {
                targetedPieces.push(m);
            }
        }
        return targetedPieces;
    }
}

export { TrapTactics };
