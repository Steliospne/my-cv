import { redirect } from 'next/navigation'
import { CvDashboard } from '@/components/cv-dashboard'
import { createCv, listCvs } from '@/lib/cv-data'

export default async function Home() {
  const cvs = await listCvs()

  async function createCvAction() {
    'use server'

    const created = await createCv()
    redirect(`/cv/${created.id}`)
  }

  return (
    <main className='min-h-screen px-6 py-8 md:px-10'>
      <div className='mx-auto w-full max-w-[1200px]'>
        <header className='mb-8 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className='text-xs uppercase tracking-[0.14em] text-(--muted)'>
              Dashboard
            </p>
            <h1 className='mt-1 font-heading text-4xl text-(--ink)'>
              Your Saved CVs
            </h1>
            <p className='mt-2 text-sm text-(--muted-strong)'>
              Select any saved CV to continue editing.
            </p>
          </div>
          <form action={createCvAction}>
            <button type='submit' className='save-btn'>
              Create New CV
            </button>
          </form>
        </header>

        <CvDashboard cvs={cvs} />

        {cvs.length === 0 ? (
          <p className='mt-8 rounded-2xl border border-dashed border-(--line) bg-(--panel) p-6 text-sm text-(--muted-strong)'>
            No CVs yet. Create your first CV to get started.
          </p>
        ) : null}
      </div>
    </main>
  )
}
