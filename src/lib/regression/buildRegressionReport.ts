import mergeRuns from "./mergeRuns";
import regressionToMarkdown from "./regressionToMarkdown";
import markdownToHtml from "@/lib/markdownToHtml";
import { RunSummary } from "@/lib/runMarkdownToSummary";

export default function buildRegressionReport(
    runs: RunSummary[]
) {
    const regression = mergeRuns(runs);
    const markdown = regressionToMarkdown(regression);
    const html = markdownToHtml(markdown);

    return {
        regression,
        markdown,
        html
    };
}
