import type { CSSProperties, PointerEventHandler } from "react";
import { cn } from "@/lib/utils";
import type {
  LearningFloatingAssistantPrimaryAction,
  LearningFloatingAssistantState,
  LearningFloatingAssistantTone,
} from "./learning-floating-assistant";
import { ReadingLine } from "./reading-line";

type LearningFloatingInsertLauncherProps = {
  isInsertDragging: boolean;
  insertButtonPosition: { x: number; y: number } | null;
  isFloatingWindowHovered: boolean;
  hasDraft: boolean;
  isDark: boolean;
  useLightShield: boolean;
  assistantState: LearningFloatingAssistantState;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onContinueLadder: () => void;
  onReviewQuestion: () => void;
  onExploreNext: () => void;
};

const assistantToneClasses: Record<
  LearningFloatingAssistantTone,
  {
    text: string;
    strokeLight: string;
    strokeDark: string;
    fillLight: string;
    fillDark: string;
    panelLight: string;
    panelDark: string;
  }
> = {
  cyan: {
    text: "text-cyan-600 dark:text-cyan-300",
    strokeLight: "rgba(8,145,178,0.62)",
    strokeDark: "rgba(103,232,249,0.72)",
    fillLight: "rgba(8,145,178,0.56)",
    fillDark: "rgba(34,211,238,0.70)",
    panelLight: "border-cyan-500/36 text-cyan-800",
    panelDark: "border-cyan-300/32 text-cyan-100",
  },
  emerald: {
    text: "text-emerald-700 dark:text-emerald-300",
    strokeLight: "rgba(4,120,87,0.58)",
    strokeDark: "rgba(110,231,183,0.66)",
    fillLight: "rgba(5,150,105,0.50)",
    fillDark: "rgba(52,211,153,0.64)",
    panelLight: "border-emerald-600/32 text-emerald-900",
    panelDark: "border-emerald-300/28 text-emerald-100",
  },
  amber: {
    text: "text-amber-700 dark:text-amber-300",
    strokeLight: "rgba(180,83,9,0.56)",
    strokeDark: "rgba(252,211,77,0.62)",
    fillLight: "rgba(217,119,6,0.44)",
    fillDark: "rgba(251,191,36,0.56)",
    panelLight: "border-amber-600/30 text-amber-900",
    panelDark: "border-amber-300/28 text-amber-100",
  },
  rose: {
    text: "text-rose-700 dark:text-rose-300",
    strokeLight: "rgba(190,18,60,0.54)",
    strokeDark: "rgba(251,113,133,0.62)",
    fillLight: "rgba(225,29,72,0.42)",
    fillDark: "rgba(244,63,94,0.54)",
    panelLight: "border-rose-600/30 text-rose-900",
    panelDark: "border-rose-300/28 text-rose-100",
  },
  slate: {
    text: "text-slate-600 dark:text-slate-300",
    strokeLight: "rgba(71,85,105,0.52)",
    strokeDark: "rgba(203,213,225,0.56)",
    fillLight: "rgba(100,116,139,0.44)",
    fillDark: "rgba(148,163,184,0.48)",
    panelLight: "border-slate-400/34 text-slate-900",
    panelDark: "border-slate-300/24 text-slate-100",
  },
};

function getActionLabel(action: LearningFloatingAssistantPrimaryAction) {
  if (action === "continue-ladder") {
    return "Continue Ladder";
  }

  if (action === "review-question") {
    return "Review flagged";
  }

  if (action === "explore-next") {
    return "Explore next";
  }

  return "Drag to insert";
}

