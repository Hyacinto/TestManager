export type MarkdownTestSuite = {
    name: string;
    cases: string[];
};

export type MarkdownData = {
    testSuites?: MarkdownTestSuite[];
};
