"use client";

import { useState } from "react";

export type BugAttachment = {
    file: File;
};

export type BugReportInput = {
    title: string;
    expected: string;
    actual: string;
    reproductionSteps: string;
    severity: "blocker" | "critical" | "major" | "minor";
    priority: "high" | "medium" | "low";
    environment: {
        browser?: string;
        os?: string;
        device?: string;
    };
    notes?: string;
    attachments?: BugAttachment[];
    issueId?: number;
    assignee?: string;
};

export default function BugReportModal({
    open,
    onCancel,
    onSubmit,
    context
}: {
    readonly open: boolean;
    readonly onCancel: () => void;
    readonly onSubmit: (bug: BugReportInput) => void;
    readonly context: {
        product: string;
        testSuite?: string;
        testCase: string;
        stepIndex: number;
        expected: string;
    };
}) {
    const [actual, setActual] = useState("");
    const [repro, setRepro] = useState("");
    const [severity, setSeverity] = useState<"blocker" | "critical" | "major" | "minor">("major");
    const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");

    const [browser, setBrowser] = useState("");
    const [os, setOs] = useState("");
    const [device, setDevice] = useState("");

    const [notes, setNotes] = useState("");
    const [files, setFiles] = useState<File[]>([]);

    const [assignee, setAssignee] = useState("");

    if (!open) return null;

    return (
        <div style={overlay}>
            <div style={modal}>
                <h2>🐞 Bug report</h2>

                <p><b>Teszteset:</b> {context.testCase}</p>
                <p><b>Lépés:</b> {context.stepIndex + 1}</p>
                <p><b>Elvárt eredmény:</b> {context.expected}</p>

                <label htmlFor="actual">Tényleges eredmény *</label>
                <textarea
                    id="actual"
                    value={actual}
                    onChange={e => setActual(e.target.value)}
                />

                <label htmlFor="repro">Reprodukció lépései *</label>
                <textarea
                    id="repro"
                    value={repro}
                    onChange={e => setRepro(e.target.value)}
                />

                <div style={{ display: "flex", gap: 10 }}>
                    <div>
                        <label htmlFor="severity">Severity *</label>
                        <select
                            id="severity"
                            value={severity}
                            onChange={e => setSeverity(e.target.value as any)}
                        >
                            <option value="blocker">Blocker</option>
                            <option value="critical">Critical</option>
                            <option value="major">Major</option>
                            <option value="minor">Minor</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="priority">Priority *</label>
                        <select
                            id="priority"
                            value={priority}
                            onChange={e => setPriority(e.target.value as any)}
                        >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                </div>

                <label htmlFor="browser">Környezet</label>
                <input
                    id="browser"
                    placeholder="Böngésző (pl. Chrome 121)"
                    value={browser}
                    onChange={e => setBrowser(e.target.value)}
                />
                <input
                    placeholder="OS (pl. Windows 11)"
                    value={os}
                    onChange={e => setOs(e.target.value)}
                />
                <input
                    placeholder="Eszköz (opcionális)"
                    value={device}
                    onChange={e => setDevice(e.target.value)}
                />

                <label htmlFor="screenshots">Képernyőképek</label>
                <input
                    id="screenshots"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={e => {
                        if (e.target.files) {
                            setFiles(Array.from(e.target.files));
                        }
                    }}
                />

                {files.length > 0 && (
                    <ul>
                        {files.map((f, i) => (
                            <li key={i}>{f.name}</li>
                        ))}
                    </ul>
                )}

                <label htmlFor="notes">Megjegyzések</label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                />

                <label htmlFor="assignee">
                    Felelős (GitHub username)
                </label>
                <input
                    id="assignee"
                    type="text"
                    value={assignee}
                    onChange={e => setAssignee(e.target.value)}
                    placeholder="Adj meg egy GitHub felhasználónevet"
                />

                <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                    <button onClick={onCancel}>Mégse</button>

                    <button
                        disabled={!actual || !repro}
                        onClick={() =>
                            onSubmit({
                                title: `Bug – ${context.testCase} – Lépés ${context.stepIndex + 1}`,
                                expected: context.expected,
                                actual,
                                reproductionSteps: repro,
                                severity,
                                priority,
                                environment: {
                                    browser,
                                    os,
                                    device
                                },
                                notes,
                                attachments: files.map(f => ({ file: f })),
                                assignee
                            })
                        }
                    >
                        🐞 Bug mentése
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ===== styles ===== */

const overlay = {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
};

const modal = {
    background: "#fff",
    padding: 20,
    width: 650,
    maxHeight: "90vh",
    overflowY: "auto" as const
};
