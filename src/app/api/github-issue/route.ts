import { NextResponse } from "next/server";

const OWNER = process.env.GITHUB_OWNER!;
const REPO = process.env.GITHUB_REPO!;
const TOKEN = process.env.GITHUB_TOKEN!;

export async function POST(req: Request) {
    const { title, body, labels, assignee = ["bug"] } = await req.json();

    if (!title || !body) {
        return NextResponse.json(
            { error: "Missing title or body" },
            { status: 400 }
        );
    }

    const finalBody = assignee
        ? `@${assignee}\n\n${body}`
        : body;

    const res = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/issues`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                Accept: "application/vnd.github+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                body: finalBody,
                labels,
                assignees: assignee ? [assignee] : []
            })
        }
    );

    if (!res.ok) {
        const err = await res.text();
        return NextResponse.json(
            { error: "GitHub issue creation failed", details: err },
            { status: 500 }
        );
    }

    const issue = await res.json();

    return NextResponse.json({
        number: issue.number,
        url: issue.html_url
    });
}
