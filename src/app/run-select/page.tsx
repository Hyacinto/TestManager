"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import markdownToJson from "@/lib/mdtojson";
import type { TestModel } from "@/types/test-model";

type QuickSuiteState = {
    open: boolean;
    name: string;
    selectedCases: string[];
};

export default function RunSelectPage() {
    const params = useSearchParams();
    const router = useRouter();

    const product = params.get("product");

    const [data, setData] = useState<TestModel | null>(null);
    const [selectedCase, setSelectedCase] = useState("");
    const [selectedSuite, setSelectedSuite] = useState("");

    const [quickSuite, setQuickSuite] = useState<QuickSuiteState>({
        open: false,
        name: "Quick Suite",
        selectedCases: []
    });

    /* ===== Load product ===== */
    useEffect(() => {
        if (!product) return;

        fetch(`/api/md?file=${product}`)
            .then(res => res.json())
            .then(md => {
                const parsed = markdownToJson(md.content) as TestModel;
                setData(parsed);
            });
    }, [product]);

    if (!product) return <p>Nincs kiválasztott termék.</p>;
    if (!data) return <p>Adatok betöltése…</p>;

    /* ===== RUN helpers ===== */

    const runSingleCase = () => {
        if (!selectedCase) return;
        router.push(
            `/run?product=${product}&case=${encodeURIComponent(selectedCase)}`
        );
    };

    const runSuite = () => {
        if (!selectedSuite) return;
        router.push(
            `/run-suite?product=${product}&suite=${encodeURIComponent(selectedSuite)}`
        );
    };

    const runRegression = () => {
        router.push(`/run-suite?product=${product}&regression=true`);
    };

    const runQuickSuite = () => {
        if (!quickSuite.selectedCases.length) return;

        router.push(
            `/run-suite?product=${product}&quick=true&cases=${encodeURIComponent(
                quickSuite.selectedCases.join(",")
            )}`
        );
    };

    return (
        <main style={{ display: "flex", flexDirection: "column", gap: 30 }}>
            <h1>RUN – {product.replace(".md", "")}</h1>

            {/* ===== Single test case ===== */}
            <section>
                <h2>🧪 Egyedi teszteset futtatása</h2>

                <select
                    value={selectedCase}
                    onChange={e => setSelectedCase(e.target.value)}
                >
                    <option value="">— válassz tesztesetet —</option>
                    {Object.keys(data.testCases).map(tc => (
                        <option key={tc} value={tc}>
                            {tc}
                        </option>
                    ))}
                </select>

                <button disabled={!selectedCase} onClick={runSingleCase}>
                    ▶ RUN
                </button>
            </section>

            <hr />

            {/* ===== Suite ===== */}
            <section>
                <h2>📦 Tesztkészlet futtatása</h2>

                <select
                    value={selectedSuite}
                    onChange={e => setSelectedSuite(e.target.value)}
                >
                    <option value="">— válassz készletet —</option>
                    {data.testSuites.map(s => (
                        <option key={s.name} value={s.name}>
                            {s.name}
                        </option>
                    ))}
                </select>

                <button disabled={!selectedSuite} onClick={runSuite}>
                    ▶ RUN készlet
                </button>

                <button onClick={() => setQuickSuite(prev => ({ ...prev, open: true }))}>
                    ⚡ Quick suite
                </button>
            </section>

            <hr />

            {/* ===== Regression ===== */}
            <section>
                <h2>🔥 Teljes regresszió</h2>

                <button onClick={runRegression}>
                    ▶ Teljes regresszió RUN
                </button>
            </section>

            {/* ===== QUICK SUITE MODAL ===== */}
            {quickSuite.open && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            padding: 20,
                            minWidth: 300
                        }}
                    >
                        <h3>⚡ Quick Suite</h3>

                        <ul>
                            {Object.keys(data.testCases).map(tc => (
                                <li key={tc}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={quickSuite.selectedCases.includes(tc)}
                                            onChange={() =>
                                                setQuickSuite(prev => ({
                                                    ...prev,
                                                    selectedCases: prev.selectedCases.includes(tc)
                                                        ? prev.selectedCases.filter(c => c !== tc)
                                                        : [...prev.selectedCases, tc]
                                                }))
                                            }
                                        />
                                        {tc}
                                    </label>
                                </li>
                            ))}
                        </ul>

                        <button
                            disabled={!quickSuite.selectedCases.length}
                            onClick={runQuickSuite}
                        >
                            ▶ RUN Quick Suite
                        </button>

                        <button
                            onClick={() =>
                                setQuickSuite({
                                    open: false,
                                    name: "Quick Suite",
                                    selectedCases: []
                                })
                            }
                        >
                            Mégse
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
