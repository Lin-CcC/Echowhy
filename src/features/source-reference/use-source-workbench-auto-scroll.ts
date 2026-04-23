import { useEffect, useRef, type DragEvent } from "react";

type DraggingWorkbenchKind = "feedback" | "source" | null;

type UseSourceWorkbenchAutoScrollOptions = {
  draggingWorkbenchKind: DraggingWorkbenchKind;
};

export function useSourceWorkbenchAutoScroll({
  draggingWorkbenchKind,
}: UseSourceWorkbenchAutoScrollOptions) {
  const workbenchPanelRef = useRef<HTMLElement | null>(null);
  const workbenchAutoScrollFrameRef = useRef<number | null>(null);
  const workbenchAutoScrollStateRef = useRef<{
    clientY: number;
    lastSeenAt: number;
    currentVelocity: number;
    lastFrameAt: number;
  } | null>(null);

  function stopWorkbenchAutoScroll() {
    if (workbenchAutoScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(workbenchAutoScrollFrameRef.current);
      workbenchAutoScrollFrameRef.current = null;
    }

    workbenchAutoScrollStateRef.current = null;
  }

  function primeWorkbenchAutoScroll(clientY: number) {
    const panel = workbenchPanelRef.current;

    if (!panel) {
      stopWorkbenchAutoScroll();
      return;
    }

    workbenchAutoScrollStateRef.current = {
      clientY,
      lastSeenAt: performance.now(),
      currentVelocity:
        workbenchAutoScrollStateRef.current?.currentVelocity ?? 0,
      lastFrameAt: performance.now(),
    };

    if (workbenchAutoScrollFrameRef.current !== null) {
      return;
    }

    const tick = () => {
      const activePanel = workbenchPanelRef.current;
      const state = workbenchAutoScrollStateRef.current;

      if (!activePanel || !state) {
        workbenchAutoScrollFrameRef.current = null;
        return;
      }

      const now = performance.now();
      const frameDelta = Math.min((now - state.lastFrameAt) / 16.6667, 2.2);
      state.lastFrameAt = now;

      const bounds = activePanel.getBoundingClientRect();
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
        activePanel.scrollTop += state.currentVelocity * frameDelta;
      }

      if (
        targetVelocity === 0 &&
        Math.abs(state.currentVelocity) <= 0.08 &&
        now - state.lastSeenAt > 520
      ) {
        stopWorkbenchAutoScroll();
        return;
      }

      workbenchAutoScrollFrameRef.current = window.requestAnimationFrame(tick);
    };

    workbenchAutoScrollFrameRef.current = window.requestAnimationFrame(tick);
  }

  function autoScrollWorkbenchPanel(event: DragEvent<HTMLElement>) {
    if (!draggingWorkbenchKind) {
      stopWorkbenchAutoScroll();
      return;
    }

    primeWorkbenchAutoScroll(event.clientY);
    event.preventDefault();
  }

  useEffect(() => stopWorkbenchAutoScroll, []);

  useEffect(() => {
    if (!draggingWorkbenchKind) {
      return;
    }

    function handleWindowDragOver(event: globalThis.DragEvent) {
      const panel = workbenchPanelRef.current;

      if (!panel) {
        return;
      }

      const bounds = panel.getBoundingClientRect();
      const withinHorizontalRange =
        event.clientX >= bounds.left - 24 && event.clientX <= bounds.right + 24;
      const withinVerticalRange =
        event.clientY >= bounds.top - 64 && event.clientY <= bounds.bottom + 64;

      if (!withinHorizontalRange || !withinVerticalRange) {
        stopWorkbenchAutoScroll();
        return;
      }

      event.preventDefault();
      primeWorkbenchAutoScroll(event.clientY);
    }

    window.addEventListener("dragover", handleWindowDragOver);

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
    };
  }, [draggingWorkbenchKind]);

  return {
    workbenchPanelRef,
    autoScrollWorkbenchPanel,
    stopWorkbenchAutoScroll,
  };
}
