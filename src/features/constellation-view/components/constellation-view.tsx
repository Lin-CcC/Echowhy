import type { TopicEdge, TopicNode } from "@/features/topic-session";

type ConstellationViewProps = {
  nodes: TopicNode[];
  edges: TopicEdge[];
  activeNodeId: string;
  onSelectNode: (nodeId: string) => void;
};

const sidebarNodeLayout = [
  { x: 108, y: 72 },
  { x: 150, y: 222 },
  { x: 90, y: 380 },
] as const;

function buildPolylinePath(from: { x: number; y: number }, to: { x: number; y: number }) {
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
}

export function ConstellationView({
  nodes,
  edges,
  activeNodeId,
  onSelectNode,
}: ConstellationViewProps) {
  const orderedNodes = nodes.slice(0, 3).map((node, index) => ({
    ...node,
    ...sidebarNodeLayout[index],
  }));
  const nodeMap = new Map(orderedNodes.map((node) => [node.id, node]));

  return (
    <svg className="absolute inset-0 h-full w-full" overflow="hidden">
      {edges.slice(0, 2).map((edge) => {
        const from = nodeMap.get(edge.from);
        const to = nodeMap.get(edge.to);

        if (!from || !to) {
          return null;
        }

        const isCompleted = from.visualState === "lit" && to.visualState === "lit";
        const touchesCurrent = from.id === activeNodeId || to.id === activeNodeId;

        return (
          <path
            key={`${edge.from}-${edge.to}`}
            d={buildPolylinePath(from, to)}
            fill="none"
            strokeWidth="1"
            className={
              isCompleted
                ? "stroke-sky-400/70"
                : touchesCurrent
                  ? "stroke-sky-400/70"
                  : "stroke-slate-400/80 dark:stroke-slate-600/80"
            }
            strokeDasharray={isCompleted ? undefined : touchesCurrent ? "3 6" : "2 8"}
          />
        );
      })}

      {orderedNodes.map((node) => {
        const isCurrent = node.id === activeNodeId;
        const isLit = node.visualState === "lit";

        return (
          <g
            key={node.id}
            transform={`translate(${node.x}, ${node.y})`}
            role="button"
            tabIndex={0}
            aria-label={`Open learning node ${node.label}`}
            className="cursor-pointer"
            onClick={() => onSelectNode(node.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelectNode(node.id);
              }
            }}
          >
            {isCurrent ? <circle r="12" className="animate-ping fill-cyan-400/28" /> : null}

            <circle
              r={isCurrent || isLit ? "5" : "4"}
              className={
                isCurrent
                  ? "fill-cyan-400"
                  : isLit
                    ? "fill-sky-400"
                    : "fill-slate-400 dark:fill-slate-500"
              }
            />

            {isLit ? (
              <text
                x="16"
                y="4"
                className="fill-cyan-600 font-mono text-[10px] uppercase tracking-widest dark:fill-cyan-400"
              >
                lit
              </text>
            ) : null}

            {isCurrent ? (
              <>
                <text
                  x="16"
                  y="4"
                  className="fill-cyan-600 font-mono text-[10px] uppercase tracking-widest dark:fill-cyan-400"
                >
                  pulsing
                </text>
                <path
                  d={`M ${16} 0 L ${48} 0 L ${72} -8 L ${98} -8`}
                  className="stroke-cyan-500/30"
                  fill="none"
                  strokeWidth="0.5"
                  strokeDasharray="2 4"
                />
              </>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
