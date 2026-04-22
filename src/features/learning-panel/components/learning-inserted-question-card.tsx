import { cn } from "@/lib/utils";
import type { InsertedQuestionRecord } from "@/features/topic-session";
import { ReadingLine } from "./reading-line";

type LearningInsertedQuestionCardVisual = {
  shell: string;
  accent: string;
  label: string;
  title: string;
  meta: string;
  emphasis?: string;
};

type LearningInsertedQuestionFeedbackVisual = {
  label: string;
  emphasis?: string;
};

type LearningInsertedQuestionCardProps = {
  question: InsertedQuestionRecord;
  visual: LearningInsertedQuestionCardVisual;
  feedbackVisual: LearningInsertedQuestionFeedbackVisual | null;
  useLightShield: boolean;
  isDark: boolean;
  onDelete: () => void;
  onDraftChange: (nextValue: string) => void;
  onCheck: (answer: string) => void;
};

export function LearningInsertedQuestionCard({
  question,
  visual,
  feedbackVisual,
  useLightShield,
  isDark,
  onDelete,
  onDraftChange,
  onCheck,
}: LearningInsertedQuestionCardProps) {
  const answerValue = question.answerDraft ?? question.answerState?.answer ?? "";

  return (
    <div id={`question-${question.id}`} data-insert-disabled="true" className={cn(visual.shell)}>
      <div className={cn("border-l-[3px] pl-5 py-0.5", visual.accent)}>
        <div className="mb-1 flex items-center justify-between gap-4">
          <p className={cn("text-[10px] font-mono uppercase tracking-[0.22em]", visual.label)}>
            <ReadingLine shield={useLightShield}>My question</ReadingLine>
          </p>
          <button
            type="button"
            onClick={onDelete}
            className="font-mono text-[10px] tracking-[0.16em] text-slate-400 transition-colors hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-300"
            aria-label="Delete inserted question"
          >
            [x]
          </button>
        </div>

        <p className={cn("text-base leading-relaxed", visual.title)}>
          <ReadingLine shield={useLightShield}>{question.prompt}</ReadingLine>
        </p>

        <textarea
          rows={1}
          value={answerValue}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="Type your thought..."
          className={cn(
            "mt-1 w-full min-h-[1.85rem] resize-none border-b bg-transparent pb-0.5 leading-6 transition-colors [field-sizing:content] placeholder:italic focus:outline-none",
            isDark
              ? "border-cyan-700/45 text-slate-200 placeholder:text-slate-400 focus:border-cyan-400"
              : "border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-cyan-500",
          )}
        />

        {question.answerState?.feedback ? (
          <div className="mt-1 space-y-1 text-sm text-slate-500 dark:text-slate-300">
            <p>
              <ReadingLine shield={useLightShield}>
                <span className={cn("font-bold", feedbackVisual?.emphasis)}>AI:</span>{" "}
                {question.answerState.feedback.nextSuggestion}
              </ReadingLine>
            </p>
            <p className={cn("text-xs uppercase tracking-[0.16em]", feedbackVisual?.label ?? visual.meta)}>
              <ReadingLine shield={useLightShield}>
                {question.answerState.feedback.label} / {question.answerState.feedback.score}/100
              </ReadingLine>
            </p>
          </div>
        ) : null}

        <div className="mt-1 flex items-center justify-end">
          <button
            type="button"
            onClick={() => onCheck(answerValue)}
            className="border border-cyan-600/45 px-5 py-2 text-xs uppercase tracking-widest text-cyan-700 transition-colors hover:bg-cyan-500 hover:text-white dark:border-cyan-400/45 dark:text-cyan-400 dark:hover:bg-cyan-400/12"
          >
            [ Check ]
          </button>
        </div>
      </div>
    </div>
  );
}
