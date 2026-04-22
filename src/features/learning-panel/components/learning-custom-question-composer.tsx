import type { FormEventHandler } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { ReadingLine } from "./reading-line";

type LearningCustomQuestionComposerProps = {
  questionField: UseFormRegisterReturn<"question">;
  errorMessage: string;
  useLightShield: boolean;
  isDark: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onQuestionChange: (nextValue: string) => void;
};

export function LearningCustomQuestionComposer({
  questionField,
  errorMessage,
  useLightShield,
  isDark,
  onSubmit,
  onQuestionChange,
}: LearningCustomQuestionComposerProps) {
  return (
    <div
      data-insert-disabled="true"
      className="rounded-r-xl border-l-[2px] border-cyan-400/45 py-0.5 pl-6"
    >
      <p className="mb-1 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
        <ReadingLine shield={useLightShield}>My own why</ReadingLine>
      </p>
      <form onSubmit={onSubmit}>
        <textarea
          {...questionField}
          onChange={(event) => {
            questionField.onChange(event);
            onQuestionChange(event.target.value);
          }}
          rows={1}
          placeholder="Or ask any follow-up you want to understand next..."
          className={cn(
            "w-full min-h-[1.85rem] resize-none border-b bg-transparent pb-0.5 leading-6 transition-colors [field-sizing:content] placeholder:italic focus:outline-none",
            isDark
              ? "border-cyan-700/45 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400"
              : "border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-cyan-500",
          )}
        />
        <div className="mt-1 text-sm text-rose-500/80 dark:text-rose-300/80">
          {errorMessage}
        </div>
        <div className="mt-1 flex items-center justify-end">
          <button
            type="submit"
            className="border border-cyan-600/50 px-5 py-2 text-xs uppercase tracking-widest text-cyan-700 transition-colors hover:bg-cyan-500 hover:text-white dark:border-cyan-400/45 dark:text-cyan-400 dark:hover:bg-cyan-400/12"
          >
            [ Start branch ]
          </button>
        </div>
      </form>
    </div>
  );
}
