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
  TopicFeedbackLevel,
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
  feedbackLevel?: TopicFeedbackLevel;
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
  feedbackLevel?: TopicFeedbackLevel;
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
        <p>
          <ReadingLine shield={shield}>
            The backend cannot verify a JWT during login because no token has
            been issued yet. It must first compare the submitted credentials
            against stored user data and account status.
          </ReadingLine>
        </p>
      );
    case "exp-controller-entry":
      return (
        <p>
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
        <p>
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
        <p>
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
        <p>
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
        <p>
          <ReadingLine shield={shield}>
            A later protected endpoint is not re-checking the raw password. It
            is trusting a server-issued token that already encodes the result of
            a past authentication decision.
          </ReadingLine>
        </p>
      );
    default:
      return (
        <p>
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
    <div className="mt-2.5 space-y-1.5 text-sm text-slate-500 dark:text-slate-300">
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
  const insertDragDelayTimeoutRef = useRef<number | null>(null);
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
  const [isFloatingWindowHovered, setIsFloatingWindowHovered] = useState(false);
  const [isFloatingWindowFocused, setIsFloatingWindowFocused] = useState(false);
  const [insertedWorkbenchBlocksByTargetId, setInsertedWorkbenchBlocksByTargetId] =
    useState<Record<string, InsertedWorkbenchBlock[]>>({});

  const floatingWindowShellClass = cn(
    "overflow-hidden bg-transparent transition-all duration-200",
    isDark ? "bg-cyan-500/[0.02]" : "bg-cyan-500/[0.03]",
  );
  const floatingWindowTitleClass = cn(
    "text-[10px] font-mono uppercase tracking-[0.24em]",
    isDark ? "text-cyan-400" : "text-cyan-700",
  );
  const floatingWindowTextareaClass = cn(
    "w-full min-h-[2.15rem] resize-none border-b bg-transparent pb-1 leading-7 transition-colors [field-sizing:content] placeholder:italic focus:outline-none focus:ring-0",
    isDark
      ? "border-cyan-800/50 text-slate-200 placeholder:text-slate-400 focus:border-cyan-400"
      : "border-cyan-200 text-slate-800 placeholder:text-slate-400 focus:border-cyan-500",
  );
  const floatingWindowSecondaryActionClass = cn(
    "text-[11px] font-mono uppercase tracking-[0.16em] transition-colors",
    isDark
      ? "text-slate-500 hover:text-cyan-400"
      : "text-slate-400 hover:text-cyan-700",
  );
  const floatingWindowPrimaryActionClass = cn(
    "border border-transparent px-0 py-0 text-[11px] font-mono uppercase tracking-[0.16em] transition-colors",
    isDark
      ? "text-cyan-400 hover:text-cyan-300"
      : "text-cyan-700 hover:text-cyan-600",
  );

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

  function resolveInsertTargetIdAtPoint(clientX: number, clientY: number) {
    const hitElement = document.elementFromPoint(clientX, clientY);

    if (hitElement?.closest("[data-insert-disabled='true']")) {
      return null;
    }

    const candidateTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-insert-target-id]"),
    )
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          node,
          targetId: node.dataset.insertTargetId ?? "",
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          centerY: rect.top + rect.height / 2,
        };
      })
      .filter(
        (target) =>
          target.targetId &&
          target.right > target.left &&
          target.bottom > target.top &&
          clientX >= target.left - 32 &&
          clientX <= target.right + 32 &&
          !target.node.closest("[data-insert-disabled='true']"),
      )
      .sort((left, right) => left.centerY - right.centerY);

    if (candidateTargets.length === 0) {
      return null;
    }

    const clusterThreshold = 44;
    const clusters: typeof candidateTargets[] = [];

    for (const target of candidateTargets) {
      const lastCluster = clusters[clusters.length - 1];

      if (!lastCluster) {
        clusters.push([target]);
        continue;
      }

      const lastCenterY =
        lastCluster[lastCluster.length - 1]?.centerY ?? target.centerY;

      if (Math.abs(target.centerY - lastCenterY) <= clusterThreshold) {
        lastCluster.push(target);
      } else {
        clusters.push([target]);
      }
    }

    const nearestCluster = clusters.reduce<typeof candidateTargets | null>(
      (bestCluster, cluster) => {
        const clusterTop = cluster[0]?.top ?? 0;
        const clusterBottom = cluster[cluster.length - 1]?.bottom ?? clusterTop;
        const clusterCenterY = (clusterTop + clusterBottom) / 2;

        if (!bestCluster) {
          return cluster;
        }

        const bestTop = bestCluster[0]?.top ?? 0;
        const bestBottom =
          bestCluster[bestCluster.length - 1]?.bottom ?? bestTop;
        const bestCenterY = (bestTop + bestBottom) / 2;

        return Math.abs(clientY - clusterCenterY) <
          Math.abs(clientY - bestCenterY)
          ? cluster
          : bestCluster;
      },
      null,
    );

    if (!nearestCluster || nearestCluster.length === 0) {
      return null;
    }

    const canonicalTarget =
      nearestCluster[Math.floor((nearestCluster.length - 1) / 2)] ??
      nearestCluster[0];

    return canonicalTarget?.targetId ?? null;
  }

  useEffect(() => {
    if (!isInsertDragging) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      const nextTargetId = resolveInsertTargetIdAtPoint(
        event.clientX,
        event.clientY,
      );

      setInsertButtonPosition({ x: event.clientX, y: event.clientY });
      setActiveInsertTargetId(nextTargetId);
      activeInsertTargetIdRef.current = nextTargetId;
    }

    function handlePointerUp() {
      if (activeInsertTargetIdRef.current) {
        setInsertComposerTargetId(activeInsertTargetIdRef.current);
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

  useEffect(() => {
    return () => {
      if (insertDragDelayTimeoutRef.current !== null) {
        window.clearTimeout(insertDragDelayTimeoutRef.current);
      }
    };
  }, []);

  function clearInsertDragDelay() {
    if (insertDragDelayTimeoutRef.current !== null) {
      window.clearTimeout(insertDragDelayTimeoutRef.current);
      insertDragDelayTimeoutRef.current = null;
    }
  }

  function cancelFloatingInsert(options?: { clearDraft?: boolean }) {
    clearInsertDragDelay();
    setIsInsertDragging(false);
    setInsertComposerTargetId(null);
    setActiveInsertTargetId(null);
    setIsFloatingWindowFocused(false);
    setIsFloatingWindowHovered(false);
    activeInsertTargetIdRef.current = null;
    setInsertButtonPosition(null);
    stopReadingAutoScroll();

    if (options?.clearDraft) {
      setInsertQuestionDraft("");
    }
  }

  useEffect(() => {
    if (!isInsertDragging && !insertComposerTargetId) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      cancelFloatingInsert();
    }

    function handleContextMenu(event: MouseEvent) {
      if (!isInsertDragging) {
        return;
      }

      event.preventDefault();
      cancelFloatingInsert();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [insertComposerTargetId, isInsertDragging]);

  function handleInsertDragStart(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    clearInsertDragDelay();

    insertDragDelayTimeoutRef.current = window.setTimeout(() => {
      setIsInsertDragging(true);
      setInsertButtonPosition({ x: event.clientX, y: event.clientY });
      insertDragDelayTimeoutRef.current = null;
    }, 100);

    function handlePointerUpBeforeDrag() {
      clearInsertDragDelay();
      window.removeEventListener("pointerup", handlePointerUpBeforeDrag);
    }

    window.addEventListener("pointerup", handlePointerUpBeforeDrag, {
      once: true,
    });
  }

  function handleSubmitInsertedQuestion(targetId: string) {
    const nextQuestion = insertQuestionDraft.trim();

    if (!nextQuestion) {
      return;
    }

    onInsertQuestion(targetId, nextQuestion);
    setInsertQuestionDraft("");
    setInsertComposerTargetId(null);
    setIsFloatingWindowFocused(false);
    setIsFloatingWindowHovered(false);
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
    const resolvedTargetId =
      activeInsertTargetIdRef.current ??
      resolveInsertTargetIdAtPoint(event.clientX, event.clientY) ??
      targetId;
    const nextBlock: InsertedWorkbenchBlock = {
      id: `${payload.kind ?? "feedback"}-${payload.id ?? "card"}-${Date.now()}`,
      kind: payload.kind === "source" ? "source" : "feedback",
      feedbackLevel: payload.feedbackLevel,
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
      [resolvedTargetId]: [...(previous[resolvedTargetId] ?? []), nextBlock],
    }));
    onWorkbenchCardInserted({ kind: payload.kind, id: payload.id });
    setActiveInsertTargetId(null);
    activeInsertTargetIdRef.current = null;
    stopReadingAutoScroll();
  }

  function getFeedbackToneVisual(level: TopicFeedbackLevel = "partial") {
    if (level === "weak") {
      return {
        shell: cn(
          "overflow-hidden bg-transparent transition-colors",
          isDark ? "bg-rose-400/[0.016]" : "bg-rose-500/[0.026]",
        ),
        accent: isDark ? "border-rose-400/72" : "border-rose-700/56",
        label: "text-rose-700 dark:text-rose-400",
        emphasis: "text-rose-700 dark:text-rose-400",
        code: isDark
          ? "border-rose-400/26 bg-transparent text-rose-200"
          : "border-rose-700/24 bg-transparent text-rose-700",
      };
    }

    if (level === "partial") {
      return {
        shell: cn(
          "overflow-hidden bg-transparent transition-colors",
          isDark ? "bg-amber-400/[0.014]" : "bg-amber-500/[0.022]",
        ),
        accent: isDark ? "border-amber-400/68" : "border-amber-600/52",
        label: "text-amber-600 dark:text-amber-400",
        emphasis: "text-amber-600 dark:text-amber-400",
        code: isDark
          ? "border-amber-400/24 bg-transparent text-slate-200"
          : "border-amber-600/22 bg-transparent text-slate-700",
      };
    }

    return {
      shell: cn(
        "overflow-hidden bg-transparent transition-colors",
        isDark ? "bg-emerald-400/[0.014]" : "bg-emerald-500/[0.02]",
      ),
      accent: isDark ? "border-emerald-400/66" : "border-emerald-700/48",
      label: "text-emerald-700 dark:text-emerald-400",
      emphasis: "text-emerald-700 dark:text-emerald-400",
      code: isDark
        ? "border-emerald-400/24 bg-transparent text-slate-200"
        : "border-emerald-700/22 bg-transparent text-slate-700",
    };
  }

  function getInsertedCardVisual(
    kind: "question" | "feedback" | "source",
    feedbackLevel?: TopicFeedbackLevel,
  ) {
    if (kind === "question") {
      return {
        shell: cn(
          "overflow-hidden bg-transparent transition-colors",
          isDark
            ? "bg-cyan-400/[0.018]"
            : "bg-cyan-500/[0.028]",
        ),
        accent: isDark ? "border-cyan-400/70" : "border-cyan-500/58",
        label: "text-cyan-600 dark:text-cyan-400",
        title: "text-slate-700 dark:text-slate-100",
        body: "text-slate-700 dark:text-slate-200",
        meta: "text-slate-400 dark:text-slate-400",
      };
    }

    if (kind === "feedback") {
      const tone = getFeedbackToneVisual(feedbackLevel);

      return {
        shell: tone.shell,
        accent: tone.accent,
        label: tone.label,
        title: "text-slate-700 dark:text-slate-100",
        body: "text-slate-600 dark:text-slate-300",
        meta: "text-slate-400 dark:text-slate-400",
        emphasis: tone.emphasis,
        code: tone.code,
      };
    }

    return {
      shell: cn(
        "overflow-hidden bg-transparent transition-colors",
        isDark
          ? "bg-indigo-400/[0.014]"
          : "bg-indigo-500/[0.02]",
      ),
      accent: isDark ? "border-indigo-400/58" : "border-indigo-500/46",
      label: "text-indigo-600 dark:text-indigo-400",
      title: "text-slate-700 dark:text-slate-100",
      body: "text-slate-600 dark:text-slate-300",
      meta: "text-slate-400 dark:text-slate-500",
      code: isDark
        ? "border-indigo-400/24 bg-transparent text-indigo-300"
        : "border-indigo-700/24 bg-transparent text-indigo-700",
    };
  }

  function renderInsertedWorkbenchBlocks(targetId: string) {
    return (
      <>
        {(insertedWorkbenchBlocksByTargetId[targetId] ?? []).map((block) => (
          <div key={block.id} className="contents">
            {(() => {
              const visual = getInsertedCardVisual(
                block.kind === "source" ? "source" : "feedback",
                block.feedbackLevel,
              );

              return (
                <article
                  data-insert-disabled="true"
                  className={cn("w-full max-w-full", visual.shell)}
                >
                  <div className={cn("border-l-[3px] pl-5 py-0.5", visual.accent)}>
                    <div className="mb-1 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "mb-0.5 text-[10px] font-mono uppercase tracking-[0.22em]",
                            visual.label,
                          )}
                        >
                          <ReadingLine shield={useLightShield}>
                            {block.kind === "source" ? "Source ref" : "AI feedback"}
                          </ReadingLine>
                        </p>
                        <h4
                          className={cn(
                            "break-words text-sm font-medium",
                            visual.title,
                          )}
                        >
                          <ReadingLine shield={useLightShield}>{block.title}</ReadingLine>
                        </h4>
                        {block.subtitle ? (
                          <p className={cn("mt-0.5 break-all text-xs", visual.meta)}>
                            <ReadingLine shield={useLightShield}>{block.subtitle}</ReadingLine>
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeInsertedWorkbenchBlock(targetId, block.id)}
                        className="shrink-0 font-mono text-[10px] tracking-[0.16em] text-slate-400 transition-colors hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-300"
                        aria-label="Remove inserted content"
                      >
                        [x]
                      </button>
                    </div>

                    {block.body ? (
                      <p
                        className={cn(
                          "whitespace-pre-wrap break-words text-sm leading-relaxed",
                          visual.body,
                        )}
                      >
                        <ReadingLine shield={useLightShield}>{block.body}</ReadingLine>
                      </p>
                    ) : null}

                    {block.code ? (
                      <pre
                        className={cn(
                          "source-workbench-scrollbar mt-1 max-h-72 w-full overflow-auto border-l-[2px] pl-4 py-1 text-[12px] leading-relaxed",
                          visual.code,
                        )}
                      >
                        <code className="whitespace-pre-wrap break-words">{block.code}</code>
                      </pre>
                    ) : null}

                    {block.meta ? (
                      <p
                        className={cn(
                          "mt-1 text-[10px] font-mono uppercase tracking-[0.16em]",
                          visual.meta,
                        )}
                      >
                        <ReadingLine shield={useLightShield}>{block.meta}</ReadingLine>
                      </p>
                    ) : null}
                  </div>
                </article>
              );
            })()}
            {renderInsertSlot(`${targetId}::after-block:${block.id}`)}
          </div>
        ))}
      </>
    );
  }

  function renderInsertedQuestionCards(targetId: string) {
    return (
      <>
        {(insertedQuestionsByTargetId[targetId] ?? []).map((question) => (
          <div key={question.id} className="contents">
            {(() => {
              const visual = getInsertedCardVisual("question");
              const feedbackVisual = question.answerState?.feedback
                ? getFeedbackToneVisual(question.answerState.feedback.level)
                : null;

              return (
                <div
                  id={`question-${question.id}`}
                  data-insert-disabled="true"
                  className={cn(visual.shell)}
                >
                  <div className={cn("border-l-[3px] pl-5 py-0.5", visual.accent)}>
                    <div className="mb-1 flex items-center justify-between gap-4">
                      <p
                        className={cn(
                          "text-[10px] font-mono uppercase tracking-[0.22em]",
                          visual.label,
                        )}
                      >
                        <ReadingLine shield={useLightShield}>My question</ReadingLine>
                      </p>
                      <button
                        type="button"
                        onClick={() => onDeleteInsertedQuestion(question.id)}
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
                      value={question.answerDraft ?? question.answerState?.answer ?? ""}
                      onChange={(event) =>
                        onInsertedQuestionDraftChange(question.id, event.target.value)
                      }
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
                            <span className={cn("font-bold", feedbackVisual?.emphasis)}>
                              AI:
                            </span>{" "}
                            {question.answerState.feedback.nextSuggestion}
                          </ReadingLine>
                        </p>
                        <p
                          className={cn(
                            "text-xs uppercase tracking-[0.16em]",
                            feedbackVisual?.label ?? visual.meta,
                          )}
                        >
                          <ReadingLine shield={useLightShield}>
                            {question.answerState.feedback.label} /{" "}
                            {question.answerState.feedback.score}/100
                          </ReadingLine>
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-1 flex items-center justify-end">
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
                </div>
              );
            })()}
            {renderInsertSlot(`${targetId}::after-question:${question.id}`)}
          </div>
        ))}
      </>
    );
  }

  function renderInsertSlot(targetId: string) {
    const isActive = activeInsertTargetId === targetId;
    const isComposing = insertComposerTargetId === targetId;

    return (
      <>
        <div className="relative h-0">
          <div
            data-insert-target-id={targetId}
            className={cn(
              "absolute inset-x-0 top-1/2 z-20 -translate-y-1/2",
              isActive || isComposing ? "h-6" : "h-4",
            )}
            onDragOver={(event) => {
              if (Array.from(event.dataTransfer.types).includes(WORKBENCH_INSERT_MIME)) {
                event.preventDefault();
                autoScrollNearestReadingArea(event);
                const resolvedTargetId = resolveInsertTargetIdAtPoint(
                  event.clientX,
                  event.clientY,
                );
                setActiveInsertTargetId(resolvedTargetId);
                activeInsertTargetIdRef.current = resolvedTargetId;
              }
            }}
            onDrop={(event) => handleWorkbenchCardDrop(event, targetId)}
          >
            <div
              className={cn(
                "pointer-events-none absolute left-0 right-0 top-1/2 z-10 -translate-y-1/2 transition-all duration-200",
                isActive
                  ? "h-[2px] bg-cyan-300/95 shadow-[0_0_18px_rgba(34,211,238,0.38)]"
                  : "h-px bg-transparent",
              )}
            />
          </div>
        </div>

        {isComposing ? (
          <form
            className={cn(floatingWindowShellClass)}
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmitInsertedQuestion(targetId);
            }}
          >
            <div className="border-l-[3px] border-cyan-500 pl-4 py-1.5 dark:border-cyan-400">
              <div className="mb-1.5 flex items-center justify-between gap-4">
                <p className={floatingWindowTitleClass}>
                  <ReadingLine shield={useLightShield}>My question</ReadingLine>
                </p>
              </div>
              <textarea
                autoFocus
                rows={1}
                value={insertQuestionDraft}
                onChange={(event) => setInsertQuestionDraft(event.target.value)}
                onFocus={() => setIsFloatingWindowFocused(true)}
                onBlur={() => setIsFloatingWindowFocused(false)}
                placeholder="Drop one sharp why here..."
                className={floatingWindowTextareaClass}
              />
              <div className="mt-1.5 flex items-center justify-end gap-6">
                <button
                  type="button"
                  onClick={() => cancelFloatingInsert({ clearDraft: true })}
                  className={floatingWindowSecondaryActionClass}
                >
                  [ cancel ]
                </button>
                <button type="submit" className={floatingWindowPrimaryActionClass}>
                  [ insert ]
                </button>
              </div>
            </div>
          </form>
        ) : null}

        {renderInsertedWorkbenchBlocks(targetId)}
        {renderInsertedQuestionCards(targetId)}
      </>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-3xl px-8 py-8 pb-24"
      onDragOver={(event) => {
        if (Array.from(event.dataTransfer.types).includes(WORKBENCH_INSERT_MIME)) {
          event.preventDefault();
          autoScrollNearestReadingArea(event);
          const resolvedTargetId = resolveInsertTargetIdAtPoint(
            event.clientX,
            event.clientY,
          );
          setActiveInsertTargetId(resolvedTargetId);
          activeInsertTargetIdRef.current = resolvedTargetId;
        }
      }}
      onDrop={stopReadingAutoScroll}
    >
      {!insertComposerTargetId ? (
        <div
          style={
            isInsertDragging && insertButtonPosition
              ? {
                  left: insertButtonPosition.x,
                  top: insertButtonPosition.y,
                  transform: "translate(-50%, -50%) scale(0.88)",
                }
              : {
                  left: 24,
                  bottom: 24,
                }
          }
          onMouseEnter={() => setIsFloatingWindowHovered(true)}
          onMouseLeave={() => setIsFloatingWindowHovered(false)}
          className={cn(
            "fixed z-40 select-none bg-transparent transition-[opacity,transform] duration-200",
            isInsertDragging
              ? "pointer-events-none opacity-100"
              : isFloatingWindowHovered || Boolean(insertQuestionDraft.trim())
                ? "opacity-100"
                : "opacity-55 hover:opacity-100",
          )}
        >
          <div
            onPointerDown={handleInsertDragStart}
            className="cursor-grab active:cursor-grabbing"
          >
            <div
              className={cn(
                "relative flex h-11 w-11 items-center justify-center transition-all duration-200",
                isDark
                  ? "text-cyan-400"
                  : "text-blue-600",
                isFloatingWindowHovered && !isInsertDragging
                  ? "scale-[1.04]"
                  : "scale-100",
              )}
              aria-label="Insert my question"
            >
              <svg
                viewBox="0 0 44 44"
                className="pointer-events-none h-11 w-11 overflow-visible"
                aria-hidden="true"
              >
                <g
                  stroke={isDark ? "rgba(34,211,238,0.68)" : "rgba(59,130,246,0.60)"}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle
                    cx="22"
                    cy="22"
                    r="11"
                    strokeWidth="1"
                    fill={isDark ? "rgba(2,6,23,0.16)" : "rgba(255,255,255,0.12)"}
                  />
                  <path
                    d="M 22 7.2
                       Q 24.1 19.6 35.1 22
                       Q 24.1 24.4 22 36.8
                       Q 19.9 24.4 8.9 22
                       Q 19.9 19.6 22 7.2 Z"
                    strokeWidth="1"
                    fill={isDark ? "rgba(34,211,238,0.68)" : "rgba(59,130,246,0.60)"}
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r="4.2"
                    strokeWidth="1"
                    fill={isDark ? "rgba(2,6,23,0.88)" : "rgba(255,255,255,0.86)"}
                  />
                </g>
                <text
                  x="22"
                  y="24.4"
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="700"
                  fill={isDark ? "rgba(207,250,254,0.96)" : "rgba(37,99,235,0.88)"}
                >
                  ?
                </text>
              </svg>
            </div>
          </div>

          {!isInsertDragging ? (
            <div
              className={cn(
                "pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap transition-all duration-200",
                isFloatingWindowHovered
                  ? "translate-x-0 opacity-100"
                  : "translate-x-1 opacity-0",
              )}
            >
              <p
                className={cn(
                  "text-[10px] font-mono uppercase tracking-[0.24em]",
                  isDark ? "text-cyan-400/88" : "text-blue-600/88",
                )}
              >
                <ReadingLine shield={useLightShield}>My question</ReadingLine>
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-8">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
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
            className="flex flex-col gap-6 border-l-[3px] border-slate-300 pl-6 pb-12 dark:border-cyan-800/42"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400">
              <ReadingLine shield={useLightShield}>Root Why</ReadingLine>
            </p>
            <p
              className={cn(
                "text-lg font-normal italic leading-[1.85] text-slate-600 dark:text-slate-200 dark:[text-shadow:0_0_10px_#0a0f1a,_0_0_20px_#0a0f1a]",
                useLightShield &&
                  "text-halo-soft-light bg-slate-50/28 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]",
              )}
            >
              {rootQuestion}
            </p>
          </div>
        </div>

      {renderInsertSlot("after-root")}

      <div className="mt-10 flex flex-col gap-[18px] text-[15px] font-normal leading-relaxed text-slate-700 dark:text-slate-300 dark:[text-shadow:0_0_8px_#0a0f1a,_0_0_16px_#0a0f1a]">
        {visibleSteps.map((step, index) => {
          const answerState = answerStateByQuestionId[step.question.id];
          const isHistoryExpanded = !answerState?.isCollapsed;
          const isCurrent = index === currentStepIndex && !showCompletionCard;
          const showHistoryCard = Boolean(answerState && answerState.status !== "failed");

          return (
            <div key={step.id} className="flex flex-col gap-[18px]">
              {showHistoryCard ? (
                <>
                  <div
                    id={`question-${step.question.id}`}
                    data-insert-disabled="true"
                    className="py-1 pl-6"
                  >
                  <button
                    type="button"
                    onClick={() => onToggleHistory(step.question.id)}
                    className="group flex w-full items-center justify-between gap-4 text-left"
                  >
                    <div className="space-y-1.5">
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
                      isHistoryExpanded ? "mt-1.5 max-h-96 opacity-100" : "max-h-0 opacity-0",
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
                  {renderInsertSlot(`after-history:${step.question.id}`)}
                </>
              ) : null}

              <div
                id={`block-${step.block.id}`}
                className={cn(
                  "-mx-4 px-4 transition-colors duration-300",
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
                <>
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
                        "w-full min-h-[1.85rem] resize-none border-b bg-transparent pb-0.5 leading-6 transition-colors [field-sizing:content] placeholder:italic focus:outline-none",
                        isDark
                          ? "border-cyan-700/45 text-slate-200 placeholder:text-slate-400 focus:border-cyan-400"
                          : "border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-cyan-500",
                      )}
                    />

                    <div className="mt-1 text-sm text-rose-500/80 dark:text-rose-300/80">
                      {answerForm.formState.errors.answer?.message ?? ""}
                    </div>

                    {failedCurrentAttempt && currentAnswerState?.feedback ? (
                      <div className="mt-1 space-y-1.5 text-sm text-slate-500 dark:text-slate-300">
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
                  </form>
                  </div>
                  {renderInsertSlot(`after-current:${step.question.id}`)}
                </>
              ) : null}
            </div>
          );
        })}

        {showCustomComposer ? (
          <>
            <div
              data-insert-disabled="true"
              className="rounded-r-xl border-l-[2px] border-cyan-400/45 py-0.5 pl-6"
            >
            <p className="mb-1 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
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
                  "w-full min-h-[1.85rem] resize-none border-b bg-transparent pb-0.5 leading-6 transition-colors [field-sizing:content] placeholder:italic focus:outline-none",
                  isDark
                    ? "border-cyan-700/45 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400"
                    : "border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-cyan-500",
                )}
              />
              <div className="mt-1 text-sm text-rose-500/80 dark:text-rose-300/80">
                {customQuestionForm.formState.errors.question?.message ?? ""}
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
            {renderInsertSlot("after-custom-question")}
          </>
        ) : null}

        {showCompletionCard ? (
          <>
            <div
              data-insert-disabled="true"
              className="rounded-2xl border border-slate-200/50 p-6 dark:border-cyan-800/30"
            >
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
            {renderInsertSlot("after-completion-card")}
          </>
        ) : null}
      </div>
    </div>
  );
}
