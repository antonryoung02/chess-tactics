import { SequenceInterpreter, TacticClassifier, TacticKey } from "@types";
import {
    ForkTactics,
    PinTactics,
    SkewerTactics,
    SacrificeTactics,
    TrapTactics,
    HangingPieceTactics,
} from "@tactics";
import { DefaultSequenceInterpreter, TacticBuilder, TrapTacticsSequenceInterpreter } from "@utils";

export class TacticFactory {
    static create(type: TacticKey): TacticClassifier {
        const interpreter = this.createSequenceInterpreter(type);
        const builder = this.createTacticBuilder();
        return this.createTactic(type, interpreter, builder);
    }

    static createTacticBuilder() {
        return new TacticBuilder();
    }

    static createSequenceInterpreter(type: TacticKey): SequenceInterpreter {
        switch (type) {
            case "trap":
                return new TrapTacticsSequenceInterpreter();
            default:
                return new DefaultSequenceInterpreter();
        }
    }

    static createTactic(
        type: TacticKey,
        interpreter: SequenceInterpreter,
        builder: TacticBuilder,
    ): TacticClassifier {
        switch (type) {
            case "fork":
                return new ForkTactics(interpreter, builder);
            case "pin":
                return new PinTactics(interpreter, builder);
            case "skewer":
                return new SkewerTactics(interpreter, builder);
            case "sacrifice":
                return new SacrificeTactics(interpreter, builder);
            case "trap":
                return new TrapTactics(interpreter, builder);
            case "hanging":
                return new HangingPieceTactics(interpreter, builder);
        }
    }
}
