import type { DragEvent } from "react";
import { formatTopicFeedbackScoreLabel } from "@/features/topic-session";
import { cn } from "@/lib/utils";
import type { FeedbackCardState } from "../types";

type ActiveFeedbackTone = {
  badge: string;
  accent: string;
  shell: string;
  border: string;
  subtle: string;
};

type ActiveFeedbackCardProps = {
  activeFeedback: FeedbackCardState;
  activeFeedbackIndex: number;
  feedbackCards: FeedbackCardState[];
  tone: ActiveFeedbackTone;
  onDismissFeedback: (feedbackId: string) => void;
  onSelectFeedback: (feedbackId: string) => void;
  onCycleFeedback: (direction: "previous" | "next") => void;
  onFocusQuestion: (questionId: string) => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
};

export function ActiveFeedbackCard({
  activeFeedback,
  activeFeedbackIndex,
  feedbackCards,
  tone,
  onDismissFeedback,
  onSelectFeedback,
  onCycleFeedback,
  onFocusQuestion,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: ActiveFeedbackCardProps) {
  return (
    <div className="relative z-20 mb-8">
      <div
        draggable
        onDragEnd={onDragEnd}
        onWheel={(event) => {
          if (feedbackCards.length <= 1 || Math.abs(event.deltaX) < 16) {
            return;
          }

          event.preventDefault();
          onCycleFeedback(event.deltaX > 0 ? "next" : "previous");
        }}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={cn(
          "cursor-grab rounded-2xl backdrop-blur-md active:cursor-grabbing",
          tone.shell,
          tone.border,
          "p-5",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p
              className={cn(
                "text-[10px] font-mono uppercase tracking-[0.22em]",
                tone.accent,
              )}
            >
              AI feedback
            </p>
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em]",
                tone.badge,
              )}
            >
              {formatTopicFeedbackScoreLabel(activeFeedback.feedback)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onDismissFeedback(activeFeedback.id)}
            className="text-xs text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            [ x ]
          </button>
        </div>

        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div>
            <p className={cn("mb-2 font-medium", tone.accent)}>
              What landed well:
            </p>
            <ul className="space-y-1">
              {activeFeedback.feedback.correctPoints.map((point) => (
                <li key={point}>- {point}</li>
              ))}
            </ul>
          </div>

          {activeFeedback.feedback.vaguePoints.length ? (
            <div>
              <p className={cn("mb-2 font-medium", tone.subtle)}>
                What feels unclear:
              </p>
              <ul className="space-y-1">
                {activeFeedback.feedback.vaguePoints.map((point) => (
                  <li key={point}>- {point}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {activeFeedback.feedback.missingPoints.length ? (
            <div>
              <p className={cn("mb-2 font-medium", tone.subtle)}>
                What's still missing:
              </p>
              <ul className="space-y-1">
                {activeFeedback.feedback.missingPoints.map((point) => (
                  <li key={point}>- {point}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <p className={cn("mb-2 font-medium", tone.accent)}>
              A good next step:
            </p>
            <p>{activeFeedback.feedback.nextSuggestion}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-200/30 pt-3 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 dark:border-slate-700/40">
          <button
            type="button"
            onClick={() => onFocusQuestion(activeFeedback.questionId)}
            className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            [ locate ]
          </button>
          {feedbackCards.length > 1 ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onCycleFeedback("previous")}
                className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-400"
              >
                prev
              </button>
              <span className="rounded-full bg-slate-500/10 px-2 py-0.5">
                {activeFeedbackIndex + 1}/{feedbackCards.length}
              </span>
              <button
                type="button"
                onClick={() => onCycleFeedback("next")}
                className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-400"
              >
                next
              </button>
              <span className="flex items-center gap-1">
                {feedbackCards.map((feedback, index) => (
                  <button
                    key={feedback.id}
                    type="button"
                    onClick={() => onSelectFeedback(feedback.id)}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-colors",
                      index === activeFeedbackIndex
                        ? "bg-cyan-500"
                        : "bg-slate-500/35 hover:bg-cyan-500/70",
                    )}
                    aria-label={`Show feedback ${index + 1}`}
                  />
                ))}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
