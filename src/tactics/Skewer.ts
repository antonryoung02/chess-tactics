import { Chess, Square } from "chess.js";
import {
    attackingSquareIsBad,
    filterOutInitiallyAttackedSquares,
    getMoveDiff,
    invertTurn,
    PIECE_VALUES,
} from "@utils";
import { BaseTactic } from "@tactics";
import { _DefaultTacticContext, _TacticContext } from "src/_types";

class SkewerTactics extends BaseTactic {
    isTactic(context: _DefaultTacticContext): boolean {
        const { position, evaluation } = context;
        const chess = new Chess(position);
        const currentMove = evaluation.sequence[0];
        chess.move(currentMove);

        const cosmeticSkewers = this.getCosmeticSkewers(context);
        for (const attackedSquares of cosmeticSkewers) {
            const attackerSquares = [currentMove.to];
            const tacticalSequence = this.sequenceInterpreter.identifyWinningSequence(
                attackerSquares,
                attackedSquares,
            );
            if (tacticalSequence) {
                this.tacticBuilder
                    .type("skewer")
                    .attackedPieces(
                        attackedSquares.map((s) => ({
                            square: s,
                            piece: chess.get(s),
                        })),
                    )
                    .sequence(tacticalSequence);
                return true;
            }
        }
        return false;
    }

    private getCosmeticSkewers(context: _TacticContext): Square[][] {
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
                    !attackingSquareIsBad(chess.fen(), m.to) &&
                    filterOutInitiallyAttackedSquares(position, currentMove, [move.to, m.to])
                        .length === 2
                ) {
                    cosmeticSkewers.push([move.to, m.to]);
                }
            }
        }
        return cosmeticSkewers;
    }
}

export { SkewerTactics };
