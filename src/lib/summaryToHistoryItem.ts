import type { RunHistoryItem } from "@/types/run-history";
import type { RunSummary } from "./runMarkdownToSummary";

export function summaryToHistoryItem(
    path: string,
    summary: RunSummary,
    openIssues: Set<number>
): RunHistoryItem {

    const passed = summary.steps.filter(
        s => s.status === "pass"
    ).length;

    const failed = summary.steps.filter(
        s => s.status === "fail"
    ).length;

    const hasOpenBug = summary.steps.some(
        s => typeof s.issueID === "number" &&
            openIssues.has(s.issueID)
    );

    return {
        path,
        title: `${summary.meta.product} – ${summary.meta.testCase}`,
        date: summary.meta.date ?? "ismeretlen dátum",
        passed,
        failed,
        githubIssueNumber: summary.meta.githubIssueNumber,
        hasOpenBug,
    };
}
