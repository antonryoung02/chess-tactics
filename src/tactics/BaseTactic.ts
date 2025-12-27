import { Tactic, TacticClassifier, TacticContext } from "@types";
import { SequenceInterpreter } from "@utils";

export class BaseTactic implements TacticClassifier {
    protected sequenceInterpreter: SequenceInterpreter;

    constructor(sequenceInterpreter: SequenceInterpreter) {
        this.sequenceInterpreter = sequenceInterpreter;
    }

    isTactic(context: TacticContext): Tactic | null {
        this.sequenceInterpreter.setContext(context);
        return null;
    }
}
