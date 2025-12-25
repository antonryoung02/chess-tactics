import { TacticContext } from "@types";

export type IsTacticTestCase = {
    description: string;
    context: TacticContext;
    expected: boolean;
    debug?: boolean;
};
