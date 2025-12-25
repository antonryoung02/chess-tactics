import { Chess, Move } from "chess.js";
import { PIECE_VALUES } from "@utils/utils";
import { FEN, TacticClassifier, BaseTacticContext } from "@types";
import { ChessHelper } from "@utils/chess_helper";
import { isWhiteToPlay } from "@utils/utils";
import { SequenceInterpreter } from "@utils/sequence_interpreter";

class SacrificeTactics implements TacticClassifier {
    isTactic(context: BaseTacticContext): any {
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
                piece: currentMove.piece,
                startFen: position,
                sequence: captureSequence,
            };
        }
        return null;
    }

    sacrificedMaterial(fen: FEN, currentMove: Move) {
        if (currentMove.promotion || currentMove.piece === "p") {
            return false;
        }
        const cs = new ChessHelper();
        const attackingColor = isWhiteToPlay(fen) ? "w" : "b";
        if (cs.materialAdvantageAfterTradesAtSquare(fen, currentMove.to, attackingColor) < 0) {
            const materialGained = currentMove.captured ? PIECE_VALUES[currentMove.captured] : 0;
            const materialLost = PIECE_VALUES[currentMove.piece];
            return materialGained - materialLost < 0;
        }
        return false;
    }
}

export { SacrificeTactics };
