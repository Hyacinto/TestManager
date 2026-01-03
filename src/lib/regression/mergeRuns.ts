import { RunSummary } from "@/lib/runMarkdownToSummary";
import { enforceComparableRuns } from "./enforceComparableRuns";
import { RegressionResult, StepTrend } from "./types";

export default function mergeRuns(
    runs: RunSummary[]
): RegressionResult {

    enforceComparableRuns(runs);

    const baseMeta = runs[0].meta;

    const maxSteps = Math.max(
        ...runs.map(r => r.steps.length)
    );

    const steps: StepTrend[] = [];

    for (let stepIndex = 0; stepIndex < maxSteps; stepIndex++) {
        const history = runs.map((run, runIndex) => {
            const step = run.steps[stepIndex];
            return {
                runIndex,
                status: step?.status ?? "fail",
                actual: step?.actual ?? ""
            };
        });

        let hasRegression = false;
        for (let i = 1; i < history.length; i++) {
            if (
                history[i - 1].status === "pass" &&
                history[i].status === "fail"
            ) {
                hasRegression = true;
                break;
            }
        }

        steps.push({
            stepIndex,
            history,
            hasRegression
        });
    }

    return {
        meta: {
            product: baseMeta.product,
            suiteName: baseMeta.suiteName,
            testCase: baseMeta.testCase
        },
        runs: runs.map((r, i) => ({
            index: i,
            date: r.meta.date
        })),
        steps
    };
}
