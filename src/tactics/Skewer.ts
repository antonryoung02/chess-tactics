import { Chess, Move } from "chess.js";
import { BaseTactic, PIECE_VALUES, SequenceInterpreter } from "@utils";
import { DefaultTacticContext, FEN, TacticClassifier } from "@types";

const baseTactic = new BaseTactic();
class SkewerTactics implements TacticClassifier {
    isTactic(context: DefaultTacticContext): any | null {
        const { position, evaluation } = context;
        const chessCopy = new Chess(position);
        const currentMove = chessCopy.move(evaluation.move);

        const cosmeticSkewers = this.getCosmeticSkewers(position, currentMove);
        for (const [nextMoveWithPiece, nextMoveWithoutPiece] of cosmeticSkewers) {
            const si = new SequenceInterpreter(position, evaluation);
            const tacticalSequence = si.identifyWinningSequence(
                [currentMove.to],
                [nextMoveWithPiece.to, nextMoveWithoutPiece.to]
            );
            if (tacticalSequence) {
                return {
                    type: "skewer",
                    piece: currentMove.piece,
                    position: position,
                    sequence: tacticalSequence,
                };
            }
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
}

export { SkewerTactics };
