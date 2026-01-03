import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const OWNER = process.env.GITHUB_OWNER!;
const REPO = process.env.GITHUB_REPO!;
const PATH = "products";

export async function readProducts() {
    const { data } = await octokit.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path: PATH,
    });

    if (!Array.isArray(data)) return [];

    const products = await Promise.all(
        data.map(async (file: any) => {
            const res = await octokit.repos.getContent({
                owner: OWNER,
                repo: REPO,
                path: file.path,
            });

            const markdown = Buffer.from(
                (res.data as any).content,
                "base64"
            ).toString("utf-8");

            return {
                key: file.name.replace(".md", ""),
                name: file.name.replace(".md", ""),
                markdown,
            };
        })
    );

    return products;
}
