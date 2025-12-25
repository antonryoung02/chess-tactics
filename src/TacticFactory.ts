import { TacticClassifier, TacticId } from "@types";
import { ForkTactics } from "@tactics/Fork";
import { PinTactics } from "@tactics/Pin";
import { SacrificeTactics } from "@tactics/Sacrifice";
import { SkewerTactics } from "@tactics/Skewer";
import { TrapTactics } from "@tactics/Trap";
import { HangingPieceTactics } from "@tactics/HangingPiece";

export class TacticFactory {
    static create(type: TacticId): TacticClassifier {
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
            case "free":
                return new HangingPieceTactics();
        }
    }
}
