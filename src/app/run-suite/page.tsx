"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import markdownToJson from "@/lib/mdtojson";
import type { MarkdownData, MarkdownTestSuite } from "@/types/markdown";
import runSuiteToMarkdown from "@/lib/runSuiteToMarkdown";
import runSuiteSummaryToHtml from "@/lib/runSuiteSummaryToHtml"

/* ================= TYPES ================= */

type SuiteTestCase = {
    name: string;
    status: "pending" | "running" | "pass" | "fail" | "skipped";
    runFile?: string;
    abortedAtStep?: number;
};

type SuiteState = {
    product: string;
    suiteName: string;
    stopOnFail: boolean;
    status: "idle" | "running" | "finished" | "aborted";
    currentIndex: number;
    testCases: SuiteTestCase[];
    startedAt?: string;
    finishedAt?: string;
};

/* ================= PAGE ================= */

export default function RunSuitePage() {
    const params = useSearchParams();
    const router = useRouter();

    const product = params.get("product");
    const suiteName = params.get("suite");

    const [suite, setSuite] = useState<SuiteState | null>(null);

    /* ===== LOAD SUITE ===== */
    useEffect(() => {
        if (!product || !suiteName) return;

        fetch(`/api/md?file=${product}`)
            .then(res => res.json())
            .then(md => {
                const data = markdownToJson(md.content) as MarkdownData;

                const foundSuite = data.testSuites?.find(
                    (s: MarkdownTestSuite) => s.name === suiteName
                );

                if (!foundSuite) {
                    throw new Error("Suite not found");
                }

                setSuite({
                    product,
                    suiteName,
                    stopOnFail: true,
                    status: "idle",
                    currentIndex: 0,
                    testCases: foundSuite.cases.map(name => ({
                        name,
                        status: "pending"
                    }))
                });
            })
            .catch(err => {
                console.error(err);
                alert("Tesztkészlet betöltése sikertelen");
            });
    }, [product, suiteName]);

    /* ================= ACTIONS ================= */

    const startSuite = () => {
        setSuite(s =>
            s
                ? {
                    ...s,
                    status: "running",
                    startedAt: new Date().toISOString()
                }
                : s
        );
    };

    const runCurrentCase = (state: SuiteState) => {
        const tc = state.testCases[state.currentIndex];
        if (!tc) return;

        setSuite(prev =>
            prev
                ? {
                    ...prev,
                    testCases: prev.testCases.map((t, i) =>
                        i === prev.currentIndex
                            ? { ...t, status: "running" }
                            : t
                    )
                }
                : prev
        );

        router.push(
            `/run?product=${state.product}&case=${tc.name}&suite=${state.suiteName}`
        );
    };

    /* ================= RETURN FROM RUN ================= */

    const result = params.get("result");
    const caseName = params.get("case");
    const file = params.get("file");
    const abortedAtStep = params.get("step");

    useEffect(() => {
        if (!suite) return;
        if (!result || !caseName) return;
        if (suite.status !== "running") return;

        setSuite(prev => {
            if (!prev) return prev;

            const idx = prev.testCases.findIndex(tc => tc.name === caseName);
            if (idx === -1) return prev;
            if (prev.testCases[idx].status !== "running") return prev;

            const updatedCases: SuiteTestCase[] = prev.testCases.map((tc, i) =>
                i === idx
                    ? {
                        ...tc,
                        status: result === "pass" ? "pass" : "fail",
                        runFile: file ?? undefined,
                        abortedAtStep: abortedAtStep
                            ? Number(abortedAtStep)
                            : undefined
                    }
                    : tc
            );

            const shouldAbort = result === "fail" && prev.stopOnFail;

            return {
                ...prev,
                testCases: updatedCases,
                status: shouldAbort ? "aborted" : "running",
                currentIndex: shouldAbort ? idx : idx + 1
            };
        });
    }, [result, caseName, file, abortedAtStep, suite?.status]);

    /* ================= ORCHESTRATION ================= */

    useEffect(() => {
        if (!suite) return;
        if (suite.status !== "running") return;

        const isLast = suite.currentIndex >= suite.testCases.length;

        if (isLast) {
            setSuite(s =>
                s && s.status === "running"
                    ? {
                        ...s,
                        status: "finished",
                        finishedAt: new Date().toISOString()
                    }
                    : s
            );
            return;
        }

        const current = suite.testCases[suite.currentIndex];
        if (current.status === "pending") {
            runCurrentCase(suite);
        }
    }, [suite?.currentIndex, suite?.status]);

    /* ================= SUMMARY ================= */

    if (!suite) return <p>Betöltés…</p>;

    if (suite.status === "finished" || suite.status === "aborted") {
        const passed = suite.testCases.filter(t => t.status === "pass").length;
        const failed = suite.testCases.filter(t => t.status === "fail").length;

        return (
            <main>
                <h1>🧪 Tesztkészlet futtatás</h1>
                <h2>{suite.suiteName}</h2>

                <h3>
                    {suite.status === "aborted"
                        ? "⛔ Megszakítva"
                        : "✔ Befejezve"}
                </h3>

                <p>
                    Összes: {suite.testCases.length}
                    <br />✔ Sikeres: {passed}
                    <br />❌ Sikertelen: {failed}
                </p>

                <ul>
                    {suite.testCases.map(tc => (
                        <li key={tc.name}>
                            {tc.status === "pass" && "✔ "}
                            {tc.status === "fail" && "❌ "}
                            {tc.name}
                        </li>
                    ))}
                </ul>

                <button
                    onClick={async () => {
                        if (!suite) return;

                        const md = runSuiteToMarkdown(suite);
                        const file = `run-suite-${Date.now()}-${suite.suiteName}.md`;

                        await fetch("/api/run", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                file,
                                content: md
                            })
                        });

                        alert("Suite summary elmentve");
                    }}
                >
                    📄 Suite summary mentése
                </button>

                <button onClick={() => router.push("/")}>
                    Vissza a dashboardra
                </button>
            </main>
        );
    }

    /* ================= IDLE ================= */

    return (
        <main>
            <h1>🧪 Tesztkészlet futtatása</h1>
            <h2>{suite.suiteName}</h2>

            <label>
                <input
                    type="checkbox"
                    checked={suite.stopOnFail}
                    onChange={e =>
                        setSuite(s =>
                            s
                                ? {
                                    ...s,
                                    stopOnFail: e.target.checked
                                }
                                : s
                        )
                    }
                />
                Megállás hibánál
            </label>

            <br />
            <br />

            <button onClick={startSuite}>
                ▶ Tesztkészlet indítása
            </button>
        </main>
    );
}
