import { Tactic, TacticContext, TacticClassifier, TacticId } from "@types";
import { TacticFactory } from "./TacticFactory";

export class ChessTactics {
    private tacticClassifiers: TacticClassifier[];
    private tacticIds: TacticId[];

    constructor(tacticIds: TacticId[]) {
        this.tacticIds = tacticIds;
        this.tacticClassifiers = [];
    }

    private initializeClassifiers() {
        this.tacticClassifiers = [];
        for (const t of this.tacticIds) {
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
