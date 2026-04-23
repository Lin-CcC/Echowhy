import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { recentTrackStartPoint, type StartSource } from "./start-page-utils";

type RecentSourceConstellationProps = {
  theme: "light" | "dark";
  recentSources: StartSource[];
  recentSourcePoints: Array<{ x: number; y: number }>;
  recentSourcePath: string;
  selectingSourcePath: string;
  selectingSourceId: string | null;
  selectingSourceIndex: number;
  hoveredSourceId: string | null;
  trackPulseKey: number;
  isTrackPulseActive: boolean;
  onHoverSource: (sourceId: string | null) => void;
  onSelectSource: (source: StartSource) => void;
  onOpenSourceChild: (
    topicId: string,
    angleId?: string,
    customQuestion?: string,
    sourceId?: string,
    sourceLabel?: string,
  ) => void;
  onPulseTrack: () => void;
  onBackToAsk: () => void;
  onOpenLibrary: () => void;
};

export function RecentSourceConstellation({
  theme,
  recentSources,
  recentSourcePoints,
  recentSourcePath,
  selectingSourcePath,
  selectingSourceId,
  selectingSourceIndex,
  hoveredSourceId,
  trackPulseKey,
  isTrackPulseActive,
  onHoverSource,
  onSelectSource,
  onOpenSourceChild,
  onPulseTrack,
  onBackToAsk,
  onOpenLibrary,
}: RecentSourceConstellationProps) {
  return (
    <motion.div
      key="recent"
      initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-48 w-[min(46rem,90vw)] flex-col items-center"
    >
      <div className="relative h-40 w-full">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d={recentSourcePath}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="0.35"
            strokeDasharray={theme === "dark" ? "1.2 3.4" : "1.4 3.2"}
            className={cn(
              theme === "dark" ? "stroke-cyan-300/24" : "stroke-slate-500/52",
            )}
          />

          {selectingSourcePath || isTrackPulseActive ? (
            <motion.path
              key={
                isTrackPulseActive
                  ? `recent-track-pulse-${trackPulseKey}`
                  : selectingSourcePath
              }
              d={isTrackPulseActive ? recentSourcePath : selectingSourcePath}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.7"
              className={cn(
                theme === "dark" ? "stroke-cyan-200" : "stroke-cyan-500",
              )}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                isTrackPulseActive
                  ? { pathLength: 1, opacity: [0, 1, 0.82, 0] }
                  : { pathLength: 1, opacity: [0, 1, 0.86] }
              }
              transition={{
                pathLength: {
                  duration: isTrackPulseActive ? 1.25 : 0.62,
                  ease: [0.22, 1, 0.36, 1],
                },
                opacity: {
                  duration: isTrackPulseActive ? 2.3 : 0.62,
                  times: isTrackPulseActive ? [0, 0.36, 0.72, 1] : undefined,
                  ease: "easeOut",
                },
              }}
            />
          ) : null}
        </svg>

        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${recentTrackStartPoint.x}%`,
            top: `${recentTrackStartPoint.y}%`,
          }}
        >
          <button
            type="button"
            onClick={onPulseTrack}
            disabled={Boolean(selectingSourceId || isTrackPulseActive)}
            aria-label="Preview recent source track"
            className="group relative flex h-8 w-8 items-center justify-center"
          >
            <motion.span
              className={cn(
                "absolute h-7 w-7 rounded-full transition-opacity",
                theme === "dark"
                  ? "bg-cyan-300/8 group-hover:bg-cyan-300/12"
                  : "bg-slate-400/10 group-hover:bg-cyan-400/14",
              )}
              animate={
                isTrackPulseActive
                  ? {
                      opacity: [0.25, 0.72, 0.48, 0.16],
                      scale: [0.82, 1.45, 1.1, 0.92],
                    }
                  : { opacity: 0.3, scale: 1 }
              }
              transition={{
                duration: isTrackPulseActive ? 2.2 : 0.2,
                times: isTrackPulseActive ? [0, 0.32, 0.68, 1] : undefined,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
            <motion.span
              className={cn(
                "relative h-3 w-3 rounded-full transition-colors",
                theme === "dark"
                  ? "bg-cyan-300/78 shadow-[0_0_18px_rgba(103,232,249,0.32)] group-hover:bg-cyan-200"
                  : "border border-cyan-600/75 bg-cyan-400 shadow-[0_0_0_4px_rgba(255,255,255,0.86),0_0_0_7px_rgba(6,182,212,0.1)] group-hover:bg-cyan-500",
              )}
              animate={
                isTrackPulseActive
                  ? {
                      scale: [1, 1.48, 1.18, 1],
                      opacity: [0.88, 1, 0.9, 0.82],
                    }
                  : { scale: 1 }
              }
              transition={{
                duration: isTrackPulseActive ? 2.05 : 0.2,
                times: isTrackPulseActive ? [0, 0.28, 0.68, 1] : undefined,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </button>
        </div>

        {recentSources.map((source, index) => {
          const point = recentSourcePoints[index] ?? { x: 50, y: 48 };
          const hovered = hoveredSourceId === source.id;
          const hasChildren = source.children.length > 0;
          const isInSelectingPath =
            selectingSourceIndex >= 0 && index <= selectingSourceIndex;
          const isLitByTrackPulse = isTrackPulseActive;
          const isSelectingTarget = selectingSourceId === source.id;

          return (
            <div
              key={source.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              onMouseEnter={() => {
                if (hasChildren) {
                  onHoverSource(source.id);
                }
              }}
              onMouseLeave={() => onHoverSource(null)}
            >
              <button
                type="button"
                onClick={() => onSelectSource(source)}
                disabled={Boolean(selectingSourceId || isTrackPulseActive)}
                className="group relative flex h-8 w-8 items-center justify-center"
              >
                <motion.span
                  className={cn(
                    "relative h-3 w-3 rounded-full transition-colors",
                    theme === "dark"
                      ? "bg-cyan-300/80 shadow-[0_0_18px_rgba(103,232,249,0.38)] group-hover:bg-cyan-200"
                      : "border border-slate-500/80 bg-slate-500 shadow-[0_0_0_4px_rgba(255,255,255,0.84),0_0_0_7px_rgba(100,116,139,0.1)] group-hover:border-cyan-600 group-hover:bg-cyan-400",
                    (isInSelectingPath || isLitByTrackPulse) &&
                      (theme === "dark"
                        ? "bg-cyan-100 shadow-[0_0_26px_rgba(165,243,252,0.58)]"
                        : "border-cyan-600 bg-cyan-400 shadow-[0_0_0_4px_rgba(255,255,255,0.88),0_0_0_8px_rgba(6,182,212,0.14)]"),
                  )}
                  animate={
                    isSelectingTarget
                      ? { scale: [1, 1.55, 1.16], opacity: [0.92, 1, 1] }
                      : isLitByTrackPulse
                        ? {
                            scale: [1, 1.28, 1.14, 1],
                            opacity: [0.88, 1, 0.9, 0.82],
                          }
                        : { scale: hovered || isInSelectingPath ? 1.2 : 1 }
                  }
                  transition={{
                    duration: isSelectingTarget
                      ? 0.58
                      : isLitByTrackPulse
                        ? 2.05
                        : 0.2,
                    times: isLitByTrackPulse ? [0, 0.32, 0.72, 1] : undefined,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
                <span
                  className={cn(
                    "absolute left-1/2 top-7 max-w-36 -translate-x-1/2 truncate whitespace-nowrap text-xs tracking-wide transition-colors",
                    theme === "dark"
                      ? "text-slate-300 drop-shadow-[0_0_10px_rgba(2,6,23,0.9)] group-hover:text-slate-100"
                      : "text-slate-600 [text-shadow:0_0_10px_#f8fafc,_0_0_20px_#f8fafc] group-hover:text-slate-900",
                  )}
                >
                  {source.label}
                </span>
              </button>

              <AnimatePresence>
                {hovered && hasChildren ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 8, filter: "blur(8px)" }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "absolute z-30 w-72 overflow-hidden rounded-none border p-3 text-left backdrop-blur-xl",
                      "left-1/2 top-12 -translate-x-1/2",
                      theme === "dark"
                        ? "border-white/[0.025] bg-slate-950/12 text-slate-300 shadow-[0_18px_64px_-62px_rgba(0,0,0,0.74)]"
                        : "border-white/20 bg-white/[0.18] text-slate-600 shadow-[0_18px_68px_-66px_rgba(15,23,42,0.22)]",
                    )}
                  >
                    <motion.div
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute inset-0",
                        theme === "dark" ? "bg-slate-800/10" : "bg-white/12",
                      )}
                      animate={{ opacity: [0.24, 0.42, 0.24] }}
                      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <div className="relative">
                      <p
                        className={cn(
                          "mb-2 text-[10px] uppercase tracking-[0.22em]",
                          theme === "dark" ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        {source.caption}
                      </p>

                      <div className="space-y-1">
                        {source.children.slice(0, 4).map((child) => (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() =>
                              onOpenSourceChild(
                                child.topicId,
                                child.angleId,
                                child.customQuestion,
                                source.sourceId ?? source.id,
                                source.sourceLabel ?? source.label,
                              )
                            }
                            className={cn(
                              "block w-full truncate border-l px-2 py-1 text-left text-xs transition-colors",
                              theme === "dark"
                                ? "border-cyan-400/16 text-slate-300/82 hover:border-cyan-400/70 hover:text-slate-100"
                                : "border-slate-300/70 text-slate-600 hover:border-cyan-500/70 hover:text-slate-900",
                            )}
                          >
                            {child.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div
        className={cn(
          "mt-2 flex justify-center gap-8 transition-all duration-300 ease-out",
          hoveredSourceId
            ? "pointer-events-none translate-y-2 opacity-0 blur-[3px]"
            : "translate-y-0 opacity-100 blur-0",
        )}
      >
        <button
          type="button"
          onClick={onBackToAsk}
          className={cn(
            "text-sm tracking-wide transition-colors",
            theme === "dark"
              ? "text-slate-500 hover:text-slate-300"
              : "text-slate-400 hover:text-slate-700",
          )}
        >
          Back to asking
        </button>
        <button
          type="button"
          onClick={onOpenLibrary}
          className={cn(
            "text-sm tracking-wide transition-colors",
            theme === "dark"
              ? "text-slate-400 hover:text-slate-300"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          Open Library
        </button>
      </div>
    </motion.div>
  );
}
