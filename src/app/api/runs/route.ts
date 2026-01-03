import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const product = searchParams.get("product");

        if (!product) {
            return NextResponse.json(
                { error: "Missing product parameter" },
                { status: 400 }
            );
        }

        const OWNER = process.env.GITHUB_OWNER;
        const REPO = process.env.GITHUB_REPO;
        const TOKEN = process.env.GITHUB_TOKEN;

        if (!OWNER || !REPO || !TOKEN) {
            return NextResponse.json(
                { error: "Missing GitHub environment variables" },
                { status: 500 }
            );
        }

        const octokit = new Octokit({ auth: TOKEN });

        const RUN_DIR = `runs/${product}`;

        const res = await octokit.repos.getContent({
            owner: OWNER,
            repo: REPO,
            path: RUN_DIR
        });

        if (!Array.isArray(res.data)) {
            return NextResponse.json([]);
        }

        const runs = res.data
            .filter(
                f =>
                    f.type === "file" &&
                    f.name.startsWith("run-") &&
                    f.name.endsWith(".md")
            )
            .map(f => ({
                name: f.name,
                path: f.path
            }))
            .sort((a, b) => b.name.localeCompare(a.name)); // newest first

        return NextResponse.json(runs);
    } catch (err: any) {
        // GitHub returns 404 if folder does not exist yet → this is OK
        if (err.status === 404) {
            return NextResponse.json([]);
        }

        console.error("RUNS API ERROR:", err);
        return NextResponse.json(
            { error: "Failed to load runs" },
            { status: 500 }
        );
    }
}
