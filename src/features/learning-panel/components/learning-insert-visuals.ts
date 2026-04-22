import type { TopicFeedbackLevel } from "@/features/topic-session";
import { cn } from "@/lib/utils";

type LearningInsertFeedbackToneVisual = {
  shell: string;
  accent: string;
  label: string;
  emphasis: string;
  code: string;
};

export type LearningInsertedCardVisual = {
  shell: string;
  accent: string;
  label: string;
  title: string;
  body: string;
  meta: string;
  emphasis?: string;
  code?: string;
};

export function getFeedbackToneVisual(
  level: TopicFeedbackLevel = "partial",
  isDark: boolean,
): LearningInsertFeedbackToneVisual {
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

export function getInsertedCardVisual(
  kind: "question" | "feedback" | "source",
  isDark: boolean,
  feedbackLevel?: TopicFeedbackLevel,
): LearningInsertedCardVisual {
  if (kind === "question") {
    return {
      shell: cn(
        "overflow-hidden bg-transparent transition-colors",
        isDark ? "bg-cyan-400/[0.018]" : "bg-cyan-500/[0.028]",
      ),
      accent: isDark ? "border-cyan-400/70" : "border-cyan-500/58",
      label: "text-cyan-600 dark:text-cyan-400",
      title: "text-slate-700 dark:text-slate-100",
      body: "text-slate-700 dark:text-slate-200",
      meta: "text-slate-400 dark:text-slate-400",
    };
  }

  if (kind === "feedback") {
    const tone = getFeedbackToneVisual(feedbackLevel, isDark);

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
      isDark ? "bg-indigo-400/[0.014]" : "bg-indigo-500/[0.02]",
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
