import { Chess, Move } from "chess.js";
import { getThreateningMoves, SequenceInterpreter } from "@utils";
import { TacticClassifier, DefaultTacticContext, Fen } from "@types";

class ForkTactics implements TacticClassifier {
    isTactic(context: DefaultTacticContext): any | null {
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
                attackingMove: currentMove,
                attackedPieces: [],
                ...tacticalSequence,
                description: "",
            };
        }
        return null;
    }

    getCosmeticForks(position: Fen, currentMove: Move): Move[] {
        const threateningMoves = getThreateningMoves(position, currentMove);
        if (threateningMoves.length >= 2) {
            return threateningMoves;
        }
        return [];
    }
}

export { ForkTactics };
