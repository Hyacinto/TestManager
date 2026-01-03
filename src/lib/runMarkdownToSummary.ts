// ===== TYPES =====
export type RunSummary = {
    meta: {
        date?: string;
        executedBy?: string;
        product: string;
        suiteName?: string;
        testCase: string;
        abortedAtStep?: number;
        githubIssueNumber?: number;
        issueAssignee?: string;
    };
    steps: Array<{
        index: number;
        status: "pass" | "fail";
        actual: string;
        expected: string;
        issueID?: number,
    }>;
};

// ===== MAIN FUNCTION =====
export default function runMarkdownToSummary(md: string): RunSummary {
    const lines = md.split("\n");
    const meta = extractMetaData(lines);
    const steps = extractSteps(lines);

    validateRequiredMeta(meta);

    return { meta, steps };
}

// ===== META EXTRACTION =====
function extractMetaData(lines: string[]): RunSummary["meta"] {
    const meta: any = {};

    for (const line of lines) {
        if (!line.trim().startsWith("- ")) continue;

        const [key, ...valueParts] = line.trim().substring(2).split(":");
        const value = valueParts.join(":").trim();

        assignMetaValue(meta, key, value);
    }

    return meta;
}

function assignMetaValue(meta: any, key: string, value: string): void {
    const metaMap: Record<string, string> = {
        "Dátum": "date",
        "Futtatta": "executedBy",
        "Termék": "product",
        "Tesztkészlet": "suiteName",
        "Teszteset": "testCase"
    };

    if (key === "GitHub Issue") {
        meta.githubIssueNumber = Number(value.replace("#", "").trim());
        return;
    }

    if (key === "Assignee") {
        meta.issueAssignee = value;
        return;
    }

    if (key === "Megszakadt lépés") {
        meta.abortedAtStep = Number(value) - 1;
        return;
    }

    if (metaMap[key]) {
        meta[metaMap[key]] = value;
    }
}


// ===== STEPS EXTRACTION =====
function extractSteps(lines: string[]): RunSummary["steps"] {
    const steps: RunSummary["steps"] = [];
    let currentStep: any = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (isStepStart(line)) {
            if (currentStep) {
                steps.push(currentStep);
            }
            currentStep = createNewStep(steps.length);
            continue;
        }

        if (!currentStep) continue;

        if (isStatusLine(line)) {
            currentStep.status = extractStatus(line);
            continue;
        }

        if (isActualResultLine(line)) {
            currentStep.actual = lines[i + 1]?.trim() ?? "";
        }
    }

    if (currentStep) {
        steps.push(currentStep);
    }

    return steps;
}

function isStepStart(line: string): boolean {
    return line.startsWith("### Lépés");
}

function isStatusLine(line: string): boolean {
    return line.startsWith("**Státusz:**");
}

function isActualResultLine(line: string): boolean {
    return line === "**Tényleges eredmény:**";
}

function createNewStep(index: number): RunSummary["steps"][0] {
    return {
        index,
        status: "pass",
        actual: "",
        expected: ""
    };
}

function extractStatus(line: string): "pass" | "fail" {
    return line.includes("FAIL") ? "fail" : "pass";
}

// ===== VALIDATION =====
function validateRequiredMeta(meta: any): void {
    if (!meta.product) {
        console.warn("RUN META WARNING: product missing, using 'unknown'");
        meta.product = "unknown";
    }

    if (!meta.testCase) {
        throw new Error("RUN META ERROR: testCase missing");
    }
}
