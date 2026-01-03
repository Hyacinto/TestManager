import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const form = await req.formData();

        const bugId = form.get("bugId") as string | null;
        const markdown = form.get("markdown") as string | null;
        const product = form.get("product") as string | null;
        const files = form.getAll("files") as File[];
        const assignee = form.get("assignee") as string | null;

        if (!bugId || !markdown || !product) {
            return NextResponse.json(
                {
                    error: "Missing required fields",
                    required: ["bugId", "markdown", "product"]
                },
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

        const basePath = `bugs/${product}/${bugId}`;

        await uploadToGitHub({
            owner: OWNER,
            repo: REPO,
            token: TOKEN,
            path: `${basePath}/bug.md`,
            content: markdown
        });

        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());

            await uploadToGitHub({
                owner: OWNER,
                repo: REPO,
                token: TOKEN,
                path: `${basePath}/${file.name}`,
                content: buffer.toString("base64"),
                alreadyBase64: true
            });
        }

        let issueId: number | null = null;

        if (assignee) {
            const issueRes = await fetch(
                `https://api.github.com/repos/${OWNER}/${REPO}/issues`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${TOKEN}`,
                        Accept: "application/vnd.github+json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: `Bug: ${bugId}`,
                        body: `Bug report: ${basePath}/bug.md`,
                        assignees: [assignee],
                        labels: ["bug"]
                    })
                }
            );

            if (!issueRes.ok) {
                const err = await issueRes.text();
                throw new Error("GitHub issue create failed: " + err);
            }

            const issue = await issueRes.json();
            issueId = issue.number;
        }

        return NextResponse.json({
            ok: true,
            issueId
        });
    } catch (err) {
        console.error("BUG UPLOAD ERROR:", err);

        return NextResponse.json(
            { error: "Bug upload failed" },
            { status: 500 }
        );
    }
}

/* ================= GITHUB HELPER ================= */

type UploadArgs = {
    owner: string;
    repo: string;
    token: string;
    path: string;
    content: string;
    alreadyBase64?: boolean;
};

async function uploadToGitHub({
    owner,
    repo,
    token,
    path,
    content,
    alreadyBase64 = false
}: UploadArgs) {
    const body = {
        message: `Add ${path}`,
        content: alreadyBase64
            ? content
            : Buffer.from(content).toString("base64")
    };

    const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }
    );

    if (!res.ok) {
        const err = await res.text();
        console.error("GitHub upload error:", err);
        throw new Error(err);
    }
}
