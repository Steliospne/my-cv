import type { CvDocument } from '@/lib/cv-types'

type CvPreviewProps = {
  cv: CvDocument
}

const splitDetails = (details: string): string[] =>
  details
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

const isItemEmpty = (item: {
  title: string
  subtitle: string
  period: string
  details: string
}) =>
  [item.title, item.subtitle, item.period, item.details].every(
    (field) => field.trim().length === 0,
  )

const shouldRenderSection = (section: CvDocument['sections'][number]) => {
  if (section.kind !== 'projects') {
    return true
  }

  return section.items.some((item) => !isItemEmpty(item))
}

export function CvPreview({ cv }: CvPreviewProps) {
  return (
    <section className='a4-sheet mx-auto'>
      <header className='border-b border-(--line) pb-6'>
        <h1 className='font-heading text-3xl tracking-tight'>{cv.fullName}</h1>
        <p className='mt-1 text-sm uppercase tracking-[0.14em] text-(--muted)'>
          {cv.headline}
        </p>
        <p className='mt-3 text-sm text-(--muted)'>
          {cv.email} | {cv.phone} | {cv.location}
        </p>
      </header>

      <section className='mt-6'>
        <h2 className='section-title'>Summary</h2>
        <p className='mt-2 text-sm leading-6 text-(--ink-soft)'>{cv.summary}</p>
      </section>

      {cv.sections.filter(shouldRenderSection).map((section) => (
        <section key={section.id} className='mt-8'>
          <h2 className='section-title'>{section.title}</h2>
          <div className='mt-4 space-y-4'>
            {section.items.map((item) => (
              <article key={item.id} className='space-y-1'>
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <h3 className='text-sm font-semibold text-(--ink)'>
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className='text-sm text-(--muted-strong)'>
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                  {item.period && (
                    <span className='text-xs uppercase tracking-[0.12em] text-(--muted)'>
                      {item.period}
                    </span>
                  )}
                </div>
                {splitDetails(item.details).length > 0 && (
                  <ul className='mt-1 space-y-1 text-sm leading-6 text-(--ink-soft)'>
                    {splitDetails(item.details).map((line) => (
                      <li key={line} className='flex gap-2'>
                        <span
                          aria-hidden='true'
                          className='mt-2 h-1.5 w-1.5 rounded-full bg-(--accent)'
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </section>
  )
}
