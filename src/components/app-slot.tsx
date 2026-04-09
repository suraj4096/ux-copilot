export function AppSlot({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-0 flex-1 overflow-auto rounded-lg border bg-background p-4 text-foreground">
      {children}
    </section>
  )
}

