import { NextResponse } from "next/server";

const OWNER = process.env.GITHUB_OWNER!;
const REPO = process.env.GITHUB_REPO!;
const TOKEN = process.env.GITHUB_TOKEN!;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const file = searchParams.get("file");

    if (!file) {
        return NextResponse.json(
            { error: "Missing file" },
            { status: 400 }
        );
    }

    const ghRes = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/products/${file}`,
        {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                Accept: "application/vnd.github+json",
                "User-Agent": "eszfk-ami-test-manager"
            }
        }
    );

    if (!ghRes.ok) {
        return NextResponse.json(
            { error: "File not found" },
            { status: 404 }
        );
    }

    const data = await ghRes.json();
    const content = Buffer.from(data.content, "base64").toString("utf-8");

    return NextResponse.json({
        file,
        content,
        sha: data.sha
    });
}

export async function POST(req: Request) {
    const body = await req.json();
    const { file, content, sha } = body;

    if (!file || !content) {
        return NextResponse.json(
            { error: "Missing file or content" },
            { status: 400 }
        );
    }

    const ghRes = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/products/${file}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                Accept: "application/vnd.github+json",
                "User-Agent": "eszfk-ami-test-manager"
            },
            body: JSON.stringify({
                message: `Update ${file}`,
                content: Buffer.from(content).toString("base64"),
                sha
            })
        }
    );

    const result = await ghRes.json();

    if (!ghRes.ok) {
        return NextResponse.json(result, { status: ghRes.status });
    }

    return NextResponse.json({
        ok: true,
        commit: result.commit.sha
    });
}
