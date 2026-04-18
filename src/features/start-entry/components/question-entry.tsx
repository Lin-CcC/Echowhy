import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Theme } from "@/app/theme/theme-provider";

const questionEntrySchema = z.object({
  question: z
    .string()
    .trim()
    .min(4, "A question needs at least a little more shape."),
});

type QuestionEntryValues = z.infer<typeof questionEntrySchema>;

type QuestionEntryProps = {
  theme: Theme;
  onSubmit: (question: string) => void;
  onAttachSource?: () => void;
};

export function QuestionEntry({
  theme,
  onSubmit,
  onAttachSource,
}: QuestionEntryProps) {
  const form = useForm<QuestionEntryValues>({
    resolver: zodResolver(questionEntrySchema),
    defaultValues: {
      question: "",
    },
  });

  const handleSubmit = form.handleSubmit(({ question }) => onSubmit(question));

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="relative flex items-center">
        <Input
          className={cn(
            "w-full min-w-0 rounded-full py-5 pl-8 pr-14 text-lg backdrop-blur-xl transition-all focus:outline-none sm:w-xl",
            theme === "dark"
              ? "border border-white/8 bg-white/3 text-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.2)] placeholder:text-slate-400 focus:border-cyan-500/30 focus:bg-white/6"
              : "bg-white/60 backdrop-blur-xl border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)] text-slate-800 placeholder:text-slate-400 focus:bg-white/80 focus:border-cyan-400/40",
          )}
          placeholder="Ask a question, follow a curiosity, or begin with a why..."
          aria-label="Learning question input"
          {...form.register("question")}
        />

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

      {onAttachSource ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onAttachSource}
            className={cn(
              "mt-6 text-sm tracking-wide transition-colors",
              theme === "dark"
                ? "text-slate-400 hover:text-slate-300"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Attach a source
          </button>
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
