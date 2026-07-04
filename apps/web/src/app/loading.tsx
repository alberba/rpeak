export default function Loading() {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-1 animate-pulse flex-col gap-5 px-4 py-6 md:px-6"
      role="status"
      aria-label="Cargando contenido"
    >
      <span className="sr-only">Cargando…</span>
      <div className="h-8 w-44 rounded-lg bg-muted" />
      <div className="h-4 w-72 max-w-full rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-32 rounded-2xl bg-muted" />
        <div className="h-32 rounded-2xl bg-muted" />
        <div className="h-32 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
