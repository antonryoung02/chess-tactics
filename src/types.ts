import { Move } from "chess.js";

export type FEN = string;

export type Evaluation = {
    type: string;
    move: Move | { from: string; to: string };
    sequence: string;
    eval: string;
    fen?: string;
};

export type Tactic = any;

export type TacticContext = {
    position: FEN;
    evaluation: Evaluation;
    presvEvaluation?: Evaluation;
};

export interface TacticClassifier {
    isTactic(context: TacticContext): Tactic | null;
}

export type TacticId = "fork" | "pin" | "skewer" | "sacrifice" | "trap";
