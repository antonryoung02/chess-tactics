import { Chess, Color, Move, Piece, PieceSymbol, Square, validateFen } from "chess.js";
import { FEN } from "@types";
import { colorToPlay, PIECE_VALUES } from "./utils";
// TODO package method ALL
export class ChessHelper {
    public chess: Chess;

    constructor() {
        this.chess = new Chess();
    }

    load(fen: FEN, color: "w" | "b" | null = null) {
        if (color) {
            const parts = fen.split(" ");
            fen = parts[0] + " " + color + " " + parts.slice(2).join(" ");
        }
        this.chess.load(fen, { skipValidation: true });
    }

    withFenRestore(methodFn: any) {
        const originalFen = this.chess.fen();
        try {
            return methodFn.call(this);
        } finally {
            this.chess.load(originalFen);
        }
    }

    // getSquareDefenders(square). Dict of piece value => number of defenders of that type
    getSquareDefenders(
        fen: FEN,
        square: Square,
        color: "w" | "b",
        verbose: boolean = false
    ): Record<string, number> | Record<string, any>[] {
        this.load(fen, color);
        let defenders: any[] = [];
        const piece = this.chess.remove(square);

        if (piece && piece.type === "k") {
            if (verbose) return [];
            return { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0, total: 0 };
        }
        let moves = this.getMovesToSquare(this.chess.fen(), square);
        while (moves.length > 0) {
            const nextDefenderLayer: any[] = [];
            const movesWithValue = moves.map((m) => ({
                value: PIECE_VALUES[m.piece],
                piece: m.piece,
                from: m.from,
            }));
            movesWithValue.sort((a, b) => a.value - b.value);
            movesWithValue.forEach((m) => {
                this.chess.remove(m.from);
                nextDefenderLayer.push(m);
            });
            defenders = defenders.concat(nextDefenderLayer);
            const currPosition = this.chess.fen();
            moves = this.getMovesToSquare(currPosition, square);
            this.load(currPosition);
        }
        if (this.kingNextToSquare(fen, square, color)) {
            defenders.push({
                value: PIECE_VALUES.k,
                piece: "k",
                from: this.chess.findPiece({ type: "k", color })[0],
            });
        }
        if (verbose) {
            return defenders.map((d) => ({ piece: d.piece, from: d.from }));
        }
        const counts = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0, total: 0 };
        defenders.forEach((m) => {
            const p = m.piece as PieceSymbol;
            counts[p] += 1;
            counts.total += 1;
        });
        return counts;
    }

    private getMovesToSquare(fen: FEN, square: Square): Move[] {
        this.load(fen);
        const piece = this.chess.get(square);
        if (piece && piece.color === this.chess.turn()) {
            this.throwError(
                "Provided a square that is occupied by a piece of the player to play. This could cause unexpected behavior"
            );
        }
        const pieceMoves = this.chess
            .moves({ verbose: true })
            .filter((m) => m.to === square && m.piece !== "p");
        const pawnMoves = this.pawnsDefendingSquare(fen, square, this.chess.turn());
        this.load(fen);
        return pieceMoves.concat(pawnMoves);
    }

    private kingNextToSquare(fen: FEN, square: Square, color: Color | null) {
        this.chess.load(fen);
        if (!color) {
            color = this.chess.turn();
        }
        const kingSquare = this.chess.findPiece({ type: "k", color })[0];

        const kingFile = String(kingSquare).charCodeAt(0) - "a".charCodeAt(0);
        const kingRank = parseInt(kingSquare[1]) - 1;

        const targetFile = square.charCodeAt(0) - "a".charCodeAt(0);
        const targetRank = parseInt(square[1]) - 1;

        const fileDiff = Math.abs(kingFile - targetFile);
        const rankDiff = Math.abs(kingRank - targetRank);
        const result = fileDiff <= 1 && rankDiff <= 1;
        return result;
    }

    private pawnsDefendingSquare(fen: FEN, square: Square, color: Color) {
        this.load(fen, color);
        this.chess.put({ type: "q", color: color === "w" ? "b" : "w" }, square);
        this.chess.setTurn(color);
        const result = this.chess
            .moves({ verbose: true })
            .filter((m) => m.to === square && m.piece === "p");
        return result;
    }

    piecePinnedToKing(fen: FEN, square: Square): boolean {
        const chess = new Chess(fen);
        const color = chess.get(square)?.color;
        const parts = fen.split(" ");
        fen = parts[0] + " " + color + " " + parts.slice(2).join(" ");
        chess.load(fen, { skipValidation: true });
        if (chess.inCheck()) {
            return false;
        }
        chess.remove(square);
        return chess.inCheck();
    }

    attackingSquareIsGood(fen: FEN, square: Square): boolean {
        const chess = new Chess(fen);
        const piece = chess.get(square);
        if (piece?.type === "k") return true;
        const advantage = this.materialAdvantageAfterTradesAtSquare(fen, square, colorToPlay(fen));
        return advantage > 0;
    }

    attackingSquareIsBad(fen: FEN, square: Square): boolean {
        const chess = new Chess(fen);
        const piece = chess.get(square);
        if (piece?.type === "k") return false;
        const advantage = this.materialAdvantageAfterTradesAtSquare(fen, square, colorToPlay(fen));
        return advantage < 0;
    }

    materialAdvantageAfterTradesAtSquare(
        fen: FEN,
        square: Square,
        attackerColorIfSquareIsUnoccupied: Color
    ): number {
        this.load(fen);
        const piece = this.chess.get(square);
        if (!piece && !attackerColorIfSquareIsUnoccupied) {
            this.throwError("function called on a square that is unoccupied!");
        }
        const attackingColor = piece
            ? piece.color === "w"
                ? "b"
                : "w"
            : attackerColorIfSquareIsUnoccupied;
        const defendingColor = attackingColor === "w" ? "b" : "w";

        if (this.chess.turn() !== attackingColor) {
            this.throwError("function called with defender to move");
        }
        const defenders: any = this.getSquareDefenders(fen, square, defendingColor, true);

        const attackers: any = this.getSquareDefenders(fen, square, attackingColor, true);
        let advantage = 0;
        let i = 0;
        if (attackers.length > 0 && piece) {
            advantage = PIECE_VALUES[piece.type];
        }
        let prevAdv = advantage;
        while (i < defenders.length && i < attackers.length) {
            if (advantage < 0) {
                if (
                    prevAdv >
                    prevAdv - PIECE_VALUES[attackers[i].piece] + PIECE_VALUES[defenders[i].piece]
                ) {
                    return prevAdv;
                }
                return advantage;
            }
            prevAdv = advantage;
            advantage -= PIECE_VALUES[attackers[i].piece];
            if (advantage > 0) {
                if (i + 1 >= attackers.length) {
                    return advantage;
                }
                if (
                    prevAdv <
                    prevAdv - PIECE_VALUES[attackers[i].piece] + PIECE_VALUES[defenders[i].piece]
                ) {
                    return prevAdv;
                }
                return advantage;
            }
            if (i + 1 < attackers.length) {
                prevAdv = advantage;
                advantage += PIECE_VALUES[defenders[i].piece];
            }

            i += 1;
        }
        return advantage;
    }

    // this handles a new move urgency constraint. Piece on square HAS to be the first `attacker`
    getEscapeSquares(fen: FEN, square: Square) {
        this.chess.load(fen);
        const piece = this.chess.get(square);
        if (!piece) {
            this.throwError("function called on a square that is unoccupied!");
        }

        const moves = this.chess.moves({ square, verbose: true });
        const escapeSquares = [];
        for (let i = 0; i < moves.length; i++) {
            this.chess.load(fen);
            this.chess.move(moves[i]);
            let initialAdvantage = 0;
            const captured = moves[i].captured;
            if (captured) {
                initialAdvantage = PIECE_VALUES[captured];
            }
            const nextFen = this.chess.fen();
            const opponentAdvantage = this.materialAdvantageAfterTradesAtSquare(
                nextFen,
                moves[i].to,
                colorToPlay(nextFen)
            );
            if (initialAdvantage - opponentAdvantage >= 0) {
                escapeSquares.push(moves[i].to);
            }
        }

        return escapeSquares;
    }

    getBlockingMoves(fen: FEN, attackingSquare: Square, threatenedSquare: Square) {
        this.load(fen);
        const attackingPiece = this.chess.get(attackingSquare);
        const threatenedPiece = this.chess.get(threatenedSquare);

        if (!attackingPiece || !threatenedPiece) {
            this.throwError(
                `The squares ${attackingSquare} or ${threatenedSquare} do not have pieces on them`
            );
            return [];
        }
        if (attackingPiece.color === this.chess.turn()) {
            this.throwError("It should not be attacker's turn to move!");
        }
        if (threatenedPiece.color !== this.chess.turn()) {
            this.throwError("It needs to be defender's turn to move!");
        }
        this.load(fen, attackingPiece.color);
        if (
            this.chess
                .moves({ square: attackingSquare, verbose: true })
                .filter((m) => m.to === threatenedSquare).length === 0
        ) {
            this.throwError("attackingSquare doesn't even threaten threatenedSquare");
        }
        this.chess.setTurn(threatenedPiece.color);

        const candidateMoves = this.chess
            .moves({ verbose: true })
            .filter((m) => m.from !== threatenedSquare)
            .filter((m) => {
                const chessCopy = new Chess(fen);
                chessCopy.move(m);
                return (
                    chessCopy
                        .moves({ square: attackingSquare, verbose: true })
                        .filter((n) => n.to === threatenedSquare).length === 0
                );
            });
        const blockingMoves = [];
        for (let i = 0; i < candidateMoves.length; i++) {
            this.chess.load(fen);
            this.chess.move(candidateMoves[i]);
            let initialAdvantage = 0;
            const captured = candidateMoves[i].captured;
            if (captured) {
                initialAdvantage = PIECE_VALUES[captured];
            }
            const opponentAdvantage = this.materialAdvantageAfterTradesAtSquare(
                this.chess.fen(),
                candidateMoves[i].to,
                colorToPlay(this.chess.fen())
            );
            if (initialAdvantage - opponentAdvantage >= 0) {
                blockingMoves.push({ from: candidateMoves[i].from, to: candidateMoves[i].to });
            }
        }
        return blockingMoves;
    }

    private throwError(message: string) {
        console.log("### Error in ChessHelper: ###");
        console.log(this.chess.ascii());
        throw new Error(message);
    }
}
