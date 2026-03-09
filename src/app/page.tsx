import Link from "next/link";
import { redirect } from "next/navigation";
import { createCv, listCvs } from "@/lib/cv-data";

export default async function Home() {
  const cvs = await listCvs();

  async function createCvAction() {
    "use server";

    const created = await createCv();
    redirect(`/cv/${created.id}`);
  }

  return (
    <main className="min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Dashboard</p>
            <h1 className="mt-1 font-heading text-4xl text-[var(--ink)]">Your Saved CVs</h1>
            <p className="mt-2 text-sm text-[var(--muted-strong)]">
              Select any saved CV to continue editing.
            </p>
          </div>
          <form action={createCvAction}>
            <button type="submit" className="save-btn">
              Create New CV
            </button>
          </form>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {cvs.map((cv) => (
            <Link
              key={cv.id}
              href={`/cv/${cv.id}`}
              className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)] transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Saved CV</p>
              <h2 className="mt-1 font-heading text-2xl text-[var(--ink)]">{cv.fullName}</h2>
              <p className="mt-1 text-sm text-[var(--muted-strong)]">{cv.headline}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.11em] text-[var(--muted)]">
                Last updated {new Date(cv.updatedAt).toLocaleString()}
              </p>
            </Link>
          ))}
        </section>

        {cvs.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] p-6 text-sm text-[var(--muted-strong)]">
            No CVs yet. Create your first CV to get started.
          </p>
        ) : null}
      </div>
    </main>
  );
}
