export default function bugToMarkdown(bug) {
    const attachments = bug.attachments || [];

    return `

# 🐞 ${bug.title}

## Elvárt eredmény
${bug.expected}

## Tényleges eredmény
${bug.actual}

## Reprodukció
${bug.reproductionSteps || "-"}

## Környezet
- Browser: ${bug.environment?.browser || "-"}
- OS: ${bug.environment?.os || "-"}
- Device: ${bug.environment?.device || "-"}

## Megjegyzések
${bug.notes || "-"}

`;
}