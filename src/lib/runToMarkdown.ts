type StepResult = {
    stepIndex?: number;
    status: "pending" | "pass" | "fail";
    expected: string;
    actual: string;
    issueId?: number;
};

type RunState = {
    product: string;
    caseName: string;
    suiteName?: string;
    executedBy?: string;
    githubIssueNumber?: number;
    testCase?: {
        name: string;
        steps: { step: string; expected: string }[];
    };
    results: StepResult[];
    abortedAtStep?: number | null;
};


export default async function runToMarkdown(
    run: RunState,
    fileName?: string
): Promise<string> {
    const date = new Date().toISOString();

    let md = `# 🧪 Tesztfuttatás riport\n\n`;

    md += `## Meta\n`;
    md += `- Dátum: ${date}\n`;
    md += `- Futtatta: ${run.executedBy || "unknown"}\n`;
    md += `- Termék: ${run.product}\n`;
    if (run.suiteName) md += `- Tesztkészlet: ${run.suiteName}\n`;
    md += `- Teszteset: ${run.caseName}\n`;

    if (run.githubIssueNumber) {
        md += `- GitHub Issue: #${run.githubIssueNumber}\n`;
    }

    if (run.abortedAtStep !== undefined && run.abortedAtStep !== null) {
        md += `- Megszakadt lépés: ${run.abortedAtStep + 1}\n`;
    }

    md += `\n---\n\n`;

    md += `## Teszteset: ${run.caseName}\n\n`;

    run.results.forEach((step, i) => {
        const stepNum = step.stepIndex !== undefined ? step.stepIndex + 1 : i + 1;
        md += `### Lépés ${stepNum}\n`;

        if (run.testCase?.steps[i]) {
            md += `**Teendő:** ${run.testCase.steps[i].step}\n\n`;
        }

        md += `**Elvárt eredmény:** ${step.expected}\n\n`;
        md += `**Státusz:** ${step.status.toUpperCase()}\n\n`;

        if (step.actual) {
            md += `**Tényleges eredmény:**\n${step.actual}\n\n`;
        }

        if (step.issueId) {
            md += `**Issue:** #${step.issueId}\n\n`;
        }

        md += `---\n\n`;
    });

    if (fileName) {
        await fetch("/api/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                file: fileName,
                content: md
            })
        });
    }

    return md.trim();
}