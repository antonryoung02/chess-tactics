import getCosmeticPinsJson from "./pin__get_cosmetic_pins.json";
import getIsTacticJson from "./pin__is_tactic.json";
import { Chess, Move } from "chess.js";
import { PinTactics } from "@tactics/Pin";
import { restoreMoves, logBoardSequence } from "../../base_tactic/base_tactic.test";
import { TacticContext } from "@types";

describe("getCosmeticPins", () => {
    test("passes json test cases", () => {
        const pinTactic = new PinTactics();

        getCosmeticPinsJson.forEach((t) => {
            const chess = new Chess(t.start_fen);
            const moveSequence = restoreMoves(t.start_fen, t.move_sequence);
            chess.move(moveSequence[0]);
            const result = pinTactic.getCosmeticPins(t.start_fen, moveSequence[0]);
            if (result.length !== t.expected) {
                console.log(`Failure: ${t.description}`);
                logBoardSequence(t.start_fen, moveSequence);
            }

            expect(result.length).toBe(t.expected);
        });
    });
});

describe("isTactic", () => {
    test("passes json test cases", () => {
        getIsTacticJson.forEach((t) => {
            const pinTactic = new PinTactics();
            const context = t.context as TacticContext;
            const result = pinTactic.isTactic(context);
            if ((result !== null) !== t.expected) {
                console.log(`Failure: ${t.description}. ${t.expected}`);
                logBoardSequence(t.context.position, []);
            }

            expect(result !== null).toBe(t.expected);
        });
    });
});
