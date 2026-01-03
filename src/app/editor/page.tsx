"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import markdownToJson from "@/lib/mdtojson";
import jsonToMarkdown from "@/lib/jsontomd";
import type { EditorProduct } from "@/types/editor";

/* ===== Types ===== */

interface TestStep {
    step: string;
    expected: string;
}

interface TestCase {
    name: string;
    purpose: string;
    itemsToTest: string;
    method: string;
    input: string;
    precondition: string;
    steps: TestStep[];
}

/* ========================== */

export default function EditorPage() {
    const params = useSearchParams();
    const productFromUrl = params.get("product");

    const [product, setProduct] = useState<EditorProduct | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileSha, setFileSha] = useState<string | null>(null);

    const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
    const [selectedTestCase, setSelectedTestCase] = useState<string | null>(null);

    const [newProductName, setNewProductName] = useState("");
    const [addToSuite, setAddToSuite] = useState<Record<string, string>>({});

    /* ===== LOAD PRODUCT ===== */
    useEffect(() => {
        if (!productFromUrl) return;

        fetch(`/api/md?file=${productFromUrl}`)
            .then(res => res.json())
            .then(md => {
                const parsed = markdownToJson(md.content) as EditorProduct;
                setProduct(parsed);
                setFileName(productFromUrl);
                setFileSha(md.sha);
            });
    }, [productFromUrl]);

    /* ===== CREATE PRODUCT ===== */
    const createProduct = () => {
        if (!newProductName.trim()) return;

        setProduct({
            productName: newProductName.trim(),
            testSuites: [],
            testCases: {}
        });

        setFileName(`${newProductName.trim()}.md`);
        setNewProductName("");
    };

    /* ===== SAVE ===== */
    const saveProduct = async () => {
        if (!product || !fileName) return;

        const md = jsonToMarkdown(product);

        const res = await fetch("/api/md", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                file: fileName,
                content: md,
                sha: fileSha
            })
        });

        const result = await res.json();

        if (!res.ok) {
            alert(result.error || "Mentési hiba");
            return;
        }

        setFileSha(result.sha);
        alert("✔ Minden változás elmentve");
    };

    /* ===== SUITES ===== */
    const addSuite = () => {
        if (!product) return;
        const name = prompt("Tesztkészlet neve:");
        if (!name) return;

        setProduct({
            ...product,
            testSuites: [...product.testSuites, { name, cases: [] }]
        });
    };

    const deleteSuite = (suiteName: string) => {
        if (!product) return;
        if (!confirm(`Biztos törlöd a "${suiteName}" tesztkészletet?`)) return;

        setProduct(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                testSuites: prev.testSuites.filter(s => s.name !== suiteName)
            };
        });

        if (selectedSuite === suiteName) {
            setSelectedSuite(null);
        }
    };

    /* ===== TEST CASE ===== */
    const addTestCase = () => {
        if (!product) return;

        const name = prompt("Teszteset neve:");
        if (!name) return;

        const newTestCase: TestCase = {
            name,
            purpose: "",
            itemsToTest: "",
            method: "",
            input: "",
            precondition: "",
            steps: []
        };

        setProduct(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                testCases: {
                    ...prev.testCases,
                    [name]: newTestCase
                }
            };
        });

        setSelectedTestCase(name);
    };

    const addCaseToSuite = (caseName: string) => {
        if (!product || !addToSuite[caseName]) return;

        setProduct(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                testSuites: prev.testSuites.map(s =>
                    s.name === addToSuite[caseName] && !s.cases.includes(caseName)
                        ? { ...s, cases: [...s.cases, caseName] }
                        : s
                )
            };
        });

        setAddToSuite(prev => ({ ...prev, [caseName]: "" }));
    };

    const deleteTestCase = () => {
        if (!product || !selectedTestCase) return;
        if (!confirm("Biztos törlöd a tesztesetet?")) return;

        setProduct(prev => {
            if (!prev) return prev;

            const { [selectedTestCase]: _, ...rest } = prev.testCases;

            return {
                ...prev,
                testCases: rest,
                testSuites: prev.testSuites.map(s => ({
                    ...s,
                    cases: s.cases.filter(c => c !== selectedTestCase)
                }))
            };
        });

        setSelectedTestCase(null);
    };

    const removeTestCaseFromSuite = (suiteName: string, testCaseName: string) => {
        if (!product) return;

        setProduct(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                testSuites: prev.testSuites.map(s =>
                    s.name === suiteName
                        ? { ...s, cases: s.cases.filter(c => c !== testCaseName) }
                        : s
                )
            };
        });
    };

    /* ===== EDITING ===== */
    const updateTestCaseField = (field: keyof TestCase, value: any) => {
        if (!product || !selectedTestCase) return;

        setProduct({
            ...product,
            testCases: {
                ...product.testCases,
                [selectedTestCase]: {
                    ...product.testCases[selectedTestCase],
                    [field]: value
                }
            }
        });
    };

    const updateStep = (index: number, field: keyof TestStep, value: string) => {
        if (!product || !selectedTestCase) return;

        const steps = [...product.testCases[selectedTestCase].steps];
        steps[index] = { ...steps[index], [field]: value };
        updateTestCaseField("steps", steps);
    };

    const addStep = () => {
        if (!product || !selectedTestCase) return;

        updateTestCaseField("steps", [
            ...product.testCases[selectedTestCase].steps,
            { step: "", expected: "" }
        ]);
    };

    const currentTestCase =
        product && selectedTestCase
            ? product.testCases[selectedTestCase]
            : null;

    /* ===== UI ===== */
    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Editor</h1>

                {product && (
                    <button
                        onClick={saveProduct}
                        className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                        💾 Mentés
                    </button>
                )}
            </div>

            {!product && (
                <div className="space-y-3">
                    <input
                        className="border p-2 rounded w-72"
                        placeholder="Termék neve"
                        value={newProductName}
                        onChange={e => setNewProductName(e.target.value)}
                    />
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                        onClick={createProduct}
                    >
                        Új termék létrehozása
                    </button>
                </div>
            )}

            {product && (
                <div className="grid grid-cols-4 gap-6">
                    {/* LEFT */}
                    <div className="col-span-1 space-y-6">
                        <div>
                            <h2 className="font-semibold mb-2">Tesztkészletek</h2>
                            {product.testSuites.map(s => (
                                <div
                                    key={s.name}
                                    className={`p-2 rounded cursor-pointer ${selectedSuite === s.name
                                        ? "bg-blue-100"
                                        : "hover:bg-gray-100"
                                        }`}
                                    onClick={() => setSelectedSuite(s.name)}
                                >
                                    <div className="flex justify-between">
                                        <span>{s.name}</span>
                                        <button
                                            className="text-red-500 text-xs"
                                            onClick={e => {
                                                e.stopPropagation();
                                                deleteSuite(s.name);
                                            }}
                                        >
                                            🗑
                                        </button>
                                    </div>

                                    {selectedSuite === s.name &&
                                        s.cases.map(tc => (
                                            <div key={tc} className="ml-3 text-sm">
                                                {tc}
                                                <button
                                                    className="ml-2 text-red-500"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        removeTestCaseFromSuite(s.name, tc);
                                                    }}
                                                >
                                                    ✖
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            ))}
                            <button
                                className="mt-2 text-sm text-blue-600"
                                onClick={addSuite}
                            >
                                + Új készlet
                            </button>
                        </div>
                        <div>
                            <h2 className="font-semibold mb-2">Tesztesetek</h2>

                            {Object.values(product.testCases).map(tc => (
                                <div
                                    key={tc.name}
                                    className={`p-2 rounded border mb-2 ${selectedTestCase === tc.name
                                        ? "bg-green-50 border-green-300"
                                        : "hover:bg-gray-50"
                                        }`}
                                >
                                    <div
                                        className="cursor-pointer"
                                        onClick={() => setSelectedTestCase(tc.name)}
                                    >
                                        <div className="font-medium">
                                            {tc.name}
                                        </div>
                                        {tc.purpose && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {tc.purpose}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                        <select
                                            className="border p-1 text-sm rounded flex-1"
                                            value={addToSuite[tc.name] || ""}
                                            onChange={e =>
                                                setAddToSuite(prev => ({
                                                    ...prev,
                                                    [tc.name]: e.target.value
                                                }))
                                            }
                                        >
                                            <option value="">
                                                + Tesztkészlethez
                                            </option>
                                            {product.testSuites.map(s => (
                                                <option
                                                    key={s.name}
                                                    value={s.name}
                                                >
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            onClick={() => addCaseToSuite(tc.name)}
                                            className="px-2 py-1 text-sm bg-blue-600 text-white rounded"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                className="mt-2 text-sm text-green-600"
                                onClick={addTestCase}
                            >
                                + Új teszteset
                            </button>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="col-span-3">
                        {currentTestCase ? (
                            <>
                                <div className="flex justify-between mb-4">
                                    <h2 className="text-xl font-semibold">
                                        {currentTestCase.name}
                                    </h2>
                                    <button
                                        className="text-red-600 text-sm"
                                        onClick={deleteTestCase}
                                    >
                                        Törlés
                                    </button>
                                </div>

                                {[
                                    ["purpose", "Tesztelés célja"],
                                    ["itemsToTest", "Tesztelendő elemek"],
                                    ["method", "Tesztelés módszere"],
                                    ["input", "Felhasznált input"],
                                    ["precondition", "Teszt előfeltétel"]
                                ].map(([key, label]) => (
                                    <div key={key} className="mb-4">
                                        <label className="block text-sm font-medium mb-1">
                                            {label}
                                        </label>
                                        <textarea
                                            rows={3}
                                            className="w-full border rounded p-2 text-sm"
                                            value={(currentTestCase as any)[key]}
                                            onChange={e =>
                                                updateTestCaseField(
                                                    key as keyof TestCase,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                ))}

                                <h3 className="font-semibold mt-6 mb-2">
                                    Tesztlépések
                                </h3>

                                {currentTestCase.steps.map((step, i) => (
                                    <div
                                        key={i}
                                        className="border rounded p-3 mb-3"
                                    >
                                        <input
                                            className="w-full border p-1 mb-2 text-sm"
                                            placeholder="Lépés"
                                            value={step.step}
                                            onChange={e =>
                                                updateStep(
                                                    i,
                                                    "step",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <input
                                            className="w-full border p-1 text-sm"
                                            placeholder="Elvárt output"
                                            value={step.expected}
                                            onChange={e =>
                                                updateStep(
                                                    i,
                                                    "expected",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                ))}

                                <button
                                    className="mt-2 text-sm text-blue-600"
                                    onClick={addStep}
                                >
                                    + Új lépés
                                </button>
                            </>
                        ) : (
                            <p className="text-gray-500">
                                A szerkesztéshez válassz egy tesztesetet!
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
