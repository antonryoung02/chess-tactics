import { TacticContext, TacticOptions } from "@types";

export type IsTacticTestCase = {
    description: string;
    context: TacticContext;
    expected: boolean;
    debug?: boolean;
    options?: TacticOptions;
};
