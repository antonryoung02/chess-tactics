import { Chess, Move } from "chess.js";
import {
    PIECE_VALUES,
    SequenceInterpreter,
    colorToPlay,
    materialAdvantageAfterTradesAtSquare,
} from "@utils";
import { Fen, TacticClassifier, DefaultTacticContext } from "@types";

class SacrificeTactics implements TacticClassifier {
    isTactic(context: DefaultTacticContext): any {
        const { position, evaluation } = context;
        const chessCopy = new Chess(position);
        const move = evaluation.move;

        const currentMove = chessCopy.move(move);
        const si = new SequenceInterpreter(position, evaluation);
        const moveList = si.evaluationToMoveList();
        const captureSequence = si.getCaptureSequence(position, moveList);

        if (this.sacrificedMaterial(position, currentMove) && captureSequence.length > 0) {
            return {
                type: "sacrifice",
                attackingMove: currentMove,
                sequence: captureSequence,
                //TODO
                description: "",
            };
        }
        return null;
    }

    sacrificedMaterial(position: Fen, currentMove: Move) {
        if (currentMove.promotion || currentMove.piece === "p") {
            return false;
        }
        const attackingColor = colorToPlay(position);
        if (materialAdvantageAfterTradesAtSquare(position, currentMove.to, attackingColor) < 0) {
            const materialGained = currentMove.captured ? PIECE_VALUES[currentMove.captured] : 0;
            const materialLost = PIECE_VALUES[currentMove.piece];
            return materialGained - materialLost < 0;
        }
        return false;
    }
}

export { SacrificeTactics };
