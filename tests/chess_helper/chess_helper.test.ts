import squareDefendersJson from "./chess_helper_get_square_defenders.json";
import attackingSquareIsGoodJson from "./chess_helper_attacking_square_is_good.json";
import getEscapeSquaresJson from "./chess_helper_get_escape_squares.json";
import getBlockingMovesJson from "./chess_helper_get_blocking_moves.json";
import { attackingSquareIsGood, getBlockingMoves, getEscapeSquares } from "@utils";
import { Square } from "chess.js";
import { getSquareDefenders } from "@utils";

describe("getSquareDefenders", () => {
    test.each(squareDefendersJson)(
        "should return verbose defenders for square $square in position $start_fen",
        (s) => {
            const square = s.square as Square;
            const whiteDefendersVerbose = getSquareDefenders(s.start_fen, square, "w", true);
            const blackDefendersVerbose = getSquareDefenders(s.start_fen, square, "b", true);
            expect(whiteDefendersVerbose).toEqual(s.expected.white_verbose);
            expect(blackDefendersVerbose).toEqual(s.expected.black_verbose);
        }
    );

    test.each(squareDefendersJson)(
        "should return non-verbose defenders for square $square in position $start_fen",
        (s) => {
            const square = s.square as Square;
            const whiteDefenders = getSquareDefenders(s.start_fen, square, "w", false);
            const blackDefenders = getSquareDefenders(s.start_fen, square, "b", false);
            expect(whiteDefenders).toEqual(s.expected.white);
            expect(blackDefenders).toEqual(s.expected.black);
        }
    );
    // very important for defenders to be sorted correctly. First "layer" ascending, then second, etc
});

describe("attackingSquareIsGood", () => {
    test.each(attackingSquareIsGoodJson)(
        "should return $expected for attacking square $square in position $start_fen",
        (s) => {
            const square = s.square as Square;
            const isGood = attackingSquareIsGood(s.start_fen, square);
            expect(isGood).toBe(s.expected);
        }
    );
});

describe("attackingSquareIsBad", () => {
    test("it should return true if the trades are bad for the attacker", () => {});
});

describe("getEscapeSquares", () => {
    test.each(getEscapeSquaresJson)(
        "should return escape squares for $square in position $start_fen",
        (s) => {
            const square = s.square as Square;
            const escapeSquares = getEscapeSquares(s.start_fen, square);
            expect(escapeSquares).toEqual(s.expected);
        }
    );
});

describe("getBlockingMoves", () => {
    test.each(getBlockingMovesJson)(
        "should find blocking moves from $attacking_square to $threatened_square in position $start_fen",
        (s) => {
            const attackingSquare = s.attacking_square as Square;
            const threatenedSquare = s.threatened_square as Square;
            const blockingMoves = getBlockingMoves(s.start_fen, attackingSquare, threatenedSquare);
            expect(blockingMoves).toHaveLength(s.expected.length);
            expect(blockingMoves).toEqual(
                expect.arrayContaining(
                    s.expected.map((expected) => expect.objectContaining(expected))
                )
            );
        }
    );
});
