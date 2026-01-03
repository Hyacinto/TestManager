function markdownToJson(md) {
    const lines = md.split("\n");

    const data = {
        productName: "",
        testSuites: [],
        testCases: {}
    };

    let currentSuite = null;
    let currentTestCase = null;
    let currentSection = null;
    let inSuiteList = false;

    for (let rawLine of lines) {
        const line = rawLine.trim();

        // === Terméknév ===
        if (/^# .* #$/.test(line)) {
            data.productName = line.replace(/#/g, "").trim();
            continue;
        }

        // === Tesztkészletek blokk kezdete ===
        if (line === "## Tesztkészletek: ##") {
            inSuiteList = true;
            continue;
        }

        // === Tesztkészlet neve (csak a listában!) ===
        if (inSuiteList && /^### .*: ###$/.test(line)) {
            const name = line.replace(/###|: ###/g, "").trim();
            currentSuite = { name, cases: [] };
            data.testSuites.push(currentSuite);
            continue;
        }

        // === Teszteset felsorolás (CSAK hivatkozás) ===
        if (inSuiteList && line.startsWith("* ")) {
            const tcName = line.replace("* ", "").trim();
            currentSuite.cases.push(tcName);
            continue;
        }

        // === Kilépés a tesztkészletek listából ===
        if (
            inSuiteList &&
            /^## .* ##$/.test(line) &&
            !line.includes("Tesztkészletek")
        ) {
            inSuiteList = false;
        }

        // === Teszteset címe (ITT jön létre!) ===
        if (/^## .* ##$/.test(line)) {
            const tcName = line.replace(/#/g, "").trim();

            data.testCases[tcName] = {
                name: tcName,
                purpose: "",
                itemsToTest: "",
                method: "",
                input: "",
                precondition: "",
                steps: []
            };

            currentTestCase = data.testCases[tcName];
            currentSection = null;
            continue;
        }

        // === Szekciók ===
        const sectionMap = {
            "### Tesztelés célja: ###": "purpose",
            "### Tesztelendő elemek: ###": "itemsToTest",
            "### Tesztelés módszere: ###": "method",
            "### Felhasznált input: ###": "input",
            "### Teszt előfeltétel: ###": "precondition",
            "### Tesztlépések: ###": "steps"
        };

        if (sectionMap[line]) {
            currentSection = sectionMap[line];
            continue;
        }

        // === Tesztlépések ===
        const stepMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (currentSection === "steps" && stepMatch) {
            currentTestCase.steps.push({
                step: stepMatch[2],
                expected: ""
            });
            continue;
        }

        // === Elvárt output ===
        const expectedMatch = line.match(/^\*\*Elvárt output:\*\*(.*)/);
        if (currentSection === "steps" && expectedMatch) {
            const last = currentTestCase.steps.length - 1;
            if (last >= 0) {
                currentTestCase.steps[last].expected = expectedMatch[1].trim();
            }
            continue;
        }

        // === Többsoros szöveg mezők ===
        if (
            currentTestCase &&
            currentSection &&
            currentSection !== "steps" &&
            line.length > 0
        ) {
            currentTestCase[currentSection] +=
                (currentTestCase[currentSection] ? "\n" : "") + line;
        }
    }

    // === Utólagos tisztítás: csak létező tesztesetek maradnak a készletekben ===
    for (const suite of data.testSuites) {
        suite.cases = suite.cases.filter(tcName => data.testCases[tcName]);
    }

    return data;
}

export default markdownToJson;