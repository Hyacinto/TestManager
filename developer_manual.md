

# Tesztmenedzser – Fejlesztői kézikönyv

Ezen dokumentum célja, hogy új fejlesztők, QA-k és érdeklődők gyorsan megértsék a rendszer gondolkodásmódját, architektúráját és tervezési döntéseit.

## 1. Bevezetés

A Tesztmenedzser egy könnyűsúlyú, markdown-alapú teszt- és hibakezelő rendszer. Nem kíván, és nem is tud versenyezni a Jirával vagy a TestRaillel; célja egy átlátható, verziózott, GitHub-alapú workflow biztosítása manuális és félautomata teszteléshez.

A rendszer elsődleges felhasználói manuális tesztelők és kisebb fejlesztői csapatok, akik szeretnék a tesztelési artefaktumokat – teszteseteket, runokat, bugokat és riportokat – egy helyen, verziókövetetten tárolni.

## 2. Alapelvek

A rendszer tervezését néhány kulcsfontosságú alapelv határozza meg:

• Markdown-first gondolkodás
• GitHub mint adatforrás
• Product-központú működés
• Átláthatóság a funkcionalitás felett
• QA-barát szemlélet

## 3. Magas szintű architektúra

A Tesztmenedzser egy Next.js App Router alapú webalkalmazás, amely egyesíti a frontend UI-t és a backend API réteget.

Az architektúra három fő rétegre bontható:
1. UI réteg (React komponensek)
2. API réteg (Next.js route handlerek)
3. Adatréteg (GitHub repository, markdown fájlok)

## 4. GitHub mint adatbázis

A rendszer egyik legfontosabb tervezési döntése, hogy nem használ hagyományos adatbázist. Minden tartós adat a GitHub repository-ban él.

Ez a megközelítés egyszerre erősség és kompromisszum. Cserébe viszont minden adat verziózott, auditálható és fejlesztőbarát.

## 5. Bug életciklus

Egy bug tipikus életútja a rendszerben:

1. Teszt futás közben hiba jelentkezik
2. A BugReportModal megnyílik
3. A tesztelő rögzíti a bug részleteit
4. Létrejön a bug.md fájl GitHubon
5. Opcionálisan GitHub Issue is készül
6. A bug megjelenik a Bug List oldalon
7. A státusz GitHub Issue alapján frissül

## 6. Run és Suite koncepció

A Run egy teszteset vagy tesztkészlet egy konkrét lefutását reprezentálja. Ez a rendszer egyik legfontosabb építőeleme.

A Suite Run több Run összefoglalása, amely alapja a regresszióknak és riportoknak.

## 7. Regresszió

A regresszió célja két különböző suite run összehasonlítása. A rendszer nem csak azt mutatja meg, hogy mi romlott el, hanem azt is, hogy mi javult.

## 8. Auth és jogosultságok

Az autentikáció NextAuth segítségével történik. A cél nem a komplex jogosultsági rendszer, hanem az alapvető védelem.

## 9. Tipikus fejlesztői workflow

Egy új fejlesztő jellemző útja:

• Repo klónozása

• Környezeti változók beállítása

• Lokális futtatás

• Egy meglévő run vagy bug megértése

• Kis fejlesztés elvégzése

## 10. Mit NEM csinál?

A rendszer tudatosan nem tartalmaz:

• Relációs adatbázist

• Valós idejű kommunikációt

• Túlzottan komplex UI-t

## 11. Zárszó

A Tesztmenedzser egy tanítható, élő rendszer. A cél nem a tökéletesség, hanem az érthetőség és a fejlődőképesség.
