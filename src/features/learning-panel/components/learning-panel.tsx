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

function ReadingLine({
  children,
  shield,
}: {
  children: ReactNode;
  shield: boolean;
}) {
  return <span className={shield ? "reading-line-shield" : undefined}>{children}</span>;
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
  isDark: boolean;
  onPreviewReference: (referenceId: string) => void;
  onClearPreviewReference: () => void;
  onPinSource: (referenceId: string) => void;
};

function AnchorToken({
  children,
  referenceId,
  isActive,
  isDark,
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
        "inline-block rounded-sm border-b px-1 font-mono transition-all",
        !isDark && "text-halo-light",
        isActive
          ? "border-cyan-500 bg-cyan-500/5 text-cyan-700 dark:border-cyan-400 dark:bg-cyan-400/8 dark:text-cyan-400"
          : "border-dashed border-cyan-500/60 text-cyan-700 hover:border-solid hover:bg-cyan-500/8 dark:border-cyan-400/70 dark:text-cyan-400",
      )}
    >
      {children}
    </button>
  );
}

function renderBlockContent(
  step: TopicDiscussionStep,
  shield: boolean,
  isDark: boolean,
  activeReferenceIds: string[],
  onPreviewReference: (referenceId: string) => void,
  onClearPreviewReference: () => void,
  onPinSource: (referenceId: string) => void,
) {
  switch (step.block.id) {
    case "exp-login-first-proof":
      return (
        <p className="mb-8">
          <ReadingLine shield={shield}>
            The backend cannot verify a JWT during login because no token has
            been issued yet. It must first compare the submitted credentials
            against stored user data and account status.
          </ReadingLine>
        </p>
      );
    case "exp-service-separation":
      return (
        <p className="mb-8">
          <ReadingLine shield={shield}>
            The{" "}
            <AnchorToken
              referenceId="ref-auth-controller"
              isActive={activeReferenceIds.includes("ref-auth-controller")}
              isDark={isDark}
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
              isDark={isDark}
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
          <ReadingLine shield={shield}>
            Only after the backend decides the user is valid does{" "}
            <AnchorToken
              referenceId="ref-jwt-service"
              isActive={activeReferenceIds.includes("ref-jwt-service")}
              isDark={isDark}
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
          <ReadingLine shield={shield}>{step.block.content}</ReadingLine>
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
  const isDark = theme === "dark";
  const useLightShield = !isDark;
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
    <div className="mx-auto w-full max-w-3xl px-8 py-8 pb-24">
      <div className="mb-12">
        <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">
          <ReadingLine shield={useLightShield}>Learning Topic</ReadingLine>
        </p>
        <h1
          className={cn(
            "max-w-[18ch] text-balance text-3xl font-light tracking-tight text-slate-900 dark:text-slate-100 sm:max-w-[20ch] sm:text-4xl 2xl:max-w-none",
            useLightShield && "text-halo-soft-light bg-slate-50/35 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]",
          )}
        >
          {title}
        </h1>
      </div>

      <div className="mb-12 border-l-[3px] border-slate-300 pl-6 dark:border-cyan-800/42">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400">
          <ReadingLine shield={useLightShield}>Root Why</ReadingLine>
        </p>
        <p
          className={cn(
            "text-lg italic leading-relaxed text-slate-600 dark:text-slate-300",
            useLightShield && "text-halo-soft-light bg-slate-50/28 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]",
          )}
        >
          {rootQuestion}
        </p>
      </div>

      <div className="space-y-8 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
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
                      <ReadingLine shield={useLightShield}>
                        <span className="font-bold not-italic">Q:</span>{" "}
                        {step.question.prompt}
                      </ReadingLine>
                    </p>
                    <span className="text-xs text-slate-400 dark:text-slate-400">
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
                      <ReadingLine shield={useLightShield}>
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">Answer:</span>{" "}
                        {answerState.status === "skipped"
                          ? "Skipped for now."
                          : answerState.answer}
                      </ReadingLine>
                    </p>
                    {answerState.feedback ? (
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        <ReadingLine shield={useLightShield}>
                          <span className="font-bold text-cyan-600 dark:text-cyan-400">AI:</span>{" "}
                          {answerState.feedback.nextSuggestion}
                        </ReadingLine>
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">
                  <ReadingLine shield={useLightShield}>
                    {step.block.title ?? `Step ${index + 1}`}
                  </ReadingLine>
                </h3>
                {renderBlockContent(
                  step,
                  useLightShield,
                  isDark,
                  activeReferenceIds,
                  onPreviewReference,
                  onClearPreviewReference,
                  onPinSource,
                )}
              </div>

              {isCurrent ? (
                <div
                  className={cn(
                    "my-10 rounded-r-xl border-l-[2px] py-2 pl-6 transition-all",
                    isDark
                      ? "border-cyan-500/24 bg-transparent"
                      : "border-cyan-500/30 bg-transparent",
                  )}
                >
                  <p className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500" />
                    <ReadingLine shield={useLightShield}>Current Question</ReadingLine>
                  </p>
                  <p className="mb-6 text-lg font-light text-slate-900 dark:text-slate-100">
                    <ReadingLine shield={useLightShield}>{step.question.prompt}</ReadingLine>
                  </p>

                  <form onSubmit={handleSubmit}>
                    <textarea
                      {...form.register("answer")}
                      rows={1}
                      placeholder="Type your thought..."
                      className={cn(
                        "w-full resize-none border-b bg-transparent pb-2 transition-colors placeholder:italic focus:outline-none",
                        isDark
                          ? "border-cyan-700/45 text-slate-100 placeholder:text-slate-400 focus:border-cyan-400"
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
                        className="text-[11px] font-mono uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        [ Skip for now ]
                      </button>
                      <button
                        type="submit"
                        className="border border-cyan-600/50 px-5 py-2 text-xs uppercase tracking-widest text-cyan-700 transition-colors hover:bg-cyan-500 hover:text-white dark:border-cyan-800/45 dark:text-cyan-400 dark:hover:bg-cyan-400/12"
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
          <div
            className={cn(
              "my-10 rounded-r-xl border-l-[2px] py-2 pl-6",
              isDark
                ? "border-cyan-500/24 bg-transparent"
                : "border-cyan-500/30 bg-transparent",
            )}
          >
            <p className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500" />
              <ReadingLine shield={useLightShield}>Current state</ReadingLine>
            </p>
            <p className="text-lg font-light text-slate-900 dark:text-slate-100">
              <ReadingLine shield={useLightShield}>
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
