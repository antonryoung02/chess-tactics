import { Chess, Move } from "chess.js";
import { BaseTactic } from "@utils/base_tactic";
import { PIECE_VALUES, fenAtEndOfSequence } from "./utils";
import { Evaluation, FEN, TacticClassifier, TacticContext } from "@types";

const baseTactic = new BaseTactic();
class SkewerTactics implements TacticClassifier {
    isTactic(context: TacticContext) {
        const { position, evaluation } = context;
        const chessCopy = new Chess(position);
        const currentMove = chessCopy.move(evaluation.move);

        const cosmeticSkewers = this.getCosmeticSkewers(position, currentMove);
        for (const [nextMoveWithPiece, nextMoveWithoutPiece] of cosmeticSkewers) {
            const skewer = this.isTacticalSkewer(
                position,
                currentMove,
                nextMoveWithPiece,
                nextMoveWithoutPiece,
                evaluation
            );
            if (skewer) return skewer;
        }
        return null;
    }

    getCosmeticSkewers(position: FEN, currentMove: Move): Move[][] {
        if (["p", "k", "n"].includes(currentMove.piece)) {
            return [];
        }
        const chess = new Chess(position);
        chess.move(currentMove);
        // On the next turn where can you move this piece
        baseTactic.invertTurn(chess);
        const possibleNextMoves = chess.moves({ square: currentMove.to, verbose: true });
        const cosmeticSkewers = [];
        for (const move of possibleNextMoves) {
            if (!move.captured || move.captured === currentMove.piece) {
                continue;
            }

            // Return to on next turn position and remove the piece
            chess.load(position);
            chess.move(currentMove);
            if (move.captured === "k") {
                if (chess.isGameOver()) {
                    return [];
                }
                const responses = chess.moves({ square: move.to, verbose: true });
                if (responses.length === 0) continue;
                chess.move(responses[0]);
            } else {
                chess.remove(move.to);
                baseTactic.invertTurn(chess);
            }

            const possibleNextMovesWithoutPiece = chess.moves({
                square: currentMove.to,
                verbose: true,
            });
            const newMoves = baseTactic.getMoveDiff(
                possibleNextMoves,
                possibleNextMovesWithoutPiece
            );
            for (const m of newMoves) {
                // can you capture behind the piece in front, and is the piece in front more valuable
                if (
                    m.captured &&
                    PIECE_VALUES[move.captured] > PIECE_VALUES[m.captured] &&
                    (baseTactic.isSquareUndefended(chess, m.to, m) ||
                        PIECE_VALUES[currentMove.piece] <= PIECE_VALUES[m.captured])
                ) {
                    cosmeticSkewers.push([move, m]);
                }
            }
        }
        return cosmeticSkewers;
    }

    isTacticalSkewer(
        position: FEN,
        currentMove: Move,
        nextMoveWithPiece: Move,
        nextMoveWithoutPiece: Move,
        evaluation: Evaluation
    ): any | null {
        const chess = new Chess(position);
        chess.move(currentMove);

        const isCaptured = this.areSkeweredPiecesCaptured(
            position,
            currentMove,
            [nextMoveWithPiece, nextMoveWithoutPiece],
            evaluation
        );
        if (isCaptured)
            return {
                type: "skewer",
                piece: currentMove.piece,
                startFen: position,
                sequence: [currentMove.san],
            };

        return null;
    }

    areSkeweredPiecesCaptured(
        position: FEN,
        currentMove: Move,
        attackedPieces: Move[],
        evaluation: Evaluation
    ): boolean {
        const nextKMoves = baseTactic.sequenceToMoveList(position, evaluation);
        const captureSequence = baseTactic.getCaptureSequence(attackedPieces, nextKMoves);
        const endFen = fenAtEndOfSequence(position, captureSequence);
        const chess = new Chess(position);
        chess.move(currentMove);
        if (
            captureSequence &&
            baseTactic.materialWasGained(chess.fen(), endFen, position.split(" ")[1])
        ) {
            return true;
        }
        return false;
    }
}

export { SkewerTactics };
