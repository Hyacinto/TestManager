"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchBugs } from "@/lib/bugs";
import { BugItem } from "@/types/bug";
import { useSearchParams } from "next/navigation";

/* ===== BADGES ===== */

function SeverityBadge({ severity }: { readonly severity: BugItem["severity"] }) {
    const map: Record<string, string> = {
        blocker: "bg-red-200 text-red-900",
        critical: "bg-red-100 text-red-800",
        major: "bg-orange-100 text-orange-800",
        minor: "bg-gray-100 text-gray-700"
    };

    return (
        <span className={`px-2 py-1 text-xs rounded ${map[severity]}`}>
            {severity.toUpperCase()}
        </span>
    );
}

function StatusBadge({ status }: { readonly status: BugItem["status"] }) {
    const map: Record<string, string> = {
        open: "bg-blue-100 text-blue-800",
        closed: "bg-green-100 text-green-800"
    };

    return (
        <span className={`px-2 py-1 text-xs rounded ${map[status]}`}>
            {status.toUpperCase()}
        </span>
    );
}

/* ===== PAGE ===== */

export default function BugsPage() {
    const [bugs, setBugs] = useState<BugItem[]>([]);
    const [loading, setLoading] = useState(true);

    const params = useSearchParams();
    const product = params.get("product");

    /* ===== FILTER PARAMS ===== */

    const statusFilter = params.get("status"); // open | closed
    const severityFilter = params.get("severity"); // blocker|critical|...
    const assigneeFilter = params.get("assignee"); // name | unassigned

    const sortBy = params.get("sort") ?? "createdAt";
    const sortDir = params.get("dir") ?? "desc";

    /* ===== FETCH ===== */

    useEffect(() => {
        if (!product) return;

        fetchBugs(product)
            .then(data => {
                setBugs(data);
            })
            .catch(err => console.error("fetchBugs error:", err))
            .finally(() => setLoading(false));
    }, [product]);

    /* ===== FILTER + SORT ===== */

    const visibleBugs = useMemo(() => {
        let list = [...bugs];



        // Status
        if (statusFilter) {
            list = list.filter(b => b.status === statusFilter);
        }

        // Severity
        if (severityFilter) {
            list = list.filter(b => b.severity === severityFilter);
        }

        // Assignee
        if (assigneeFilter) {
            if (assigneeFilter === "unassigned") {
                list = list.filter(b => !b.assignee);
            } else {
                list = list.filter(b => b.assignee === assigneeFilter);
            }
        }

        // Sorting
        list.sort((a, b) => {
            let res = 0;

            switch (sortBy) {
                case "createdAt":
                    res =
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime();
                    break;
                case "severity": {
                    const order = ["blocker", "critical", "major", "minor"];
                    res =
                        order.indexOf(a.severity) -
                        order.indexOf(b.severity);
                    break;
                }
                case "status":
                    res = a.status.localeCompare(b.status);
                    break;
                case "assignee":
                    res = (a.assignee ?? "").localeCompare(b.assignee ?? "");
                    break;
            }

            return sortDir === "asc" ? res : -res;
        });

        return list;
    }, [
        bugs,
        statusFilter,
        severityFilter,
        assigneeFilter,
        sortBy,
        sortDir
    ]);

    /* ===== URL HELPER ===== */

    function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());

    if (value) {
        next.set(key, value);
    } else {
        next.delete(key);
    }

    globalThis.history.replaceState(null, "", `?${next.toString()}`);
    }

    if (!product) {
        return <p className="p-6">Nincs kiválasztott termék.</p>;
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold">Bug lista</h1>
            </div>

            {/* FILTER BAR */}
            <div className="flex gap-4 mb-4 text-sm">
                <select
                    value={statusFilter ?? ""}
                    onChange={e =>
                        updateParam("status", e.target.value || null)
                    }
                >
                    <option value="">Státusz: mind</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                </select>

                <select
                    value={severityFilter ?? ""}
                    onChange={e =>
                        updateParam("severity", e.target.value || null)
                    }
                >
                    <option value="">Súlyosság: mind</option>
                    <option value="blocker">Blocker</option>
                    <option value="critical">Critical</option>
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                </select>

                <select
                    value={assigneeFilter ?? ""}
                    onChange={e =>
                        updateParam("assignee", e.target.value || null)
                    }
                >
                    <option value="">Felelős: mind</option>
                    <option value="unassigned">Unassigned</option>
                </select>

                <select
                    value={`${sortBy}:${sortDir}`}
                    onChange={e => {
                        const [s, d] = e.target.value.split(":");
                        updateParam("sort", s);
                        updateParam("dir", d);
                    }}
                >
                    <option value="createdAt:desc">Létrehozva ↓</option>
                    <option value="createdAt:asc">Létrehozva ↑</option>
                    <option value="severity:asc">Súlyosság</option>
                    <option value="status:asc">Státusz</option>
                    <option value="assignee:asc">Felelős</option>
                </select>
            </div>

            {/* TABLE */}
            <div className="bg-white border rounded">
                {loading && (
                    <div className="p-6 text-center text-gray-500">
                        Betöltés…
                    </div>
                )}

                {!loading && visibleBugs.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        Nincs találat
                    </div>
                )}

                {!loading && visibleBugs.length > 0 && (
                    <table className="w-full text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="text-left p-3">Létrehozva</th>
                                <th className="text-left p-3">Súlyosság</th>
                                <th className="text-left p-3">Cím</th>
                                <th className="text-left p-3">Státusz</th>
                                <th className="text-left p-3">Felelős</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleBugs.map(bug => (
                                <tr
                                    key={bug.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="p-3 font-mono text-xs">
                                        {bug.createdAt}
                                    </td>
                                    <td className="p-3">
                                        <SeverityBadge
                                            severity={bug.severity}
                                        />
                                    </td>
                                    <td className="p-3">
                                        <Link
                                            href={`/bugs/${bug.id}?product=${product}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {bug.title}
                                        </Link>
                                    </td>
                                    <td className="p-3">
                                        <StatusBadge status={bug.status} />
                                    </td>
                                    <td className="p-3">
                                        {bug.assignee ?? "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
