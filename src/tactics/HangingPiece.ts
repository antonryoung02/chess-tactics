import { Chess } from "chess.js";
import { PIECE_VALUES } from "@utils";
import { BaseTactic } from "@tactics";
import { _PositionComparisonTacticContext } from "src/_types";

class HangingPieceTactics extends BaseTactic {
    isTactic(context: _PositionComparisonTacticContext): boolean {
        const { position, evaluation, prevMove, prevPosition } = context;
        const prevChess = new Chess(prevPosition);
        const chess = new Chess(position);
        const currentMove = evaluation.sequence[0];

        if (!currentMove.captured || currentMove.captured === "p") {
            return null;
        }
        if (prevChess.inCheck() || (prevMove.captured && prevMove.captured !== "p")) {
            return null;
        }

        chess.load(position);
        const attackers = chess.attackers(currentMove.to);
        const tacticalSequence = this.sequenceInterpreter.identifyWinningSequence(attackers, [
            currentMove.to,
        ]);
        this.sequenceInterpreter.setContext({
            evaluation: context.prevEvaluation,
            position: context.prevPosition,
        });
        const prevSequence = this.sequenceInterpreter.identifyWinningSequence(attackers, [
            currentMove.to,
        ]);
        if (
            tacticalSequence &&
            tacticalSequence.materialChange >= PIECE_VALUES[currentMove.captured] &&
            (!prevSequence || prevSequence.materialChange < PIECE_VALUES[currentMove.captured])
        ) {
            this.tacticBuilder
                .type("hanging")
                .attackedPieces([{ square: currentMove.to, piece: chess.get(currentMove.to) }])
                .sequence(tacticalSequence);
            return true;
        }
        return false;
    }
}

export { HangingPieceTactics };
