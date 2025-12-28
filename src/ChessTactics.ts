import { Tactic, TacticContext, TacticClassifier, TacticKey } from "@types";
import { TacticFactory } from "./TacticFactory";
import { TacticContextParser } from "./utils/TacticContextParser";

export class ChessTactics {
    private tacticClassifiers: TacticClassifier[];
    private selectedTactics: TacticKey[];

    constructor(tacticKeys: TacticKey[] = []) {
        this.selectedTactics = tacticKeys;
        this.initializeClassifiers();
    }

    private initializeClassifiers() {
        this.tacticClassifiers = [];
        if (this.selectedTactics.length === 0) {
            this.selectedTactics = ["fork", "hanging", "pin", "sacrifice", "skewer", "trap"];
        }
        for (const t of this.selectedTactics) {
            this.tacticClassifiers.push(TacticFactory.create(t));
        }
    }

    classify(context: TacticContext): Tactic | null {
        const internalContext = TacticContextParser.parse(context);
        for (const classifier of this.tacticClassifiers) {
            const tactic = classifier.isTactic(internalContext);
            if (tactic) return tactic;
        }
        return null;
    }
}
