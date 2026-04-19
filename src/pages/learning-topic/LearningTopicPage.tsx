import { useEffect, useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { ConstellationView } from "@/features/constellation-view";
import { LearningPanel } from "@/features/learning-panel";
import { SourceReferencePanel } from "@/features/source-reference";
import type {
  TopicAnswerState,
  TopicDiscussionStep,
  TopicNodeVisualState,
} from "@/features/topic-session";
import { constellationTopic, getConstellationTopicById } from "@/mock/data/constellation-topic";

function buildDiscussionSteps(topic: typeof constellationTopic): TopicDiscussionStep[] {
  const explanationBlockById = new Map(topic.explanationBlocks.map((block) => [block.id, block]));
  const questionById = new Map(topic.questions.map((question) => [question.id, question]));

  const plan = [
    {
      id: "step-login-proof",
      blockId: "exp-login-first-proof",
      questionId: "q-root-login",
      defaultReferenceId: "ref-auth-service",
    },
    {
      id: "step-service-separation",
      blockId: "exp-service-separation",
      questionId: "q-auth-service",
      defaultReferenceId: "ref-auth-controller",
    },
    {
      id: "step-jwt-after-validation",
      blockId: "exp-jwt-after-validation",
      questionId: "q-jwt-issued",
      defaultReferenceId: "ref-jwt-service",
    },
  ] as const;

  return plan.flatMap((step) => {
    const block = explanationBlockById.get(step.blockId);
    const question = questionById.get(step.questionId);

    return block && question
      ? [
          {
            id: step.id,
            block,
            question,
            defaultReferenceId: step.defaultReferenceId,
          },
        ]
      : [];
  });
}

export function LearningTopicPage() {
  const { id } = useParams({ from: "/topic/$id" });
  const topic = getConstellationTopicById(id) ?? constellationTopic;
  const discussionSteps = useMemo(() => buildDiscussionSteps(topic), [topic]);

  const [unlockedStepCount, setUnlockedStepCount] = useState(1);
  const [answerStateByQuestionId, setAnswerStateByQuestionId] = useState<
    Record<string, TopicAnswerState | undefined>
  >({});
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<string[]>([]);
  const [previewSource, setPreviewSource] = useState<string | null>(null);
  const [pinnedSources, setPinnedSources] = useState<string[]>([]);

  useEffect(() => {
    setUnlockedStepCount(1);
    setAnswerStateByQuestionId({});
    setExpandedHistoryIds([]);
    setPreviewSource(null);
    setPinnedSources([]);
  }, [topic]);

  const currentStepIndex = Math.min(unlockedStepCount - 1, discussionSteps.length - 1);
  const currentStep = discussionSteps[currentStepIndex];

  const constellationNodes = useMemo(
    () =>
      discussionSteps.map((step) => {
        const question = topic.questions.find((item) => item.id === step.question.id) ?? step.question;
        const discussionStepIndex = discussionSteps.findIndex(
          (step) => step.question.id === question.id,
        );
        const answerState = answerStateByQuestionId[question.id];

        let visualState: TopicNodeVisualState = "dim";

        if (answerState?.status === "checked") {
          visualState = "lit";
        } else if (
          discussionStepIndex !== -1 &&
          discussionStepIndex === currentStepIndex &&
          !answerState
        ) {
          visualState = "pulsing";
        }

        return {
          ...question,
          visualState,
        };
      }),
    [answerStateByQuestionId, currentStepIndex, discussionSteps, topic.questions],
  );
  const constellationEdges = useMemo(
    () =>
      discussionSteps.slice(0, -1).map((step, index) => ({
        from: step.question.id,
        to: discussionSteps[index + 1]!.question.id,
      })),
    [discussionSteps],
  );

  const handleCheckCurrent = (answer: string) => {
    if (!currentStep) {
      return;
    }

    setAnswerStateByQuestionId((previous) => ({
      ...previous,
      [currentStep.question.id]: {
        questionId: currentStep.question.id,
        answer,
        status: "checked",
        feedback: topic.feedbackPreview,
      },
    }));

    setUnlockedStepCount((previous) =>
      Math.min(Math.max(previous, currentStepIndex + 2), discussionSteps.length),
    );
  };

  const handleSkipCurrent = () => {
    if (!currentStep) {
      return;
    }

    setAnswerStateByQuestionId((previous) => ({
      ...previous,
      [currentStep.question.id]: {
        questionId: currentStep.question.id,
        answer: "",
        status: "skipped",
        feedback: null,
      },
    }));

    setUnlockedStepCount((previous) =>
      Math.min(Math.max(previous, currentStepIndex + 2), discussionSteps.length),
    );
  };

  const handleToggleHistory = (questionId: string) => {
    setExpandedHistoryIds((previous) =>
      previous.includes(questionId)
        ? previous.filter((id) => id !== questionId)
        : [...previous, questionId],
    );
  };

  const handleSelectNode = (nodeId: string) => {
    const stepIndex = discussionSteps.findIndex((step) => step.question.id === nodeId);

    if (stepIndex === -1) {
      return;
    }

    const targetQuestionId = discussionSteps[stepIndex]?.question.id;
    if (!targetQuestionId) {
      return;
    }

    if (stepIndex < currentStepIndex) {
      setExpandedHistoryIds((previous) =>
        previous.includes(targetQuestionId)
          ? previous.filter((id) => id !== targetQuestionId)
          : [...previous, targetQuestionId],
      );
    }
  };

  const handlePreviewReference = (referenceId: string) => {
    if (!pinnedSources.includes(referenceId)) {
      setPreviewSource(referenceId);
    }
  };

  const handleClearPreviewReference = () => {
    setPreviewSource(null);
  };

  const handlePinSource = (referenceId: string) => {
    setPinnedSources((previous) =>
      previous.includes(referenceId)
        ? previous.filter((id) => id !== referenceId)
        : [...previous, referenceId],
    );
    setPreviewSource(null);
  };

  const handleUnpinSource = (referenceId: string) => {
    setPinnedSources((previous) => previous.filter((id) => id !== referenceId));
  };

  const activeReferenceIds = useMemo(
    () => [...new Set([...pinnedSources, ...(previewSource ? [previewSource] : [])])],
    [pinnedSources, previewSource],
  );

  return (
    <section className="relative min-h-[calc(100vh-5rem)] w-full overflow-hidden bg-transparent">
      <div className="flex h-[calc(100vh-5rem)] w-full overflow-hidden">
        <aside className="relative hidden h-full w-[220px] shrink-0 border-r border-slate-200/50 bg-transparent lg:block dark:border-slate-800/50">
          <ConstellationView
            nodes={constellationNodes}
            edges={constellationEdges}
            activeNodeId={currentStep?.question.id ?? ""}
            onSelectNode={handleSelectNode}
          />
        </aside>

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-transparent pb-40 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="w-full">
            <LearningPanel
              title={topic.title}
              rootQuestion={topic.rootQuestion}
              steps={discussionSteps}
              currentStepIndex={currentStepIndex}
              unlockedStepCount={unlockedStepCount}
              answerStateByQuestionId={answerStateByQuestionId}
              expandedHistoryIds={expandedHistoryIds}
              activeReferenceIds={activeReferenceIds}
              onToggleHistory={handleToggleHistory}
              onCheckCurrent={handleCheckCurrent}
              onSkipCurrent={handleSkipCurrent}
              onPreviewReference={handlePreviewReference}
              onClearPreviewReference={handleClearPreviewReference}
              onPinSource={handlePinSource}
            />
          </div>
        </main>

        <SourceReferencePanel
          references={topic.sourceReferences}
          pinnedReferenceIds={pinnedSources}
          previewReferenceId={previewSource}
          onUnpinSource={handleUnpinSource}
        />
      </div>
    </section>
  );
}
