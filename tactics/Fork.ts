import { Chess, Move } from "chess.js";
import { BaseTactic } from "../utils/base_tactic.js";
import { fenAtEndOfSequence } from "./utils.js";
import { TacticClassifier, TacticContext } from "../types.js";
import { colorToPlay } from "../utils/utils.js";
import { Evaluation, FEN } from "../types.js";

const baseTactic = new BaseTactic();

class ForkTactics implements TacticClassifier {
    isTactic(context: TacticContext): any | null {
        const { position, evaluation } = context;
        const chessCopy = new Chess(position);
        const currentMove = chessCopy.move(evaluation.move);
        const cosmeticForks = this.getCosmeticForks(position, currentMove);

        if (cosmeticForks) {
            const nextEngineMoves = baseTactic.sequenceToMoveList(position, evaluation);
            const tacticalSequence = baseTactic.getCaptureSequence(cosmeticForks, nextEngineMoves);
            const endFen = fenAtEndOfSequence(position, tacticalSequence);
            if (
                tacticalSequence &&
                baseTactic.materialWasGained(position, endFen, colorToPlay(position))
            ) {
                return {
                    type: "fork",
                    piece: currentMove.piece,
                    startFen: position,
                    sequence: tacticalSequence,
                };
            }
        }
        return null;
    }

    getCosmeticForks(position: FEN, currentMove: Move): Move[] {
        const chess = new Chess(position);
        const threateningMoves = baseTactic.getThreateningMoves(chess, currentMove, position);
        if (threateningMoves.length >= 2) {
            return threateningMoves;
        }
        return [];
    }
}

export { ForkTactics };
