import isTacticJson from "./sacrifice__is_tactic.json";
import { SacrificeTactics } from "@tactics/Sacrifice";

import { logBoardSequence } from "../../base_tactic/base_tactic.test";
import { TacticContext } from "@types";

describe("Sacrifice.isTactic", () => {
    test("passes json test cases", () => {
        const sacTactic = new SacrificeTactics();

        isTacticJson.forEach((t) => {
            if (t.debug) {
                debugger;
            }
            const context = t.context as TacticContext;
            const result = sacTactic.isTactic(context);
            if ((result !== null) !== t.expected) {
                console.log(`Failure: ${t.description}. ${t.expected}`);
                logBoardSequence(context.position, []);
            }

            expect(result !== null).toBe(t.expected);
        });
    });
});
