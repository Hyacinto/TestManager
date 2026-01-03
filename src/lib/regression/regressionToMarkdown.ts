import { RegressionResult } from "./types";

export default function regressionToMarkdown(
    reg: RegressionResult
): string {

    const header = `
# 🔁 Regresszió riport

**Termék:** ${reg.meta.product}
${reg.meta.suiteName ? `**Tesztkészlet:** ${reg.meta.suiteName}` : ""}
**Teszteset:** ${reg.meta.testCase}

---

## 📅 Futtatások
${reg.runs.map(r => `- Run ${r.index + 1}: ${r.date}`).join("\n")}

---

## 📊 Step regresszió mátrix
`;

    const tableHeader =
        `| Step | ${reg.runs.map(r => `Run ${r.index + 1}`).join(" | ")} | Regresszió |\n` +
        `|------|${reg.runs.map(() => "-------").join("|")}|-------------|`;

    const rows = reg.steps.map(step => {
        const cells = step.history.map(h =>
            h.status === "pass" ? "✔ PASS" : "❌ FAIL"
        );

        return `| ${step.stepIndex + 1} | ${cells.join(" | ")} | ${step.hasRegression ? "🚨 IGEN" : "—"
            } |`;
    });

    const regressions = reg.steps
        .filter(s => s.hasRegression)
        .map(
            s => `- 🚨 **${s.stepIndex + 1}. lépés**: PASS → FAIL`
        )
        .join("\n");

    return [
        header,
        tableHeader,
        ...rows,
        "\n---\n## 🚨 Detektált regressziók",
        regressions || "_Nincs regresszió_"
    ].join("\n");
}
