import { NextResponse } from "next/server";

const OWNER = process.env.GITHUB_OWNER!;
const REPO = process.env.GITHUB_REPO!;
const TOKEN = process.env.GITHUB_TOKEN!;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const product = searchParams.get("product");
    const bugId = searchParams.get("id");

    if (!product || !bugId) {
        return NextResponse.json(
            { error: "Missing product or id" },
            { status: 400 }
        );
    }

    if (!product) {
        return NextResponse.json(
            { error: "product query param required" },
            { status: 400 }
        );
    }

    const basePath = `bugs/${product}/${bugId}`;

    // 1️⃣ bug.md
    const mdRes = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${basePath}/bug.md`,
        {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                Accept: "application/vnd.github+json"
            }
        }
    );


    if (!mdRes.ok) {
        return NextResponse.json(
            { error: "Bug not found" },
            { status: 404 }
        );
    }

    const mdFile = await mdRes.json();
    const markdown = Buffer.from(mdFile.content, "base64").toString("utf-8");

    // 2️⃣ attachments
    const dirRes = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${basePath}`,
        {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                Accept: "application/vnd.github+json"
            }
        }
    );

    const files = dirRes.ok ? await dirRes.json() : [];

    const attachments = files
        .filter((f: any) => f.type === "file" && f.name !== "bug.md")
        .map((f: any) => ({
            name: f.name,
            url: f.download_url
        }));

    return NextResponse.json({
        product,
        id: bugId,
        markdown,
        attachments
    });
}
