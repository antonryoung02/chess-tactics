import { Chess, Move } from "chess.js";
import { Evaluation, FEN } from "../types.js";
import { PIECE_VALUES } from "./utils.js";
import { ChessHelper } from "../utils/chess_helper.js";
import { colorToPlay, isWhiteToPlay } from "../utils/utils.js";
import { RatingAnalysis } from "../utils/rating_service.js";

class HangingPieceTactics {
    isTactic(
        initialPosition: FEN,
        prevEval: Evaluation[],
        currEval: Evaluation[],
        prevMove: Move | { from: string; to: string; captured: string }
    ): any | null {
        const chessCopy = new Chess(initialPosition);
        const currentMove = chessCopy.move(currEval[0].move);
        const rs = new RatingAnalysis();
        const wasWhite = !isWhiteToPlay(initialPosition);
        const prevRating = rs.classifyMove(
            rs.winningChanceDiff(prevEval[0], currEval[0], wasWhite)
        );
        // no captures on previous move
        if (prevMove.to === currentMove.to && prevMove.captured) {
            return null;
        }
        if (prevRating !== "mistake" && prevRating !== "blunder") {
            return null;
        }
        if (!currentMove.captured) {
            return null;
        }
        const ch = new ChessHelper();
        if (
            ch.materialAdvantageAfterTradesAtSquare(
                initialPosition,
                currentMove.to,
                colorToPlay(initialPosition)
            ) === PIECE_VALUES[currentMove.captured]
        ) {
            return {
                type: "hanging",
                piece: currentMove.captured,
                startFen: initialPosition,
                sequence: [currentMove.san],
            };
        }
        return null;
    }
}

export { HangingPieceTactics };
