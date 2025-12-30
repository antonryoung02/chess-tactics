import { Tactic, TacticContext, TacticClassifier, TacticKey, TacticOptions } from "@types";
import { TacticFactory } from "./TacticFactory";
import { TacticContextParser } from "./utils/TacticContextParser";
import { DEFAULT_TACTIC_CLASSIFIERS, DEFAULT_TACTIC_OPTIONS } from "@utils";

export class ChessTactics {
    private tacticClassifiers: TacticClassifier[];
    private selectedTactics: TacticKey[];

    constructor(tacticKeys: TacticKey[] = []) {
        this.selectedTactics = tacticKeys;
        this.initializeClassifiers();
    }

    private initializeClassifiers() {
        if (this.selectedTactics.length === 0) {
            this.selectedTactics = DEFAULT_TACTIC_CLASSIFIERS;
        } else {
            this.tacticClassifiers = [];
            for (const t of this.selectedTactics) {
                this.tacticClassifiers.push(TacticFactory.create(t));
            }
        }
    }

    classify(
        context: TacticContext,
        options: TacticOptions = DEFAULT_TACTIC_OPTIONS
    ): Tactic | null {
        const internalContext = TacticContextParser.parse(context);
        for (const classifier of this.tacticClassifiers) {
            const tactic = classifier.isTactic(internalContext, options);
            if (tactic) return tactic;
        }
        return null;
    }
}
