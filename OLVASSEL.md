# 🧪 Tesztmenedzser rendszer

**Verzió:** 1.1
**Állapot:** aktív fejlesztés 🚧

----------

## 1️⃣ Bevezetés – mi ez az egész?

A Tesztmenedzser egy **modern, Git-alapú tesztmenedzsment rendszer**, amelynek célja:

-   🧑‍💻 **Fejlesztőknek:** átlátható bugok, visszakövethető változások

-   🧪 **Tesztelőknek:** strukturált tesztelés, Markdown-alapú dokumentáció

-   📊 **Stakeholdereknek:** érthető állapot, riportok, exportálható eredmények

## Mi nem?

Ez a rendszer:

-   nem akar Jira lenni

-   nem akar mindent tudni

-   **csak azt csinálja, és azt is jól, ami fontos**

> _Tesztelés, átláthatóság, bizalom._


🎯 **Alapelv:**

> _A tesztelési adatok ne egy zárt eszközben éljenek, hanem verziózva, átláthatóan, auditálhatóan._

Ezért:

-   a bugok **Markdown fájlok**

-   a forrás **GitHub repository**

-   az UI csak „ablak” erre az adatra


----------

## 2️⃣ Ki, mit talál itt?

| Szerep| Számára fontos|
|--|--|
| 🧪 Tesztelő| Hogyan keletkezik bug, hogyan jelenik meg|
|🧑‍💻 Fejlesztő| Architektúra, API-k, adatmodell|
|📦 Stakeholder:|Hol tartunk, mi kész, mi jön|
|🧭 Új belépő|Gyors kép a rendszer egészéről|

> Fejlesztőknek bővebben: [Fejlesztői kézikönyv](./developer_manual.md)

----------

## 3️⃣ Hol tart MOST? (v1.1) 📍

### ✔️ Ami már működik

-   Termék-alapú bugkezelés

-   Bug lista oldal

-   Bug részletező oldal

-   GitHub-alapú tárolás

-   Markdown → strukturált adat konverzió

-   API réteg (Next.js App Router)

-   Jogosultság (Auth / NextAuth)

----------

## 4️⃣ Fő koncepciók

### 🧩 Termék (Product)

A termék a **vezérfonal**.

> Amit a dashboardon kiválasztasz, az **minden további oldalon meghatározza megjelenő adatokat**:

-   bug lista

-   bug részletek

-   futások

-   riportok


----------

### 🐞 Bug = mappa + markdown

Egy bug **nem adatbázis rekord**, hanem:

```
bugs/
 └─ webshop/
    └─ BUG-2025-001/
       ├─ bug.md
       ├─ screenshot.png
       └─ log.txt
```


📄 `bug.md` tartalmazza:

-   státusz

-   súlyosság

-   felelős

-   leírás

-   lépések

-   elvárt / tényleges eredmény


----------

## 5️⃣ Technikai architektúra 🧑‍💻

### Stack

-   ⚛️ Next.js (App Router)

-   📦 TypeScript

-   🔐 NextAuth

-   🐙 GitHub REST API

-   📝 Markdown parsing

-   📄 PDF export


----------


### Mappa-stratégia

| Mappa| Szerep|
|--|--|
| app/api | Backend API|
|`app/bugs`|UI oldalak|
|`lib/`|üzleti logika|
|`types/`|típusdefiníciók|
|`components/`|újrahasznosítható UI|

----------

## 6️⃣ Bug adatmodell (logikai)

```
BugItem {
id: string
product: string
createdAt: string
severity: "blocker" | "critical" | "major" | "minor"  status: "open" | "closed"
assignee?: string
markdown: string
}
```

----------

## 7️⃣ API filozófia

### Az API nem „okos”, mert:

-   csak **olvas**

-   csak **konvertál**

-   nem tárol állapotot


### Példák

| Endpoint| Mit csinál|
|--|--|
|`/api/bugs`|bug lista|
|`/api/bugs/view`|egy bug|
|`/api/bug-upload`|új bug|
|`/api/github-issue`|issue sync|

