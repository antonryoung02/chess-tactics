import { Fen, Tactic, TacticClassifier } from "@types";
import { colorToPlay, getMaterialChange, SequenceInterpreter } from "@utils";
import { _TacticContext } from "src/_types";
import { Chess, Move } from "chess.js";

export class BaseTactic implements TacticClassifier {
    protected sequenceInterpreter: SequenceInterpreter;

    constructor(sequenceInterpreter: SequenceInterpreter) {
        this.sequenceInterpreter = sequenceInterpreter;
    }

    // Detects non-immediate tactics by iteratively calling isTactic on the position as long as the previous attacker move was 'forcing'
    findTactic(context: _TacticContext): Tactic | null {
        let sequence = context.evaluation.sequence;
        const chess = new Chess(context.position);
        let isForcing = true;

        let i = 0;
        while (isForcing && i < Math.min(sequence.length - 2, 4)) {
            const newContext = this.contextAtState(context, chess.fen(), sequence, i);
            this.sequenceInterpreter.setContext(newContext);
            const tactic = this.isTactic(newContext);
            if (tactic) {
                if (tactic.type === "hanging" && i > 0) {
                    return null;
                }
                return this.wrapTactic(tactic, context, sequence, i);
            }
            // Play your move and opponent's response
            const currMove = chess.move(sequence[i]);
            isForcing = this.isForcingPosition(chess, currMove);
            chess.move(sequence[i + 1]);
            i += 2;
        }
        return null;
    }

    isTactic(context: _TacticContext): Partial<Tactic> | null {
        throw new Error("BaseTactic.isTactic must be overridden in subclass");
    }

    wrapTactic(
        tactic: Partial<Tactic>,
        context: _TacticContext,
        sequence: Move[],
        sequenceIndex: number
    ): Tactic {
        return {
            type: tactic.type,
            endPosition: tactic.endPosition,
            attackedPieces: tactic.attackedPieces,
            startPosition: context.position,
            materialChange: getMaterialChange(
                context.position,
                tactic.endPosition,
                colorToPlay(context.position)
            ),
            triggerIndex: sequenceIndex,
            sequence: sequence.slice(0, sequenceIndex).concat(tactic.sequence),
        };
    }

    // could try adding 'madeThreat' to the isForcing if needed
    // most likely would require a multipv > 1 engine evaluation for anything better than this
    private isForcingPosition(chess: Chess, move: Move): boolean {
        return move.captured !== undefined || chess.inCheck();
    }

    private contextAtState(
        context: _TacticContext,
        position: Fen,
        sequence: Move[],
        sequenceIndex: number
    ) {
        let newContext: _TacticContext = {
            ...context,
            position: position,
            evaluation: { sequence: sequence.slice(sequenceIndex) },
        };
        if ("prevEvaluation" in context && sequenceIndex > 0) {
            newContext = {
                ...newContext,
                prevPosition: context.position,
                prevMove: sequence[sequenceIndex - 1],
                prevEvaluation: context.evaluation,
            };
        }
        return newContext;
    }
}
