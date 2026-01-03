import type { SuiteState } from "../types/runSuite";

export default function runSuiteToMarkdown(suite: SuiteState): string {
    const started = suite.startedAt
        ? new Date(suite.startedAt).toLocaleString()
        : "-";

    const finished = suite.finishedAt
        ? new Date(suite.finishedAt).toLocaleString()
        : "-";

    const passed = suite.testCases.filter(t => t.status === "pass").length;
    const failed = suite.testCases.filter(t => t.status === "fail").length;

    let md = `# 🧪 Test Suite Run Summary\n\n`;

    md += `## Suite\n`;
    md += `- **Product:** ${suite.product}\n`;
    md += `- **Suite:** ${suite.suiteName}\n`;
    md += `- **Started:** ${started}\n`;
    md += `- **Finished:** ${finished}\n`;
    md += `- **Status:** ${failed > 0 ? "❌ FAILED" : "✔ PASSED"}\n\n`;

    md += `---\n\n`;
    md += `## Results\n\n`;
    md += `| Test case | Status | Run file | Aborted step |\n`;
    md += `|----------|--------|----------|--------------|\n`;

    suite.testCases.forEach(tc => {
        md += `| ${tc.name} | ${tc.status === "pass" ? "✔ PASS" :
            tc.status === "fail" ? "❌ FAIL" :
                tc.status.toUpperCase()
            } | ${tc.runFile ?? "-"} | ${tc.abortedAtStep !== undefined ? tc.abortedAtStep + 1 : "–"
            } |\n`;
    });

    md += `\n---\n\n`;
    md += `## Summary\n`;
    md += `- **Total:** ${suite.testCases.length}\n`;
    md += `- **Passed:** ${passed}\n`;
    md += `- **Failed:** ${failed}\n`;

    return md;
}
