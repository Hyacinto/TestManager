export type StepTrend = {
    stepIndex: number;
    history: {
        runIndex: number;
        status: "pass" | "fail";
        actual: string;
    }[];
    hasRegression: boolean;
};

export type RegressionResult = {
    meta: {
        product: string;
        suiteName?: string;
        testCase: string;
    };
    runs: {
        index: number;
        date: string;
    }[];
    steps: StepTrend[];
};
