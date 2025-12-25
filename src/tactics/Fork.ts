import { Chess, Move } from "chess.js";
import { BaseTactic } from "@utils/base_tactic";
import { TacticClassifier, BaseTacticContext, FEN } from "@types";
import { SequenceInterpreter } from "@utils/sequence_interpreter";

const baseTactic = new BaseTactic();

class ForkTactics implements TacticClassifier {
    isTactic(context: BaseTacticContext): any | null {
        const { position, evaluation } = context;
        const si = new SequenceInterpreter(position, evaluation);
        const chessCopy = new Chess(position);
        const currentMove = chessCopy.move(evaluation.move);
        const cosmeticForks = this.getCosmeticForks(position, currentMove);
        const attackedSquares = cosmeticForks.map((m) => m.to);
        const tacticalSequence = si.identifyWinningSequence([currentMove.to], attackedSquares);
        if (tacticalSequence) {
            return {
                type: "fork",
                piece: currentMove.piece,
                position: position,
                sequence: tacticalSequence,
            };
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
