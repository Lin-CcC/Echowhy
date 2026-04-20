import { useEffect, useRef, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useThemeMode } from "@/app/theme/theme-provider";
import { cn } from "@/lib/utils";
import type { TopicAnswerState, TopicDiscussionStep } from "@/features/topic-session";

const answerSchema = z.object({
  answer: z.string().trim().min(8, "Try answering in a complete thought."),
});

const customQuestionSchema = z.object({
  question: z.string().trim().min(6, "Give this follow-up a little more shape."),
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
type CustomQuestionValues = z.infer<typeof customQuestionSchema>;

type LearningPanelProps = {
  title: string;
  rootQuestion: string;
  steps: TopicDiscussionStep[];
  currentStepIndex: number;
  visibleStepCount: number;
  answerStateByQuestionId: Record<string, TopicAnswerState | undefined>;
  activeReferenceIds: string[];
  highlightedBlockId: string | null;
  prefilledAnswer?: string;
  showCustomComposer: boolean;
  customQuestionDraft: string;
  showCompletionCard: boolean;
  activeAngleTitle: string;
  canExploreAnotherAngle: boolean;
  onDraftAnswerChange: (questionId: string, draft: string) => void;
  onCustomQuestionDraftChange: (draft: string) => void;
  onToggleHistory: (questionId: string) => void;
  onCheckCurrent: (answer: string) => void;
  onSkipCurrent: () => void;
  onTryAgain: () => void;
  onRevealAnswer: () => void;
  onPreviewReference: (referenceId: string) => void;
  onClearPreviewReference: () => void;
  onPinSource: (referenceId: string) => void;
  onSubmitCustomQuestion: (question: string) => void;
  onExploreAnotherAngle: () => void;
  onReturnToLibrary: () => void;
  onAskFollowUp: () => void;
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
    case "exp-controller-entry":
      return (
        <p className="mb-8">
          <ReadingLine shield={shield}>
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
            receives the HTTP request because something has to translate the
            outside world into the app's internal flow. But it should hand the
            actual credential truth down to{" "}
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
            .
          </ReadingLine>
        </p>
      );
    case "exp-service-separation":
      return (
        <p className="mb-8">
          <ReadingLine shield={shield}>
            The actual decision about whether credentials are valid belongs in{" "}
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
            . That keeps the transport layer thin and the business rule
            explicit.
          </ReadingLine>
        </p>
      );
    case "exp-controller-thin":
      return (
        <p className="mb-8">
          <ReadingLine shield={shield}>
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
            still owns request parsing, validation annotations, and shaping the
            response. It does not own the meaning of a valid login; it delegates
            that rule.
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
    case "exp-jwt-trust":
      return (
        <p className="mb-8">
          <ReadingLine shield={shield}>
            A later protected endpoint is not re-checking the raw password. It
            is trusting a server-issued token that already encodes the result of
            a past authentication decision.
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

function InlineFeedback({
  answerState,
  useLightShield,
}: {
  answerState: TopicAnswerState;
  useLightShield: boolean;
}) {
  if (!answerState.feedback) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-300">
      <p>
        <ReadingLine shield={useLightShield}>
          <span className="font-bold text-cyan-600 dark:text-cyan-400">AI:</span>{" "}
          {answerState.feedback.nextSuggestion}
        </ReadingLine>
      </p>
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-slate-400">
        <ReadingLine shield={useLightShield}>
          {answerState.feedback.label} · {answerState.feedback.score}/100
        </ReadingLine>
      </p>
    </div>
  );
}

export function LearningPanel({
  title,
  rootQuestion,
  steps,
  currentStepIndex,
  visibleStepCount,
  answerStateByQuestionId,
  activeReferenceIds,
  highlightedBlockId,
  prefilledAnswer,
  showCustomComposer,
  customQuestionDraft,
  showCompletionCard,
  activeAngleTitle,
  canExploreAnotherAngle,
  onDraftAnswerChange,
  onCustomQuestionDraftChange,
  onToggleHistory,
  onCheckCurrent,
  onSkipCurrent,
  onTryAgain,
  onRevealAnswer,
  onPreviewReference,
  onClearPreviewReference,
  onPinSource,
  onSubmitCustomQuestion,
  onExploreAnotherAngle,
  onReturnToLibrary,
  onAskFollowUp,
}: LearningPanelProps) {
  const { theme } = useThemeMode();
  const isDark = theme === "dark";
  const useLightShield = !isDark;
  const currentStep = steps[currentStepIndex];
  const currentAnswerState = currentStep
    ? answerStateByQuestionId[currentStep.question.id]
    : undefined;

  const answerForm = useForm<AnswerValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: { answer: prefilledAnswer ?? "" },
  });

  const customQuestionForm = useForm<CustomQuestionValues>({
    resolver: zodResolver(customQuestionSchema),
    defaultValues: { question: customQuestionDraft },
  });

  const lastQuestionIdRef = useRef<string | null>(null);
  const lastCustomComposerVisibleRef = useRef(false);

  useEffect(() => {
    const nextQuestionId = currentStep?.question.id ?? null;

    if (!nextQuestionId) {
      lastQuestionIdRef.current = null;
      return;
    }

    const nextAnswer = prefilledAnswer ?? "";
    const currentValue = answerForm.getValues("answer") ?? "";
    const questionChanged = lastQuestionIdRef.current !== nextQuestionId;

    if (questionChanged || currentValue !== nextAnswer) {
      answerForm.reset({ answer: nextAnswer });
    }

    lastQuestionIdRef.current = nextQuestionId;
  }, [currentStep?.question.id, prefilledAnswer, answerForm]);

  useEffect(() => {
    if (!showCustomComposer) {
      lastCustomComposerVisibleRef.current = false;
      return;
    }

    const nextQuestion = customQuestionDraft ?? "";
    const currentValue = customQuestionForm.getValues("question") ?? "";
    const composerBecameVisible = !lastCustomComposerVisibleRef.current;

    if (composerBecameVisible || currentValue !== nextQuestion) {
      customQuestionForm.reset({ question: nextQuestion });
    }

    lastCustomComposerVisibleRef.current = true;
  }, [customQuestionDraft, customQuestionForm, showCustomComposer]);

  const handleSubmit = answerForm.handleSubmit(({ answer }) => onCheckCurrent(answer));
  const handleCustomQuestionSubmit = customQuestionForm.handleSubmit(({ question }) =>
    onSubmitCustomQuestion(question),
  );

  const answerField = answerForm.register("answer");
  const customQuestionField = customQuestionForm.register("question");

  const visibleSteps = steps.slice(0, visibleStepCount);
  const failedCurrentAttempt = currentAnswerState?.status === "failed";

  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-8 pb-24">
      <div className="mb-12">
        <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          <ReadingLine shield={useLightShield}>Learning Topic</ReadingLine>
        </p>
        <h1
          className={cn(
            "max-w-[18ch] text-balance text-3xl font-light tracking-tight text-slate-900 dark:text-white dark:[text-shadow:0_0_12px_#0a0f1a,_0_0_24px_#0a0f1a] sm:max-w-[20ch] sm:text-4xl 2xl:max-w-none",
            useLightShield &&
              "text-halo-soft-light bg-slate-50/35 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]",
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
            "text-lg font-normal italic leading-relaxed text-slate-600 dark:text-slate-200 dark:[text-shadow:0_0_10px_#0a0f1a,_0_0_20px_#0a0f1a]",
            useLightShield &&
              "text-halo-soft-light bg-slate-50/28 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]",
          )}
        >
          {rootQuestion}
        </p>
      </div>

      <div className="space-y-8 text-[15px] font-normal leading-relaxed text-slate-700 dark:text-slate-300 dark:[text-shadow:0_0_8px_#0a0f1a,_0_0_16px_#0a0f1a]">
        {visibleSteps.map((step, index) => {
          const answerState = answerStateByQuestionId[step.question.id];
          const isHistoryExpanded = !answerState?.isCollapsed;
          const isCurrent = index === currentStepIndex && !showCompletionCard;
          const showHistoryCard = Boolean(answerState && answerState.status !== "failed");

          return (
            <div key={step.id}>
              {showHistoryCard ? (
                <div
                  id={`question-${step.question.id}`}
                  className="my-8 py-2 pl-6"
                >
                  <button
                    type="button"
                    onClick={() => onToggleHistory(step.question.id)}
                    className="group flex w-full items-center justify-between gap-4 text-left"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-normal italic text-slate-500 transition-colors group-hover:text-cyan-600 dark:text-slate-200 dark:group-hover:text-cyan-400">
                        <ReadingLine shield={useLightShield}>
                          <span className="font-bold not-italic">Q:</span>{" "}
                          {step.question.prompt}
                        </ReadingLine>
                      </p>
                      {answerState?.summary ? (
                        <p className="text-sm text-slate-500 dark:text-slate-300">
                          <ReadingLine shield={useLightShield}>
                            {answerState.summary}
                          </ReadingLine>
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-xs text-slate-400 dark:text-slate-400">
                      {isHistoryExpanded ? "-" : "+"}
                    </span>
                  </button>

                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-out",
                      isHistoryExpanded ? "mt-3 max-h-96 opacity-100" : "max-h-0 opacity-0",
                    )}
                  >
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      <ReadingLine shield={useLightShield}>
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">
                          Answer:
                        </span>{" "}
                        {answerState?.status === "skipped"
                          ? "Skipped for now."
                          : answerState?.answer}
                      </ReadingLine>
                    </p>
                    {answerState ? (
                      <InlineFeedback
                        answerState={answerState}
                        useLightShield={useLightShield}
                      />
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div
                id={`block-${step.block.id}`}
                className={cn(
                  "-mx-4 px-4 py-2 transition-colors duration-300",
                  highlightedBlockId === step.block.id &&
                    "block-focus-flash",
                )}
              >
                <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-slate-200 dark:tracking-[0.1em]">
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
                  id={`question-${step.question.id}`}
                  className={cn(
                    "my-10 rounded-r-xl border-l-[2px] py-2 pl-6 transition-all",
                    isDark
                      ? "border-cyan-400/45 bg-transparent"
                      : "border-cyan-500/30 bg-transparent",
                  )}
                >
                  <p className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500" />
                    <ReadingLine shield={useLightShield}>Current Question</ReadingLine>
                  </p>
                  <p className="mb-6 text-lg font-light text-slate-900 dark:text-slate-100 dark:[text-shadow:0_0_10px_#0a0f1a,_0_0_20px_#0a0f1a]">
                    <ReadingLine shield={useLightShield}>{step.question.prompt}</ReadingLine>
                  </p>

                  <form onSubmit={handleSubmit}>
                    <textarea
                      {...answerField}
                      onChange={(event) => {
                        answerField.onChange(event);

                        if (currentStep) {
                          onDraftAnswerChange(currentStep.question.id, event.target.value);
                        }
                      }}
                      rows={2}
                      placeholder={step.question.inputPlaceholder ?? "Type your thought..."}
                      className={cn(
                        "w-full resize-none border-b bg-transparent pb-2 transition-colors placeholder:italic focus:outline-none",
                        isDark
                          ? "border-cyan-700/45 text-slate-200 placeholder:text-slate-400 focus:border-cyan-400"
                          : "border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-cyan-500",
                      )}
                    />

                    <div className="mt-2 text-sm text-rose-500/80 dark:text-rose-300/80">
                      {answerForm.formState.errors.answer?.message ?? ""}
                    </div>

                    {failedCurrentAttempt && currentAnswerState?.feedback ? (
                      <div className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-300">
                        <p>
                          <ReadingLine shield={useLightShield}>
                            This doesn't seem quite right. Want to try again or
                            reveal the answer?
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
                        className="border border-cyan-600/50 px-5 py-2 text-xs uppercase tracking-widest text-cyan-700 transition-colors hover:bg-cyan-500 hover:text-white dark:border-cyan-400/45 dark:text-cyan-400 dark:hover:bg-cyan-400/12"
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

        {showCustomComposer ? (
          <div className="my-10 rounded-r-xl border-l-[2px] border-cyan-400/45 py-2 pl-6">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
              <ReadingLine shield={useLightShield}>My own why</ReadingLine>
            </p>
            <form onSubmit={handleCustomQuestionSubmit}>
              <textarea
                {...customQuestionField}
                onChange={(event) => {
                  customQuestionField.onChange(event);
                  onCustomQuestionDraftChange(event.target.value);
                }}
                rows={2}
                placeholder="Or ask any follow-up you want to understand next..."
                className={cn(
                  "w-full resize-none border-b bg-transparent pb-2 transition-colors placeholder:italic focus:outline-none",
                  isDark
                    ? "border-cyan-700/45 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400"
                    : "border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-cyan-500",
                )}
              />
              <div className="mt-2 text-sm text-rose-500/80 dark:text-rose-300/80">
                {customQuestionForm.formState.errors.question?.message ?? ""}
              </div>
              <div className="mt-6 flex items-center justify-end">
                <button
                  type="submit"
                  className="border border-cyan-600/50 px-5 py-2 text-xs uppercase tracking-widest text-cyan-700 transition-colors hover:bg-cyan-500 hover:text-white dark:border-cyan-400/45 dark:text-cyan-400 dark:hover:bg-cyan-400/12"
                >
                  [ Start branch ]
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {showCompletionCard ? (
          <div className="my-10 rounded-2xl border border-slate-200/50 p-6 dark:border-cyan-800/30">
            <p className="mb-3 text-lg font-medium text-slate-900 dark:text-slate-100">
              Topic Mastered!
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              You have completed the "{activeAngleTitle}" angle of this topic.
            </p>

            <div className="mt-6">
              <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                What would you like to do next?
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onExploreAnotherAngle}
                  disabled={!canExploreAnotherAngle}
                  className="border border-slate-200/60 px-4 py-2 text-xs uppercase tracking-widest text-slate-600 transition-colors hover:border-cyan-400 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-cyan-800/30 dark:text-slate-300 dark:hover:border-cyan-400 dark:hover:text-cyan-400"
                >
                  [ Explore another angle ]
                </button>
                <button
                  type="button"
                  onClick={onReturnToLibrary}
                  className="border border-slate-200/60 px-4 py-2 text-xs uppercase tracking-widest text-slate-600 transition-colors hover:border-cyan-400 hover:text-cyan-600 dark:border-cyan-800/30 dark:text-slate-300 dark:hover:border-cyan-400 dark:hover:text-cyan-400"
                >
                  [ Return to Library ]
                </button>
                <button
                  type="button"
                  onClick={onAskFollowUp}
                  className="border border-slate-200/60 px-4 py-2 text-xs uppercase tracking-widest text-slate-600 transition-colors hover:border-cyan-400 hover:text-cyan-600 dark:border-cyan-800/30 dark:text-slate-300 dark:hover:border-cyan-400 dark:hover:text-cyan-400"
                >
                  [ Ask a follow-up question ]
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
