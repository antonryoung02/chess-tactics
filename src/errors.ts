export type ChessTacticParserErrorCode =
    | "INVALID_FEN"
    | "INVALID_MOVE"
    | "INVALID_FOLLOWUP"
    | "INVALID_SEQUENCE";

export class ChessTacticsParserError extends Error {
    code: ChessTacticParserErrorCode;
    constructor(message: string, code: ChessTacticParserErrorCode, options?: { cause?: unknown }) {
        super(message, options);
        this.name = "ChessTacticsParserError";
        this.code = code;
    }
}
