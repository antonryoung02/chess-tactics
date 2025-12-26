import { Chess } from "chess.js";
import { PositionComparisonTacticContext } from "@types";
import { PIECE_VALUES, SequenceInterpreter } from "@utils";

class HangingPieceTactics {
    isTactic(context: PositionComparisonTacticContext): any | null {
        const { position, evaluation, prevMove } = context;
        const chessCopy = new Chess(position);
        const currentMove = chessCopy.move(evaluation.move);

        if (!currentMove.captured) {
            return null;
        }
        if (
            prevMove.captured &&
            PIECE_VALUES[prevMove.captured] >= PIECE_VALUES[currentMove.captured]
        ) {
            return null;
        }

        const si = new SequenceInterpreter(position, evaluation);
        chessCopy.load(position);
        const attackers = chessCopy.attackers(currentMove.to);
        const tacticalSequence = si.identifyWinningSequence(attackers, [currentMove.to]);
        if (tacticalSequence) {
            return {
                type: "hanging",
                attackingMove: currentMove,
                attackedPieces: [],
                ...tacticalSequence,
                description: "",
            };
        }
        return null;
    }
}

export { HangingPieceTactics };
