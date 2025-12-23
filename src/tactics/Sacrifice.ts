import { Chess, Move } from "chess.js";
import { PIECE_VALUES } from "./utils";
import { FEN, TacticClassifier, TacticContext } from "@types";
import { ChessHelper } from "@utils/chess_helper";
import { isWhiteToPlay } from "@utils/utils";

class SacrificeTactics implements TacticClassifier {
    isTactic(context: TacticContext): any {
        const { position, evaluation } = context;
        // Any eval with limited options implies you have to do it
        // if (evaluation.length < 5) {
        //     return null;
        // }
        const chessCopy = new Chess(position);
        const move = evaluation.move;

        const currentMove = chessCopy.move(move);
        if (this.sacrificedMaterial(position, currentMove)) {
            return {
                type: "sacrifice",
                piece: currentMove.piece,
                startFen: position,
                sequence: [`${currentMove.from}${currentMove.to}`],
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
