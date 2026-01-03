export default function regressionToMarkdown(r: any) {
    let md = `# 🔁 Regression Report\n\n`;

    md += `## Meta\n`;
    md += `- Product: ${r.product}\n`;
    md += `- Suite: ${r.suite}\n`;
    md += `- Test case: ${r.testCase}\n\n`;

    md += `---\n\n`;

    r.history.forEach((run: any, index: number) => {
        md += `## Run ${index + 1}\n`;
        md += `**Date:** ${run.date}\n\n`;

        run.steps.forEach((step: any) => {
            md += `### Step ${step.step}\n`;
            md += `**Status:** ${step.status}\n\n`;

            if (step.actual) {
                md += `**Actual:**\n${step.actual}\n\n`;
            }

            if (step.issueId) {
                md += `**Issue:** #${step.issueId}\n\n`;
            }
        });

        md += `---\n\n`;
    });

    return md.trim();
}
