import { Fen, Tactic, TacticClassifier, TacticOptions, SequenceInterpreter } from "@types";
import { TacticBuilder } from "@utils";
import { _TacticContext } from "src/_types";
import { Chess, Move } from "chess.js";

export class BaseTactic implements TacticClassifier {
    protected sequenceInterpreter: SequenceInterpreter;
    protected tacticBuilder: TacticBuilder;

    constructor(sequenceInterpreter: SequenceInterpreter, builder: TacticBuilder) {
        this.sequenceInterpreter = sequenceInterpreter;
        this.tacticBuilder = builder;
    }

    // Detects non-immediate tactics by iteratively calling isTactic on the position as long as the previous attacker move was 'forcing'
    findTactic(context: _TacticContext, options: TacticOptions): Tactic | null {
        let sequence = context.evaluation.sequence;
        const chess = new Chess(context.position);
        let isForcing = true;

        let i = 0;
        while (isForcing && i <= Math.min(sequence.length - 3, options.maxLookaheadMoves)) {
            const currentContext = this.contextAtState(context, chess.fen(), sequence, i);
            this.sequenceInterpreter.setContext(currentContext);

            const isTactic = this.isTactic(currentContext);
            if (isTactic) {
                return this.tacticBuilder.complete(context, i).build();
            } else {
                // Play your move and opponent's response
                const currMove = chess.move(sequence[i]);
                isForcing = this.isForcingPosition(chess, currMove);
                chess.move(sequence[i + 1]);
                i += 2;
            }
        }
        return null;
    }

    isTactic(context: _TacticContext): boolean {
        throw new Error("BaseTactic.isTactic must be overridden in subclass");
    }
    // could try adding 'madeThreat' to the isForcing if needed
    // most likely would require a multipv > 1 engine evaluation for anything better than this
    private isForcingPosition(chess: Chess, move: Move): boolean {
        return move.captured !== undefined || chess.inCheck();
    }

    // todo: the start of a factory pattern
    private contextAtState(
        context: _TacticContext,
        position: Fen,
        sequence: Move[],
        sequenceIndex: number,
    ) {
        if (sequenceIndex === 0) {
            return context;
        }
        if ("prevEvaluation" in context) {
            return this.updatePositionComparisonContext(context, position, sequence, sequenceIndex);
        } else {
            return this.updateDefaultContext(context, position, sequence, sequenceIndex);
        }
    }

    private updateDefaultContext(
        context: _TacticContext,
        position: Fen,
        sequence: Move[],
        sequenceIndex: number,
    ) {
        return {
            position: position,
            evaluation: { sequence: sequence.slice(sequenceIndex) },
        };
    }

    private updatePositionComparisonContext(
        context: _TacticContext,
        position: Fen,
        sequence: Move[],
        sequenceIndex: number,
    ) {
        return {
            position: position,
            evaluation: { sequence: sequence.slice(sequenceIndex) },
            prevPosition: context.position,
            prevMove: sequence[sequenceIndex - 1],
            prevEvaluation: context.evaluation,
        };
    }
}
