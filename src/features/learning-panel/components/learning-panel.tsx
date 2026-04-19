import { useEffect, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useThemeMode } from "@/app/theme/theme-provider";
import { cn } from "@/lib/utils";
import type {
  TopicAnswerState,
  TopicDiscussionStep,
  TopicSession,
} from "@/features/topic-session";

const answerSchema = z.object({
  answer: z.string().trim().min(8, "Try answering in a complete thought."),
});

const readingProtectionClass =
  "text-halo-light bg-[radial-gradient(ellipse_at_center,rgba(248,250,252,0.66)_0%,rgba(248,250,252,0.3)_42%,rgba(248,250,252,0)_78%)] dark:bg-transparent dark:text-halo-dark";

function ReadingLine({ children }: { children: ReactNode }) {
  return <span className="reading-line-shield">{children}</span>;
}

type AnswerValues = z.infer<typeof answerSchema>;

type LearningPanelProps = {
  title: string;
  rootQuestion: TopicSession["rootQuestion"];
  steps: TopicDiscussionStep[];
  currentStepIndex: number;
  unlockedStepCount: number;
  answerStateByQuestionId: Record<string, TopicAnswerState | undefined>;
  expandedHistoryIds: string[];
  activeReferenceIds: string[];
  onToggleHistory: (questionId: string) => void;
  onCheckCurrent: (answer: string) => void;
  onSkipCurrent: () => void;
  onPreviewReference: (referenceId: string) => void;
  onClearPreviewReference: () => void;
  onPinSource: (referenceId: string) => void;
};

type AnchorTokenProps = {
  children: string;
  referenceId: string;
  isActive: boolean;
  onPreviewReference: (referenceId: string) => void;
  onClearPreviewReference: () => void;
  onPinSource: (referenceId: string) => void;
};

function AnchorToken({
  children,
  referenceId,
  isActive,
  onPreviewReference,
  onClearPreviewReference,
  onPinSource,
}: AnchorTokenProps) {
  return (
    <button
      type="button"
      onMouseEnter={() => onPreviewReference(referenceId)}
      onMouseLeave={onClearPreviewReference}
      onClick={() => onPinSource(referenceId)}
      className={cn(
        "text-halo-light dark:text-halo-dark inline-block rounded-sm border-b px-1 font-mono transition-all",
        isActive
          ? "border-cyan-500 bg-cyan-500/5 text-cyan-700 dark:border-cyan-400 dark:bg-cyan-400/8 dark:text-cyan-300"
          : "border-dashed border-cyan-500/60 text-cyan-700 hover:border-solid hover:bg-cyan-500/8 dark:text-cyan-400",
      )}
    >
      {children}
    </button>
  );
}

function renderBlockContent(
  step: TopicDiscussionStep,
  activeReferenceIds: string[],
  onPreviewReference: (referenceId: string) => void,
  onClearPreviewReference: () => void,
  onPinSource: (referenceId: string) => void,
) {
  switch (step.block.id) {
    case "exp-login-first-proof":
      return (
        <p className="mb-8">
          <ReadingLine>
            The backend cannot verify a JWT during login because no token has
            been issued yet. It must first compare the submitted credentials
            against stored user data and account status.
          </ReadingLine>
        </p>
      );
    case "exp-service-separation":
      return (
        <p className="mb-8">
          <ReadingLine>
            The{" "}
            <AnchorToken
              referenceId="ref-auth-controller"
              isActive={activeReferenceIds.includes("ref-auth-controller")}
              onPreviewReference={onPreviewReference}
              onClearPreviewReference={onClearPreviewReference}
              onPinSource={onPinSource}
            >
              AuthController
            </AnchorToken>{" "}
            receives the HTTP request, but the actual decision about whether
            credentials are valid belongs in{" "}
            <AnchorToken
              referenceId="ref-auth-service"
              isActive={activeReferenceIds.includes("ref-auth-service")}
              onPreviewReference={onPreviewReference}
              onClearPreviewReference={onClearPreviewReference}
              onPinSource={onPinSource}
            >
              AuthService
            </AnchorToken>
            . That keeps the transport layer thin and the business rule explicit.
          </ReadingLine>
        </p>
      );
    case "exp-jwt-after-validation":
      return (
        <p className="mb-8">
          <ReadingLine>
            Only after the backend decides the user is valid does{" "}
            <AnchorToken
              referenceId="ref-jwt-service"
              isActive={activeReferenceIds.includes("ref-jwt-service")}
              onPreviewReference={onPreviewReference}
              onClearPreviewReference={onClearPreviewReference}
              onPinSource={onPinSource}
            >
              JwtService
            </AnchorToken>{" "}
            sign a token. Later protected requests can trust that token because
            the server itself created it after a successful login.
          </ReadingLine>
        </p>
      );
    default:
      return (
        <p className="mb-8">
          <ReadingLine>{step.block.content}</ReadingLine>
        </p>
      );
  }
}

