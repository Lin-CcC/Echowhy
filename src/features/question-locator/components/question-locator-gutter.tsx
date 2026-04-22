import type { QuestionLocatorModel } from "../types";

type QuestionLocatorGutterProps = {
  model: QuestionLocatorModel | null;
  onSelectQuestion: (questionId: string) => void;
};

function getRelativeTopStyle(relativeTop: number) {
  return {
    top: `calc(${relativeTop * 92}% + 4%)`,
  };
}

export function QuestionLocatorGutter({
  model,
  onSelectQuestion,
}: QuestionLocatorGutterProps) {
  if (!model) {
    return null;
  }

  return (
    <aside
      aria-label="Question locator"
      className="relative hidden h-full w-10 shrink-0 bg-transparent lg:block"
    >
      <div className="absolute inset-y-7 left-1/2 w-px -translate-x-1/2 bg-transparent" />

      {model.items.map((item) => (
        <button
          key={item.questionId}
          type="button"
          title={item.questionPrompt}
          aria-label={`Locate question: ${item.questionPrompt}`}
          onClick={() => onSelectQuestion(item.questionId)}
          style={getRelativeTopStyle(item.relativeTop)}
          className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/70 shadow-[0_0_0_5px_rgba(125,211,252,0.08)] transition-transform hover:scale-110 hover:bg-cyan-500 dark:bg-cyan-400/75 dark:shadow-[0_0_0_5px_rgba(34,211,238,0.08)] dark:hover:bg-cyan-300"
        />
      ))}
    </aside>
  );
}
