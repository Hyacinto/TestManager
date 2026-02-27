import bugToMarkdown from "./markdown.js";

const API_BASE = "http://localhost:8000";

async function loadProjects() {
    const res = await fetch(`${API_BASE}/projects`);
    const data = await res.json();

    const select = document.getElementById("projectSelect");

    data.projects.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.name;
        select.appendChild(opt);
    });

    const option = document.getElementById("projectSelect");
    option.querySelector("option[value='']").disabled = true;
}

async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData
    });

    return res.json();
}

async function createIssue(issue) {
    const res = await fetch(`${API_BASE}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issue })
    });

    console.log("ISSUE PAYLOAD:", { issue });

    return res.json();
}

document.addEventListener("DOMContentLoaded", () => {
    loadProjects();

    const form = document.getElementById("bugForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const files = Array.from(document.getElementById("screenshots").files);
        const uploads = [];

        for (const f of files) {
            const up = await uploadFile(f);
            uploads.push({
                token: up.upload.token,
                filename: f.name,
                content_type: f.type,
            });
        }

        const bug = {

            expected: expected.value,
            actual: actual.value,
            reproductionSteps: repro.value,
            environment: {
                browser: browser.value,
                os: os.value,
                device: device.value
            }
        };

        const description = bugToMarkdown(bug);

        const issue = {
            subject: `Bug report – ${testCase.value}`,
            project_id: parseInt(document.getElementById("projectSelect").value),
            tracker_id: 1,
            priority_id: mapPriority(document.getElementById("priority").value),
            status_id: 1,
            description: description,
            assigned_to_id: parseInt(document.getElementById("assigneeSelect").value) || undefined,
            uploads
        };

        form.reset();
        document.getElementById("projectSelect").selectedIndex = -1;

        const result = await createIssue(issue);

        if (result.issue) {
            document.getElementById("result").innerText =
                `✔ Issue ID: ${result.issue.id}`;
        } else {
            document.getElementById("result").innerText =
                `❌ Hiba történt (status: ${result.status})`;
        }
    });

    function mapPriority(p) {
        switch (p) {
            case "high": return 3;
            case "medium": return 2;
            case "low": return 1;
            default: return 3;
        }
    }

    document.getElementById("projectSelect").addEventListener("change", async () => {
        const projectId = document.getElementById("projectSelect").value;
        const res = await fetch(`${API_BASE}/projects/${projectId}/users`);
        const data = await res.json();

        const assigneeSelect = document.getElementById("assigneeSelect");
        assigneeSelect.innerHTML = '<option value="">-- válassz felelőst --</option>';

        data.users.forEach(u => {
            const opt = document.createElement("option");
            opt.value = u.id;
            opt.textContent = u.name;
            assigneeSelect.appendChild(opt);

            const option = document.getElementById("assigneeSelect");
            option.querySelector("option[value='']").disabled = true;
        });
    });
});