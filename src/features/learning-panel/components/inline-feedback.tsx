import {
  formatTopicFeedbackScoreLabel,
  type TopicAnswerState,
} from "@/features/topic-session";
import { ReadingLine } from "./reading-line";

type InlineFeedbackProps = {
  answerState: TopicAnswerState;
  useLightShield: boolean;
};

export function InlineFeedback({
  answerState,
  useLightShield,
}: InlineFeedbackProps) {
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
          {formatTopicFeedbackScoreLabel(answerState.feedback, { includeMax: true })}
        </ReadingLine>
      </p>
    </div>
  );
}
