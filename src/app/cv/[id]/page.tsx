import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CvBuilder } from '@/components/cv-builder'
import { serializeCv } from '@/lib/cv-data'

type CvPageProps = {
  params: Promise<{ id: string }>
}

export default async function CvPage({ params }: CvPageProps) {
  const { id } = await params
  const cv = await serializeCv(id)

  if (!cv) {
    notFound()
  }

  return (
    <main className='h-screen overflow-hidden px-4 py-4 md:px-6 md:py-6'>
      <div className='mx-auto flex h-full max-w-[1450px] flex-col gap-3'>
        <div className='shrink-0'>
          <Link
            href='/'
            className='inline-flex rounded-full border border-(--line) bg-(--panel) px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-(--muted-strong) transition hover:border-(--accent) hover:text-(--ink)'
          >
            Back To Dashboard
          </Link>
        </div>
        <div className='min-h-0 flex-1'>
          <CvBuilder initialCv={cv} />
        </div>
      </div>
    </main>
  )
}
