type StepResult = {
    step: number;
    status: "PASS" | "FAIL";
    actual?: string;
    issueId?: number;
};

type TestCaseRun = {
    product: string;
    suite: string;
    testCase: string;
    date: string;
    steps: StepResult[];
};

export type RegressionResult = {
    product: string;
    suite: string;
    testCase: string;
    history: TestCaseRun[];
};

/* ================= PARSER ================= */

export function parseRunMarkdown(md: string): TestCaseRun {
    const product = md.match(/Product:\s*(.+)/)?.[1] ?? "";
    const suite = md.match(/Suite:\s*(.+)/)?.[1] ?? "";
    const testCase = md.match(/Test case:\s*(.+)/)?.[1] ?? "";
    const date = md.match(/Date:\s*(.+)/)?.[1] ?? "";

    const stepBlocks = md.split("## Step ").slice(1);

    const steps: StepResult[] = stepBlocks.map(block => {
        const step = Number(block.match(/^(\d+)/)?.[1]);
        const status = block.match(/\*\*Result:\*\*\s*(PASS|FAIL)/)?.[1] as
            | "PASS"
            | "FAIL";

        const actual =
            block.match(/\*\*Actual:\*\*\n([\s\S]*?)(\n\*\*|\n---)/)?.[1]?.trim();

        const issueId = Number(
            block.match(/\*\*Issue:\s*#(\d+)/)?.[1]
        ) || undefined;

        return { step, status, actual, issueId };
    });

    return { product, suite, testCase, date, steps };
}

/* ================= MERGE ENGINE ================= */

export function mergeRegression(runs: TestCaseRun[]): RegressionResult {
    if (runs.length === 0) {
        throw new Error("No runs to merge");
    }

    const { product, suite, testCase } = runs[0];

    // Guard: meta consistency
    runs.forEach(r => {
        if (
            r.product !== product ||
            r.suite !== suite ||
            r.testCase !== testCase
        ) {
            throw new Error("Meta mismatch between runs");
        }
    });

    // időrendbe
    const ordered = [...runs].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
        product,
        suite,
        testCase,
        history: ordered
    };
}
