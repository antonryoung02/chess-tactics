import { Move } from "chess.js";
export declare function restoreMoves(
    startFen: string,
    rawMoves: {
        from: string;
        to: string;
    }[]
): Move[];
export declare function logBoardSequence(startFen: string, moveSequence: Move[]): void;
