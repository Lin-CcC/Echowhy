import { Card } from '@/components/ui/card'
import { ConstellationView } from '@/features/constellation-view/components/constellation-view'
import { constellationTopic } from '@/mock/data/constellation-topic'

export function LearningTopicPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <ConstellationView
        title={constellationTopic.title}
        subtitle={constellationTopic.overview}
        nodes={constellationTopic.nodes}
        edges={constellationTopic.edges}
      />

      <Card className="p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Learning anchor
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-50">
          {constellationTopic.title}
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-400">
          {constellationTopic.goal}
        </p>
        <div className="mt-8 space-y-4 rounded-3xl border border-white/8 bg-white/4 p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
            Phase 1 prototype
          </p>
          <p className="text-sm leading-7 text-slate-300">
            This first screen is intentionally narrow: a static constellation,
            three node states, and enough structure to prove the product can
            move from documentation into a living surface.
          </p>
        </div>
      </Card>
    </div>
  )
}
