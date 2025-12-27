import { Chess, Move } from "chess.js";
import { getThreateningMoves } from "@utils";
import { DefaultTacticContext, Fen } from "@types";
import { BaseTactic } from "@tactics";

class ForkTactics extends BaseTactic {
    isTactic(context: DefaultTacticContext): any | null {
        super.isTactic(context);
        const { position, evaluation } = context;
        const chess = new Chess(position);
        const currentMove = chess.move(evaluation.move);
        const cosmeticForks = this.getCosmeticForks(position, currentMove);
        const attackedSquares = cosmeticForks.map((m) => m.to);
        const tacticalSequence = this.sequenceInterpreter.identifyWinningSequence(
            [currentMove.to],
            attackedSquares
        );
        if (tacticalSequence) {
            return {
                type: "fork",
                attackingMove: currentMove,
                attackedPieces: attackedSquares.map((s) => ({ square: s, piece: chess.get(s) })),
                description: "",
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
