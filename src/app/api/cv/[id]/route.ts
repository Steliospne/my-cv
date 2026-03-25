import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidateTag } from 'next/cache'

const itemSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  period: z.string(),
  details: z.string(),
})

const sectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.enum(['experience', 'education', 'projects', 'skills', 'languages']),
  sortOrder: z.number().int().nonnegative(),
  items: z.array(itemSchema),
})

const cvSchema = z.object({
  id: z.string(),
  fullName: z.string().min(1),
  headline: z.string().min(1),
  email: z.string().min(1),
  phone: z.string().min(1),
  location: z.string().min(1),
  summary: z.string().min(1),
  githubUrl: z.string(),
  linkedinUrl: z.string(),
  sections: z.array(sectionSchema),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await request.json()
  const parsed = cvSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid CV payload', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const data = parsed.data

  if (data.id !== id) {
    return NextResponse.json(
      { message: 'Path id does not match payload id.' },
      { status: 400 },
    )
  }

  const existingCv = await prisma.cv.findUnique({
    where: { id },
    select: {
      id: true,
      sections: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!existingCv) {
    return NextResponse.json({ message: 'CV not found.' }, { status: 404 })
  }

  const ownedSectionIds = new Set(
    existingCv.sections.map((section) => section.id),
  )
  const hasInvalidSection = data.sections.some(
    (section) => !ownedSectionIds.has(section.id),
  )

  if (hasInvalidSection) {
    return NextResponse.json(
      { message: 'One or more sections do not belong to this CV.' },
      { status: 400 },
    )
  }

  await prisma.$transaction(async (tx) => {
    await tx.cv.update({
      where: { id },
      data: {
        fullName: data.fullName,
        headline: data.headline,
        email: data.email,
        phone: data.phone,
        location: data.location,
        summary: data.summary,
        githubUrl: data.githubUrl,
        linkedinUrl: data.linkedinUrl,
      },
    })

    for (const [index, section] of data.sections.entries()) {
      await tx.cvSection.updateMany({
        where: { id: section.id, cvId: id },
        data: {
          title: section.title,
          sortOrder: index,
          items: section.items,
        },
      })
    }
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const existingCv = await prisma.cv.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!existingCv) {
    return NextResponse.json({ message: 'CV not found.' }, { status: 404 })
  }

  await prisma.cv.delete({
    where: { id },
  })

  revalidateTag('cvs', { expire: 0 })

  return NextResponse.json({ ok: true })
}
