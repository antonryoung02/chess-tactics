import { Tactic, TacticClassifier, TacticOptions } from "@types";
import { colorToPlay, getMaterialChange, SequenceInterpreter } from "@utils";
import { _TacticContext } from "src/_types";
import { DEFAULT_TACTIC_OPTIONS } from "@utils";
import { Chess } from "chess.js";

export class BaseTactic implements TacticClassifier {
    protected sequenceInterpreter: SequenceInterpreter;

    constructor(sequenceInterpreter: SequenceInterpreter) {
        this.sequenceInterpreter = sequenceInterpreter;
    }

    findTactic(context: _TacticContext, options: TacticOptions): Tactic | null {
        let sequence = context.evaluation.sequence;
        let index = 0;
        const chess = new Chess(context.position);
        const mergedOptions = { ...DEFAULT_TACTIC_OPTIONS, ...options };
        let isForcing = true;

        while (isForcing && index < sequence.length - 2) {
            let newContext: _TacticContext = {
                ...context,
                position: chess.fen(),
                evaluation: { sequence: sequence.slice(index) },
            };
            if ("prevEvaluation" in context && index > 0) {
                chess.undo();
                newContext = {
                    ...newContext,
                    prevPosition: chess.fen(),
                    prevMove: sequence[index - 1],
                    prevEvaluation: { sequence: sequence.slice(index - 1) },
                };
                chess.move(sequence[index - 1]);
            }
            this.sequenceInterpreter.setContext(newContext);
            this.sequenceInterpreter.setOptions(mergedOptions);
            const tactic = this.isTactic(newContext);
            if (tactic) {
                return {
                    ...tactic,
                    startPosition: context.position,
                    materialChange: getMaterialChange(
                        context.position,
                        tactic.endPosition,
                        colorToPlay(context.position)
                    ),
                    sequence: sequence
                        .slice(0, index)
                        .map((s) => s.san)
                        .concat(tactic.sequence),
                };
            }
            const currMove = chess.move(sequence[index]);
            // could try adding 'madeThreat' to the isForcing if needed
            isForcing = currMove.captured !== undefined || chess.inCheck();
            chess.move(sequence[index + 1]);
            index += 2;
        }
        return null;
    }

    isTactic(context: _TacticContext): Tactic | null {
        throw new Error("BaseTactic.isTactic must be overridden in subclass");
    }
}
