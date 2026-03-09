'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { CvListItem } from '@/lib/cv-types'

type CvDashboardProps = {
  cvs: CvListItem[]
}

export function CvDashboard({ cvs }: CvDashboardProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const deleteCv = async (cvId: string, fullName: string) => {
    const shouldDelete = window.confirm(
      `Delete "${fullName || 'Untitled CV'}"? This action cannot be undone.`,
    )

    if (!shouldDelete) {
      return
    }

    try {
      setDeletingId(cvId)
      const response = await fetch(`/api/cv/${cvId}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Delete failed')
      }
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className='grid gap-4 md:grid-cols-2'>
      {cvs.map((cv) => (
        <article
          key={cv.id}
          className='rounded-3xl border border-(--line) bg-(--panel) p-5 shadow-(--card-shadow) transition hover:-translate-y-0.5 hover:border-(--accent)'
        >
          <p className='text-xs uppercase tracking-[0.14em] text-(--muted)'>
            Saved CV
          </p>
          <h2 className='mt-1 font-heading text-2xl text-(--ink)'>
            {cv.fullName}
          </h2>
          <p className='mt-1 text-sm text-(--muted-strong)'>{cv.headline}</p>
          <p className='mt-4 text-xs uppercase tracking-[0.11em] text-(--muted)'>
            Last updated {new Date(cv.updatedAt).toLocaleString()}
          </p>
          <div className='mt-4 flex items-center gap-2'>
            <Link
              href={`/cv/${cv.id}`}
              className='rounded-full border border-(--line) px-4 py-2 text-xs font-semibold uppercase tracking-[0.11em] text-(--muted-strong) transition hover:border-(--accent) hover:text-(--ink)'
            >
              Edit
            </Link>
            <button
              type='button'
              onClick={() => deleteCv(cv.id, cv.fullName)}
              disabled={deletingId === cv.id}
              className='rounded-full border border-rose-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.11em] text-rose-700 transition hover:bg-rose-50 disabled:opacity-50'
            >
              {deletingId === cv.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </article>
      ))}
    </section>
  )
}
