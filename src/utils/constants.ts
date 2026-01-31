import { PieceSymbol } from "chess.js";
import { TacticKey, TacticOptions } from "@types";

export const PIECE_VALUES: Record<PieceSymbol, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: Infinity,
};

export const DEFAULT_TACTIC_OPTIONS: TacticOptions = {
    trimEndSequence: false,
    maxLookaheadMoves: 5,
};

export const DEFAULT_TACTIC_CLASSIFIERS: TacticKey[] = [
    "fork",
    "pin",
    "sacrifice",
    "skewer",
    "trap",
    "hanging",
];

// This can be added to tactic options eventually. For now it cuts off any excessively long 'moves till capture' sequences to pass tests
export const MAX_TACTIC_LENGTH = 7;
