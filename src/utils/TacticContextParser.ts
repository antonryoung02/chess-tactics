import { Evaluation, Fen, MoveEvaluation, TacticContext, UciEvaluation } from "@types";
import { _Evaluation, _TacticContext } from "src/_types";
import { Chess } from "chess.js";

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
        const chess = new Chess(position);
        const moveList = [];

        const sequence = Array.isArray(evaluation.followup)
            ? evaluation.followup
            : evaluation.followup.split(/\s+/).filter((m) => m);

        const move = chess.move(evaluation.move);
        sequence.forEach((s) => {
            moveList.push(chess.move(s));
        });

        return {
            move: move,
            followup: moveList,
        };
    }

    static parseUciEvaluation(position: Fen, evaluation: UciEvaluation): _Evaluation {
        const chess = new Chess(position);
        const moveList = [];

        const sequence = Array.isArray(evaluation.sequence)
            ? evaluation.sequence
            : evaluation.sequence.split(/\s+/).filter((m) => m);

        sequence.forEach((s) => {
            moveList.push(chess.move(s));
        });

        return {
            move: moveList[0],
            followup: moveList.slice(1),
        };
    }
}
