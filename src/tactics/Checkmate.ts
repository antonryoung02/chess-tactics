import { Evaluation, FEN } from "@types";
import { SequenceInterpreter } from "@utils/sequence_interpreter";

class CheckmateTactics {
    isTactic(initialPosition: FEN, evaluations: any, i: number): any | null {
        const currEval = evaluations[i - 1];
        if (i < 2 || currEval[0].type !== "mate") {
            return null;
        }

        const prevEval = evaluations[i - 2];
        // allows mate in x -> opposite mate in x
        if (
            prevEval[0].type === "mate" &&
            Math.sign(prevEval[0].eval) === Math.sign(currEval[0].eval)
        ) {
            return null;
        }
        if (Math.abs(currEval[0].eval) > 6) {
            return null;
        }
        let start = i;
        const initialMateInX = Math.abs(evaluations[i - 1][0].eval);
        const si = new SequenceInterpreter(initialPosition, evaluations[start - 1][0]);
        const sequence = si.evaluationToMoveList();
        while (i < evaluations.length) {
            if (evaluations[i].type === "game_over" && Math.abs(evaluations[i].eval) === 1) break;
            if (this.playerExitedForcedMate(evaluations[i], evaluations[i - 1])) {
                return {
                    start: start,
                    type: "checkmate",
                    found: false,
                    startFen: initialPosition,
                    sequence: sequence,
                    length: initialMateInX,
                };
            }
            i += 1;
        }
        return {
            start: start,
            type: "checkmate",
            found: true,
            startFen: initialPosition,
            sequence: sequence,
            length: initialMateInX,
        };
    }

    playerExitedForcedMate(currEval: Evaluation, prevEval: Evaluation): boolean {
        const prevMateInX = Math.abs(Number(prevEval.eval));
        return (
            currEval.type === "cp" ||
            Math.abs(Number(currEval.eval)) > prevMateInX ||
            Math.sign(Number(prevEval.eval)) !== Math.sign(Number(currEval.eval)) ||
            (currEval.type === "game_over" && Number(currEval.eval) === 0) // draw
        );
    }
}

export { CheckmateTactics };
