import { Tactic, TacticClassifier } from "@types";
import { SequenceInterpreter } from "@utils";
import { _TacticContext } from "src/_types";

export class BaseTactic implements TacticClassifier {
    protected sequenceInterpreter: SequenceInterpreter;

    constructor(sequenceInterpreter: SequenceInterpreter) {
        this.sequenceInterpreter = sequenceInterpreter;
    }

    isTactic(context: _TacticContext): Tactic | null {
        this.sequenceInterpreter.setContext(context);
        return null;
    }
}
