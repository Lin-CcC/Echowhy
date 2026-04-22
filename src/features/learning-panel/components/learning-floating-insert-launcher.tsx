import type { CSSProperties, PointerEventHandler } from "react";
import { cn } from "@/lib/utils";
import { ReadingLine } from "./reading-line";

type LearningFloatingInsertLauncherProps = {
  isInsertDragging: boolean;
  insertButtonPosition: { x: number; y: number } | null;
  isFloatingWindowHovered: boolean;
  hasDraft: boolean;
  isDark: boolean;
  useLightShield: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onPointerDown: PointerEventHandler<HTMLDivElement>;
};

export function LearningFloatingInsertLauncher({
  isInsertDragging,
  insertButtonPosition,
  isFloatingWindowHovered,
  hasDraft,
  isDark,
  useLightShield,
  onMouseEnter,
  onMouseLeave,
  onPointerDown,
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
            isDark ? "text-cyan-400" : "text-blue-600",
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
              stroke={isDark ? "rgba(34,211,238,0.68)" : "rgba(59,130,246,0.60)"}
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
                fill={isDark ? "rgba(34,211,238,0.68)" : "rgba(59,130,246,0.60)"}
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
            "pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap transition-all duration-200",
            isFloatingWindowHovered ? "translate-x-0 opacity-100" : "translate-x-1 opacity-0",
          )}
        >
          <p
            className={cn(
              "text-[10px] font-mono uppercase tracking-[0.24em]",
              isDark ? "text-cyan-400/88" : "text-blue-600/88",
            )}
          >
            <ReadingLine shield={useLightShield}>My question</ReadingLine>
          </p>
        </div>
      ) : null}
    </div>
  );
}
