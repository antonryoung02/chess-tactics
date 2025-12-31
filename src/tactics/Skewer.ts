import { Chess, Move } from "chess.js";
import {
    colorToPlay,
    getMoveDiff,
    invertTurn,
    materialAdvantageAfterTradesAtSquare,
    PIECE_VALUES,
} from "@utils";
import { Fen, Tactic } from "@types";
import { BaseTactic } from "@tactics";
import { _DefaultTacticContext, _TacticContext } from "src/_types";

class SkewerTactics extends BaseTactic {
    isTactic(context: _DefaultTacticContext): Tactic | null {
        const { position, evaluation } = context;
        const chess = new Chess(position);
        const currentMove = chess.move(evaluation.sequence[0]);

        const cosmeticSkewers = this.getCosmeticSkewers(context);
        for (const [nextMoveWithPiece, nextMoveWithoutPiece] of cosmeticSkewers) {
            const tacticalSequence = this.sequenceInterpreter.identifyWinningSequence(
                [currentMove.to],
                [nextMoveWithPiece.to, nextMoveWithoutPiece.to]
            );
            if (tacticalSequence) {
                return {
                    type: "skewer",
                    attackingMove: currentMove,
                    attackedPieces: [
                        { square: nextMoveWithPiece.to, piece: chess.get(nextMoveWithPiece.to) },
                        {
                            square: nextMoveWithoutPiece.to,
                            piece: chess.get(nextMoveWithoutPiece.to),
                        },
                    ],
                    description: "",
                    ...tacticalSequence,
                };
            }
        }
        return null;
    }

    getCosmeticSkewers(context: _TacticContext): Move[][] {
        const { evaluation, position } = context;
        const currentMove = evaluation.sequence[0];
        if (["p", "k", "n"].includes(currentMove.piece)) {
            return [];
        }
        const chess = new Chess(position);
        chess.move(currentMove);
        // On the next turn where can you move this piece
        invertTurn(chess);
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
                if (evaluation.sequence.length === 1) {
                    return [];
                }
                const response = evaluation.sequence[1];
                if (response.piece !== "k") {
                    return [];
                }
                chess.move(response);
            } else {
                chess.remove(move.to);
                invertTurn(chess);
            }

            const possibleNextMovesWithoutPiece = chess.moves({
                square: currentMove.to,
                verbose: true,
            });
            const newMoves = getMoveDiff(possibleNextMoves, possibleNextMovesWithoutPiece);
            for (const m of newMoves) {
                // can you capture behind the piece in front, and is the piece in front more valuable
                if (
                    m.captured &&
                    PIECE_VALUES[move.captured] > PIECE_VALUES[m.captured] &&
                    materialAdvantageAfterTradesAtSquare(
                        chess.fen(),
                        m.to,
                        colorToPlay(chess.fen())
                    ) >= 0
                ) {
                    cosmeticSkewers.push([move, m]);
                }
            }
        }
        return cosmeticSkewers;
    }
}

export { SkewerTactics };
