import { SequenceInterpreter, TacticClassifier, TacticKey } from "@types";
import {
    ForkTactics,
    PinTactics,
    SkewerTactics,
    SacrificeTactics,
    TrapTactics,
    HangingPieceTactics,
} from "@tactics";
import { DefaultSequenceInterpreter, TrapTacticsSequenceInterpreter } from "@utils";

export class TacticFactory {
    static create(type: TacticKey): TacticClassifier {
        const interpreter = this.createSequenceInterpreter(type);
        return this.createTactic(type, interpreter);
    }

    static createSequenceInterpreter(type: TacticKey): SequenceInterpreter {
        switch (type) {
            case "trap":
                return new TrapTacticsSequenceInterpreter();
            default:
                return new DefaultSequenceInterpreter();
        }
    }

    static createTactic(type: TacticKey, interpreter: SequenceInterpreter): TacticClassifier {
        switch (type) {
            case "fork":
                return new ForkTactics(interpreter);
            case "pin":
                return new PinTactics(interpreter);
            case "skewer":
                return new SkewerTactics(interpreter);
            case "sacrifice":
                return new SacrificeTactics(interpreter);
            case "trap":
                return new TrapTactics(interpreter);
            case "hanging":
                return new HangingPieceTactics(interpreter);
        }
    }
}
