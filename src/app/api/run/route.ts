import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { file, content, product } = await req.json();

        if (!file || !content || !product) {
            return NextResponse.json(
                { error: "Missing file, content or product" },
                { status: 400 }
            );
        }

        const OWNER = process.env.GITHUB_OWNER;
        const REPO = process.env.GITHUB_REPO;
        const TOKEN = process.env.GITHUB_TOKEN;

        if (!OWNER || !REPO || !TOKEN) {
            return NextResponse.json(
                { error: "Missing GitHub env vars" },
                { status: 500 }
            );
        }

        const path = `runs/${product}/${file}`;

        const res = await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    Accept: "application/vnd.github+json"
                },
                body: JSON.stringify({
                    message: `Add test run ${file}`,
                    content: Buffer.from(content).toString("base64")
                })
            }
        );

        if (!res.ok) {
            const err = await res.text();
            return NextResponse.json(
                { error: err },
                { status: 500 }
            );
        }

        return NextResponse.json({ ok: true, path });
    } catch (err) {
        console.error("RUN SAVE ERROR:", err);
        return NextResponse.json(
            { error: "Run save failed" },
            { status: 500 }
        );
    }
}
