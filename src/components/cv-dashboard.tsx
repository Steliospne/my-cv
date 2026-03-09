'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type ChangeEvent } from 'react'
import type { CvListItem } from '@/lib/cv-types'

type CvDashboardProps = {
  cvs: CvListItem[]
}

export function CvDashboard({ cvs }: CvDashboardProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [showImportPanel, setShowImportPanel] = useState(false)

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

  const importFromJsonObject = async (payload: unknown) => {
    setImportError(null)
    setIsImporting(true)

    try {
      const response = await fetch('/api/cv/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = (await response.json().catch(() => null)) as
        | {
            id?: string
            message?: string
            issues?: Array<{ instancePath?: string; message?: string }>
          }
        | null

      if (!response.ok || !data?.id) {
        const firstIssue = data?.issues?.[0]
        const issueHint = firstIssue
          ? `${firstIssue.instancePath || '/'} ${firstIssue.message || ''}`.trim()
          : null
        throw new Error(issueHint || data?.message || 'Import failed.')
      }

      setShowImportPanel(false)
      setImportText('')
      router.push(`/cv/${data.id}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed.'
      setImportError(message)
    } finally {
      setIsImporting(false)
    }
  }

  const handlePasteImport = async () => {
    if (!importText.trim()) {
      setImportError('Paste JSON content first.')
      return
    }

    try {
      const parsed = JSON.parse(importText) as unknown
      await importFromJsonObject(parsed)
    } catch (error) {
      if (error instanceof SyntaxError) {
        setImportError('Invalid JSON format. Please fix and try again.')
        return
      }

      const message = error instanceof Error ? error.message : 'Import failed.'
      setImportError(message)
    }
  }

  const handleFileImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const content = await file.text()
    setImportText(content)

    try {
      const parsed = JSON.parse(content) as unknown
      await importFromJsonObject(parsed)
    } catch (error) {
      if (error instanceof SyntaxError) {
        setImportError('Uploaded file is not valid JSON.')
        return
      }

      const message = error instanceof Error ? error.message : 'Import failed.'
      setImportError(message)
    } finally {
      event.target.value = ''
    }
  }

  return (
    <>
      <div className='mb-5 flex items-center justify-end'>
        <button
          type='button'
          onClick={() => setShowImportPanel((prev) => !prev)}
          className='rounded-full border border-(--line) bg-(--panel) px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-(--muted-strong) transition hover:border-(--accent) hover:text-(--ink)'
        >
          {showImportPanel ? 'Hide Import' : 'Import JSON CV'}
        </button>
      </div>

      {showImportPanel ? (
        <section className='mb-6 rounded-3xl border border-(--line) bg-(--panel) p-5 shadow-(--card-shadow)'>
          <h3 className='font-heading text-2xl text-(--ink)'>Import CV from JSON</h3>
          <p className='mt-2 text-sm text-(--muted-strong)'>
            Paste JSON text or upload a <code>.json</code> file. The payload is validated against a Draft 2020-12 schema.
          </p>

          <div className='mt-4 flex flex-wrap gap-3'>
            <label className='rounded-full border border-(--line) px-4 py-2 text-xs font-semibold uppercase tracking-[0.11em] text-(--muted-strong) transition hover:border-(--accent) hover:text-(--ink)'>
              Upload JSON File
              <input
                type='file'
                accept='application/json,.json'
                onChange={handleFileImport}
                className='hidden'
              />
            </label>
            <button
              type='button'
              onClick={handlePasteImport}
              disabled={isImporting}
              className='rounded-full border border-(--line) px-4 py-2 text-xs font-semibold uppercase tracking-[0.11em] text-(--muted-strong) transition hover:border-(--accent) hover:text-(--ink) disabled:opacity-50'
            >
              {isImporting ? 'Importing...' : 'Import Pasted JSON'}
            </button>
          </div>

          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            className='form-textarea mt-4 min-h-52'
            placeholder='Paste CV JSON here...'
          />

          {importError ? (
            <p className='mt-3 text-sm text-rose-700'>Import error: {importError}</p>
          ) : null}
        </section>
      ) : null}

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
    </>
  )
}
