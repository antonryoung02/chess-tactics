import { Fen, SequenceInterpretation, SequenceInterpreter, TacticOptions } from "@types";
import { Chess, Move, Square } from "chess.js";
import {
    positionAfterSequence,
    getMaterialChange,
    colorToPlay,
    attackingSquareIsBad,
    MAX_TACTIC_LENGTH,
} from "@utils";
import { _TacticContext, _Evaluation } from "src/_types";

export class DefaultSequenceInterpreter implements SequenceInterpreter {
    private evaluation: _Evaluation;
    private position: Fen;

    setContext(context: _TacticContext) {
        const { evaluation, position } = context;
        this.evaluation = evaluation;
        this.position = position;
    }

    identifyWinningSequence(
        attackerSquares: Square[],
        attackedSquares: Square[],
    ): SequenceInterpretation | null {
        if (attackedSquares.length === 0 || attackerSquares.length === 0) return null;
        const chess = new Chess(this.position);
        const moves = this.evaluation.sequence;

        for (let i = 0; i < Math.min(moves.length, MAX_TACTIC_LENGTH); i++) {
            const move = moves[i];
            const position = chess.fen();
            chess.move(move);
            if (
                (i % 2 === 0 &&
                    this.capturedAttackedPieces(move, attackerSquares, attackedSquares)) ||
                (i % 2 === 1 && this.isDesparado(position, move, attackerSquares))
            ) {
                let tacticalSequence = moves.slice(0, i + 1);
                const remainingSequence = moves.slice(i + 1);
                tacticalSequence = tacticalSequence.concat(
                    this.getCaptureSequence(chess.fen(), remainingSequence),
                );
                const endPosition = positionAfterSequence(this.position, tacticalSequence);
                const materialChange = getMaterialChange(
                    position,
                    endPosition,
                    colorToPlay(this.position),
                );
                if (materialChange > 0) {
                    return {
                        startPosition: this.position,
                        endPosition: endPosition,
                        sequence: tacticalSequence,
                        materialChange: materialChange,
                    };
                } else {
                    return null;
                }
            }
            // Track attacker/attacked piece movements through the sequence
            if (i % 2 === 0) {
                const attackerIdx = attackerSquares.indexOf(move.from);
                if (attackerIdx !== -1) {
                    attackerSquares[attackerIdx] = move.to;
                }
            } else {
                const attackedIdx = attackedSquares.indexOf(move.from);
                if (attackedIdx !== -1) {
                    attackedSquares[attackedIdx] = move.to;
                }
            }
        }
        return null;
    }

    private getCaptureSequence(position: Fen, sequence: Move[]) {
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

    protected capturedAttackedPieces(
        move: Move,
        attackerSquares: Square[],
        attackedSquares: Square[],
    ): boolean {
        return (
            move.captured &&
            attackerSquares.includes(move.from) &&
            attackedSquares.includes(move.to)
        );
    }

    private isDesparado(position: Fen, move: Move, attackerSquares: Square[]): boolean {
        if (!move.captured) return false;
        return attackingSquareIsBad(position, move.to);
    }
}

export class TrapTacticsSequenceInterpreter extends DefaultSequenceInterpreter {
    protected capturedAttackedPieces(
        move: Move,
        attackerSquares: Square[],
        attackedSquares: Square[],
    ): boolean {
        const capturedSquares = attackedSquares.filter((s) => {
            // moved to an attackedSquare, and captured a piece
            // can we check for initial piece marked as trapped?
            // Can we find a failure case for the current implementation?
            return s === move.to && move.captured;
        });
        return capturedSquares.length > 0;
    }
}
