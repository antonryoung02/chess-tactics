import { Evaluation, Fen } from "@types";
import { Chess, Move, Square } from "chess.js";
import { fenAtEndOfSequence, materialWasGained, colorToPlay, attackingSquareIsBad } from "@utils";

export class SequenceInterpreter {
    private evaluation: Evaluation;
    private position: Fen;

    constructor(position: Fen, evaluation: Evaluation) {
        this.evaluation = evaluation;
        this.position = position;
    }

    evaluationToMoveList(): Move[] {
        const chess = new Chess(this.position);
        const m = chess.move(this.evaluation.move);

        const moveList = [m];
        const sequence = this.evaluation.sequence.split(" ");
        sequence.forEach((s: any) => {
            const move = chess.move(s);
            moveList.push(move);
        });
        return this.trimEndCaptures(moveList);
    }

    // not trimming end captures allows possibility of tactic cutting off in the middle of a capture sequence
    // and incorrectly reading material advantage
    private trimEndCaptures(moveList: Move[]): Move[] {
        let i = moveList.length - 1;
        while (i >= 0) {
            if (moveList[i].captured) {
                i -= 1;
            } else {
                break;
            }
        }
        return moveList.slice(0, i + 1);
    }

    getCaptureSequence(position: Fen, sequence: Move[]) {
        const chess = new Chess(position);
        const matches = [];
        for (const s of sequence) {
            const prevChess = new Chess(chess.fen());
            const m = chess.move(s);
            if (m.captured || chess.inCheck() || prevChess.inCheck()) {
                matches.push(m.san);
            } else {
                break;
            }
        }
        return matches;
    }

    // either the pieces on attackedSquares are captured for material gain
    // or defender desparados on attackerSquare for a loss of material

    // the separation of tacticalSequence and remainingSequence
    // is to ensure that non-capturing engine intermezzos
    // still allow captures on attackedSquares to be found
    identifyWinningSequence(attackerSquares: Square[], attackedSquares: Square[]): any {
        if (attackedSquares.length === 0) return null;
        let tacticalSequence: string[] = [];
        const sequence = this.evaluationToMoveList();

        const chess = new Chess(this.position);
        for (let i = 0; i < sequence.length; i++) {
            const move = sequence[i];
            tacticalSequence.push(move.san);
            const position = chess.fen();
            if (
                this.capturedAttackedPieces(move, attackerSquares, attackedSquares) ||
                this.isDesparado(position, move)
            ) {
                chess.move(move);
                const remainingSequence = sequence.slice(i + 1);
                tacticalSequence = tacticalSequence.concat(
                    this.getCaptureSequence(chess.fen(), remainingSequence)
                );
                const endPosition = fenAtEndOfSequence(this.position, tacticalSequence);
                const materialChange = materialWasGained(
                    position,
                    endPosition,
                    colorToPlay(this.position)
                );
                if (materialChange > 0) {
                    return {
                        startPosition: this.position,
                        endPosition: endPosition,
                        sequence: tacticalSequence,
                        materialChange: materialChange,
                    };
                }
                return null;
            }
            chess.move(move);
        }
        return null;
    }

    private capturedAttackedPieces(
        move: Move,
        attackerSquares: Square[],
        attackedSquares: Square[]
    ): boolean {
        const capturedSquares = attackedSquares.filter((s) => {
            // move came from an attacker square, to an attackedSquare, and captured a piece
            return (
                attackerSquares.filter((s) => s === move.from).length > 0 &&
                s === move.to &&
                move.captured
            );
        });
        return capturedSquares.length > 0;
    }

    private isDesparado(position: Fen, move: Move): boolean {
        if (!move.captured) return false;
        return attackingSquareIsBad(position, move.to);
    }
}
