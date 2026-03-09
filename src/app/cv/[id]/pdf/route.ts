import { renderToBuffer } from "@react-pdf/renderer";
import { CvPdfDocument } from "@/lib/cv-pdf";
import { serializeCv } from "@/lib/cv-data";
import { createElement } from "react";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cv = await serializeCv(id);

  if (!cv) {
    return new Response("CV not found", { status: 404 });
  }

  const buffer = await renderToBuffer(createElement(CvPdfDocument, { cv }));
  const sanitizedName = cv.fullName.trim().toLowerCase().replaceAll(" ", "-");
  const filename = `${sanitizedName || "cv"}-cv.pdf`;
  const shouldPreview = new URL(request.url).searchParams.get("preview") === "1";

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${shouldPreview ? "inline" : "attachment"}; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