export function LearningPanel({
  title,
  rootQuestion,
  steps,
  currentStepIndex,
  unlockedStepCount,
  answerStateByQuestionId,
  expandedHistoryIds,
  activeReferenceIds,
  onToggleHistory,
  onCheckCurrent,
  onSkipCurrent,
  onPreviewReference,
  onClearPreviewReference,
  onPinSource,
}: LearningPanelProps) {
  const { theme } = useThemeMode();
  const currentStep = steps[currentStepIndex];
  const currentAnswerState = currentStep
    ? answerStateByQuestionId[currentStep.question.id]
    : undefined;

  const form = useForm<AnswerValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: { answer: "" },
  });

  useEffect(() => {
    form.reset({ answer: "" });
  }, [currentStep?.question.id, form]);

  const handleSubmit = form.handleSubmit(({ answer }) => onCheckCurrent(answer));
  const visibleSteps = steps.slice(0, unlockedStepCount);
  const finishedAllSteps =
    unlockedStepCount === steps.length &&
    Boolean(currentStep) &&
    Boolean(currentAnswerState);

  return (
    <div className={cn("mx-auto w-full max-w-3xl px-8 py-16 sm:py-24", readingProtectionClass)}>
      <div className="mb-12">
        <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          <ReadingLine>Learning Topic</ReadingLine>
        </p>
        <h1 className="text-3xl font-light tracking-tight text-slate-900 dark:text-white/90 sm:text-4xl">
          <ReadingLine>{title}</ReadingLine>
        </h1>
      </div>

      <div className="mb-12 border-l-[3px] border-slate-300 pl-6 dark:border-slate-700">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
          <ReadingLine>Root Why</ReadingLine>
        </p>
        <p className="text-lg italic leading-relaxed text-slate-600 dark:text-slate-400">
          <ReadingLine>{rootQuestion}</ReadingLine>
        </p>
      </div>

      <div className="space-y-8 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300/80">
        {visibleSteps.map((step, index) => {
          const answerState = answerStateByQuestionId[step.question.id];
          const isHistoryExpanded = expandedHistoryIds.includes(step.question.id);
          const isCurrent = index === currentStepIndex && !finishedAllSteps;

          return (
            <div key={step.id}>
              {answerState ? (
                <div className="my-8 py-2 pl-6 opacity-80">
                  <button
                    type="button"
                    onClick={() => onToggleHistory(step.question.id)}
                    className="group flex w-full items-center justify-between text-left"
                  >
                    <p className="text-sm italic text-slate-500 transition-colors group-hover:text-cyan-600 dark:text-slate-400 dark:group-hover:text-cyan-400">
                      <ReadingLine>
                        <span className="font-bold not-italic">Q:</span>{" "}
                        {step.question.prompt}
                      </ReadingLine>
                    </p>
                    <span className="text-xs text-slate-400">
                      {isHistoryExpanded ? "-" : "+"}
                    </span>
                  </button>

                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-500 ease-in-out",
                      isHistoryExpanded ? "mt-3 max-h-56 opacity-100" : "max-h-0 opacity-0",
                    )}
                  >
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      <ReadingLine>
                        <span className="font-bold text-cyan-600 dark:text-cyan-500">Answer:</span>{" "}
                        {answerState.status === "skipped"
                          ? "Skipped for now."
                          : answerState.answer}
                      </ReadingLine>
                    </p>
                    {answerState.feedback ? (
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        <ReadingLine>
                          <span className="font-bold text-cyan-600 dark:text-cyan-500">AI:</span>{" "}
                          {answerState.feedback.nextSuggestion}
                        </ReadingLine>
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-slate-200">
                  <ReadingLine>{step.block.title ?? `Step ${index + 1}`}</ReadingLine>
                </h3>
                {renderBlockContent(
                  step,
                  activeReferenceIds,
                  onPreviewReference,
                  onClearPreviewReference,
                  onPinSource,
                )}
              </div>

              {isCurrent ? (
                <div className="my-10 rounded-r-xl border-l-[2px] border-cyan-500/40 bg-cyan-50/20 py-2 pl-6 transition-all dark:bg-cyan-950/10">
                  <p className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-500">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500" />
                    <ReadingLine>Current Question</ReadingLine>
                  </p>
                  <p className="mb-6 text-lg font-light text-slate-900 dark:text-white/90">
                    <ReadingLine>{step.question.prompt}</ReadingLine>
                  </p>

                  <form onSubmit={handleSubmit}>
                    <textarea
                      {...form.register("answer")}
                      rows={1}
                      placeholder="Type your thought..."
                      className={cn(
                        "w-full resize-none border-b bg-transparent pb-2 transition-colors placeholder:italic focus:outline-none",
                        theme === "dark"
                          ? "border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400"
                          : "border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-cyan-500",
                      )}
                    />

                    <div className="mt-2 text-sm text-rose-500/80 dark:text-rose-300/80">
                      {form.formState.errors.answer?.message ?? ""}
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-6">
                      <button
                        type="button"
                        onClick={onSkipCurrent}
                        className="text-[11px] font-mono uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        [ Skip for now ]
                      </button>
                      <button
                        type="submit"
                        className="border border-cyan-600/50 px-5 py-2 text-xs uppercase tracking-widest text-cyan-700 transition-colors hover:bg-cyan-500 hover:text-white dark:border-cyan-500/50 dark:text-cyan-400 dark:hover:bg-cyan-900/50"
                      >
                        [ Check ]
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}
            </div>
          );
        })}

        {finishedAllSteps ? (
          <div className="my-10 rounded-r-xl border-l-[2px] border-cyan-500/40 bg-cyan-50/20 py-2 pl-6 dark:bg-cyan-950/10">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500" />
              <ReadingLine>Current state</ReadingLine>
            </p>
            <p className="text-lg font-light text-slate-900 dark:text-white/90">
              <ReadingLine>
                This branch is grounded for now. The next step is to persist it
                into Library and let Review reopen it later.
              </ReadingLine>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
