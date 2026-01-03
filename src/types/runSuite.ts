export type SuiteTestCase = {
    name: string;
    status: "pending" | "running" | "pass" | "fail" | "skipped";
    runFile?: string;
    abortedAtStep?: number;
};

export type SuiteState = {
    product: string;
    suiteName: string;
    stopOnFail: boolean;
    status: "idle" | "running" | "finished" | "aborted";
    currentIndex: number;
    testCases: SuiteTestCase[];
    startedAt?: string;
    finishedAt?: string;
};
