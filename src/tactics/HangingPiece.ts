import { Chess } from "chess.js";
import { PIECE_VALUES } from "@utils";
import { BaseTactic } from "@tactics";
import { _PositionComparisonTacticContext } from "src/_types";
import { Tactic, TacticOptions } from "@types";

class HangingPieceTactics extends BaseTactic {
    isTactic(context: _PositionComparisonTacticContext): Tactic | null {
        const { position, evaluation, prevMove } = context;
        const chess = new Chess(position);
        const currentMove = evaluation.sequence[0];

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
