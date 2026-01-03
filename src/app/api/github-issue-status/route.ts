import { NextResponse } from "next/server";
import { getIssueStatus } from "@/lib/github-issue-status";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const issue = searchParams.get("issue");

    if (!issue) {
        return NextResponse.json(
            { error: "Missing issue number" },
            { status: 400 }
        );
    }

    const status = await getIssueStatus(Number(issue));
    return NextResponse.json(status);
}
