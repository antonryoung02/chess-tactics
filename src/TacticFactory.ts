import { TacticClassifier, TacticKey } from "@types";
import {
    ForkTactics,
    PinTactics,
    SkewerTactics,
    SacrificeTactics,
    TrapTactics,
    HangingPieceTactics,
} from "@tactics";

export class TacticFactory {
    static create(type: TacticKey): TacticClassifier {
        switch (type) {
            case "fork":
                return new ForkTactics();
            case "pin":
                return new PinTactics();
            case "skewer":
                return new SkewerTactics();
            case "sacrifice":
                return new SacrificeTactics();
            case "trap":
                return new TrapTactics();
            case "hanging":
                return new HangingPieceTactics();
        }
    }
}
