import {
    Evaluation,
    Fen,
    MoveEvaluation,
    TacticContext,
    TacticOptions,
    UciEvaluation,
} from "@types";
import { _Evaluation, _TacticContext } from "src/_types";
import { Chess, Move } from "chess.js";
import { ChessTacticsParserError } from "@chess-tactics";

export class TacticContextParser {
    static parse(context: TacticContext, options: TacticOptions): _TacticContext {
        const evaluation = this.parseEvaluation(context.position, context.evaluation, options);
        if ("prevEvaluation" in context) {
            const prevChess = new Chess(context.prevPosition);
            try {
                prevChess.move(context.prevMove);
            } catch (e) {
                throw new ChessTacticsParserError(
                    `prevMove ${context.prevMove.san} is not playable in prevPosition ${context.prevPosition}`,
                    "INVALID_MOVE",
                    { cause: e }
                );
            }
            const prevEvaluation = this.parseEvaluation(
                context.prevPosition,
                context.prevEvaluation,
                options
            );
            return {
                evaluation: evaluation,
                position: context.position,
                prevEvaluation: prevEvaluation,
                prevMove: context.prevMove,
                prevPosition: context.prevPosition,
            };
        }
        return {
            evaluation: evaluation,
            position: context.position,
        };
    }

    static parseEvaluation(
        position: Fen,
        evaluation: Evaluation,
        options: TacticOptions
    ): _Evaluation {
        let parsedEvaluation: _Evaluation;
        if ("sequence" in evaluation) {
            parsedEvaluation = this.parseUciEvaluation(position, evaluation);
        } else {
            parsedEvaluation = this.parseMoveEvaluation(position, evaluation);
        }
        if (options.trimEndSequence) {
            parsedEvaluation.sequence = this.trimEndCaptures(parsedEvaluation.sequence);
        }
        return parsedEvaluation;
    }

    private static trimEndCaptures(moveList: Move[]): Move[] {
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

    static parseMoveEvaluation(position: Fen, evaluation: MoveEvaluation): _Evaluation {
        let chess: Chess;
        try {
            chess = new Chess(position);
        } catch (error) {
            throw new ChessTacticsParserError(
                `Invalid position argument: ${position}`,
                "INVALID_FEN",
                { cause: error }
            );
        }

        const sequence = Array.isArray(evaluation.followup)
            ? evaluation.followup
            : evaluation.followup.split(/\s+/).filter((m) => m);

        let firstMove: Move;
        try {
            firstMove = chess.move(evaluation.move);
        } catch (error) {
            throw new ChessTacticsParserError(
                `Invalid move: ${JSON.stringify(evaluation.move)} is not playable in ${position}`,
                "INVALID_MOVE",
                { cause: error }
            );
        }
        const moveList = [firstMove];
        let currPos: Fen;
        sequence.forEach((s) => {
            try {
                currPos = chess.fen();
                moveList.push(chess.move(s));
            } catch (error) {
                throw new ChessTacticsParserError(
                    `Invalid followup: ${JSON.stringify(s)} is not playable in ${currPos}`,
                    "INVALID_FOLLOWUP",
                    { cause: error }
                );
            }
        });
        return {
            sequence: moveList,
        };
    }

    static parseUciEvaluation(position: Fen, evaluation: UciEvaluation): _Evaluation {
        let chess: Chess;
        try {
            chess = new Chess(position);
        } catch (error) {
            throw new ChessTacticsParserError(
                `Invalid position argument: ${position}`,
                "INVALID_FEN",
                { cause: error }
            );
        }
        const moveList = [];

        const sequence = Array.isArray(evaluation.sequence)
            ? evaluation.sequence
            : evaluation.sequence.split(/\s+/).filter((m) => m);

        let currPos: Fen;
        sequence.forEach((s) => {
            try {
                currPos = chess.fen();
                moveList.push(chess.move(s));
            } catch (error) {
                throw new ChessTacticsParserError(
                    `Invalid sequence: ${JSON.stringify(s)} is not playable in ${currPos}`,
                    "INVALID_SEQUENCE",
                    { cause: error }
                );
            }
        });
        return {
            sequence: moveList,
        };
    }
}
