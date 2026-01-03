"use client";

import { useState } from "react";
import bugToMarkdown from "@/lib/bugToMarkdown";

export default function NewBugPage() {
    const [bug, setBug] = useState<any>({
        title: "",
        testCase: "",
        stepIndex: 0,
        environment: { os: "", browser: "", version: "" },
        expected: "",
        actual: "",
        reproduction: "",
        notes: ""
    });

    const update = (field: string, value: any) =>
        setBug((b: any) => ({ ...b, [field]: value }));

    const save = async () => {
        const md = bugToMarkdown(bug);

        const fileName =
            "BUG-" + Date.now() + ".md";

        const res = await fetch("/api/bug", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                file: fileName,
                content: md
            })
        });

        if (res.ok) {
            alert("Bug report mentve");
            globalThis.history.back();
        } else {
            alert("Hiba mentéskor");
        }
    };

    return (
        <main>
            <h1>Új Bug Report</h1>

            <input
                placeholder="Rövid hiba leírás"
                value={bug.title}
                onChange={e => update("title", e.target.value)}
            />

            <h3>Környezet</h3>
            <input placeholder="OS"
                onChange={e => update("environment", { ...bug.environment, os: e.target.value })} />
            <input placeholder="Böngésző"
                onChange={e => update("environment", { ...bug.environment, browser: e.target.value })} />
            <input placeholder="Verzió"
                onChange={e => update("environment", { ...bug.environment, version: e.target.value })} />

            <h3>Elvárt eredmény</h3>
            <textarea onChange={e => update("expected", e.target.value)} />

            <h3>Tényleges eredmény</h3>
            <textarea onChange={e => update("actual", e.target.value)} />

            <h3>Reprodukció</h3>
            <textarea onChange={e => update("reproduction", e.target.value)} />

            <h3>Megjegyzés</h3>
            <textarea onChange={e => update("notes", e.target.value)} />

            <button onClick={save}>💾 Bug mentése</button>
        </main>
    );
}
