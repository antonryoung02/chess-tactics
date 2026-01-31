import { Chess, Move, Square } from "chess.js";
import { filterOutInitiallyAttackedSquares, getThreateningMoves } from "@utils";
import { Fen } from "@types";
import { BaseTactic } from "@tactics";
import { _DefaultTacticContext } from "src/_types";

class ForkTactics extends BaseTactic {
    isTactic(context: _DefaultTacticContext): boolean {
        const { position, evaluation } = context;
        const currentMove = evaluation.sequence[0];
        const chess = new Chess(position);
        chess.move(currentMove);

        const attackerSquares = [currentMove.to];
        const attackedSquares = this.getCosmeticForks(position, currentMove);
        const tacticalSequence = this.sequenceInterpreter.identifyWinningSequence(
            attackerSquares,
            attackedSquares,
        );
        if (tacticalSequence) {
            this.tacticBuilder
                .type("fork")
                .attackedPieces(attackedSquares.map((s) => ({ square: s, piece: chess.get(s) })))
                .sequence(tacticalSequence);
            return true;
        }
        return false;
    }

    private getCosmeticForks(position: Fen, currentMove: Move): Square[] {
        let threatenedSquares = getThreateningMoves(position, currentMove).map((m) => m.to);
        threatenedSquares = filterOutInitiallyAttackedSquares(
            position,
            currentMove,
            threatenedSquares,
        );
        if (threatenedSquares.length >= 2) {
            return threatenedSquares;
        }
        return [];
    }
}

export { ForkTactics };
