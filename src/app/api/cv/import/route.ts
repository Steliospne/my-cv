import Ajv2020 from "ajv/dist/2020";
import { NextResponse } from "next/server";
import { createCvFromImport } from "@/lib/cv-data";
import type { CvImportPayload } from "@/lib/cv-data";
import cvImportSchema from "@/lib/schemas/cv-import.schema.json";

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validateImport = ajv.compile(cvImportSchema);

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  if (!payload) {
    return NextResponse.json(
      { message: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const isValid = validateImport(payload);
  if (!isValid) {
    return NextResponse.json(
      {
        message: "Import payload does not match schema.",
        issues: validateImport.errors ?? [],
      },
      { status: 400 },
    );
  }

  const created = await createCvFromImport(payload as CvImportPayload);
  return NextResponse.json({ id: created.id }, { status: 201 });
}
