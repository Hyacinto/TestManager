export type BugInput = {
    title: string;

    product: string;
    testSuite?: string;
    testCase: string;
    stepIndex: number;

    status?: "OPEN" | "FIXED" | "RETEST";
    severity: string;
    priority: string;

    expected: string;
    actual: string;
    reproductionSteps?: string;

    environment?: {
        browser?: string;
        os?: string;
        device?: string;
    };

    notes?: string;

    attachments?: { file: File }[];

    reportedBy?: string;

    assignee?: string;
};

export default function bugToMarkdown(bug: BugInput): string {
    const attachments = bug.attachments || [];

    return `---
status: ${bug.status ?? "OPEN"}
severity: ${bug.severity}
priority: ${bug.priority}
product: ${bug.product}
testSuite: ${bug.testSuite ?? "-"}
testCase: ${bug.testCase}
step: ${bug.stepIndex + 1}
reportedBy: ${bug.reportedBy ?? "unknown"}
createdAt: ${new Date().toISOString()}
---

# 🐞 ${bug.title}

## Kontextus
- **Termék:** ${bug.product}
- **Tesztkészlet:** ${bug.testSuite ?? "-"}
- **Teszteset:** ${bug.testCase}
- **Lépés:** ${bug.stepIndex + 1}

---

## Súlyosság
- **Severity:** ${bug.severity}
- **Priority:** ${bug.priority}

---

## Elvárt eredmény
${bug.expected}

## Tényleges eredmény
${bug.actual}

---

## Reprodukció
${bug.reproductionSteps || "-"}

---

## Környezet
- Böngésző: ${bug.environment?.browser || "-"}
- OS: ${bug.environment?.os || "-"}
- Eszköz: ${bug.environment?.device || "-"}

---

## Csatolmányok
${attachments.length === 0
            ? "_Nincs csatolmány_"
            : attachments
                .map(a => `![${a.file.name}](./${a.file.name})`)
                .join("\n")
        }

---

## Megjegyzések
${bug.notes || "-"}

---

## Felelős
${bug.assignee ? `- Assignee: ${bug.assignee}` : "-"}

`;
}


