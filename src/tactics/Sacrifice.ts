import { Chess, Move } from "chess.js";
import {
    PIECE_VALUES,
    positionAfterSequence,
    attackingSquareIsBad,
    colorToPlay,
    getMaterialChange,
} from "@utils";
import { Fen } from "@types";
import { BaseTactic } from "@tactics";
import { _DefaultTacticContext } from "src/_types";

class SacrificeTactics extends BaseTactic {
    isTactic(context: _DefaultTacticContext): boolean {
        const { position, evaluation } = context;
        const currentMove = evaluation.sequence[0];

        if (this.sacrificedMaterial(position, currentMove)) {
            const endPosition = positionAfterSequence(position, evaluation.sequence);
            const materialChange = getMaterialChange(position, endPosition, colorToPlay(position));
            const tacticalSequence = {
                sequence: evaluation.sequence,
                startPosition: position,
                endPosition: endPosition,
                materialChange: materialChange,
            };
            const chess = new Chess(position);
            this.tacticBuilder
                .type("sacrifice")
                .attackedPieces([{ square: currentMove.to, piece: chess.get(currentMove.to) }])
                .sequence(tacticalSequence);
            return true;
        }
        return false;
    }

    private sacrificedMaterial(position: Fen, currentMove: Move) {
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
