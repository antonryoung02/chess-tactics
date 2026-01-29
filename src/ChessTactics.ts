import { Tactic, TacticContext, TacticClassifier, TacticKey, TacticOptions } from "@types";
import { TacticFactory } from "./TacticFactory";
import { TacticContextParser } from "./utils/TacticContextParser";
import { DEFAULT_TACTIC_CLASSIFIERS, DEFAULT_TACTIC_OPTIONS } from "@utils";
/*

factory creates tactic(interpreter)
classify calls findTactic(context, options)

BaseTactic

findTactic wraps tactic.isTactic(context)
- exists to implement the maxLookaheadMoves option AND wrap / rename fields
- this is bad but some fields need information from findTactic
--- materialChange 
--- sequence

- contextAtState also looks bad
- it updates both _DefaultTacticContext and _PositionComparisonTacticContext types
- use factory?
--- 'is it _PositionComparisonTacticContext' handling exists in two places already


SequenceInterpreter

- The whole point is
using the sequence, is some behavior found between the identified
attacker pieces and identified attacked pieces that should be considered as 
the tactic being intentionally played by the engine.

there is some difference between tactics thus the need for subclassing
ex. trapped piece tactics still count if the attacked piece moves

getCaptureSequence: only used to extend the tactic sequence past tactic capture






Other

- There is no 'is it _PositionComparisonTacticContext' check before calling findTactic
- should isDesparado be a TacticHeuristic method instead of a class method?
*/

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

    classify(context: TacticContext, options: TacticOptions = {}): Tactic[] {
        const tactics = [];
        const internalOptions = { ...DEFAULT_TACTIC_OPTIONS, ...options };
        const internalContext = TacticContextParser.parse(context, internalOptions);

        for (const classifier of this.tacticClassifiers) {
            const t = classifier.findTactic(internalContext, internalOptions);
            if (t) tactics.push(t);
        }
        return tactics;
    }
}
