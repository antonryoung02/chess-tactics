import { Move, Piece, Square } from "chess.js";
import { _TacticContext } from "./_types";

export type Fen = string;

export type TacticOptions = {
    trimEndSequence?: boolean;
    maxLookaheadMoves?: number;
};

export type UciEvaluation = {
    sequence: string | string[] | Move[];
};

export type MoveEvaluation = {
    move: string | { from: string; to: string } | Move;
    followup: string | string[] | Move[];
};

export type Evaluation = UciEvaluation | MoveEvaluation;

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

export type TacticKey = "fork" | "pin" | "skewer" | "sacrifice" | "trap" | "hanging";

export interface TacticClassifier {
    findTactic(context: _TacticContext, options: TacticOptions): Tactic | null;
    isTactic(context: _TacticContext): Partial<Tactic> | null;
}

export type SequenceInterpretation = {
    sequence: Move[];
    startPosition: Fen;
    endPosition: Fen;
    materialChange: number;
};

export type Tactic = SequenceInterpretation & {
    type: TacticKey;
    triggerIndex: number;
    attackedPieces: { square: Square; piece: Piece }[];
};
