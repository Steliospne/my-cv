import cvImportSchema from '@/lib/schemas/cv-import.schema.json'

export async function GET() {
  return Response.json(cvImportSchema)
}
