"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();

    const [products, setProducts] = useState<string[]>([]);
    const [product, setProduct] = useState<string | null>(null);

    /* ===== Load products ===== */
    useEffect(() => {
        fetch("/api/products")
            .then(res => res.json())
            .then(list => setProducts(list));
    }, []);

    /* ===== Load previously selected product ===== */
    useEffect(() => {
        const saved = localStorage.getItem("selectedProduct");
        if (saved) setProduct(saved);
    }, []);

    /* ===== Save selected product ===== */
    const handleProductSelect = (value: string) => {
        if (!value) {
            localStorage.removeItem("selectedProduct");
            setProduct(null);
        } else {
            localStorage.setItem("selectedProduct", value);
            setProduct(value);
        }
    };

    if (!products.length) {
        return <p className="p-6">Termékek betöltése…</p>;
    }

    return (
        <main className="p-6 max-w-3xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold">
                Tesztmenedzser – Dashboard
            </h1>

            {/* ===== PRODUCT SELECT ===== */}
            <section className="space-y-2">
                <h2 className="font-semibold">Termék kiválasztása</h2>

                <select
                    className="border p-2 rounded w-72"
                    value={product ?? ""}
                    onChange={e => handleProductSelect(e.target.value)}
                >
                    <option value="">— Válassz terméket —</option>
                    {products.map(p => (
                        <option key={p} value={p}>
                            {p.replace(".md", "")}
                        </option>
                    ))}
                </select>
            </section>

            {/* ===== ACTIONS ===== */}
            {product && (
                <section className="space-y-4">
                    <h2 className="font-semibold">
                        Műveletek a terméken
                    </h2>

                    <div className="flex gap-4">
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                            onClick={() =>
                                router.push(
                                    `/editor?product=${encodeURIComponent(product)}`
                                )
                            }
                        >
                            ✏️ Szerkesztés
                        </button>

                        <button
                            className="px-4 py-2 bg-green-600 text-white rounded"
                            onClick={() =>
                                router.push(
                                    `/run-select?product=${encodeURIComponent(product)}`
                                )
                            }
                        >
                            ▶ Teszt futtatása
                        </button>

                        <button
                            className="px-4 py-2 bg-gray-700 text-white rounded"
                            onClick={() =>
                                router.push(
                                    `/history?product=${encodeURIComponent(product)}`
                                )
                            }
                        >
                            📜 Run history
                        </button>

                        <button
                            className="px-4 py-2 bg-purple-600 text-white rounded"
                            onClick={() =>
                                router.push(
                                    `/bugs?product=${encodeURIComponent(product)}`
                                )
                            }
                        >
                            🐛 Bug lista
                        </button>
                    </div>
                </section>
            )}
        </main>
    );
}
