import { Fen, SequenceInterpretation } from "@types";
import { Chess, Move, Square } from "chess.js";
import { getMaterialChange, colorToPlay, attackingSquareIsBad } from "@utils";
import { _TacticContext, _Evaluation } from "src/_types";

export class SequenceInterpreter {
    private evaluation: _Evaluation;
    private position: Fen;

    setContext(context: _TacticContext) {
        const { evaluation, position } = context;
        this.evaluation = evaluation;
        this.position = position;
    }

    getCaptureSequence(position: Fen, sequence: Move[]) {
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

    // Tactic is returned if the pieces on attackerSquares capture any of the pieces on attackedSquares
    // AND the resulting position after checks and captures won material
    // TODO
    // The isDesparado case handles 6 of 170 tests. It's probably too broad, try only desparados
    identifyWinningSequence(
        attackerSquares: Square[],
        attackedSquares: Square[]
    ): SequenceInterpretation | null {
        if (attackedSquares.length === 0 || attackerSquares.length === 0) return null;
        let tacticalSequence: Move[] = [];
        const chess = new Chess(this.position);
        const moves = this.evaluation.sequence;

        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            tacticalSequence.push(move);
            const position = chess.fen();
            chess.move(move);
            if (
                this.capturedAttackedPieces(move, attackerSquares, attackedSquares) ||
                this.isDesparado(position, move)
            ) {
                const remainingSequence = moves.slice(i + 1);
                tacticalSequence = tacticalSequence.concat(
                    this.getCaptureSequence(chess.fen(), remainingSequence)
                );
                const endPosition = this.positionAfterSequence(this.position, tacticalSequence);
                const materialChange = getMaterialChange(
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
                } else {
                    return null;
                }
            }
            // Track the attackers movements through the sequence
            const attackerIdx = attackerSquares.indexOf(move.from);
            if (attackerIdx !== -1) {
                attackerSquares[attackerIdx] = move.to;
            }
        }
        return null;
    }

    protected capturedAttackedPieces(
        move: Move,
        attackerSquares: Square[],
        attackedSquares: Square[]
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

    positionAfterSequence(position: Fen, sequence: string[] | Move[] | null) {
        if (!sequence) return position;
        const chess = new Chess(position);
        sequence.forEach((m) => {
            chess.move(m);
        });
        return chess.fen();
    }
}

export class TrapTacticsSequenceInterpreter extends SequenceInterpreter {
    protected capturedAttackedPieces(
        move: Move,
        attackerSquares: Square[],
        attackedSquares: Square[]
    ): boolean {
        const capturedSquares = attackedSquares.filter((s) => {
            // move came from an attacker square, to an attackedSquare, and captured a piece
            return s === move.to && move.captured;
        });
        return capturedSquares.length > 0;
    }
}
