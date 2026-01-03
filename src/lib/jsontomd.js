export default function jsonToMarkdown(data) {
    let md = `# ${data.productName} #\n\n`;
    md += `## Tesztkészletek: ##\n\n`;

    for (const suite of data.testSuites) {
        md += `### ${suite.name}: ###\n`;

        for (const tcName of suite.cases) {
            md += `* ${tcName}\n`;
        }

        md += "\n";
    }

    for (const tc of Object.values(data.testCases)) {
        md += `## ${tc.name} ##\n\n`;

        md += `### Tesztelés célja: ###\n${tc.purpose || ""}\n\n`;
        md += `### Tesztelendő elemek: ###\n${tc.itemsToTest || ""}\n\n`;
        md += `### Tesztelés módszere: ###\n${tc.method || ""}\n\n`;
        md += `### Felhasznált input: ###\n${tc.input || ""}\n\n`;
        md += `### Teszt előfeltétel: ###\n${tc.precondition || ""}\n\n`;

        md += `### Tesztlépések: ###\n\n`;
        tc.steps.forEach((s, i) => {
            md += `${i + 1}. ${s.step}\n`;
            md += `   **Elvárt output:** ${s.expected || ""}\n\n`;
        });
    }

    return md;
}
