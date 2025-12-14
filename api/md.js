import markdownToJson from "./mdtojson";

export default async function handler(req, res) {
    const OWNER = process.env.GITHUB_OWNER;
    const REPO = process.env.GITHUB_REPO;

    if (req.method === "GET") {
        const file = req.query.file;

        if (!file) {
            return res.status(400).json({ error: "Missing file parameter" });
        }

        const ghRes = await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/contents/tests/${file}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: "application/vnd.github+json"
                }
            }
        );

        if (!ghRes.ok) {
            return res.status(404).json({ error: "File not found" });
        }

        const data = await ghRes.json();

        const content = Buffer.from(data.content, "base64").toString("utf-8");

        const json = markdownToJson(content)

        return res.json({
            file,
            sha: data.sha
        }), json;
    }

    if (req.method === "POST" && Object.keys(req.body || {}).length === 0) {
        return res.status(400).json({ error: "Empty request body" });
    }

    if (req.method === "POST") {
        const { file, content, sha } = req.body;

        if (!file || !content) {
            return res.status(400).json({ error: "Missing file or content" });
        }

        const ghRes = await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/contents/tests/${file}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: "application/vnd.github+json"
                },
                body: JSON.stringify({
                    message: `Update ${file}`,
                    content: Buffer.from(content).toString("base64"),
                    sha: sha || undefined
                })
            }
        );

        const result = await ghRes.json();

        if (ghRes.status === 409) {
            return res.status(409).json({
                error: "Conflict – file changed meanwhile"
            });
        }

        if (!ghRes.ok) {
            return res.status(ghRes.status).json(result);
        }

        return res.json({
            ok: true,
            commit: result.commit.sha,
            sha: result.content.sha
        });
    }

    return res.status(405).end();
}

