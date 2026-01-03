"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

export default function BugPreviewPage() {
    const params = useSearchParams();
    const product = params.get("product");
    const id = params.get("id");

    const [bug, setBug] = useState<BugView | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!product || !id) return;

        fetch(
            `/api/bugs/view?product=${encodeURIComponent(
                product
            )}&id=${encodeURIComponent(id)}`
        )
            .then(res => res.json())
            .then(data => {
                setBug(data);
                setLoading(false);
            });
    }, [product, id]);

    if (!product || !id) return <p>Hiányzó paraméter.</p>;
    if (loading) return <p>Bug betöltése…</p>;
    if (!bug) return <p>Bug nem található.</p>;

    return (
        <main>
            <h1>🐞 Bug részletek</h1>

            <p>
                <b>Termék:</b> {bug.product}
                <br />
                <b>ID:</b> {bug.id}
                <b>Státusz:</b>{" "}
                <span style={{ fontWeight: "bold" }}>{bug.status}</span>
                <br />
                <b>Beküldte:</b> {bug.reportedBy ?? "—"}
            </p>


            <hr />

            <ReactMarkdown>{bug.markdown}</ReactMarkdown>

            {bug.attachments.length > 0 && (
                <>
                    <hr />
                    <h3>Csatolmányok</h3>

                    <ul>
                        {bug.attachments.map(a => (
                            <li key={a.name}>
                                <a href={a.url} target="_blank">
                                    {a.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <hr />

            <a
                href={`https://github.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/tree/main/bugs/${bug.product}/${bug.id}`}
                target="_blank"
            >
                🔗 Megnyitás GitHubon
            </a>
        </main>
    );
}
