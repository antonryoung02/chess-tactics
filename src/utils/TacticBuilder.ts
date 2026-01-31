import { SequenceInterpretation, Tactic, TacticKey } from "@types";
import { Piece, Square } from "chess.js";
import { _TacticContext } from "src/_types";
import { colorToPlay, getMaterialChange } from "./Utils";

export class TacticBuilder {
    private tactic: Partial<Tactic>;
    private completed: boolean;

    constructor() {
        this.tactic = {};
        this.completed = false;
    }

    type(type: TacticKey) {
        if (this.completed) throw new Error("type called after completion");
        this.tactic.type = type;
        return this;
    }

    attackedPieces(attackedPieces: { square: Square; piece: Piece }[]) {
        if (this.completed) throw new Error("attackedPieces called after completion");
        this.tactic.attackedPieces = attackedPieces;
        return this;
    }

    sequence(sequenceInterpretation: SequenceInterpretation) {
        if (this.completed) throw new Error("sequence called after completion");
        this.tactic = {
            ...this.tactic,
            ...sequenceInterpretation,
        };
        return this;
    }

    // .complete overwrites some fields because .isTactic and sequenceInterpreter do not know about previous moves played in the loop.
    complete(initialContext: _TacticContext, triggerIndex: number) {
        if (!this.tactic.endPosition || !this.tactic.sequence) {
            throw new Error(".complete called before .sequence");
        }
        this.tactic.triggerIndex = triggerIndex;
        this.tactic.materialChange = getMaterialChange(
            initialContext.position,
            this.tactic.endPosition,
            colorToPlay(initialContext.position),
        );
        this.tactic.startPosition = initialContext.position;
        this.tactic.sequence = initialContext.evaluation.sequence
            .slice(0, triggerIndex)
            .concat(this.tactic.sequence);
        this.completed = true;
        return this;
    }

    build(): Tactic {
        if (!this.completed) throw new Error(".build called before completion");
        if (this.validate(this.tactic)) {
            return this.tactic;
        } else {
            throw new Error("Invalid Tactic Construction");
        }
    }

    private validate(candidate: Partial<Tactic>): candidate is Tactic {
        return (
            candidate.type !== undefined &&
            candidate.triggerIndex !== undefined &&
            candidate.attackedPieces !== undefined &&
            candidate.sequence !== undefined &&
            candidate.startPosition !== undefined &&
            candidate.endPosition !== undefined &&
            candidate.materialChange !== undefined
        );
    }
}
