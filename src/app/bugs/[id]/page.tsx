"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

type BugView = {
    product: string;
    id: string;
    markdown: string;
    attachments: {
        name: string;
        url: string;
    }[];
    status?: string;
    reportedBy?: string;
};

function Badge({
    label,
    color,
}: Readonly<{
    label: string;
    color: string;
}>) {
    return (
        <span className={`inline-block px-3 py-1 text-xs rounded ${color}`}>
            {label}
        </span>
    );
}

export default function BugDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const product = searchParams.get("product");

    const [bug, setBug] = useState<BugView | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!product || !id) {
            setError("Hiányzó paraméter.");
            setLoading(false);
            return;
        }

        fetch(
            `/api/bugs/view?product=${encodeURIComponent(
                product
            )}&id=${encodeURIComponent(id)}`
        )
            .then(res => {
                if (!res.ok) throw new Error("Bug nem található");
                return res.json();
            })
            .then(data => {
                setBug(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [product, id]);

    if (loading) return <p className="p-6">Bug betöltése…</p>;
    if (error) return <p className="p-6 text-red-600">{error}</p>;
    if (!bug) return <p className="p-6">Bug nem található.</p>;

    return (
        <main className="p-6 max-w-3xl">
            {/* Breadcrumb */}
            <div className="mb-4 text-sm text-gray-500">
                <Link href="/bugs" className="hover:underline">
                    Bug lista
                </Link>{" "}
                / {bug.id}
            </div>

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-xl font-semibold mb-2">
                        🐞 Bug részletek
                    </h1>

                    <div className="flex gap-2">
                        {bug.status && (
                            <Badge
                                label={bug.status.toUpperCase()}
                                color="bg-blue-100 text-blue-800"
                            />
                        )}

                        {bug.reportedBy && (
                            <Badge
                                label={`👤 ${bug.reportedBy}`}
                                color="bg-gray-100 text-gray-700"
                            />
                        )}
                    </div>
                </div>

                <a
                    href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_OWNER}/${process.env.NEXT_PUBLIC_GITHUB_REPO}/tree/main/bugs/${bug.product}/${bug.id}`}
                    target="_blank"
                    className="text-sm text-blue-600 hover:underline"
                >
                    🔗 GitHub
                </a>
            </div>

            {/* Meta */}
            <div className="bg-white border rounded p-4 mb-6 text-sm space-y-2">
                <div>
                    <b>Termék:</b> {bug.product}
                </div>
                <div>
                    <b>Bug ID:</b>{" "}
                    <span className="font-mono">{bug.id}</span>
                </div>
            </div>

            {/* Markdown */}
            <article className="prose max-w-none">
                <ReactMarkdown>{bug.markdown}</ReactMarkdown>
            </article>

            {/* Attachments */}
            {bug.attachments.length > 0 && (
                <>
                    <hr className="my-6" />
                    <h3 className="font-semibold mb-2">📎 Csatolmányok</h3>
                    <ul className="list-disc pl-6">
                        {bug.attachments.map(a => (
                            <li key={a.name}>
                                <a
                                    href={a.url}
                                    target="_blank"
                                    className="text-blue-600 hover:underline"
                                >
                                    {a.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </main>
    );
}
