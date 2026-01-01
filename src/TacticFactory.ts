import { TacticClassifier, TacticKey } from "@types";
import {
    ForkTactics,
    PinTactics,
    SkewerTactics,
    SacrificeTactics,
    TrapTactics,
    HangingPieceTactics,
} from "@tactics";
import { SequenceInterpreter } from "@utils";
import { TrapTacticsSequenceInterpreter } from "./utils/SequenceInterpreter";

export class TacticFactory {
    static create(type: TacticKey): TacticClassifier {
        const sequenceInterpreter = new SequenceInterpreter();
        switch (type) {
            case "fork":
                return new ForkTactics(sequenceInterpreter);
            case "pin":
                return new PinTactics(sequenceInterpreter);
            case "skewer":
                return new SkewerTactics(sequenceInterpreter);
            case "sacrifice":
                return new SacrificeTactics(sequenceInterpreter);
            case "trap":
                const trapInterpreter = new TrapTacticsSequenceInterpreter();
                return new TrapTactics(trapInterpreter);
            case "hanging":
                return new HangingPieceTactics(sequenceInterpreter);
        }
    }
}
