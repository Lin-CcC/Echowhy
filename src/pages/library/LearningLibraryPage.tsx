import { Card } from '@/components/ui/card'

export function LearningLibraryPage() {
  return (
    <Card className="p-6">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
        Learning Library
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-slate-50">
        Learned topics will gather here.
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
        This page is intentionally light in the first scaffold. The next step is
        to render learned topics and chain-first topic detail from local or mock
        data.
      </p>
    </Card>
  )
}