----------

## 8️⃣ Tesztelési szemlélet 🧪

### Mit nyer a tesztelő?

-   Nem kell Jira

-   Nem kell egy vagy több külön tool

-   Minden bug **verziózott**

-   Visszanézhető változások

-   Pull Request-ben véleményezhető


📌 **Mert a tesztelés ≠ adminisztráció!**

----------

## 9️⃣ Stakeholder nézőpontból 📊

### Mit lát majd a vezetés?

-   mennyi nyitott bug van

-   melyik termék problémás

-   mikor romlott a minőség

-   exportálható PDF riport

💬 _„Nem érdekel a technológia, csak az állapot.”_
→ a rendszer ezt az igényt igyekszik kiszolgálni.

## 🔟 Roadmap 🗺️

Tervek a jövőre

### 🚀 v1.2 – Bug lista tuning

-   🔍 Szűrés (státusz, súlyosság, felelős)

-   ↕️ Rendezés

-   💾 URL-alapú állapot

---

### 🚀 v1.3 – Workflow

-   ✍️ Bug szerkesztés

-   🔄 Státusz váltás

-   🐙 GitHub Issue sync (2-way)

---

### 🚀 v1.4 – Riport & history

-   📈 Trendek

-   🧾 Riport sablonok

-   📤 Export (PDF, MD)

---

### 🚀 v.1.5 - CI - CD

- 🤖 GitHub Actions

- 🏗️ Automatikus build

- 📝 Markdown lint

- 📊 Regresszió riport generálás

- 🧪 Minőségkapu

- 🔔 CI visszajelzés – státusz GitHub PR-on

---

### 🚀 v2.0 – Multi-user 🌍

-   👥 Csapatkezelés

-   🔐 Role-ok

-   🧠 Okos dashboard

----------


## 1️⃣1️⃣ ⚙️ Telepítés és futtatás

Ez a fejezet végigvezet azon, hogyan lehet a Tesztmenedzsert helyben futtatni, fejleszteni vagy kipróbálni/tesztelni.

Nem szükséges mély Next.js tudás, csak alap fejlesztői környezetet.

### 1️⃣ Előfeltételek 🧩
Kötelező eszközök

|Eszköz	| Verzió|
|--|--|
| Node.js| 18.x vagy újabb, npm	Node-dal együtt
|Git |	bármely friss|
GitHub fiók	API eléréshez

📌 Ajánlott:

VS Code

GitHub CLI (gh)

### 2️⃣ Projekt letöltése 📥
```
git clone https://github.com//Hyacinto/ESZFK-AMI-Test-Manager.git
cd tesztmenedzser
```

📦 A repository tartalmaz minden szükséges kódot, nincs külön backend.

### 3️⃣ Függőségek telepítése 📦
```
npm install
```
Ez telepíti:

- Next.js

- NextAuth

- Markdown feldolgozókat

- PDF export könyvtárakat

⏱️ Első futtatáskor ez 1–2 perc is lehet.

### 4️⃣ Környezeti változók (.env.local) 🔐

A projekt nem indul el megfelelő .env.local nélkül.

Hozd létre a gyökérben:
```
.env.local
```

Kötelező változók
```
# GitHub

GITHUB_OWNER=your-org
GITHUB_REPO="ESZFK-AMI-Test-Manager"
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=
NEXT_PUBLIC_GITHUB_CLIENT_ID=

# Auth
NEXTAUTH_SECRET=super-secret-string
NEXTAUTH_URL=http://localhost:3000
```

**Token létrehozása GitHubon 🛠️**

Lépések:

1. GitHub → Settings

2. Developer settings

3. Personal access tokens

4. Fine-grained tokens

5. ➕ Generate new token

**Token alapbeállítások**

|Mező	|Érték|
|--|--|
|Token name|	tesztmenedzser-dev|
|Expiration|	30–90 nap|
|Resource owner|	saját user vagy org|
Repository access	|**Only selected repositories**|

