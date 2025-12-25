import { Tactic, TacticContext, TacticClassifier, TacticKey } from "@types";
import { TacticFactory } from "./TacticFactory";

export class ChessTactics {
    private tacticClassifiers: TacticClassifier[];
    private selectedTactics: TacticKey[];

    constructor(tactics: TacticKey[]) {
        this.selectedTactics = tactics;
        this.tacticClassifiers = [];
        this.initializeClassifiers();
    }

    private initializeClassifiers() {
        this.tacticClassifiers = [];
        for (const t of this.selectedTactics) {
            this.tacticClassifiers.push(TacticFactory.create(t));
        }
    }

    classify(context: TacticContext): Tactic | null {
        this.initializeClassifiers();
        for (const classifier of this.tacticClassifiers) {
            const tactic = classifier.isTactic(context);
            if (tactic) {
                return tactic;
            }
        }
        return null;
    }
}
