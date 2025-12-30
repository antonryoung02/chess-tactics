import { Tactic, TacticClassifier, TacticOptions } from "@types";
import { SequenceInterpreter } from "@utils";
import { _TacticContext } from "src/_types";
import { DEFAULT_TACTIC_OPTIONS } from "@utils";

export class BaseTactic implements TacticClassifier {
    protected sequenceInterpreter: SequenceInterpreter;

    constructor(sequenceInterpreter: SequenceInterpreter) {
        this.sequenceInterpreter = sequenceInterpreter;
    }

    isTactic(context: _TacticContext, options: TacticOptions): Tactic | null {
        this.sequenceInterpreter.setContext(context);
        this.sequenceInterpreter.setOptions({ ...DEFAULT_TACTIC_OPTIONS, ...options });
        return null;
    }
}
