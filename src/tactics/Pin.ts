import { Chess, Move, Square } from "chess.js";
import { filterOutInitiallyAttackedSquares, getMoveDiff, invertTurn, PIECE_VALUES } from "@utils";
import { BaseTactic } from "@tactics";
import { _DefaultTacticContext } from "src/_types";
import { Fen } from "@types";

class PinTactics extends BaseTactic {
    isTactic(context: _DefaultTacticContext): boolean {
        const { position, evaluation } = context;
        const currentMove = evaluation.sequence[0];

        const cosmeticPins = this.getCosmeticPins(position, currentMove);
        for (const attackedSquares of cosmeticPins) {
            const attackerSquares = [currentMove.to];
            const tacticalSequence = this.sequenceInterpreter.identifyWinningSequence(
                attackerSquares,
                attackedSquares,
            );
            if (tacticalSequence) {
                const chess = new Chess(position);
                this.tacticBuilder
                    .type("pin")
                    .attackedPieces(
                        attackedSquares.map((s) => ({
                            square: s,
                            piece: chess.get(s),
                        })),
                    )
                    .sequence(tacticalSequence);
                return true;
            }
        }
        return false;
    }

    private getCosmeticPins(position: Fen, currentMove: Move): Square[][] {
        if (["p", "k", "n"].includes(currentMove.piece)) {
            return [];
        }
        const chess = new Chess(position);
        chess.move(currentMove);
        // On the next turn where can you move this piece
        invertTurn(chess);
        const possibleNextMoves = chess.moves({ square: currentMove.to, verbose: true });
        const cosmeticPins = [];
        for (const move of possibleNextMoves) {
            // Can't pin a king or same piece
            if (!move.captured || move.captured === "k" || move.captured === currentMove.piece) {
                continue;
            }
            // Return to on next turn position and remove the piece
            chess.load(position);
            chess.move(currentMove);
            chess.remove(move.to);
            invertTurn(chess);
            // Is a more valuable piece behind the capturable pieces
            const possibleNextMovesWithoutPiece = chess.moves({
                square: currentMove.to,
                verbose: true,
            });
            const newMoves = getMoveDiff(possibleNextMoves, possibleNextMovesWithoutPiece);

            // A cosmetic pin is 'did my piece move to a square that pins any lower value piece to a higher value piece'
            for (const m of newMoves) {
                if (m.captured && PIECE_VALUES[move.captured] < PIECE_VALUES[m.captured]) {
                    if (
                        (move.captured === "p" &&
                            !this.movePreventsPawnMobility(position, currentMove, move, m)) ||
                        filterOutInitiallyAttackedSquares(position, currentMove, [move.to, m.to])
                            .length < 2
                    ) {
                        continue;
                    }
                    cosmeticPins.push([move.to, m.to]); // [move to capture pinned piece, move to capture piece behind it]
                }
            }
        }
        return cosmeticPins;
    }

    private movePreventsPawnMobility(
        position: Fen,
        currentMove: Move,
        moveCapturingPawn: Move,
        moveCapturingBehindPiece: Move,
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
            if (chess.attackers(moveCapturingBehindPiece.to).length > 0) {
                doesPrevent = true;
            }
        }

        return doesPrevent;
    }
}

export { PinTactics };
