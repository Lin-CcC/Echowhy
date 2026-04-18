import { Card } from '@/components/ui/card'

export function ReviewPage() {
  return (
    <Card className="p-6">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
        Review
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-slate-50">
        Worth revisiting will appear here.
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
        Phase 1 keeps review simple. Once persistence and answer feedback are in
        place, this page will reopen topics through the same constellation-first
        surface.
      </p>
    </Card>
  )
}
