import { Chess } from "chess.js";
import { PIECE_VALUES } from "./utils";
import { Evaluation, FEN } from "@types";
import type { Square, Move, Color, PieceSymbol } from "chess.js";

class BaseTactic {
    invertTurn(chess: Chess): void {
        let fenSplit = chess.fen().split(" ");
        fenSplit[1] = fenSplit[1] === "w" ? "b" : "w";
        fenSplit[3] = "-";

        chess.load(fenSplit.join(" "));
    }

    getThreateningMoves(chess: Chess, currentMove: Move, initialPosition: FEN): Array<Move> {
        // game must be the initial position
        const chessCopy = new Chess(initialPosition);
        chessCopy.move(currentMove);
        this.invertTurn(chessCopy);

        const possibleMoves = chessCopy.moves({ square: currentMove.to, verbose: true });
        const threateningMoves = [];
        for (const m of possibleMoves) {
            if (this.isPieceThreatened(initialPosition, m, currentMove)) {
                threateningMoves.push(m);
            }
        }
        return threateningMoves;
    }

    isPieceThreatened(initialPosition: FEN, threateningMove: Move, currentMove: Move): boolean {
        // in order for a piece to be threatened by another piece, it can't be of same type, and it can either be worth more material or undefended
        // Structure:
        // initialPosition must be on the board
        const chess = new Chess(initialPosition);
        let piece = chess.get(threateningMove.to);
        if (!piece || piece.type === currentMove.piece) return false;
        if (PIECE_VALUES[piece.type] > PIECE_VALUES[currentMove.piece]) return true;

        chess.move(currentMove);

        const opponentResponses = chess
            .moves({ verbose: true })
            .filter((e) => e.to === currentMove.to);
        for (let i = 0; i < opponentResponses.length; i++) {
            const m = opponentResponses[i];
            if (PIECE_VALUES[m.piece] <= PIECE_VALUES[currentMove.piece]) {
                return false;
            }
            if (this.isSquareUndefended(chess, m.to, m)) {
                return false;
            }
            chess.remove(m.from);
        }
        if (chess.inCheck()) {
            this.invertTurn(chess);
            return this.isSquareUndefended(chess, threateningMove.to, threateningMove);
        } else {
            this.invertTurn(chess);
            return this.isSquareUndefended(chess, threateningMove.to, threateningMove);
        }
    }

    isSquareUndefended(chess: Chess, square: Square, move: Move): boolean {
        try {
            const chessCopy = new Chess(chess.fen());
            chessCopy.move(move);
            return !this.canMoveToSquare(chessCopy, square);
        } catch (e) {
            console.error("Error in isSquareUndefended: ", e);
        }
        return false;
    }

    // TODO package method
    canMoveToSquare(chess: Chess, square: Square): boolean {
        return chess.moves({ verbose: true }).filter((e) => e.to === square).length > 0;
    }

    isPieceCapturableWithTradeOrBetter(chess: Chess, square: Square): boolean {
        //Needs to be initial position + game.move(currenMove). ie Opponent's response
        const piece = chess.get(square);
        if (!piece) {
            return false;
        }
        const opponentMoves = chess.moves({ verbose: true }).filter((e) => e.to == square);
        for (const m of opponentMoves) {
            if (PIECE_VALUES[m.piece] <= PIECE_VALUES[piece.type]) {
                return true;
            }
        }
        return false;
    }

    isPieceCapturableForMaterialGain(chess: Chess, square: Square): boolean {
        // not actually needed, acts as a 'can you capture the piece on square with a piece of lesser value
        const piece = chess.get(square);
        if (!piece) {
            return false;
        }
        const opponentMoves = chess.moves({ verbose: true }).filter((e) => e.to == square);
        for (const m of opponentMoves) {
            if (m.captured && PIECE_VALUES[m.piece] < PIECE_VALUES[m.captured]) {
                return true;
            }
        }
        return false;
    }

    // TODO package method
    getMoveDiff(originalMoves: Move[], newMoves: Move[]): Move[] {
        return newMoves.filter(
            (m) => originalMoves.map((n) => n.to).includes(m.to) === false && m.captured
        );
    }
}

export { BaseTactic };
