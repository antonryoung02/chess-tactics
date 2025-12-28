import { Move, Piece, Square } from "chess.js";
import { _TacticContext } from "./_types";

export type Fen = string;

export type UciEvaluation = {
    sequence: string | string[];
};

export type MoveEvaluation = {
    move: string | { from: string; to: string } | Move;
    followup: string | string[];
};

export type Evaluation = UciEvaluation | MoveEvaluation;

export type CanonicalEvaluation = {
    move: Move;
    followup: Move[];
};

export type DefaultTacticContext = {
    position: Fen;
    evaluation: Evaluation;
};

export type PositionComparisonTacticContext = DefaultTacticContext & {
    prevEvaluation: Evaluation;
    prevMove: Move;
    prevPosition: Fen;
};

export type TacticContext = DefaultTacticContext | PositionComparisonTacticContext;

export interface TacticClassifier {
    isTactic(context: _TacticContext): Tactic | null;
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
