import { Fen, SequenceInterpretation, SequenceInterpreter } from "@types";
import { Chess, Move, Square } from "chess.js";
import {
    positionAfterSequence,
    getMaterialChange,
    colorToPlay,
    attackingSquareIsBad,
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

    // Tactic is returned if the pieces on attackerSquares capture any of the pieces on attackedSquares
    // AND the resulting position after checks and captures won material
    // TODO
    // The isDesparado case handles 6 of 170 tests. It's probably too broad, try only desparados
    identifyWinningSequence(
        attackerSquares: Square[],
        attackedSquares: Square[],
    ): SequenceInterpretation | null {
        if (attackedSquares.length === 0 || attackerSquares.length === 0) return null;
        const chess = new Chess(this.position);
        const moves = this.evaluation.sequence;

        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            const position = chess.fen();
            chess.move(move);
            if (
                this.capturedAttackedPieces(move, attackerSquares, attackedSquares) ||
                this.isDesparado(position, move)
            ) {
                return this.completeTacticalSequence(
                    moves,
                    moves.slice(0, i + 1),
                    chess,
                    position,
                    i,
                );
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

    private completeTacticalSequence(
        moves: Move[],
        tacticalSequence: Move[],
        chess: Chess,
        position: string,
        i: number,
    ) {
        const remainingSequence = moves.slice(i + 1);
        tacticalSequence = tacticalSequence.concat(
            this.getCaptureSequence(chess.fen(), remainingSequence),
        );
        const endPosition = positionAfterSequence(this.position, tacticalSequence);
        const materialChange = getMaterialChange(position, endPosition, colorToPlay(this.position));
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
        const capturedSquares = attackedSquares.filter((s) => {
            // move came from an attacker square, to an attackedSquare, and captured a piece
            return (
                attackerSquares.filter((t) => t === move.from).length > 0 &&
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

export class TrapTacticsSequenceInterpreter extends DefaultSequenceInterpreter {
    protected capturedAttackedPieces(
        move: Move,
        attackerSquares: Square[],
        attackedSquares: Square[],
    ): boolean {
        const capturedSquares = attackedSquares.filter((s) => {
            // moved to an attackedSquare, and captured a piece
            return s === move.to && move.captured;
        });
        return capturedSquares.length > 0;
    }
}
