import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import type { Theme } from "@/app/theme/theme-provider";
import { cn } from "@/lib/utils";

const questionEntrySchema = z.object({
  question: z.string(),
});

type QuestionEntryValues = z.infer<typeof questionEntrySchema>;

type QuestionEntryProps = {
  theme: Theme;
  onSubmit: (question: string) => void;
  onAttachSource?: () => void;
  onFilesSelected?: (files: FileList | File[]) => void;
  onShowRecentSources?: () => void;
  selectedSourceLabel?: string | null;
  selectedSourceCaption?: string | null;
  sourcePreviewAvailable?: boolean;
  isSourcePreviewOpen?: boolean;
  onPreviewSource?: () => void;
  onClearSelectedSource?: () => void;
  allowEmptyQuestion?: boolean;
};

export function QuestionEntry({
  theme,
  onSubmit,
  onAttachSource,
  onFilesSelected,
  onShowRecentSources,
  selectedSourceLabel,
  selectedSourceCaption,
  sourcePreviewAvailable,
  isSourcePreviewOpen,
  onPreviewSource,
  onClearSelectedSource,
  allowEmptyQuestion,
}: QuestionEntryProps) {
  const form = useForm<QuestionEntryValues>({
    resolver: zodResolver(questionEntrySchema),
    defaultValues: {
      question: "",
    },
  });
  const [isDraggingSource, setIsDraggingSource] = useState(false);

  const handleSubmit = form.handleSubmit(({ question }) => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion && !allowEmptyQuestion) {
      form.setError("question", {
        type: "manual",
        message: "A question needs at least a little more shape.",
      });
      return;
    }

    if (trimmedQuestion && trimmedQuestion.length < 4) {
      form.setError("question", {
        type: "manual",
        message: "A question needs at least a little more shape.",
      });
      return;
    }

    onSubmit(trimmedQuestion);
  });

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div
        className="relative flex items-center"
        onDragEnter={(event) => {
          if (!onFilesSelected) {
            return;
          }

          event.preventDefault();
          setIsDraggingSource(true);
        }}
        onDragOver={(event) => {
          if (!onFilesSelected) {
            return;
          }

          event.preventDefault();
          setIsDraggingSource(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsDraggingSource(false);
          }
        }}
        onDrop={(event) => {
          if (!onFilesSelected) {
            return;
          }

          event.preventDefault();
          setIsDraggingSource(false);
          onFilesSelected(event.dataTransfer.files);
        }}
      >
        <Input
          className={cn(
            "w-full min-w-0 rounded-full py-5 pl-8 pr-14 text-lg backdrop-blur-xl transition-all focus:outline-none sm:w-xl",
            theme === "dark"
              ? "border border-white/8 bg-white/3 text-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.2)] placeholder:text-slate-400 focus:border-cyan-500/30 focus:bg-white/6"
              : "border border-slate-200/55 bg-white/62 text-slate-800 shadow-[0_4px_24px_-4px_rgba(148,163,184,0.15)] placeholder:text-slate-400 focus:border-cyan-400/35 focus:bg-white/78",
            isDraggingSource &&
              (theme === "dark"
                ? "border-cyan-400/45 bg-cyan-400/8 shadow-[0_0_34px_rgba(34,211,238,0.12)]"
                : "border-cyan-400/45 bg-cyan-50/75"),
          )}
          placeholder=""
          aria-label="Learning question input"
          {...form.register("question")}
        />

        {isDraggingSource ? (
          <div
            className={cn(
              "pointer-events-none absolute left-8 text-sm tracking-wide",
              theme === "dark" ? "text-cyan-200/80" : "text-cyan-700/75",
            )}
          >
            Drop to attach source
          </div>
        ) : null}

        <button
          type="submit"
          aria-label="Start learning"
          className={cn(
            "absolute right-3 rounded-full bg-transparent p-2.5 transition-all duration-300",
            theme === "dark"
              ? "text-white/30 hover:bg-cyan-500/20 hover:text-cyan-400"
              : "text-slate-500 hover:bg-cyan-500/16 hover:text-cyan-600",
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>

      {selectedSourceLabel ? (
        <div
          className={cn(
            "mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs tracking-wide",
            theme === "dark" ? "text-slate-400" : "text-slate-500",
          )}
        >
          <span className="max-w-80 truncate">
            {"Source attached - "}
            {selectedSourceLabel}
            {selectedSourceCaption ? (
              <span className={theme === "dark" ? "text-slate-500" : "text-slate-400"}>
                {" - "}
                {selectedSourceCaption}
              </span>
            ) : null}
          </span>

          {sourcePreviewAvailable && onPreviewSource ? (
            <button
              type="button"
              onClick={onPreviewSource}
              className={cn(
                "transition-colors",
                isSourcePreviewOpen
                  ? theme === "dark"
                    ? "text-cyan-300"
                    : "text-cyan-700"
                  : theme === "dark"
                    ? "text-slate-500 hover:text-cyan-300"
                    : "text-slate-400 hover:text-cyan-700",
              )}
            >
              [ preview ]
            </button>
          ) : null}

          {onClearSelectedSource ? (
            <button
              type="button"
              onClick={onClearSelectedSource}
              className={cn(
                "transition-colors",
                theme === "dark"
                  ? "text-slate-500 hover:text-slate-200"
                  : "text-slate-400 hover:text-slate-700",
              )}
            >
              [ remove ]
            </button>
          ) : null}
        </div>
      ) : null}

      {onAttachSource || onShowRecentSources ? (
        <div className="mt-6 flex justify-center gap-8">
          {onAttachSource ? (
            <button
              type="button"
              onClick={onAttachSource}
              className={cn(
                "text-sm tracking-wide transition-colors",
                theme === "dark"
                  ? "text-slate-400 hover:text-slate-300"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              Attach a source
            </button>
          ) : null}

          {onShowRecentSources ? (
            <button
              type="button"
              onClick={onShowRecentSources}
              className={cn(
                "text-sm tracking-wide transition-colors",
                theme === "dark"
                  ? "text-slate-400 hover:text-slate-300"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              Recent sources
            </button>
          ) : null}
        </div>
      ) : null}

      <p
        className={cn(
          "min-h-5 text-center text-sm",
          theme === "dark" ? "text-rose-200/70" : "text-rose-600/80",
        )}
      >
        {form.formState.errors.question?.message ?? ""}
      </p>
    </form>
  );
}
