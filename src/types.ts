import { Color, Move, PieceSymbol, Square } from "chess.js";

export type Fen = string;

export type Evaluation = {
    type: string;
    move: Move | { from: string; to: string };
    sequence: string;
    eval: string;
    fen?: string;
};

export type DefaultTacticContext = {
    position: Fen;
    evaluation: Evaluation;
};

export type PositionComparisonTacticContext = DefaultTacticContext & {
    prevEvaluation: Evaluation;
    prevMove: Move;
};

export type TacticContext = DefaultTacticContext | PositionComparisonTacticContext;

export interface TacticClassifier {
    isTactic(context: TacticContext): Tactic | null;
}

export type TacticKey = "fork" | "pin" | "skewer" | "sacrifice" | "trap" | "hangingPiece";

export type Tactic = {
    type: TacticKey;
    attackingMove: Move;
    attackedPieces: { square: Square; type: PieceSymbol; color: Color }[];
    sequence: string[];
    startPosition: Fen;
    endPosition: Fen;
    materialChange: number;
    description: string;
};
