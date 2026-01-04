"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import runMarkdownToSummary from "@/lib/runMarkdownToSummary";
import type { RunHistoryItem } from "@/types/run-history";
import { summaryToHistoryItem } from "@/lib/summaryToHistoryItem";

export default function RunHistoryPage() {
    const router = useRouter();
    const params = useSearchParams();
    const product = params.get("product");

    const [runs, setRuns] = useState<RunHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [openIssues, setOpenIssues] = useState<Set<number>>(new Set());


    useEffect(() => {
        if (!product) return;

        setLoading(true);

        fetch(`/api/runs?product=${encodeURIComponent(product)}`)
            .then(res => res.json())
            .then(async (files: { path: string }[]) => {
                const items: RunHistoryItem[] = [];

                const open = new Set<number>();

                for (const file of files) {
                    const res = await fetch(
                        `/api/run-file?path=${encodeURIComponent(file.path)}`
                    );

                    const md = await res.text();

                    try {
                        const summary = runMarkdownToSummary(md);

                        // 🔍 issue státuszok lekérése
                        for (const step of summary.steps) {
                            if (!step.issueID) continue;

                            const r = await fetch(
                                `/api/github-issue-status?issue=${step.issueID}`
                            );
                            const data = await r.json();

                            if (data.state === "OPEN") {
                                open.add(step.issueID);
                            }
                        }

                        const historyItem = summaryToHistoryItem(
                            file.path,
                            summary,
                            open
                        );

                        items.push(historyItem);

                    } catch (err: unknown) {
                        console.error("Hibás run fájl kihagyva:", file.path, err);
                    }
                }

                setOpenIssues(open);

                setRuns(
                    items.toSorted((a, b) =>
                        b.date.localeCompare(a.date)
                    )
                );
            })
            .finally(() => setLoading(false));
    }, [product]);

    if (!product) {
        return <p className="p-6">Nincs kiválasztott termék.</p>;
    }

    if (loading) {
        return <p className="p-6">Run history betöltése…</p>;
    }

    if (!runs.length) {
        return <p className="p-6">Nincs még futás ehhez a termékhez.</p>;
    }

    return (
        <main className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">
                📜 Run history – {product.replace(".md", "")}
            </h1>

            <ul className="space-y-3">
                {runs.map(run => {
                    let borderColor: string;
                    if (run.hasOpenBug) {
                        borderColor = "6px solid #dc2626";
                    } else if (run.failed > 0) {
                        borderColor = "6px solid #f59e0b";
                    } else {
                        borderColor = "6px solid #16a34a";
                    }

                    return (
                        <li

                            key={run.path}
                            className="p-4 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                            style={{
                                borderLeft: borderColor
                            }}
                            onClick={() => router.push(`/run-details?path=${encodeURIComponent(run.path)}`)}
                        >
                            <strong>{run.title}</strong>

                            <div className="text-sm text-gray-600">
                                {run.date} — ✔ {run.passed} / ❌ {run.failed}

                                {run.hasOpenBug && (
                                    <span
                                        style={{
                                            marginLeft: 12,
                                            padding: "2px 8px",
                                            background: "#dc2626",
                                            color: "white",
                                            borderRadius: 12,
                                            fontSize: 12
                                        }}
                                    >
                                        🐞 OPEN
                                    </span>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </main >
    );
}
