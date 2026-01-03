export async function POST(req: Request) {
    const { file, content } = await req.json();

    const OWNER = process.env.GITHUB_OWNER;
    const REPO = process.env.GITHUB_REPO;

    const res = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/bugs/${file}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept: "application/vnd.github+json"
            },
            body: JSON.stringify({
                message: `Add bug report ${file}`,
                content: Buffer.from(content).toString("base64")
            })
        }
    );

    if (!res.ok) {
        return new Response("GitHub error", { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }));
}
