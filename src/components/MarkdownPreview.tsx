import ReactMarkdown from "react-markdown";

interface Props {
    markdown: string;
}

export default function MarkdownPreview({ markdown }: Props) {
    return (
        <div className="prose max-w-none text-sm">
            <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
    );
}
