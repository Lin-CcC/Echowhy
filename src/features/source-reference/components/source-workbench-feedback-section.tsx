import type { DragEvent } from "react";
import { ActiveFeedbackCard } from "./active-feedback-card";
import { buildFeedbackWorkbenchDragPayload } from "../utils";
import type {
  ActiveFeedbackTone,
  FeedbackCardState,
  WorkbenchInsertPayload,
} from "../types";

type SourceWorkbenchFeedbackSectionProps = {
  activeFeedback: FeedbackCardState | null;
  activeFeedbackIndex: number;
  feedbackCards: FeedbackCardState[];
  tone: ActiveFeedbackTone | null;
  onDismissFeedback: (feedbackId: string) => void;
  onSelectFeedback: (feedbackId: string) => void;
  onCycleFeedback: (direction: "previous" | "next") => void;
  onFocusQuestion: (questionId: string) => void;
  onStartWorkbenchDrag: (
    event: DragEvent<HTMLDivElement>,
    payload: WorkbenchInsertPayload,
  ) => void;
  onStopWorkbenchDrag: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>, targetFeedbackId: string) => void;
};

export function SourceWorkbenchFeedbackSection({
  activeFeedback,
  activeFeedbackIndex,
  feedbackCards,
  tone,
  onDismissFeedback,
  onSelectFeedback,
  onCycleFeedback,
  onFocusQuestion,
  onStartWorkbenchDrag,
  onStopWorkbenchDrag,
  onDragOver,
  onDrop,
}: SourceWorkbenchFeedbackSectionProps) {
  if (!activeFeedback || !tone) {
    return null;
  }

  return (
    <ActiveFeedbackCard
      activeFeedback={activeFeedback}
      activeFeedbackIndex={activeFeedbackIndex}
      feedbackCards={feedbackCards}
      tone={tone}
      onDismissFeedback={onDismissFeedback}
      onSelectFeedback={onSelectFeedback}
      onCycleFeedback={onCycleFeedback}
      onFocusQuestion={onFocusQuestion}
      onDragStart={(event) =>
        onStartWorkbenchDrag(event, {
          kind: "feedback",
          ...buildFeedbackWorkbenchDragPayload(activeFeedback),
        })
      }
      onDragEnd={onStopWorkbenchDrag}
      onDragOver={onDragOver}
      onDrop={(event) => onDrop(event, activeFeedback.id)}
    />
  );
}
