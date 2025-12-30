import { Evaluation, Fen, MoveEvaluation, TacticContext, UciEvaluation } from "@types";
import { _Evaluation, _TacticContext } from "src/_types";
import { Chess, Move } from "chess.js";
import { ChessTacticsParserError } from "@chess-tactics";

export class TacticContextParser {
    static parse(context: TacticContext): _TacticContext {
        const evaluation = this.parseEvaluation(context.position, context.evaluation);
        if ("prevEvaluation" in context) {
            const prevEvaluation = this.parseEvaluation(
                context.prevPosition,
                context.prevEvaluation
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

    static parseEvaluation(position: Fen, evaluation: Evaluation): _Evaluation {
        if ("sequence" in evaluation) {
            return this.parseUciEvaluation(position, evaluation);
        }
        return this.parseMoveEvaluation(position, evaluation);
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
        const moveList = [];

        const sequence = Array.isArray(evaluation.followup)
            ? evaluation.followup
            : evaluation.followup.split(/\s+/).filter((m) => m);

        let firstMove: Move;
        try {
            firstMove = chess.move(evaluation.move);
        } catch (error) {
            throw new ChessTacticsParserError(
                `Invalid move: ${evaluation.move} is not playable in ${position}`,
                "INVALID_MOVE",
                { cause: error }
            );
        }

        let currPos: Fen;
        sequence.forEach((s) => {
            try {
                currPos = chess.fen();

                moveList.push(chess.move(s));
            } catch (error) {
                throw new ChessTacticsParserError(
                    `Invalid followup: ${s} is not playable in ${currPos}`,
                    "INVALID_FOLLOWUP",
                    { cause: error }
                );
            }
        });
        return {
            move: firstMove,
            followup: moveList,
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
                    `Invalid sequence: ${s} is not playable in ${currPos}`,
                    "INVALID_SEQUENCE",
                    { cause: error }
                );
            }
        });
        return {
            move: moveList[0],
            followup: moveList.slice(1),
        };
    }
}
