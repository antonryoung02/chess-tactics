import { Chess } from "chess.js";
import { PositionComparisonTacticContext } from "@types";
import { PIECE_VALUES } from "@utils/utils";
import { SequenceInterpreter } from "@utils/sequence_interpreter";

//
class HangingPieceTactics {
    isTactic(context: PositionComparisonTacticContext): any | null {
        const { position, evaluation, prevEvaluation, prevMove } = context;
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
        if (tacticalSequence.length > 0) {
            return {
                type: "hanging",
                piece: currentMove.captured,
                startFen: position,
                sequence: tacticalSequence,
            };
        }
        return null;
    }
}

export { HangingPieceTactics };
