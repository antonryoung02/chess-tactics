import { Chess, Move } from "chess.js";
import { filterOutInitiallyAttackedSquares, getThreateningMoves } from "@utils";
import { Fen, Tactic } from "@types";
import { BaseTactic } from "@tactics";
import { _DefaultTacticContext } from "src/_types";

class ForkTactics extends BaseTactic {
    isTactic(context: _DefaultTacticContext): Partial<Tactic> | null {
        const { position, evaluation } = context;
        const chess = new Chess(position);
        const currentMove = chess.move(evaluation.sequence[0]);
        const cosmeticForks = this.getCosmeticForks(position, currentMove);
        let attackedSquares = cosmeticForks.map((m) => m.to);
        attackedSquares = filterOutInitiallyAttackedSquares(position, currentMove, attackedSquares);
        if (attackedSquares.length < 2) return null;
        const tacticalSequence = this.sequenceInterpreter.identifyWinningSequence(
            [currentMove.to],
            attackedSquares
        );
        if (tacticalSequence) {
            return {
                type: "fork",
                attackedPieces: attackedSquares.map((s) => ({ square: s, piece: chess.get(s) })),
                ...tacticalSequence,
            };
        }
        return null;
    }

    getCosmeticForks(position: Fen, currentMove: Move): Move[] {
        const threateningMoves = getThreateningMoves(position, currentMove);
        if (threateningMoves.length >= 2) {
            return threateningMoves;
        }
        return [];
    }
}

export { ForkTactics };
