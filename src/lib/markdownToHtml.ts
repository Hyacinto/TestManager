import { marked } from "marked";

export default function markdownToHtml(md: string): string {
    return `
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="utf-8" />
    <title>Regresszió riport</title>
    <style>
        body {
            font-family: system-ui, sans-serif;
            padding: 2rem;
            max-width: 1000px;
            margin: auto;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 1rem;
        }
        th, td {
            border: 1px solid #ccc;
            padding: .5rem;
            text-align: center;
        }
        th {
            background: #f3f3f3;
        }
        tr:nth-child(even) {
            background: #fafafa;
        }
    </style>
</head>
<body>
${marked.parse(md)}
</body>
</html>
`;
}
