import { Evaluation, FEN } from "@types";
import { Chess, Move, Square } from "chess.js";
import { ChessHelper } from "./chess_helper";
import { BaseTactic } from "./base_tactic";
import { fenAtEndOfSequence } from "@tactics/utils";
import { colorToPlay } from "./utils";

const baseTactic = new BaseTactic();
export class SequenceInterpreter {
    private evaluation: Evaluation;
    private position: FEN;

    constructor(position: FEN, evaluation: Evaluation) {
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

    getCaptureSequence(position: FEN, sequence: Move[]) {
        const chess = new Chess(position);
        const matches = [];
        for (const s of sequence) {
            const prevChess = new Chess(chess.fen());
            const m = chess.move(s);
            if (m.captured || chess.inCheck() || prevChess.inCheck()) {
                matches.push(m);
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
    identifyWinningSequence(attackerSquare: Square, attackedSquares: Square[]): string[] | null {
        if (attackedSquares.length === 0) return null;
        let tacticalSequence: string[] = [];
        const sequence = this.evaluationToMoveList();

        const chess = new Chess(this.position);
        for (let i = 0; i < sequence.length; i++) {
            const move = sequence[i];
            tacticalSequence.push(move.san);
            const position = chess.fen();
            if (
                this.capturedAttackedPieces(move, attackedSquares) ||
                this.isDesparado(position, move)
            ) {
                chess.move(move);
                const remainingSequence = sequence.slice(i + 1);
                tacticalSequence = tacticalSequence.concat(
                    this.getCaptureSequence(chess.fen(), remainingSequence)
                );
                if (
                    baseTactic.materialWasGained(
                        position,
                        fenAtEndOfSequence(this.position, tacticalSequence),
                        colorToPlay(this.position)
                    )
                ) {
                    return tacticalSequence;
                }
                return null;
            }
            chess.move(move);
        }
        return null;
    }

    private capturedAttackedPieces(move: Move, attackedSquares: Square[]): boolean {
        const capturedSquares = attackedSquares.filter((s) => {
            return s === move.to && move.captured;
        });
        return capturedSquares.length > 0;
    }

    private isDesparado(position: FEN, move: Move): boolean {
        if (!move.captured) return false;
        const ch = new ChessHelper();
        return ch.attackingSquareIsBad(position, move.to);
    }
}
