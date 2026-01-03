export type TestStep = {
    step: string;
    expected: string;
};

export type TestCase = {
    name: string;
    purpose: string;
    itemsToTest: string;
    method: string;
    input: string;
    precondition: string;
    steps: TestStep[];
};

export type TestSuite = {
    name: string;
    cases: string[];
};

export type TestModel = {
    productName: string;
    testSuites: TestSuite[];
    testCases: Record<string, TestCase>;
};
