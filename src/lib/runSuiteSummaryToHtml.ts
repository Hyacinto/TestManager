import type { SuiteState } from "@/types/runSuite";

export default function runSuiteSummaryToHtml(suite: SuiteState) {
    const passed = suite.testCases.filter(t => t.status === "pass").length;
    const failed = suite.testCases.filter(t => t.status === "fail").length;

    return `
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="utf-8" />
    <title>Run Suite Report – ${suite.suiteName}</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 40px;
            color: #222;
        }
        h1, h2 {
            margin-bottom: 0.3em;
        }
        .meta {
            margin-bottom: 24px;
        }
        .summary {
            margin: 20px 0;
            padding: 16px;
            border-radius: 6px;
            background: #f5f5f5;
        }
        ul {
            list-style: none;
            padding: 0;
        }
        li {
            padding: 10px;
            margin-bottom: 8px;
            border-left: 6px solid #ccc;
            background: #fafafa;
        }
        li.pass { border-color: #2ecc71; }
        li.fail { border-color: #e74c3c; }
        li.skipped { border-color: #f1c40f; }
        .step {
            font-size: 0.9em;
            color: #555;
        }
    </style>
</head>
<body>

<h1>🧪 Tesztkészlet riport</h1>
<h2>${suite.suiteName}</h2>

<div class="meta">
    <div><b>Termék:</b> ${suite.product}</div>
    <div><b>Indítva:</b> ${suite.startedAt ?? "-"}</div>
    <div><b>Befejezve:</b> ${suite.finishedAt ?? "-"}</div>
</div>

<div class="summary">
    <div>✔ Sikeres: ${passed}</div>
    <div>❌ Sikertelen: ${failed}</div>
    <div>Összes: ${suite.testCases.length}</div>
</div>

<ul>
    ${suite.testCases.map(tc => `
        <li class="${tc.status}">
            <b>${tc.name}</b> – ${tc.status.toUpperCase()}
            ${tc.abortedAtStep !== undefined
            ? `<div class="step">Megállt a ${tc.abortedAtStep + 1}. lépésnél</div>`
            : ""
        }
        </li>
    `).join("")}
</ul>

</body>
</html>
`;
}
