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
    identifyWinningSequence(
        attackerSquares: Square[],
        attackedSquares: Square[]
    ): SequenceInterpretation | null {
        if (attackedSquares.length === 0 || attackerSquares.length === 0) return null;

        let tacticalSequence = [];
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
            return s === move.to && move.captured;
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
