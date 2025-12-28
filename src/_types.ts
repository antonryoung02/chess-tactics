import { Move } from "chess.js";
import { Fen } from "@types";

export type _Evaluation = {
    move: Move;
    followup: Move[];
};

export type _DefaultTacticContext = {
    position: Fen;
    evaluation: _Evaluation;
};

export type _PositionComparisonTacticContext = _DefaultTacticContext & {
    prevEvaluation: _Evaluation;
    prevPosition: Fen;
    prevMove: Move;
};

export type _TacticContext = _DefaultTacticContext | _PositionComparisonTacticContext;
