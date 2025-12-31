import { Chess, Move } from "chess.js";
import {
    PIECE_VALUES,
    colorToPlay,
    getMaterialChange,
    materialAdvantageAfterTradesAtSquare,
} from "@utils";
import { Fen, Tactic, TacticOptions } from "@types";
import { BaseTactic } from "@tactics";
import { _DefaultTacticContext } from "src/_types";

class SacrificeTactics extends BaseTactic {
    isTactic(context: _DefaultTacticContext): Tactic {
        const { position, evaluation } = context;
        const chess = new Chess(position);
        const currentMove = evaluation.sequence[0];

        const moveList = this.sequenceInterpreter.evaluationToMoveList();
        const captureSequence = this.sequenceInterpreter.getCaptureSequence(position, moveList);
        if (this.sacrificedMaterial(position, currentMove) && captureSequence.length > 0) {
            const endPosition = this.sequenceInterpreter.positionAfterSequence(
                position,
                captureSequence
            );
            const materialChange = getMaterialChange(position, endPosition, colorToPlay(position));
            return {
                type: "sacrifice",
                attackingMove: currentMove,
                attackedPieces: [{ square: currentMove.to, piece: chess.get(currentMove.to) }],
                sequence: captureSequence,
                startPosition: position,
                endPosition: endPosition,
                materialChange: materialChange,
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
