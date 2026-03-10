export function GlobalLoading() {
  return (
    <div
      className='grid min-h-screen w-full place-items-center px-6'
      aria-live='polite'
      aria-label='Loading'
    >
      <div className='flex flex-col items-center gap-6'>
        <p className='text-[0.65rem] font-medium uppercase tracking-[0.2em] text-(--muted)'>
          Loading
        </p>
        <h1 className='font-heading text-2xl font-semibold tracking-tight text-(--ink)'>
          CV Studio
        </h1>
        <div className='loading-bar' aria-hidden />
      </div>
    </div>
  )
}
