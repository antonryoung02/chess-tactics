import { EvaluationAnalysis } from "../src/services/evaluation_service";
import { Move } from "chess.js";
export declare function createMockEvalService(overrides?: {}): EvaluationAnalysis;
export declare function restoreMoves(
    startFen: string,
    rawMoves: {
        from: string;
        to: string;
    }[]
): Move[];
export declare function logBoardSequence(startFen: string, moveSequence: Move[]): void;
