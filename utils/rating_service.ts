import { Evaluation } from "../types";

class RatingAnalysis {
    #thresholds: Record<string, number> = {
        best: 0.01,
        good: 0.04,
        inaccuracy: 0.075,
        mistake: 0.15,
    };

    accuracyToColor(accuracy: number) {
        const diff = this.accuracyToDiff(accuracy);
        const rating = this.classifyMove(diff);
        return this.#thresholds[rating];
    }

    classifyMove(winDiff: number) {
        if (this.#isBest(winDiff)) {
            return "best";
        }
        if (this.#isGood(winDiff)) {
            return "good";
        }
        if (this.#isInaccuracy(winDiff)) {
            return "inaccuracy";
        }
        if (this.#isMistake(winDiff)) {
            return "mistake";
        }
        return "blunder";
    }

    getGameAccuracies(ratings: number[]) {
        let whiteSum = 0;
        let whiteMoves = 0;
        let blackSum = 0;
        let blackMoves = 0;
        for (let i = 0; i < ratings.length; i++) {
            if (i % 2 === 0) {
                whiteSum += this.diffToAccuracy(ratings[i]);
                whiteMoves += 1;
            } else {
                blackSum += this.diffToAccuracy(ratings[i]);
                blackMoves += 1;
            }
        }
        return { white: whiteSum / whiteMoves, black: blackSum / blackMoves };
    }

    accuracyToDiff(accuracy: number) {
        return -Math.log(accuracy) / 10;
    }

    diffToAccuracy(diff: number) {
        return Math.exp(-10 * diff);
        // "Proprietary"
        // Best 100-95
        // Good 95-81
        // Inacc 81-68
        // Mistake 68-47
        // Blunder 47-0
    }

    cpToWinPercentage(cpEval: number) {
        return 1 / (1 + Math.exp(-0.368 * cpEval));
    }

    winningChanceDiff(beforeEval: Evaluation, afterEval: Evaluation, isWhite: boolean) {
        const oldWin = this.evalToWinProb(beforeEval, isWhite);
        const newWin = this.evalToWinProb(afterEval, isWhite);
        return oldWin - newWin;
    }

    evalToWinProb(evalObj: Evaluation, isWhite: boolean) {
        if (!evalObj) {
            return 1;
        }

        let cpValue = Number(evalObj.eval);
        if (!isWhite) {
            cpValue = -cpValue;
        }

        if (evalObj.type === "cp") {
            return this.cpToWinPercentage(cpValue);
        } else if (evalObj.type === "mate") {
            return cpValue > 0 ? 1.0 : 0.0;
        } else if (evalObj.type === "game_over") {
            return cpValue;
        }

        return 0.5;
    }

    #isBest(diff: number) {
        return diff < this.#thresholds.best;
    }

    #isGood(diff: number) {
        return diff < this.#thresholds.good;
    }

    #isInaccuracy(diff: number) {
        return diff < this.#thresholds.inaccuracy;
    }

    #isMistake(diff: number) {
        return diff < this.#thresholds.mistake;
    }
}
export { RatingAnalysis };
