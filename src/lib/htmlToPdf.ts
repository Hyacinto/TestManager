import { chromium } from "playwright";

type PdfOptions = {
    html: string;
    outputPath: string;
    title?: string;
};

export default async function htmlToPdf({
    html,
    outputPath,
    title
}: PdfOptions) {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.setContent(html, {
        waitUntil: "networkidle"
    });

    await page.pdf({
        path: outputPath,
        format: "A4",
        printBackground: true,
        displayHeaderFooter: !!title,
        headerTemplate: title
            ? `<div style="font-size:10px; margin-left:20px;">${title}</div>`
            : "<div></div>",
        footerTemplate: `
            <div style="font-size:10px; width:100%; text-align:center;">
                <span class="pageNumber"></span> / <span class="totalPages"></span>
            </div>
        `,
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    });

    await browser.close();
}
