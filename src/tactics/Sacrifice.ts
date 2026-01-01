import { Chess, Move } from "chess.js";
import { PIECE_VALUES, attackingSquareIsBad, colorToPlay, getMaterialChange } from "@utils";
import { Fen, Tactic } from "@types";
import { BaseTactic } from "@tactics";
import { _DefaultTacticContext } from "src/_types";

class SacrificeTactics extends BaseTactic {
    isTactic(context: _DefaultTacticContext): Partial<Tactic> | null {
        const { position, evaluation } = context;
        const chess = new Chess(position);
        const currentMove = evaluation.sequence[0];

        chess.move(currentMove);
        const captureSequence = [currentMove].concat(
            this.sequenceInterpreter.getCaptureSequence(chess.fen(), evaluation.sequence.slice(1))
        );
        chess.undo();
        if (this.sacrificedMaterial(position, currentMove) && captureSequence.length > 0) {
            const endPosition = this.sequenceInterpreter.positionAfterSequence(
                position,
                captureSequence
            );
            const materialChange = getMaterialChange(position, endPosition, colorToPlay(position));
            return {
                type: "sacrifice",
                attackedPieces: [{ square: currentMove.to, piece: chess.get(currentMove.to) }],
                sequence: captureSequence,
                startPosition: position,
                endPosition: endPosition,
                materialChange: materialChange,
            };
        }
        return null;
    }

    sacrificedMaterial(position: Fen, currentMove: Move) {
        if (currentMove.promotion || currentMove.piece === "p") {
            return false;
        }
        if (attackingSquareIsBad(position, currentMove.to, currentMove)) {
            const materialGained = currentMove.captured ? PIECE_VALUES[currentMove.captured] : 0;
            const materialLost = PIECE_VALUES[currentMove.piece];
            return materialGained - materialLost < 0;
        }
        return false;
    }
}

export { SacrificeTactics };
