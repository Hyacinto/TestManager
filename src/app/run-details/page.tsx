"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Markdown from "react-markdown";
import runMarkdownToSummary, {
    type RunSummary
} from "@/lib/runMarkdownToSummary";
import { syncBugStatus } from "@/lib/syncBugStatus";

export default function RunDetailsPage() {
    const params = useSearchParams();
    const router = useRouter();
    const path = params.get("path");

    const [markdown, setMarkdown] = useState<string | null>(null);
    const [summary, setSummary] = useState<RunSummary | null>(null);
    const [issueStatus, setIssueStatus] = useState<Record<number, "OPEN" | "CLOSED">>({});
    const [loading, setLoading] = useState(true);

    // 🔒 megakadályozza a duplikált sync-et
    const syncedIssues = useRef<Set<number>>(new Set());

    /* ===== Run betöltése ===== */
    useEffect(() => {
        if (!path) return;

        fetch(`/api/run-file?path=${encodeURIComponent(path)}`)
            .then(res => {
                if (!res.ok) throw new Error("Run file load failed");
                return res.text();
            })
            .then(md => {
                setMarkdown(md);
                setSummary(runMarkdownToSummary(md));
            })
            .finally(() => setLoading(false));
    }, [path]);

    /* ===== Issue státusz lekérés + sync ===== */
    useEffect(() => {
        if (!summary?.steps || !summary.meta?.product) return;

        summary.steps.forEach(async step => {
            const issueId = step.issueID;
            if (!issueId) return;

            try {
                const res = await fetch(
                    `/api/github-issue-status?issue=${step.issueID}`
                );
                const data = await res.json();

                setIssueStatus(prev => ({
                    ...prev,
                    [issueId]: data.state
                }));

                // 🔄 ha CLOSED → frissítjük a bug markdownot
                if (
                    data.state === "CLOSED" &&
                    !syncedIssues.current.has(issueId)
                ) {
                    syncedIssues.current.add(issueId);

                    syncBugStatus(
                        `bugs/${summary.meta.product}/bug-${issueId}.md`,
                        issueId
                    );
                }

            } catch (e) {
                console.error("Issue státusz hiba:", e);
            }
        });
    }, [summary]);

    /* ===== RENDER ===== */

    if (!path) return <p>Hiányzó run azonosító.</p>;
    if (loading) return <p>Run betöltése…</p>;
    if (!markdown || !summary) return <p>Nem sikerült betölteni.</p>;

    return (
        <main style={{ maxWidth: 900, margin: "0 auto" }}>
            <button onClick={() => router.back()} style={{ marginBottom: 16 }}>
                ⬅ Vissza
            </button>

            <h1>🧪 Run részletek</h1>

            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    padding: 16,
                    background: "#fafafa"
                }}
            >
                <Markdown>{markdown}</Markdown>

                <h2 style={{ marginTop: 32 }}>🔍 Lépések és hibák</h2>

                {summary.steps.map((step, i) => (
                    <div
                        key={`${step.issueID}-${step.status}-${i}`}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: 6,
                            padding: 12,
                            marginBottom: 12,
                            background:
                                step.status === "fail"
                                    ? "#fff1f2"
                                    : "#f0fdf4"
                        }}
                    >
                        <strong>
                            {i + 1}. lépés — {step.status.toUpperCase()}
                        </strong>

                        <div><em>Elvárt:</em> {step.expected}</div>
                        {step.actual && <div><em>Tényleges:</em> {step.actual}</div>}

                        {step.issueID && (
                            <div style={{ marginTop: 8 }}>
                                🐞{" "}
                                <a
                                    href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_OWNER}/${process.env.NEXT_PUBLIC_GITHUB_REPO}/issues/${step.issueID}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Issue #{step.issueID}
                                </a>

                                <span
                                    style={{
                                        marginLeft: 10,
                                        padding: "2px 8px",
                                        borderRadius: 12,
                                        fontSize: 12,
                                        background:
                                            issueStatus[step.issueID] === "CLOSED"
                                                ? "#16a34a"
                                                : "#dc2626",
                                        color: "white"
                                    }}
                                >
                                    {issueStatus[step.issueID] ?? "…"}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </main>
    );
}
