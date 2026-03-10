import { renderToBuffer } from "@react-pdf/renderer";
import { CvPdfDocument } from "@/lib/cv-pdf";
import { serializeCv } from "@/lib/cv-actions";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cv = await serializeCv(id);

  if (!cv) {
    return new Response("CV not found", { status: 404 });
  }

  const pdfDocument = CvPdfDocument({ cv }) as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(pdfDocument);
  const sanitizedName = cv.fullName.trim().toLowerCase().replaceAll(" ", "-");
  const filename = `${sanitizedName || "cv"}-cv.pdf`;
  const shouldPreview = new URL(request.url).searchParams.get("preview") === "1";

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${shouldPreview ? "inline" : "attachment"}; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
