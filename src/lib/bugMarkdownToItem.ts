import type { BugItem } from "@/types/bug";

export default function bugMarkdownToItem(
    md: string,
    path: string,
    product: string
): BugItem {
    const lines = md.split("\n");

    const meta: Record<string, string> = {};
    let title = "Untitled bug";

    for (const line of lines) {
        if (line.startsWith("# ")) {
            title = line.replace("#", "").trim();
        }

        if (!line.trim().startsWith("- ")) continue;

        const [key, ...valueParts] = line
            .trim()
            .substring(2)
            .split(":");

        meta[key.trim()] = valueParts.join(":").trim();
    }

    const resolvedProduct =
        meta["Product"] ??
        extractProductFromPath(path) ??
        product ??
        "unknown";

    const bug: BugItem = {
        id: extractBugIdFromPath(path),
        title,

        product: resolvedProduct,

        testCase: meta["Test case"],
        stepIndex: meta["Step"]
            ? Number(meta["Step"]) - 1
            : undefined,

        severity: (meta["Severity"] as any) ?? "major",
        priority: (meta["Priority"] as any) ?? "medium",

        assignee: meta["Assignee"] || undefined,

        githubIssueNumber: meta["GitHub Issue"]
            ? Number(meta["GitHub Issue"].replace("#", ""))
            : undefined,

        createdAt: meta["Created"],
        updatedAt: meta["Updated"],

        // status-t később az API tölti fel GitHub alapján
        status: meta["Status"] as BugItem["status"] ?? "open",

        path
    };

    return bug;
}

/* ================= HELPERS ================= */

function extractBugIdFromPath(path: string): string {
    // bugs/<product>/<bugId>/bug.md
    const parts = path.split("/");
    return parts.at(-2) || "unknown-bug";
}

function extractProductFromPath(path: string): string | null {
    const parts = path.split("/");
    return parts.length >= 2 ? parts[1] : null;
}
