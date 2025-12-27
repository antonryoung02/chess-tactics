import { Move, Piece, Square } from "chess.js";

export type Fen = string;

export type Evaluation = {
    move: { from: string; to: string };
    sequence: string;
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

export type TacticKey = "fork" | "pin" | "skewer" | "sacrifice" | "trap" | "hanging";

export type SequenceInterpretation = {
    sequence: string[];
    startPosition: Fen;
    endPosition: Fen;
    materialChange: number;
};

export type Tactic = SequenceInterpretation & {
    type: TacticKey;
    attackingMove: Move;
    attackedPieces: { square: Square; piece: Piece }[];
    description: string;
};
