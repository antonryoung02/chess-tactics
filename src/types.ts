import { Move, PieceSymbol } from "chess.js";

export type FEN = string;

export type Evaluation = {
    type: string;
    move: Move | { from: string; to: string };
    sequence: string;
    eval: string;
    fen?: string;
};

export type Tactic = {
    type: TacticId;
    piece: PieceSymbol;
    position: FEN;
    sequence: string[];
};

export type TacticContext = BaseTacticContext | PositionComparisonTacticContext;

export type BaseTacticContext = {
    position: FEN;
    evaluation: Evaluation;
};

export type PositionComparisonTacticContext = BaseTacticContext & {
    prevEvaluation: Evaluation;
    prevMove: Move;
};

export interface TacticClassifier {
    isTactic(context: TacticContext): Tactic | null;
}

export type TacticId = "fork" | "pin" | "skewer" | "sacrifice" | "trap" | "free";
