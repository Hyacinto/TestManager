import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

const OWNER = process.env.GITHUB_OWNER!;
const REPO = process.env.GITHUB_REPO!;
const TOKEN = process.env.GITHUB_TOKEN!;

const octokit = new Octokit({ auth: TOKEN });

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");

    if (!path) {
        return NextResponse.json(
            { error: "path is required" },
            { status: 400 }
        );
    }

    try {
        const res = await octokit.repos.getContent({
            owner: OWNER,
            repo: REPO,
            path
        });

        if (Array.isArray(res.data) || !("content" in res.data)) {
            return NextResponse.json(
                { error: "Not a file" },
                { status: 400 }
            );
        }

        const content = Buffer.from(
            res.data.content,
            "base64"
        ).toString("utf-8");

        return new NextResponse(content, {
            headers: { "Content-Type": "text/markdown" }
        });
    } catch (err) {
        console.error("RUN FILE READ ERROR:", err);
        return NextResponse.json(
            { error: "File not found" },
            { status: 404 }
        );
    }
}
