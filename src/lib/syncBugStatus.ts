export async function syncBugStatus(
    bugPath: string,
    issueId: number
) {
    try {
        const res = await fetch(
            `/api/github-issue-status?issue=${issueId}`
        );

        const { state } = await res.json();

        if (state !== "CLOSED") return;

        await fetch("/api/bugs/view", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                path: bugPath,
                status: "CLOSED"
            })
        });

    } catch (e) {
        console.error("Bug státusz sync hiba:", e);
    }
}

