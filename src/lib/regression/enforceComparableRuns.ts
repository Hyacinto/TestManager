import { RunSummary } from "@/lib/runMarkdownToSummary";

export function enforceComparableRuns(runs: RunSummary[]) {
    if (runs.length < 2) {
        throw new Error("Regression requires at least 2 runs");
    }

    const base = runs[0].meta;

    runs.forEach((r, i) => {
        if (r.meta.product !== base.product) {
            throw new Error(
                `Run[${i}] product mismatch (${r.meta.product})`
            );
        }

        if (r.meta.suiteName !== base.suiteName) {
            throw new Error(
                `Run[${i}] suite mismatch (${r.meta.suiteName})`
            );
        }

        if (r.meta.testCase !== base.testCase) {
            throw new Error(
                `Run[${i}] testcase mismatch (${r.meta.testCase})`
            );
        }
    });
}
