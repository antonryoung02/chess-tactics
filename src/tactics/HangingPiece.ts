import { Chess } from "chess.js";
import { PositionComparisonTacticContext } from "@types";
import { PIECE_VALUES } from "@utils";
import { BaseTactic } from "@tactics";

class HangingPieceTactics extends BaseTactic {
    isTactic(context: PositionComparisonTacticContext): any | null {
        super.isTactic(context);
        const { position, evaluation, prevMove } = context;
        const chess = new Chess(position);
        const currentMove = chess.move(evaluation.move);

        if (!currentMove.captured) {
            return null;
        }
        if (
            prevMove.captured &&
            PIECE_VALUES[prevMove.captured] >= PIECE_VALUES[currentMove.captured]
        ) {
            return null;
        }

        chess.load(position);
        const attackers = chess.attackers(currentMove.to);
        const tacticalSequence = this.sequenceInterpreter.identifyWinningSequence(attackers, [
            currentMove.to,
        ]);
        if (tacticalSequence) {
            return {
                type: "hanging",
                attackingMove: currentMove,
                attackedPieces: [{ square: currentMove.to, piece: chess.get(currentMove.to) }],
                description: "",
                ...tacticalSequence,
            };
        }
        return null;
    }
}

export { HangingPieceTactics };
