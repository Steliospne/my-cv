'use client'

import { useMemo, useState, useTransition } from 'react'
import type { CvDocument } from '@/lib/cv-types'
import { CvPreview } from '@/components/cv-preview'
import { formatFilename } from '@/lib/utils/format-filename'
import { generateRandomString } from '@/lib/utils/generate-random-string'

type CvBuilderProps = {
  initialCv: CvDocument
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const createItem = () => ({
  id: crypto.randomUUID(),
  title: '',
  subtitle: '',
  period: '',
  details: '',
})

const autoResizeTextarea = (element: HTMLTextAreaElement | null) => {
  if (!element) return
  element.style.height = 'auto'
  element.style.height = `${element.scrollHeight}px`
}

export function CvBuilder({ initialCv }: CvBuilderProps) {
  const [cv, setCv] = useState<CvDocument>(initialCv)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [pdfState, setPdfState] = useState<'idle' | 'downloading' | 'error'>(
    'idle',
  )
  const [isPending, startTransition] = useTransition()

  const saveLabel = useMemo(() => {
    if (saveState === 'saving' || isPending) return 'Saving...'
    if (saveState === 'saved') return 'Saved'
    if (saveState === 'error') return 'Retry save'
    return 'Save changes'
  }, [isPending, saveState])

  const persistCv = async (): Promise<boolean> => {
    const response = await fetch(`/api/cv/${cv.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cv),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      const firstIssue = payload?.issues?.[0]
      const issuePath =
        Array.isArray(firstIssue?.path) && firstIssue.path.length > 0
          ? String(firstIssue.path[firstIssue.path.length - 1])
          : null
      setSaveMessage(
        issuePath
          ? `Please check "${issuePath}".`
          : 'Save failed. Please review fields.',
      )
      return false
    }

    setSaveMessage('All changes saved.')
    return true
  }

  const saveCv = () => {
    setSaveState('saving')
    setSaveMessage(null)
    startTransition(async () => {
      const ok = await persistCv()
      setSaveState(ok ? 'saved' : 'error')
    })
  }

  const updateHeader =
    (
      field: keyof Pick<
        CvDocument,
        'fullName' | 'headline' | 'email' | 'phone' | 'location' | 'summary'
      >,
    ) =>
    (value: string) => {
      setSaveState('idle')
      setSaveMessage(null)
      setCv((prev) => ({ ...prev, [field]: value }))
    }

  const updateItem = (
    sectionId: string,
    itemId: string,
    field: 'title' | 'subtitle' | 'period' | 'details',
    value: string,
  ) => {
    setSaveState('idle')
    setSaveMessage(null)
    setCv((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, [field]: value } : item,
              ),
            }
          : section,
      ),
    }))
  }

  const addItem = (sectionId: string) => {
    setSaveState('idle')
    setSaveMessage(null)
    setCv((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? { ...section, items: [...section.items, createItem()] }
          : section,
      ),
    }))
  }

  const removeItem = (sectionId: string, itemId: string) => {
    setSaveState('idle')
    setSaveMessage(null)
    setCv((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.filter((item) => item.id !== itemId),
            }
          : section,
      ),
    }))
  }

  const moveItem = (
    sectionId: string,
    itemId: string,
    direction: 'up' | 'down',
  ) => {
    setSaveState('idle')
    setSaveMessage(null)
    setCv((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id !== sectionId) return section

        const index = section.items.findIndex((item) => item.id === itemId)
        if (index < 0) return section

        const swapIndex = direction === 'up' ? index - 1 : index + 1
        if (swapIndex < 0 || swapIndex >= section.items.length) return section

        const items = [...section.items]
        ;[items[index], items[swapIndex]] = [items[swapIndex], items[index]]
        return { ...section, items }
      }),
    }))
  }

  const downloadPdf = async () => {
    setPdfState('downloading')
    setSaveState('saving')
    setSaveMessage(null)

    try {
      const didSave = await persistCv()
      if (!didSave) {
        setSaveState('error')
        setPdfState('error')
        return
      }

      setSaveState('saved')
      const response = await fetch(`/cv/${cv.id}/pdf`)
      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const cvFullname = formatFilename(cv.fullName, 'cv')
      const cvHeadline = formatFilename(
        cv.headline,
        generateRandomString({ length: 8, mode: 'numeric' }),
      )
      const filename = `${cvFullname}-${cvHeadline}.pdf`

      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      setPdfState('idle')

      if (window.confirm('PDF downloaded. Do you want to preview it now?')) {
        window.open(
          `/cv/${cv.id}/pdf?preview=1`,
          '_blank',
          'noopener,noreferrer',
        )
      }
    } catch {
      setPdfState('error')
    }
  }

  return (
    <main className='h-full'>
      <div className='grid h-full w-full gap-4 xl:grid-cols-[minmax(360px,500px)_1fr]'>
        <section className='flex h-full min-h-0 flex-col rounded-3xl border border-(--line) bg-(--panel) p-6 shadow-(--card-shadow)'>
          <div className='mb-6 flex items-center justify-between'>
            <div>
              <p className='text-xs uppercase tracking-[0.14em] text-(--muted)'>
                One Template
              </p>
              <h1 className='mt-1 font-heading text-3xl text-(--ink)'>
                CV Studio
              </h1>
            </div>
            <button
              type='button'
              className='rounded-full border border-(--line) px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-(--muted-strong) transition hover:border-(--accent) hover:text-(--ink)'
              onClick={downloadPdf}
              disabled={pdfState === 'downloading'}
            >
              {pdfState === 'downloading' ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>

          <div className='scroll-panel min-h-0 flex-1 overflow-y-auto pr-2'>
            <div className='space-y-3'>
              <label className='form-label'>
                Full Name
                <input
                  className='form-input'
                  value={cv.fullName}
                  onChange={(event) =>
                    updateHeader('fullName')(event.target.value)
                  }
                />
              </label>
              <label className='form-label'>
                Headline
                <input
                  className='form-input'
                  value={cv.headline}
                  onChange={(event) =>
                    updateHeader('headline')(event.target.value)
                  }
                />
              </label>
              <label className='form-label'>
                Email
                <input
                  className='form-input'
                  value={cv.email}
                  onChange={(event) =>
                    updateHeader('email')(event.target.value)
                  }
                />
              </label>
              <label className='form-label'>
                Phone
                <input
                  className='form-input'
                  value={cv.phone}
                  onChange={(event) =>
                    updateHeader('phone')(event.target.value)
                  }
                />
              </label>
              <label className='form-label'>
                Location
                <input
                  className='form-input'
                  value={cv.location}
                  onChange={(event) =>
                    updateHeader('location')(event.target.value)
                  }
                />
              </label>
              <label className='form-label'>
                Summary
                <textarea
                  className='form-textarea'
                  rows={4}
                  value={cv.summary}
                  onChange={(event) =>
                    updateHeader('summary')(event.target.value)
                  }
                />
              </label>
            </div>

            <div className='mt-8 space-y-6'>
              {cv.sections.map((section) => (
                <article
                  key={section.id}
                  className='rounded-2xl border border-(--line) p-4'
                >
                  <div className='mb-4 flex items-center justify-between'>
                    <div>
                      <h2 className='font-heading text-xl text-(--ink)'>
                        {section.title}
                      </h2>
                    </div>
                    <button
                      type='button'
                      onClick={() => addItem(section.id)}
                      className='rounded-full border border-(--line) px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition hover:border-(--accent) hover:text-(--ink)'
                    >
                      Add Item
                    </button>
                  </div>

                  <div className='space-y-4'>
                    {section.items.map((item, index) => (
                      <div
                        key={item.id}
                        className='rounded-xl bg-(--panel-soft) p-3'
                      >
                        <div className='mb-3 flex items-center justify-between'>
                          <p className='text-xs uppercase tracking-[0.12em] text-(--muted)'>
                            Entry {index + 1}
                          </p>
                          <div className='flex gap-2'>
                            <button
                              type='button'
                              onClick={() =>
                                moveItem(section.id, item.id, 'up')
                              }
                              className='tiny-btn'
                              disabled={index === 0}
                            >
                              Up
                            </button>
                            <button
                              type='button'
                              onClick={() =>
                                moveItem(section.id, item.id, 'down')
                              }
                              className='tiny-btn'
                              disabled={index === section.items.length - 1}
                            >
                              Down
                            </button>
                            <button
                              type='button'
                              onClick={() => removeItem(section.id, item.id)}
                              className='tiny-btn tiny-btn-danger'
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className='grid gap-3'>
                          <label className='form-label'>
                            Title
                            <input
                              className='form-input'
                              value={item.title}
                              onChange={(event) =>
                                updateItem(
                                  section.id,
                                  item.id,
                                  'title',
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                          <label className='form-label'>
                            Subtitle
                            <input
                              className='form-input'
                              value={item.subtitle}
                              onChange={(event) =>
                                updateItem(
                                  section.id,
                                  item.id,
                                  'subtitle',
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                          <label className='form-label'>
                            Period
                            <input
                              className='form-input'
                              value={item.period}
                              onChange={(event) =>
                                updateItem(
                                  section.id,
                                  item.id,
                                  'period',
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                          <label className='form-label'>
                            Details (one bullet per line)
                            <textarea
                              rows={4}
                              className='form-textarea'
                              ref={autoResizeTextarea}
                              value={item.details}
                              onInput={(event) =>
                                autoResizeTextarea(event.currentTarget)
                              }
                              onChange={(event) =>
                                updateItem(
                                  section.id,
                                  item.id,
                                  'details',
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className='mt-5 flex shrink-0 items-center gap-3 border-t border-(--line) pt-4'>
            <button onClick={saveCv} type='button' className='save-btn'>
              {saveLabel}
            </button>
            {saveState === 'error' && !saveMessage && (
              <span className='text-xs uppercase tracking-[0.14em] text-rose-600'>
                Save failed
              </span>
            )}
            {saveMessage && saveState !== 'error' && (
              <span className='text-xs uppercase tracking-[0.14em] text-emerald-700'>
                {saveMessage}
              </span>
            )}
            {saveState === 'error' && saveMessage && (
              <span className='text-xs uppercase tracking-[0.14em] text-rose-600'>
                {saveMessage}
              </span>
            )}
            {pdfState === 'error' && (
              <span className='text-xs uppercase tracking-[0.14em] text-rose-600'>
                PDF download failed
              </span>
            )}
          </div>
        </section>

        <section className='h-full overflow-auto rounded-3xl border border-(--line) bg-(--panel) p-4 shadow-(--card-shadow)'>
          <CvPreview cv={cv} />
        </section>
      </div>
    </main>
  )
}
