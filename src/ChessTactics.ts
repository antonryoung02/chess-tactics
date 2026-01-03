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

    classify(context: TacticContext, options: TacticOptions = DEFAULT_TACTIC_OPTIONS): Tactic[] {
        const tactics = [];
        const mergedOptions = { ...DEFAULT_TACTIC_OPTIONS, ...options };
        const internalContext = TacticContextParser.parse(context, mergedOptions);
        for (const classifier of this.tacticClassifiers) {
            const t = classifier.findTactic(internalContext, mergedOptions);
            if (t) tactics.push(t);
        }
        return tactics;
    }
}
