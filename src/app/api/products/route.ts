import { NextResponse } from "next/server";
import jasonToMarkdown from "@/lib/jsontomd";

const OWNER = process.env.GITHUB_OWNER!;
const REPO = process.env.GITHUB_REPO!;
const TOKEN = process.env.GITHUB_TOKEN!;

export async function GET() {
    const res = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/products`,
        {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                Accept: "application/vnd.github+json"
            }
        }
    );

    if (!res.ok) {
        return NextResponse.json(
            { error: "Cannot load products" },
            { status: 500 }
        );
    }

    const files = await res.json();

    const products = files
        .filter((f: any) => f.type === "file" && f.name.endsWith(".md"))
        .map((f: any) => f.name);

    return NextResponse.json(products);
}

export async function POST(req: Request) {
    const { product } = await req.json();

    const md = jasonToMarkdown(product);

    const filePath = `products/${product.productName}.md`;

    const res = await fetch(
        `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${filePath}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: `Update product: ${product.productName}`,
                content: Buffer.from(md).toString("base64"),
            }),
        }
    );

    if (!res.ok) {
        return NextResponse.json({ error: "GitHub save failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}

