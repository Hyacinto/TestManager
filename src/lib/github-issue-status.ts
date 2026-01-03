import { Octokit } from "@octokit/rest";

export async function getIssueStatus(issueNumber: number) {
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    const res = await octokit.rest.issues.get({
        owner: process.env.GITHUB_OWNER!,
        repo: process.env.GITHUB_REPO!,
        issue_number: issueNumber
    });

    return {
        state: res.data.state, // "open" | "closed"
        closedAt: res.data.closed_at
    };
}