export function LearningFloatingInsertLauncher({
  isInsertDragging,
  insertButtonPosition,
  isFloatingWindowHovered,
  hasDraft,
  isDark,
  useLightShield,
  assistantState,
  onMouseEnter,
  onMouseLeave,
  onPointerDown,
  onContinueLadder,
  onReviewQuestion,
  onExploreNext,
}: LearningFloatingInsertLauncherProps) {
  const style: CSSProperties =
    isInsertDragging && insertButtonPosition
      ? {
          left: insertButtonPosition.x,
          top: insertButtonPosition.y,
          transform: "translate(-50%, -50%) scale(0.88)",
        }
      : {
          left: 24,
          bottom: 24,
        };
  const tone = assistantToneClasses[assistantState.tone];
  const actionLabel = getActionLabel(assistantState.primaryAction);

  function handlePrimaryAction() {
    if (assistantState.primaryAction === "continue-ladder") {
      onContinueLadder();
      return;
    }

    if (assistantState.primaryAction === "review-question") {
      onReviewQuestion();
      return;
    }

    if (assistantState.primaryAction === "explore-next") {
      onExploreNext();
    }
  }

  return (
    <div
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "fixed z-40 select-none bg-transparent transition-[opacity,transform] duration-200",
        isInsertDragging
          ? "pointer-events-none opacity-100"
          : isFloatingWindowHovered || hasDraft
            ? "opacity-100"
            : "opacity-55 hover:opacity-100",
      )}
    >
      <div onPointerDown={onPointerDown} className="cursor-grab active:cursor-grabbing">
        <div
          className={cn(
            "relative flex h-11 w-11 items-center justify-center transition-all duration-200",
            tone.text,
            isFloatingWindowHovered && !isInsertDragging ? "scale-[1.04]" : "scale-100",
          )}
          aria-label="Insert my question"
        >
          <svg
            viewBox="0 0 44 44"
            className="pointer-events-none h-11 w-11 overflow-visible"
            aria-hidden="true"
          >
            <g
              stroke={isDark ? tone.strokeDark : tone.strokeLight}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle
                cx="22"
                cy="22"
                r="11"
                strokeWidth="1"
                fill={isDark ? "rgba(2,6,23,0.16)" : "rgba(255,255,255,0.12)"}
              />
              <path
                d="M 22 7.2
                   Q 24.1 19.6 35.1 22
                   Q 24.1 24.4 22 36.8
                   Q 19.9 24.4 8.9 22
                   Q 19.9 19.6 22 7.2 Z"
                strokeWidth="1"
                fill={isDark ? tone.fillDark : tone.fillLight}
              />
              <circle
                cx="22"
                cy="22"
                r="4.2"
                strokeWidth="1"
                fill={isDark ? "rgba(2,6,23,0.88)" : "rgba(255,255,255,0.86)"}
              />
            </g>
            <text
              x="22"
              y="24.4"
              textAnchor="middle"
              fontSize="8"
              fontWeight="700"
              fill={isDark ? "rgba(207,250,254,0.96)" : "rgba(37,99,235,0.88)"}
            >
              ?
            </text>
          </svg>
        </div>
      </div>

      {!isInsertDragging ? (
        <div
          className={cn(
            "pointer-events-none absolute bottom-0 left-full ml-3 w-72 transition-all duration-200",
            isFloatingWindowHovered ? "translate-x-0 opacity-100" : "translate-x-1 opacity-0",
          )}
        >
          <div
            className={cn(
              "pointer-events-auto border-l bg-transparent px-4 py-3",
              isDark ? tone.panelDark : tone.panelLight,
            )}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.24em]">
              <ReadingLine shield={useLightShield}>
                {assistantState.eyebrow}
              </ReadingLine>
            </p>
            <p className="mt-1 text-sm font-medium leading-5 text-slate-800 dark:text-slate-100">
              <ReadingLine shield={useLightShield}>{assistantState.label}</ReadingLine>
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-300">
              <ReadingLine shield={useLightShield}>
                {assistantState.summary}
              </ReadingLine>
            </p>
            <p className="mt-2 text-[11px] leading-5 text-slate-400 dark:text-slate-400">
              <ReadingLine shield={useLightShield}>
                {assistantState.detail}
              </ReadingLine>
            </p>

            {assistantState.primaryAction === "insert-question" ? (
              <p className="mt-3 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">
                <ReadingLine shield={useLightShield}>Drag icon to insert</ReadingLine>
              </p>
            ) : (
              <button
                type="button"
                onClick={handlePrimaryAction}
                className={cn(
                  "mt-3 text-[10px] font-mono uppercase tracking-[0.2em] transition-colors",
                  tone.text,
                )}
              >
                [ {actionLabel} ]
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
