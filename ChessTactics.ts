import { Tactic, TacticContext, TacticClassifier, TacticId } from "./types";
import { TacticFactory } from "./TacticFactory";

export class ChessTactics {
    private tacticClassifiers: TacticClassifier[];

    constructor(tacticIds: TacticId[]) {
        this.tacticClassifiers = [];
        for (const t of tacticIds) {
            this.tacticClassifiers.push(TacticFactory.create(t));
        }
    }

    classify(context: TacticContext): Tactic | null {
        for (const classifier of this.tacticClassifiers) {
            const tactic = classifier.isTactic(context);
            if (tactic) {
                return tactic;
            }
        }
        return null;
    }
}