✔️ Válaszd ki azt a repo-t, ahol a bugs/ mappa van.

**Szükséges jogosultságok 🔐**

*Repository permissions*

|Jogosultság|	Szint|
|--|--|
|Contents	|Read and write|
|Metadata	|Read|
|Issues (opcionális)|	Read & write|

📌 A Minimum működéshez ➡️ Contents: Read

📌 Bug létrehozáshoz / frissítéshez ➡️ Contents: Read & Write

**Token elmentése biztonságosan 🔒**

⚠️ A tokent csak egyszer látod!
Másold ki azonnal.

.env.local
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxx

❌ SOHA:

- NE commitold

- NE oszd meg chatben

- NE tedd frontendbe

**NEXTAUTH_SECRET létrehozása 🔐**

Ez egy:

- session titkosítás

- cookie aláírás

- auth biztonság

Generálása:
```
openssl rand -base64 32
```

Majd:

NEXTAUTH_SECRET=generated-secret

⚠️ Amit NEXT_PUBLIC_-tel kezdesz, az látszik a böngészőben!⚠️


**Token rotáció & lejárat 🔁**

Ajánlott gyakorlat:

- ⏱️ 30–90 napos lejárat

- 🔄 rendszeres csere

- 🧹 régi token törlés

Ha lejár:

- API 401 / 403 hibát dob

- bug lista nem töltődik be

**Gyakori hibák 🚨**

❌ 403 Forbidden

A Token nem fér hozzá a repo-hoz

❌ 404 Not Found

A Repo létezik, de nincs jogosultság

❌ Works locally, fails on prod

A Prod env-ben nincs beállítva secret

🔐 **Fontos biztonsági szabályok**

- GitHub tokennek repo jogosultság kell

- .env.local soha ne kerüljön commitra

- production környezetben külön secret-ek


### 5️⃣ Fejlesztői mód indítása 🚀

```
npm run dev
```

Ez elindítja:

- UI-t

- API route-okat

- Markdown → adat konverziót

🌍 Elérés:

http://localhost:3000

### 6️⃣ Tipikus első lépések 👣
#### 1️⃣ Bejelentkezés

GitHub / Auth provider

Session kezelés automatikus

#### 2️⃣ Termék kiválasztás

A Dashboard oldalon, ami Tesztmenedzser kezdőlapja is egyben.

Ez meghatároz minden további oldalt

Jelenleg csak egy termékret tartalmaz a rendszer: teszt.md

#### 3️⃣ További termék(ek) hozzáadása:

http://localhost:3000/editor

### 7️⃣ Gyakori hibák és megoldások 🧯

❌ **„Bug not found”**

Ellenőrizd:

- helyes product paraméter

- GitHub mappa létezik

- token jogosultság

❌ **raw.map is not a function**

Az API nem tömböt ad vissza
➡️ mindig ellenőrizd:
```
Array.isArray(data)
```

❌ **Auth loop / 401**

A NEXTAUTH_URL egyezzen az aktuális host-tal

### 8️⃣ Build & production futtatás 🏗️
Build
```
npm run build
```

Production indítás
```
npm start
```

📌 Production módban:

- nincs hot reload

- gyorsabb API válaszok


### 9️⃣ Fejlesztési ajánlások 🧠

- 🔄 Kis commitok

- 📝 Markdown változás PR-ben

- 🧪 API route tesztelés Postman-nel

- 🔍 Console log fejlesztéskor

### 🔟 Gyors ellenőrzőlista ✅
| Ellenőrzés|	OK|
|--|--|
|Node 18+	|⬜
|.env.local	|⬜
|GitHub token|	⬜
|npm run dev|	⬜
|/bugs oldal betölt|	⬜

🎯 **Zárás**

Ha idáig eljutottál, akkor:

- a rendszer fut

- a GitHub integráció él

- a fejlesztés és/vagy tesztelés elkezdhető

🚀 **Innen már csak rajtad múlik.**



