from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import requests

REDMINE_URL = "http://localhost:3000"
API_KEY = ""

app = FastAPI()

# Dev CORS (frontendhez)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Projektek
# ---------------------------
@app.get("/projects")
def get_projects():
    r = requests.get(
        f"{REDMINE_URL}/projects.json",
        headers={"X-Redmine-API-Key": API_KEY}
    )
    return r.json()


# ---------------------------
# Fájl feltöltés
# ---------------------------
@app.post("/upload")
def upload_file(file: UploadFile = File(...)):
    content = file.file.read()

    r = requests.post(
        f"{REDMINE_URL}/uploads.json",
        headers={
            "X-Redmine-API-Key": API_KEY,
            "Content-Type": "application/octet-stream"
        },
        data=content
    )

    return r.json()


# ---------------------------
# Issue létrehozás
# ---------------------------
@app.post("/issues")
def create_issue(data: dict):
    r = requests.post(
        f"{REDMINE_URL}/issues.json",
        headers={
            "X-Redmine-API-Key": API_KEY,
            "Content-Type": "application/json"
        },
        json=data  # teljes body megy tovább
    )

    print("STATUS:", r.status_code)
    print("TEXT:", r.text)

    if r.text and r.status_code:
        return {"status": r.status_code,"text": r.text}
    else:
        return {"status": r.status_code}

# ---------------------------
# Projekthez tartozó felhasználók
# ---------------------------
@app.get("/projects/{project_id}/users")
def get_project_users(project_id: int):
    r = requests.get(
        f"{REDMINE_URL}/projects/{project_id}/memberships.json",
        headers={"X-Redmine-API-Key": API_KEY}
    )

    data = r.json()
    memberships = data.get("memberships", [])

    users = []

    for m in memberships:
        user = m.get("user")
        if user:
            users.append({
                "id": user["id"],
                "name": user["name"]
            })

    return {"users": users}