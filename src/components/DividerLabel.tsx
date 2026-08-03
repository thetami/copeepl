export function DividerLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 mb-2 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-widest text-ink-light">
      <span className="h-px flex-1 bg-warm-mid" />
      {children}
      <span className="h-px flex-1 bg-warm-mid" />
    </div>
  );
}
