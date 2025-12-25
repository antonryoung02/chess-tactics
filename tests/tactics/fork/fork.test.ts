import { Chess, Move } from "chess.js";
import { ForkTactics } from "@tactics/Fork";
import getCosmeticForksJson from "./fork__get_cosmetic_forks.json";
import getIsTacticJson from "./fork__is_tactic.json";
import { restoreMoves, logBoardSequence } from "../../base_tactic/base_tactic.test";
import { TacticContext } from "@types";

describe("getCosmeticForks", () => {
    test("passes json test cases", () => {
        const forkTactic = new ForkTactics();
        getCosmeticForksJson.forEach((t) => {
            const moveSequence = restoreMoves(t.start_fen, t.move_sequence);
            const result = forkTactic.getCosmeticForks(t.start_fen, moveSequence[0]);
            if (result.length !== t.expected) {
                console.log(`Failure: ${t.description}. Expected: ${t.expected}`);
                logBoardSequence(t.start_fen, moveSequence);
            }

            expect(result.length).toBe(t.expected);
        });
    });
});

// describe("isTactic", () => {
//     test("passes json test cases", () => {
//         getIsTacticJson.forEach((t) => {
//             const forkTactic = new ForkTactics();
//             const context = t.context as TacticContext;
//             if (t.debug) {
//                 debugger;
//             }
//             const result = forkTactic.isTactic(context);
//             if ((result !== null) !== t.expected) {
//                 console.log(
//                     `Failure: ${t.description}. Expected: ${t.expected}. Recieved: ${result}`
//                 );
//                 logBoardSequence(t.context.position, []);
//             }

//             expect(result !== null).toBe(t.expected);
//         });
//     });
// });
