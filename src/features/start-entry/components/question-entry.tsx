import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";

const questionEntrySchema = z.object({
  question: z
    .string()
    .trim()
    .min(4, "A question needs at least a little more shape."),
});

type QuestionEntryValues = z.infer<typeof questionEntrySchema>;

type QuestionEntryProps = {
  onSubmit: (question: string) => void;
  onAttachSource?: () => void;
};

export function QuestionEntry({
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
          className="w-full min-w-0 rounded-full border border-white/5 bg-white/[0.03] py-5 pl-8 pr-14 text-lg text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all placeholder:text-white/20 focus:border-cyan-500/30 focus:bg-white/[0.06] focus:outline-none sm:w-[36rem]"
          placeholder="Ask a question, follow a curiosity, or begin with a why..."
          aria-label="Learning question input"
          {...form.register("question")}
        />

        <button
          type="submit"
          aria-label="Start learning"
          className="absolute right-3 rounded-full bg-transparent p-2.5 text-white/30 transition-all duration-300 hover:bg-cyan-500/20 hover:text-cyan-400"
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
            className="mt-6 text-sm tracking-wide text-slate-500 transition-colors hover:text-slate-300"
          >
            Attach a source
          </button>
        </div>
      ) : null}

      <p className="min-h-5 text-center text-sm text-rose-200/70">
        {form.formState.errors.question?.message ?? ""}
      </p>
    </form>
  );
}
