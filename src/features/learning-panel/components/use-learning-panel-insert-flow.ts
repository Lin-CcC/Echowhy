import {
  useEffect,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { TopicFeedbackLevel } from "@/features/topic-session";

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

export type InsertedWorkbenchBlock = {
  id: string;
  kind: "feedback" | "source";
  feedbackLevel?: TopicFeedbackLevel;
  title: string;
  subtitle?: string;
  body?: string;
  code?: string;
  meta?: string;
};

type UseLearningPanelInsertFlowParams = {
  onInsertQuestion: (targetId: string, question: string) => void;
  onWorkbenchCardInserted: (payload: {
    kind?: "feedback" | "source";
    id?: string;
  }) => void;
};

export function useLearningPanelInsertFlow({
  onInsertQuestion,
  onWorkbenchCardInserted,
}: UseLearningPanelInsertFlowParams) {
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
  const [, setIsFloatingWindowFocused] = useState(false);
  const [insertedWorkbenchBlocksByTargetId, setInsertedWorkbenchBlocksByTargetId] =
    useState<Record<string, InsertedWorkbenchBlock[]>>({});

  useEffect(() => {
    if (!isInsertDragging) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      const nextTargetId = resolveInsertTargetIdAtPoint(event.clientX, event.clientY);

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

  function clearInsertDragDelay() {
    if (insertDragDelayTimeoutRef.current !== null) {
      window.clearTimeout(insertDragDelayTimeoutRef.current);
      insertDragDelayTimeoutRef.current = null;
    }
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

      if (
        targetVelocity === 0 &&
        Math.abs(state.currentVelocity) <= 0.08 &&
        now - state.lastSeenAt > 520
      ) {
        stopReadingAutoScroll();
        return;
      }

      readingAutoScrollFrameRef.current = window.requestAnimationFrame(tick);
    };

    readingAutoScrollFrameRef.current = window.requestAnimationFrame(tick);
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

  function handleDragOver(event: ReactDragEvent<HTMLElement>) {
    if (!Array.from(event.dataTransfer.types).includes(WORKBENCH_INSERT_MIME)) {
      return;
    }

    event.preventDefault();
    autoScrollNearestReadingArea(event);
    const resolvedTargetId = resolveInsertTargetIdAtPoint(
      event.clientX,
      event.clientY,
    );
    setActiveInsertTargetId(resolvedTargetId);
    activeInsertTargetIdRef.current = resolvedTargetId;
  }

  function handleRootDragOver(event: ReactDragEvent<HTMLDivElement>) {
    handleDragOver(event);
  }

  function handleInsertSlotDragOver(event: ReactDragEvent<HTMLDivElement>) {
    handleDragOver(event);
  }

  function handleFloatingComposerFocus() {
    setIsFloatingWindowFocused(true);
  }

  function handleFloatingComposerBlur() {
    setIsFloatingWindowFocused(false);
  }

  return {
    isInsertDragging,
    activeInsertTargetId,
    insertComposerTargetId,
    insertQuestionDraft,
    insertButtonPosition,
    isFloatingWindowHovered,
    insertedWorkbenchBlocksByTargetId,
    setInsertQuestionDraft,
    setIsFloatingWindowHovered,
    cancelFloatingInsert,
    handleInsertDragStart,
    handleSubmitInsertedQuestion,
    handleWorkbenchCardDrop,
    handleRootDragOver,
    handleInsertSlotDragOver,
    handleFloatingComposerFocus,
    handleFloatingComposerBlur,
    stopReadingAutoScroll,
    removeInsertedWorkbenchBlock,
  };
}
