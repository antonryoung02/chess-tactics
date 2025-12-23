import { Chess, Move } from "chess.js";
import { BaseTactic } from "@utils/base_tactic";
import { fenAtEndOfSequence, PIECE_VALUES } from "./utils";
import { Evaluation, FEN, TacticClassifier, TacticContext } from "@types";

const baseTactic = new BaseTactic();

class PinTactics implements TacticClassifier {
    isTactic(context: TacticContext) {
        const { position, evaluation } = context;
        const chessCopy = new Chess(position);
        const currentMove = chessCopy.move(evaluation.move);

        const cosmeticPins = this.getCosmeticPins(position, currentMove);
        for (const [nextMoveWithPiece, nextMoveWithoutPiece] of cosmeticPins) {
            const pin = this.isTacticalPin(
                position,
                currentMove,
                nextMoveWithPiece,
                nextMoveWithoutPiece,
                evaluation
            );
            if (pin) return pin;
        }
        return null;
    }

    getCosmeticPins(position: FEN, currentMove: Move): Array<Array<Move>> {
        if (["p", "k", "n"].includes(currentMove.piece)) {
            return [];
        }
        const chess = new Chess(position);
        chess.move(currentMove);
        // On the next turn where can you move this piece
        baseTactic.invertTurn(chess);
        const possibleNextMoves = chess.moves({ square: currentMove.to, verbose: true });
        const cosmeticPins = [];
        for (const move of possibleNextMoves) {
            // Can't pin a king or same piece
            if (!move.captured || move.captured === "k" || move.captured === currentMove.piece) {
                continue;
            }
            if (move.captured === "p") {
                // are you actually preventing movement
                // this is especially important for rooks/queens who might just be vertically in front/behind
            }

            // Return to on next turn position and remove the piece
            chess.load(position);
            chess.move(currentMove);
            chess.remove(move.to);
            baseTactic.invertTurn(chess);
            // Is a more valuable piece behind the capturable pieces
            const possibleNextMovesWithoutPiece = chess.moves({
                square: currentMove.to,
                verbose: true,
            });
            const newMoves = baseTactic.getMoveDiff(
                possibleNextMoves,
                possibleNextMovesWithoutPiece
            );

            // A cosmetic pin is 'did my piece move to a square that pins any lower value piece to a higher value piece'
            for (const m of newMoves) {
                if (m.captured && PIECE_VALUES[move.captured] < PIECE_VALUES[m.captured]) {
                    if (
                        move.captured === "p" &&
                        !this.movePreventsPawnMobility(position, currentMove, move, m)
                    ) {
                        continue;
                    }
                    cosmeticPins.push([move, m]); // [move to capture pinned piece, move to capture piece behind it]
                }
            }
        }
        return cosmeticPins;
    }

    isTacticalPin(
        position: FEN,
        currentMove: Move,
        nextMoveWithPiece: Move,
        nextMoveWithoutPiece: Move,
        evaluation: Evaluation
    ): any | null {
        const chess = new Chess(position);
        chess.move(currentMove);

        const isCaptured = this.arePinnedPiecesCaptured(
            position,
            [nextMoveWithPiece, nextMoveWithoutPiece],
            evaluation
        );
        if (isCaptured)
            return {
                type: "pin",
                piece: currentMove.piece,
                startFen: position,
                sequence: [currentMove.san],
            };

        return null;
    }

    arePinnedPiecesCaptured(
        position: FEN,
        attackedPieces: Array<Move>,
        evaluation: Evaluation
    ): boolean {
        const nextKMoves = baseTactic.sequenceToMoveList(position, evaluation);
        const captureSequence = baseTactic.getCaptureSequence(attackedPieces, nextKMoves);
        const endFen = fenAtEndOfSequence(position, captureSequence);
        if (
            captureSequence &&
            baseTactic.materialWasGained(position, endFen, position.split(" ")[1])
        ) {
            return true;
        }
        return false;
    }

    movePreventsPawnMobility(
        position: FEN,
        currentMove: Move,
        moveCapturingPawn: Move,
        moveCapturingBehindPiece: Move
    ) {
        // do any of the possible pawn movements uncover the pin -> losing material?

        if (moveCapturingBehindPiece.captured === "k") return true;
        const pawnSquare = moveCapturingPawn.to;
        const chess = new Chess(position);

        chess.move(currentMove);
        const movesAfter = chess.moves({ square: pawnSquare, verbose: true });

        // this case is mostly for king where the pawn movement is truly restricted
        // this doesn't cover when currentMove blocks the pawn directly. commenting out

        // now to see if the pawn move uncovers the pinned piece
        let doesPrevent = false;
        for (const move of movesAfter) {
            chess.load(position);
            chess.move(currentMove);
            chess.move(move);
            // the pawn can capture your pinning piece
            if (move.to === currentMove.to) {
                return false;
            }
            if (baseTactic.canMoveToSquare(chess, moveCapturingBehindPiece.to)) {
                doesPrevent = true;
            }
        }

        return doesPrevent;
    }
}

export { PinTactics };
