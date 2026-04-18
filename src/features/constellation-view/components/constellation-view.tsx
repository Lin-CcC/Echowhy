import { Card } from '@/components/ui/card'

type ConstellationNode = {
  id: string
  label: string
  x: number
  y: number
  visualState: 'dim' | 'pulsing' | 'lit'
}

type ConstellationEdge = {
  from: string
  to: string
}

type ConstellationViewProps = {
  title: string
  subtitle: string
  nodes: ConstellationNode[]
  edges: ConstellationEdge[]
}

function buildPolyline(from: ConstellationNode, to: ConstellationNode) {
  const midpointX = (from.x + to.x) / 2
  const midpointY = (from.y + to.y) / 2 - 24

  return `${from.x},${from.y} ${midpointX},${midpointY} ${to.x},${to.y}`
}

function nodeStyles(visualState: ConstellationNode['visualState']) {
  switch (visualState) {
    case 'lit':
      return {
        fill: 'var(--star-lit)',
        ring: 'rgba(224,242,254,0.25)',
      }
    case 'pulsing':
      return {
        fill: 'var(--star-active)',
        ring: 'rgba(125,211,252,0.32)',
      }
    default:
      return {
        fill: 'var(--star-dim)',
        ring: 'rgba(71,85,105,0.18)',
      }
  }
}

export function ConstellationView({
  title,
  subtitle,
  nodes,
  edges,
}: ConstellationViewProps) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))

  return (
    <Card className="overflow-hidden bg-slate-950/70">
      <div className="border-b border-white/8 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Follow-up chain
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-50">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          {subtitle}
        </p>
      </div>

      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.08),_transparent_38%),linear-gradient(180deg,#020617_0%,#020617_25%,#020c1d_100%)] p-4 sm:p-6">
        <svg
          viewBox="0 0 760 420"
          role="img"
          aria-label="A constellation view of the current learning topic."
          className="h-[420px] w-full"
        >
          <defs>
            <filter id="constellationGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {edges.map((edge) => {
            const from = nodeMap.get(edge.from)
            const to = nodeMap.get(edge.to)

            if (!from || !to) {
              return null
            }

            return (
              <polyline
                key={`${edge.from}-${edge.to}`}
                points={buildPolyline(from, to)}
                fill="none"
                stroke="var(--line-constellation)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )
          })}

          {nodes.map((node) => {
            const style = nodeStyles(node.visualState)

            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <circle
                  r={node.visualState === 'lit' ? 20 : 18}
                  fill={style.ring}
                  filter="url(#constellationGlow)"
                />
                <circle
                  r={node.visualState === 'dim' ? 6 : 7.5}
                  fill={style.fill}
                  className={node.visualState === 'pulsing' ? 'animate-pulse' : ''}
                  filter="url(#constellationGlow)"
                />
                <text
                  x={14}
                  y={-12}
                  fill="var(--text-secondary)"
                  fontSize="12"
                  letterSpacing="0.08em"
                  className="uppercase"
                >
                  {node.visualState}
                </text>
                <text x={14} y={10} fill="var(--text-primary)" fontSize="15">
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </Card>
  )
}
