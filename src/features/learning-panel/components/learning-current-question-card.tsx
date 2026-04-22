import type { FormEventHandler } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import type {
  TopicAnswerState,
  TopicDiscussionStep,
  TopicQuestionReviewState,
} from "@/features/topic-session";
import { QuestionReviewActions } from "./question-review-actions";
import { ReadingLine } from "./reading-line";

type LearningCurrentQuestionCardProps = {
  step: TopicDiscussionStep;
  answerField: UseFormRegisterReturn<"answer">;
  errorMessage: string;
  failedCurrentAttempt: boolean;
  currentAnswerState: TopicAnswerState | undefined;
  reviewState: TopicQuestionReviewState | undefined;
  useLightShield: boolean;
  isDark: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onAnswerChange: (nextValue: string) => void;
  onTryAgain: () => void;
  onRevealAnswer: () => void;
  onSkipCurrent: () => void;
  onToggleQuestionPending: (questionId: string) => void;
  onToggleQuestionBookmark: (questionId: string) => void;
  onToggleQuestionWeak: (questionId: string) => void;
};

export function LearningCurrentQuestionCard({
  step,
  answerField,
  errorMessage,
  failedCurrentAttempt,
  currentAnswerState,
  reviewState,
  useLightShield,
  isDark,
  onSubmit,
  onAnswerChange,
  onTryAgain,
  onRevealAnswer,
  onSkipCurrent,
  onToggleQuestionPending,
  onToggleQuestionBookmark,
  onToggleQuestionWeak,
}: LearningCurrentQuestionCardProps) {
  return (
    <div
      id={`question-${step.question.id}`}
      data-insert-disabled="true"
      className={cn(
        "rounded-r-xl border-l-[2px] py-0.5 pl-6 transition-all",
        isDark
          ? "border-cyan-400/45 bg-transparent"
          : "border-cyan-500/30 bg-transparent",
      )}
    >
      <p className="mb-1 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500" />
        <ReadingLine shield={useLightShield}>Current Question</ReadingLine>
      </p>
      <p className="mb-1 text-lg font-light text-slate-900 dark:text-slate-100 dark:[text-shadow:0_0_10px_#0a0f1a,_0_0_20px_#0a0f1a]">
        <ReadingLine shield={useLightShield}>{step.question.prompt}</ReadingLine>
      </p>

      <form onSubmit={onSubmit}>
        <textarea
          {...answerField}
          onChange={(event) => {
            answerField.onChange(event);
            onAnswerChange(event.target.value);
          }}
          rows={1}
          placeholder={step.question.inputPlaceholder ?? "Type your thought..."}
          className={cn(
            "w-full min-h-[1.85rem] resize-none border-b bg-transparent pb-0.5 leading-6 transition-colors [field-sizing:content] placeholder:italic focus:outline-none",
            isDark
              ? "border-cyan-700/45 text-slate-200 placeholder:text-slate-400 focus:border-cyan-400"
              : "border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-cyan-500",
          )}
        />

        <div className="mt-1 text-sm text-rose-500/80 dark:text-rose-300/80">
          {errorMessage}
        </div>

        {failedCurrentAttempt && currentAnswerState?.feedback ? (
          <div className="mt-1 space-y-1.5 text-sm text-slate-500 dark:text-slate-300">
            <p>
              <ReadingLine shield={useLightShield}>
                This doesn't seem quite right. Want to try again or reveal the
                answer?
              </ReadingLine>
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onTryAgain}
                className="text-[11px] font-mono uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
              >
                [ Try again ]
              </button>
              <button
                type="button"
                onClick={onRevealAnswer}
                className="text-[11px] font-mono uppercase tracking-widest text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
              >
                [ Reveal answer ]
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-1 flex items-center justify-end gap-6">
          <button
            type="button"
            onClick={onSkipCurrent}
            className="text-[11px] font-mono uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
          >
            [ Skip for now ]
          </button>
          <button
            type="submit"
            className="border border-cyan-600/50 px-5 py-2 text-xs uppercase tracking-widest text-cyan-700 transition-colors hover:bg-cyan-500 hover:text-white dark:border-cyan-400/45 dark:text-cyan-400 dark:hover:bg-cyan-400/12"
          >
            [ Check ]
          </button>
        </div>
        <QuestionReviewActions
          questionId={step.question.id}
          reviewState={reviewState}
          isDark={isDark}
          onTogglePending={onToggleQuestionPending}
          onToggleBookmark={onToggleQuestionBookmark}
          onToggleWeak={onToggleQuestionWeak}
        />
      </form>
    </div>
  );
}
