import type {
  DragEvent as ReactDragEvent,
  DragEventHandler,
  ReactNode,
} from "react";
import type { InsertedQuestionRecord } from "@/features/topic-session";
import { getFeedbackToneVisual, getInsertedCardVisual } from "./learning-insert-visuals";
import { LearningInsertSlot } from "./learning-insert-slot";
import { LearningInsertedQuestionCard } from "./learning-inserted-question-card";
import { LearningInsertedWorkbenchCard } from "./learning-inserted-workbench-card";
import type { InsertedWorkbenchBlock } from "./use-learning-panel-insert-flow";

type LearningPanelInsertStackProps = {
  targetId: string;
  activeInsertTargetId: string | null;
  insertComposerTargetId: string | null;
  insertQuestionDraft: string;
  insertedWorkbenchBlocksByTargetId: Record<string, InsertedWorkbenchBlock[]>;
  insertedQuestionsByTargetId: Record<string, InsertedQuestionRecord[]>;
  isDark: boolean;
  useLightShield: boolean;
  onSlotDragOver: DragEventHandler<HTMLDivElement>;
  onSlotDrop: (event: ReactDragEvent<HTMLDivElement>, targetId: string) => void;
  onDraftChange: (nextValue: string) => void;
  onComposerFocus: () => void;
  onComposerBlur: () => void;
  onCancel: () => void;
  onSubmit: (targetId: string) => void;
  onRemoveWorkbenchBlock: (targetId: string, blockId: string) => void;
  onDeleteInsertedQuestion: (questionId: string) => void;
  onInsertedQuestionDraftChange: (questionId: string, draft: string) => void;
  onCheckInsertedQuestion: (questionId: string, answer: string) => void;
  children?: ReactNode;
};

export function LearningPanelInsertStack({
  targetId,
  activeInsertTargetId,
  insertComposerTargetId,
  insertQuestionDraft,
  insertedWorkbenchBlocksByTargetId,
  insertedQuestionsByTargetId,
  isDark,
  useLightShield,
  onSlotDragOver,
  onSlotDrop,
  onDraftChange,
  onComposerFocus,
  onComposerBlur,
  onCancel,
  onSubmit,
  onRemoveWorkbenchBlock,
  onDeleteInsertedQuestion,
  onInsertedQuestionDraftChange,
  onCheckInsertedQuestion,
  children,
}: LearningPanelInsertStackProps) {
  const insertedWorkbenchBlocks = insertedWorkbenchBlocksByTargetId[targetId] ?? [];
  const insertedQuestions = insertedQuestionsByTargetId[targetId] ?? [];

  return (
    <LearningInsertSlot
      targetId={targetId}
      isActive={activeInsertTargetId === targetId}
      isComposing={insertComposerTargetId === targetId}
      isDark={isDark}
      useLightShield={useLightShield}
      insertQuestionDraft={insertQuestionDraft}
      onDragOver={onSlotDragOver}
      onDrop={(event) => onSlotDrop(event, targetId)}
      onDraftChange={onDraftChange}
      onFocus={onComposerFocus}
      onBlur={onComposerBlur}
      onCancel={onCancel}
      onSubmit={() => onSubmit(targetId)}
    >
      {children}

      {insertedWorkbenchBlocks.map((block) => {
        const blockTargetId = `${targetId}::after-block:${block.id}`;

        return (
          <div key={block.id} className="contents">
            <LearningInsertedWorkbenchCard
              block={block}
              visual={getInsertedCardVisual(
                block.kind === "source" ? "source" : "feedback",
                isDark,
                block.feedbackLevel,
              )}
              useLightShield={useLightShield}
              onRemove={() => onRemoveWorkbenchBlock(targetId, block.id)}
            />
            <LearningPanelInsertStack
              targetId={blockTargetId}
              activeInsertTargetId={activeInsertTargetId}
              insertComposerTargetId={insertComposerTargetId}
              insertQuestionDraft={insertQuestionDraft}
              insertedWorkbenchBlocksByTargetId={insertedWorkbenchBlocksByTargetId}
              insertedQuestionsByTargetId={insertedQuestionsByTargetId}
              isDark={isDark}
              useLightShield={useLightShield}
              onSlotDragOver={onSlotDragOver}
              onSlotDrop={onSlotDrop}
              onDraftChange={onDraftChange}
              onComposerFocus={onComposerFocus}
              onComposerBlur={onComposerBlur}
              onCancel={onCancel}
              onSubmit={onSubmit}
              onRemoveWorkbenchBlock={onRemoveWorkbenchBlock}
              onDeleteInsertedQuestion={onDeleteInsertedQuestion}
              onInsertedQuestionDraftChange={onInsertedQuestionDraftChange}
              onCheckInsertedQuestion={onCheckInsertedQuestion}
            />
          </div>
        );
      })}

      {insertedQuestions.map((question) => {
        const questionTargetId = `${targetId}::after-question:${question.id}`;

        return (
          <div key={question.id} className="contents">
            <LearningInsertedQuestionCard
              question={question}
              visual={getInsertedCardVisual("question", isDark)}
              feedbackVisual={
                question.answerState?.feedback
                  ? getFeedbackToneVisual(question.answerState.feedback.level, isDark)
                  : null
              }
              useLightShield={useLightShield}
              isDark={isDark}
              onDelete={() => onDeleteInsertedQuestion(question.id)}
              onDraftChange={(nextValue) =>
                onInsertedQuestionDraftChange(question.id, nextValue)
              }
              onCheck={(answer) => onCheckInsertedQuestion(question.id, answer)}
            />
            <LearningPanelInsertStack
              targetId={questionTargetId}
              activeInsertTargetId={activeInsertTargetId}
              insertComposerTargetId={insertComposerTargetId}
              insertQuestionDraft={insertQuestionDraft}
              insertedWorkbenchBlocksByTargetId={insertedWorkbenchBlocksByTargetId}
              insertedQuestionsByTargetId={insertedQuestionsByTargetId}
              isDark={isDark}
              useLightShield={useLightShield}
              onSlotDragOver={onSlotDragOver}
              onSlotDrop={onSlotDrop}
              onDraftChange={onDraftChange}
              onComposerFocus={onComposerFocus}
              onComposerBlur={onComposerBlur}
              onCancel={onCancel}
              onSubmit={onSubmit}
              onRemoveWorkbenchBlock={onRemoveWorkbenchBlock}
              onDeleteInsertedQuestion={onDeleteInsertedQuestion}
              onInsertedQuestionDraftChange={onInsertedQuestionDraftChange}
              onCheckInsertedQuestion={onCheckInsertedQuestion}
            />
          </div>
        );
      })}
    </LearningInsertSlot>
  );
}
