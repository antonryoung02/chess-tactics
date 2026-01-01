import { Chess } from "chess.js";
import { PIECE_VALUES } from "@utils";
import { BaseTactic } from "@tactics";
import { _PositionComparisonTacticContext } from "src/_types";
import { Tactic } from "@types";

class HangingPieceTactics extends BaseTactic {
    isTactic(context: _PositionComparisonTacticContext): Partial<Tactic> | null {
        const { position, evaluation, prevMove } = context;
        const chess = new Chess(position);
        const currentMove = evaluation.sequence[0];

        if (!currentMove.captured || currentMove.captured === "p") {
            return null;
        }
        if (prevMove.captured && prevMove.captured !== "p") {
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
            return {
                type: "hanging",
                attackedPieces: [{ square: currentMove.to, piece: chess.get(currentMove.to) }],
                ...tacticalSequence,
            };
        }
        return null;
    }
}

export { HangingPieceTactics };
