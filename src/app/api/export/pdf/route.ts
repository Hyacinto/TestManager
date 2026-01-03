import { NextResponse } from "next/server";
import regressionToHtml from "@/lib/regressionToHtml";
import htmlToPdf from "@/lib/htmlToPdf";
import path from "node:path";
import fs from "node:fs/promises";

export async function POST(req: Request) {
    const regression = await req.json();

    const html = regressionToHtml(regression);

    const fileName = `regression-${Date.now()}.pdf`;
    const outputPath = path.join(process.cwd(), "exports", fileName);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    await htmlToPdf({
        html,
        outputPath,
        title: `Regression – ${regression.testCase}`
    });

    return NextResponse.json({
        file: fileName
    });
}
