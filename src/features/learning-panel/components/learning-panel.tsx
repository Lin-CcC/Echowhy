import {
  useEffect,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useThemeMode } from "@/app/theme/theme-provider";
import { cn } from "@/lib/utils";
import type {
  InsertedQuestionRecord,
  TopicAnswerState,
  TopicDiscussionStep,
} from "@/features/topic-session";

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
const WORKBENCH_INSERT_MIME = "application/echowhy-workbench-card";

type WorkbenchInsertPayload = {
  kind?: "feedback" | "source";
  id?: string;
  label?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  code?: string;
  meta?: string;
  insertPrompt?: string;
};

type InsertedWorkbenchBlock = {
  id: string;
  kind: "feedback" | "source";
  title: string;
  subtitle?: string;
  body?: string;
  code?: string;
  meta?: string;
};

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
  insertedQuestions: InsertedQuestionRecord[];
  onDraftAnswerChange: (questionId: string, draft: string) => void;
  onCustomQuestionDraftChange: (draft: string) => void;
  onToggleHistory: (questionId: string) => void;
  onInsertQuestion: (targetId: string, question: string) => void;
  onDeleteInsertedQuestion: (questionId: string) => void;
  onInsertedQuestionDraftChange: (questionId: string, draft: string) => void;
  onCheckInsertedQuestion: (questionId: string, answer: string) => void;
  onWorkbenchCardInserted: (payload: {
    kind?: "feedback" | "source";
    id?: string;
  }) => void;
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
  insertedQuestions,
  onDraftAnswerChange,
  onCustomQuestionDraftChange,
  onToggleHistory,
  onInsertQuestion,
  onDeleteInsertedQuestion,
  onInsertedQuestionDraftChange,
  onCheckInsertedQuestion,
  onWorkbenchCardInserted,
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
  const activeInsertTargetIdRef = useRef<string | null>(null);
  const readingAutoScrollFrameRef = useRef<number | null>(null);
  const readingAutoScrollStateRef = useRef<{
    container: HTMLElement;
    clientY: number;
    lastSeenAt: number;
    currentVelocity: number;
    lastFrameAt: number;
  } | null>(null);
  const [isInsertDragging, setIsInsertDragging] = useState(false);
  const [activeInsertTargetId, setActiveInsertTargetId] = useState<string | null>(null);
  const [insertComposerTargetId, setInsertComposerTargetId] = useState<string | null>(
    null,
  );
  const [insertQuestionDraft, setInsertQuestionDraft] = useState("");
  const [insertButtonPosition, setInsertButtonPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [insertedWorkbenchBlocksByTargetId, setInsertedWorkbenchBlocksByTargetId] =
    useState<Record<string, InsertedWorkbenchBlock[]>>({});

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
  const insertedQuestionsByTargetId = insertedQuestions.reduce<
    Record<string, InsertedQuestionRecord[]>
  >((accumulator, question) => {
    accumulator[question.targetId] = [
      ...(accumulator[question.targetId] ?? []),
      question,
    ];
    return accumulator;
  }, {});

  useEffect(() => {
    if (!isInsertDragging) {
      return;
    }

    function getTargetIdFromPoint(clientX: number, clientY: number) {
      const element = document.elementFromPoint(clientX, clientY);
      const target = element?.closest<HTMLElement>("[data-insert-target-id]");
      return target?.dataset.insertTargetId ?? null;
    }

    function handlePointerMove(event: PointerEvent) {
      const nextTargetId = getTargetIdFromPoint(event.clientX, event.clientY);

      setInsertButtonPosition({ x: event.clientX, y: event.clientY });
      setActiveInsertTargetId(nextTargetId);
      activeInsertTargetIdRef.current = nextTargetId;
    }

    function handlePointerUp() {
      if (activeInsertTargetIdRef.current) {
        setInsertComposerTargetId(activeInsertTargetIdRef.current);
        setInsertQuestionDraft("");
      }

      setIsInsertDragging(false);
      setActiveInsertTargetId(null);
      activeInsertTargetIdRef.current = null;
      setInsertButtonPosition(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isInsertDragging]);

  useEffect(() => stopReadingAutoScroll, []);

  function handleInsertDragStart(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsInsertDragging(true);
    setInsertButtonPosition({ x: event.clientX, y: event.clientY });
  }

  function handleSubmitInsertedQuestion(targetId: string) {
    const nextQuestion = insertQuestionDraft.trim();

    if (!nextQuestion) {
      return;
    }

    onInsertQuestion(targetId, nextQuestion);
    setInsertQuestionDraft("");
    setInsertComposerTargetId(null);
  }

  function stopReadingAutoScroll() {
    if (readingAutoScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(readingAutoScrollFrameRef.current);
      readingAutoScrollFrameRef.current = null;
    }

    readingAutoScrollStateRef.current = null;
  }

  function autoScrollNearestReadingArea(event: ReactDragEvent<HTMLElement>) {
    const scrollContainer = event.currentTarget.closest<HTMLElement>(
      "[data-auto-scroll-container]",
    );

    if (!scrollContainer) {
      return;
    }

    readingAutoScrollStateRef.current = {
      container: scrollContainer,
      clientY: event.clientY,
      lastSeenAt: performance.now(),
      currentVelocity: readingAutoScrollStateRef.current?.currentVelocity ?? 0,
      lastFrameAt: performance.now(),
    };

    if (readingAutoScrollFrameRef.current !== null) {
      return;
    }

    const tick = () => {
      const state = readingAutoScrollStateRef.current;

      if (!state) {
        readingAutoScrollFrameRef.current = null;
        return;
      }

      const now = performance.now();
      const frameDelta = Math.min((now - state.lastFrameAt) / 16.6667, 2.2);
      state.lastFrameAt = now;

      const bounds = state.container.getBoundingClientRect();
      const edgeSize = 176;
      const maxSpeed = 52;
      const topDistance = state.clientY - bounds.top;
      const bottomDistance = bounds.bottom - state.clientY;
      let targetVelocity = 0;

      if (topDistance < edgeSize) {
        const intensity = 1 - Math.max(topDistance, 0) / edgeSize;
        targetVelocity = -(maxSpeed * intensity * intensity * intensity);
      } else if (bottomDistance < edgeSize) {
        const intensity = 1 - Math.max(bottomDistance, 0) / edgeSize;
        targetVelocity = maxSpeed * intensity * intensity * intensity;
      }

      if (now - state.lastSeenAt > 380) {
        targetVelocity = 0;
      }

      const ease = Math.min(0.26 * frameDelta, 0.42);
      state.currentVelocity += (targetVelocity - state.currentVelocity) * ease;

      if (Math.abs(state.currentVelocity) > 0.08) {
        state.container.scrollTop += state.currentVelocity * frameDelta;
      }

      if (targetVelocity === 0 && Math.abs(state.currentVelocity) <= 0.08 && now - state.lastSeenAt > 520) {
        stopReadingAutoScroll();
        return;
      }

      readingAutoScrollFrameRef.current = window.requestAnimationFrame(tick);
    };

    readingAutoScrollFrameRef.current = window.requestAnimationFrame(tick);
  }

  function readWorkbenchInsertPayload(event: ReactDragEvent<HTMLElement>) {
    const rawPayload = event.dataTransfer.getData(WORKBENCH_INSERT_MIME);

    if (!rawPayload) {
      return null;
    }

    try {
      return JSON.parse(rawPayload) as WorkbenchInsertPayload;
    } catch {
      return null;
    }
  }

  function removeInsertedWorkbenchBlock(targetId: string, blockId: string) {
    setInsertedWorkbenchBlocksByTargetId((previous) => ({
      ...previous,
      [targetId]: (previous[targetId] ?? []).filter((block) => block.id !== blockId),
    }));
  }

  function handleWorkbenchCardDrop(
    event: ReactDragEvent<HTMLDivElement>,
    targetId: string,
  ) {
    const payload = readWorkbenchInsertPayload(event);

    if (!payload) {
      return;
    }

    event.preventDefault();
    const nextBlock: InsertedWorkbenchBlock = {
      id: `${payload.kind ?? "feedback"}-${payload.id ?? "card"}-${Date.now()}`,
      kind: payload.kind === "source" ? "source" : "feedback",
      title:
        payload.title ??
        payload.label ??
        (payload.kind === "source" ? "Source reference" : "Answer feedback"),
      subtitle: payload.subtitle,
      body: payload.body ?? payload.insertPrompt,
      code: payload.code,
      meta: payload.meta,
    };

    setInsertedWorkbenchBlocksByTargetId((previous) => ({
      ...previous,
      [targetId]: [...(previous[targetId] ?? []), nextBlock],
    }));
    onWorkbenchCardInserted({ kind: payload.kind, id: payload.id });
    setActiveInsertTargetId(null);
    activeInsertTargetIdRef.current = null;
    stopReadingAutoScroll();
  }

  function renderInsertedWorkbenchBlocks(targetId: string) {
    return (
      <>
        {(insertedWorkbenchBlocksByTargetId[targetId] ?? []).map((block) => (
          <article
            key={block.id}
            className={cn(
              "my-5 w-full max-w-full overflow-hidden border-l-[2px] py-3 pl-5 transition-colors",
              block.kind === "source"
                ? "border-cyan-500/35"
                : "border-amber-400/35 dark:border-amber-300/35",
            )}
          >
            <div className="mb-2 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
                  <ReadingLine shield={useLightShield}>
                    {block.kind === "source" ? "Source insert" : "Feedback insert"}
                  </ReadingLine>
                </p>
                <h4 className="break-words text-sm font-semibold text-slate-700 dark:text-slate-100">
                  <ReadingLine shield={useLightShield}>{block.title}</ReadingLine>
                </h4>
                {block.subtitle ? (
                  <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">
                    <ReadingLine shield={useLightShield}>{block.subtitle}</ReadingLine>
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => removeInsertedWorkbenchBlock(targetId, block.id)}
                className="shrink-0 font-mono text-[10px] tracking-widest text-slate-400 transition-colors hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-300"
                aria-label="Remove inserted content"
              >
                [x]
              </button>
            </div>

            {block.body ? (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <ReadingLine shield={useLightShield}>{block.body}</ReadingLine>
              </p>
            ) : null}

            {block.code ? (
              <pre className="source-workbench-scrollbar mt-3 max-h-72 w-full overflow-auto border-l border-cyan-500/25 bg-cyan-500/[0.025] p-3 text-[12px] leading-relaxed text-cyan-700 dark:bg-cyan-400/[0.035] dark:text-cyan-300">
                <code className="whitespace-pre-wrap break-words">{block.code}</code>
              </pre>
            ) : null}

            {block.meta ? (
              <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                <ReadingLine shield={useLightShield}>{block.meta}</ReadingLine>
              </p>
            ) : null}
          </article>
        ))}
      </>
    );
  }

  function renderInsertedQuestionCards(targetId: string) {
    return (
      <>
        {(insertedQuestionsByTargetId[targetId] ?? []).map((question) => (
          <div
            key={question.id}
            id={`question-${question.id}`}
            className={cn(
              "my-6 border-l-[2px] py-2 pl-6 transition-colors",
              question.answerState?.status === "passed"
                ? "border-cyan-400/55"
                : "border-cyan-500/40",
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
                <ReadingLine shield={useLightShield}>My question</ReadingLine>
              </p>
              <button
                type="button"
                onClick={() => onDeleteInsertedQuestion(question.id)}
                className="font-mono text-[10px] tracking-widest text-slate-400 transition-colors hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-300"
                aria-label="Delete inserted question"
              >
                [x]
              </button>
            </div>
            <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">
              <ReadingLine shield={useLightShield}>{question.prompt}</ReadingLine>
            </p>

            <textarea
              rows={1}
              value={question.answerDraft ?? question.answerState?.answer ?? ""}
              onChange={(event) =>
                onInsertedQuestionDraftChange(question.id, event.target.value)
              }
              placeholder="Type your thought..."
              className={cn(
                "mt-5 w-full min-h-[2.15rem] resize-none border-b bg-transparent pb-1 leading-7 transition-colors [field-sizing:content] placeholder:italic focus:outline-none",
                isDark
                  ? "border-cyan-700/45 text-slate-200 placeholder:text-slate-400 focus:border-cyan-400"
                  : "border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-cyan-500",
              )}
            />

            {question.answerState?.feedback ? (
              <div className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-300">
                <p>
                  <ReadingLine shield={useLightShield}>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">
                      AI:
                    </span>{" "}
                    {question.answerState.feedback.nextSuggestion}
                  </ReadingLine>
                </p>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-slate-400">
                  <ReadingLine shield={useLightShield}>
                    {question.answerState.feedback.label} /{" "}
                    {question.answerState.feedback.score}/100
                  </ReadingLine>
                </p>
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-end">
              <button
                type="button"
                onClick={() =>
                  onCheckInsertedQuestion(
                    question.id,
                    question.answerDraft ?? question.answerState?.answer ?? "",
                  )
                }
                className="border border-cyan-600/45 px-5 py-2 text-xs uppercase tracking-widest text-cyan-700 transition-colors hover:bg-cyan-500 hover:text-white dark:border-cyan-400/45 dark:text-cyan-400 dark:hover:bg-cyan-400/12"
              >
                [ Check ]
              </button>
            </div>
          </div>
        ))}
      </>
    );
  }

  function renderInsertSlot(targetId: string) {
    const isActive = activeInsertTargetId === targetId;
    const isComposing = insertComposerTargetId === targetId;

    return (
      <div
        data-insert-target-id={targetId}
        className="relative my-2 min-h-5"
        onDragOver={(event) => {
          if (Array.from(event.dataTransfer.types).includes(WORKBENCH_INSERT_MIME)) {
            event.preventDefault();
            autoScrollNearestReadingArea(event);
            setActiveInsertTargetId(targetId);
          }
        }}
        onDragLeave={() => {
          setActiveInsertTargetId((current) => (current === targetId ? null : current));
        }}
        onDrop={(event) => handleWorkbenchCardDrop(event, targetId)}
      >
        <div
          className={cn(
            "pointer-events-none absolute left-0 right-0 top-1/2 z-10 h-px -translate-y-1/2 transition-all duration-200",
            isActive
              ? "bg-cyan-300/90 shadow-[0_0_18px_rgba(34,211,238,0.32)]"
              : "bg-transparent",
          )}
        />

        {isComposing ? (
          <form
            className="my-4 border-l-[2px] border-cyan-500/40 py-2 pl-6"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmitInsertedQuestion(targetId);
            }}
          >
            <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
              <ReadingLine shield={useLightShield}>My question</ReadingLine>
            </p>
            <textarea
              autoFocus
              rows={1}
              value={insertQuestionDraft}
              onChange={(event) => setInsertQuestionDraft(event.target.value)}
              placeholder="Drop one sharp why here..."
              className={cn(
                "w-full min-h-[2.15rem] resize-none border-b bg-transparent pb-1 leading-7 transition-colors [field-sizing:content] placeholder:italic focus:outline-none",
                isDark
                  ? "border-cyan-700/45 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400"
                  : "border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-cyan-500",
              )}
            />
            <div className="mt-4 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setInsertComposerTargetId(null);
                  setInsertQuestionDraft("");
                }}
                className="text-[10px] font-mono uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                [ cancel ]
              </button>
              <button
                type="submit"
                className="border border-cyan-600/45 px-4 py-1.5 text-[10px] uppercase tracking-widest text-cyan-700 transition-colors hover:bg-cyan-500 hover:text-white dark:border-cyan-400/45 dark:text-cyan-400 dark:hover:bg-cyan-400/12"
              >
                [ insert ]
              </button>
            </div>
          </form>
        ) : null}

        {renderInsertedWorkbenchBlocks(targetId)}
        {renderInsertedQuestionCards(targetId)}
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-3xl px-8 py-8 pb-24"
      onDragOver={(event) => {
        if (Array.from(event.dataTransfer.types).includes(WORKBENCH_INSERT_MIME)) {
          autoScrollNearestReadingArea(event);
        }
      }}
      onDrop={stopReadingAutoScroll}
    >
      <button
        type="button"
        onPointerDown={handleInsertDragStart}
        style={
          insertButtonPosition
            ? {
                left: insertButtonPosition.x,
                top: insertButtonPosition.y,
                transform: "translate(-50%, -50%)",
              }
            : undefined
        }
        className={cn(
          "fixed z-40 select-none border border-cyan-500/35 bg-slate-950/25 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/80 backdrop-blur-md hover:border-cyan-400/60 hover:text-cyan-300",
          isInsertDragging
            ? "pointer-events-none cursor-grabbing transition-none"
            : "cursor-grab transition-colors",
          insertButtonPosition
            ? ""
            : "bottom-8 left-1/2 -translate-x-[25rem]",
        )}
      >
        [ + why ]
      </button>

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

      <div
        data-insert-target-id="after-root"
        className="mb-12 border-l-[3px] border-slate-300 pl-6 dark:border-cyan-800/42"
      >
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

      {renderInsertSlot("after-root")}

      <div className="space-y-8 text-[15px] font-normal leading-relaxed text-slate-700 dark:text-slate-300 dark:[text-shadow:0_0_8px_#0a0f1a,_0_0_16px_#0a0f1a]">
        {visibleSteps.map((step, index) => {
          const answerState = answerStateByQuestionId[step.question.id];
          const isHistoryExpanded = !answerState?.isCollapsed;
          const isCurrent = index === currentStepIndex && !showCompletionCard;
          const showHistoryCard = Boolean(answerState && answerState.status !== "failed");

          return (
            <div key={step.id} data-insert-target-id={`after-step:${step.id}`}>
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

              {renderInsertSlot(`after-step:${step.id}`)}

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
                      rows={1}
                      placeholder={step.question.inputPlaceholder ?? "Type your thought..."}
                      className={cn(
                        "w-full min-h-[2.15rem] resize-none border-b bg-transparent pb-1 leading-7 transition-colors [field-sizing:content] placeholder:italic focus:outline-none",
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
                rows={1}
                placeholder="Or ask any follow-up you want to understand next..."
                className={cn(
                  "w-full min-h-[2.15rem] resize-none border-b bg-transparent pb-1 leading-7 transition-colors [field-sizing:content] placeholder:italic focus:outline-none",
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
