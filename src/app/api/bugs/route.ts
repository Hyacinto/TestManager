import { NextResponse } from "next/server";
import bugMarkdownToItem from "@/lib/bugMarkdownToItem";
import type { BugItem } from "@/types/bug";

const OWNER = process.env.GITHUB_OWNER!;
const REPO = process.env.GITHUB_REPO!;
const TOKEN = process.env.GITHUB_TOKEN!;

async function fetchFromGitHub(url: string) {
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            Accept: "application/vnd.github+json"
        }
    });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    return res.json();
}

function applyFilters(items: BugItem[], filters: { product?: string; assignee?: string; status?: string }) {
    let filtered = items;
    if (filters.product) filtered = filtered.filter(b => b.product === filters.product);
    if (filters.assignee) filtered = filtered.filter(b => b.assignee === filters.assignee);
    if (filters.status) filtered = filtered.filter(b => b.status === filters.status);
    return filtered;
}

export async function GET(req: Request) {
    try {
        if (!OWNER || !REPO || !TOKEN) {
            return NextResponse.json(
                { error: "Missing GitHub env vars" },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(req.url);

        const filterProduct = searchParams.get("product");
        const filterAssignee = searchParams.get("assignee");
        const filterStatus = searchParams.get("status");

        /* ================= 1️⃣ list bug.md files ================= */


        const tree = await fetchFromGitHub(
            `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/main?recursive=1`
        );

        const bugFiles = tree.tree.filter(
            (item: any) =>
                item.type === "blob" && item.path.endsWith("/bug.md")
        );

        /* ================= 2️⃣ load + parse ================= */

        const items: BugItem[] = [];

        for (const file of bugFiles) {
            try {
                const contentJson = await fetchFromGitHub(
                    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${file.path}`
                );
                const md = Buffer.from(
                    contentJson.content,
                    "base64"
                ).toString("utf-8");

                const bug = bugMarkdownToItem(md, file.path, filterProduct ?? "unknown");
                items.push(bug);
            } catch {
                continue;
            }
        }

        /* ================= 3️⃣ GitHub issue status enrich ================= */

        for (const bug of items) {
            if (!bug.githubIssueNumber) continue;

            try {
                const issue = await fetchFromGitHub(
                    `https://api.github.com/repos/${OWNER}/${REPO}/issues/${bug.githubIssueNumber}`
                );
                bug.status = issue.state === "closed" ? "CLOSED" : "OPEN";
                bug.assignee = issue.assignee?.login ?? bug.assignee;
            } catch {
                continue;
            }
        }

        /* ================= 4️⃣ filtering ================= */

        const filtered = applyFilters(items, {
            product: filterProduct ?? undefined,
            assignee: filterAssignee ?? undefined,
            status: filterStatus ?? undefined
        });

        return NextResponse.json({
            items: filtered,
            total: filtered.length
        });
    } catch (err) {
        console.error("BUG LIST API ERROR:", err);

        return NextResponse.json(
            { error: "Failed to load bugs" },
            { status: 500 }
        );
    }
}

