import { Bookmark, Flag, TimerReset } from "lucide-react";
import type { TopicQuestionReviewState } from "@/features/topic-session";
import { cn } from "@/lib/utils";

type QuestionReviewActionsProps = {
  questionId: string;
  reviewState: TopicQuestionReviewState | undefined;
  isDark: boolean;
  onTogglePending: (questionId: string) => void;
  onToggleBookmark: (questionId: string) => void;
  onToggleWeak: (questionId: string) => void;
};

export function QuestionReviewActions({
  questionId,
  reviewState,
  isDark,
  onTogglePending,
  onToggleBookmark,
  onToggleWeak,
}: QuestionReviewActionsProps) {
  const actions = [
    {
      key: "pending",
      label: "Pending",
      active: reviewState?.pending === true,
      onClick: onTogglePending,
      icon: TimerReset,
    },
    {
      key: "bookmark",
      label: "Favorite",
      active: reviewState?.bookmarked === true,
      onClick: onToggleBookmark,
      icon: Bookmark,
    },
    {
      key: "weak",
      label: "Needs work",
      active: reviewState?.selfMarkedWeak === true,
      onClick: onToggleWeak,
      icon: Flag,
    },
  ] as const;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.key}
            type="button"
            onClick={() => action.onClick(questionId)}
            className={cn(
              "inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] transition-colors",
              action.active
                ? "text-cyan-700 dark:text-cyan-400"
                : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-400 hover:text-slate-700",
            )}
          >
            <Icon size={12} />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
