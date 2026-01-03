"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import markdownToJson from "@/lib/mdtojson";
import runToMarkdown from "@/lib/runToMarkdown";
import bugToMarkdown, { type BugInput } from "@/lib/bugToMarkdown";
import BugReportModal from "@/components/BugReportModal";

/* ================= TYPES ================= */

type StepResult = {
    status: "pending" | "pass" | "fail";
    expected: string;
    actual: string;
    issueId?: number;
};

type TestCase = {
    name: string;
    steps: { step: string; expected: string }[];
    product?: string;
    testSuite?: string;
};

type MarkdownData = {
    testCases: Record<string, TestCase>;
};

/* ================= PAGE ================= */

export default function RunPage() {
    const params = useSearchParams();
    const product = params.get("product");
    const caseName = params.get("case");
    const suiteName = params.get("suite");
    const router = useRouter();

    const { data: session } = useSession();
    const executedBy = session?.user?.email ?? "unknown";

    const [testCase, setTestCase] = useState<TestCase | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [results, setResults] = useState<StepResult[]>([]);
    const [finished, setFinished] = useState(false);
    const [abortedAtStep, setAbortedAtStep] = useState<number | null>(null);
    const [failModalOpen, setFailModalOpen] = useState(false);

    if (!product) {
        return (
            <main className="p-6">
                <h1>❌ Hiányzó termék</h1>
                <p>
                    A futtatáshoz nincs kiválasztva termék.
                </p>
            </main>
        );
    }

    /* ===== Load test ===== */
    useEffect(() => {
        if (!caseName) {
            return;
        }

        fetch(`/api/md?file=${product}`)
            .then(res => {
                if (!res.ok) throw new Error(`MD fetch failed: ${res.status}`);
                return res.json();
            })
            .then(md => {
                const data = markdownToJson(md.content) as MarkdownData;
                const selectedCase = data.testCases?.[caseName];

                if (!selectedCase) {
                    console.error(`Test case not found: ${caseName}`);
                    setTestCase(null);
                    return;
                }

                setTestCase({
                    ...selectedCase,
                    name: caseName,
                    product,
                });

                setResults(
                    selectedCase.steps.map(s => ({
                        status: "pending",
                        expected: s.expected,
                        actual: "",
                        issueId: undefined
                    }))
                );

                setCurrentStep(0);
                setFinished(false);
                setAbortedAtStep(null);
            })
            .catch(err => {
                console.error("Failed to load test case:", err);
                setTestCase(null);
            });
    }, [caseName, product]);

    /* ===== RENDER GUARDS ===== */
    if (!product) {
        return (
            <main className="p-6">
                <h1>❌ Hiányzó termék</h1>
                <p>
                    A futtatáshoz nincs kiválasztva termék.
                </p>
            </main>
        );
    }

    if (!testCase) return <p>Betöltés…</p>;
    if (!testCase.steps.length) return <p>Nincs tesztlépés.</p>;
    if (results.length !== testCase.steps.length) return <p>Inicializálás…</p>;

    const step = testCase.steps[currentStep];
    const result = results[currentStep];

    /* ================= ACTIONS ================= */

    const markPass = () => {
        setResults(r =>
            r.map((x, i) =>
                i === currentStep
                    ? {
                        status: "pass",
                        expected: step.expected,
                        actual: step.expected,
                        issueId: undefined
                    }
                    : x
            )
        );

        if (currentStep < testCase.steps.length - 1) {
            setCurrentStep(s => s + 1);
        } else {
            setFinished(true);
        }
    };

    const markFail = () => {
        setResults(r =>
            r.map((x, i) =>
                i === currentStep
                    ? {
                        status: "fail",
                        expected: step.expected,
                        actual: "",
                        issueId: undefined
                    }
                    : x
            )
        );

        setAbortedAtStep(currentStep);
        setFailModalOpen(true);
    };

    /* ================= SUMMARY ================= */

    if (finished && !failModalOpen) {
        const passed = results.filter(r => r.status === "pass").length;
        const failed = results.filter(r => r.status === "fail").length;

        const saveRun = async () => {
            if (!product) {
                console.error("Product is required");
                return;
            }

            const md = await runToMarkdown({
                product: product,
                caseName: testCase.name,
                executedBy,
                testCase,
                results,
                abortedAtStep
            });

            console.log(md);

            const file = `run-${Date.now()}-${testCase.name}-${failed ? "FAIL" : "PASS"}.md`;

            await fetch("/api/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    file,
                    content: md,
                    product,
                })
            });

            const qs = new URLSearchParams({
                product: product!,
                case: testCase.name,
                result: failed ? "fail" : "pass",
                file
            });

            if (suiteName) {
                qs.set("suite", suiteName);
            }
            if (abortedAtStep !== null) {
                qs.set("step", String(abortedAtStep));
            }

            router.push(
                suiteName
                    ? `/run-suite?${qs.toString()}`
                    : `/?${qs.toString()}`
            );

            console.log("Run saved");
        };

        return (
            <main>
                <h1>RUN összegzés</h1>
                <h2>{testCase.name}</h2>

                {failed > 0 ? (
                    <h3 style={{ color: "red" }}>❌ Sikertelen</h3>
                ) : (
                    <h3 style={{ color: "green" }}>✔ Sikeres</h3>
                )}

                <p>
                    Összes lépés: {results.length}<br />
                    Sikeres: {passed}<br />
                    Sikertelen: {failed}
                </p>

                {abortedAtStep !== null && (
                    <p style={{ color: "red" }}>
                        ⛔ Teszt megszakadt a(z) {abortedAtStep + 1}. lépésnél
                    </p>
                )}

                <button onClick={saveRun}>📄 Riport mentése</button>
                <button onClick={() => globalThis.window?.history.back()}>Vissza</button>
            </main>
        );
    }

    /* ================= UI ================= */

    return (
        <main>
            <h1>{testCase.name}</h1>

            <h2>
                Lépés {currentStep + 1} / {testCase.steps.length}
            </h2>

            <p><b>Teendő:</b> {step.step}</p>
            <p><b>Elvárt eredmény:</b> {step.expected}</p>

            <div style={{ marginTop: 20 }}>
                <button
                    onClick={markPass}
                    disabled={failModalOpen || result.status !== "pending"}
                >
                    ✔ Sikeres
                </button>

                <button
                    onClick={markFail}
                    disabled={failModalOpen}
                >
                    ✖ Sikertelen
                </button>
            </div>

            {/* ===== FAIL MODAL ===== */}
            <BugReportModal
                open={failModalOpen}
                onCancel={() => setFailModalOpen(false)}
                context={{
                    product: product ?? "unknown",
                    testSuite: testCase.testSuite,
                    testCase: testCase.name,
                    stepIndex: currentStep,
                    expected: step.expected
                }}
                onSubmit={async (bug) => {
                    const fullBug: BugInput = {
                        ...bug,
                        product: product ?? "unknown",
                        testSuite: testCase.testSuite,
                        testCase: testCase.name,
                        stepIndex: currentStep,
                        status: "OPEN",
                        reportedBy: executedBy,
                    };

                    const md = bugToMarkdown(fullBug);
                    const form = new FormData();
                    form.append("bugId", `bug-${Date.now()}-${testCase.name}`);
                    form.append("markdown", md);
                    form.append("product", product ?? "unknown");


                    bug.attachments?.forEach(a => {
                        form.append("files", a.file);
                    });

                    await fetch("/api/bug-upload", {
                        method: "POST",
                        body: form
                    });

                    const issueRes = await fetch("/api/github-issue", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            title: `[BUG] ${testCase.name} – ${currentStep + 1}. lépés`,
                            body: md
                        })
                    });

                    if (!issueRes.ok) {
                        console.warn("GitHub issue creation failed");
                    }

                    const issue = await issueRes.json();
                    const issueNumber = issue.number;

                    setResults(prev =>
                        prev.map((r, i) =>
                            i === currentStep
                                ? {
                                    ...r,
                                    actual: bug.actual || md,
                                    issueId: issueNumber
                                }
                                : r
                        )
                    );

                    setFailModalOpen(false);
                    setFinished(true);
                }}
            />
        </main>
    );
}