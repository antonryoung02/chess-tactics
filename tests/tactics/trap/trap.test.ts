import { TrapTactics } from "@tactics/Trap";
import getIsTacticJson from "./trap__is_tactic.json";
import { logBoardSequence } from "../../base_tactic/base_tactic.test";
import { TacticContext } from "@types";

describe("isTactic", () => {
    test("passes json test cases", () => {
        getIsTacticJson.forEach((t) => {
            const trapTactic = new TrapTactics();
            if (t?.debug) {
                debugger;
            }
            const context = t.context as TacticContext;
            const result = trapTactic.isTactic(context);

            if ((result !== null) !== t.expected) {
                console.log(`Failure: ${t.description}. ${t.expected}`);
                logBoardSequence(context.position, []);
            }

            expect(result !== null).toBe(t.expected);
        });
    });
});
