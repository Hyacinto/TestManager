export type EditorProduct = {
    productName: string;
    testSuites: {
        name: string;
        cases: string[];
    }[];
    testCases: {
        [key: string]: TestCase;
    };
};

type TestStep = {
    step: string;
    expected: string;
};

type TestCase = {
    name: string;
    purpose: string;
    itemsToTest: string;
    method: string;
    input: string;
    precondition: string;
    steps: TestStep[];
};

type TestSuite = {
    name: string;
    cases: string[];
};

type Product = {
    productName: string;
    testSuites: TestSuite[];
    testCases: Record<string, TestCase>;
};

