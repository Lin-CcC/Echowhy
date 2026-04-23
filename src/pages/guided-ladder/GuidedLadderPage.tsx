import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { resolveGuidedLadderSource } from "@/features/guided-ladder";
import { loadLearningModules } from "@/features/topic-session";
import { getSourceImportById } from "@/mock/data/constellation-topic";
import { cn } from "@/lib/utils";

export function GuidedLadderPage() {
  const { sourceId } = useParams({ from: "/ladder/$sourceId" });
  const search = useSearch({ from: "/ladder/$sourceId" });
  const navigate = useNavigate();
  const sourceImport = useMemo(
    () =>
      resolveGuidedLadderSource({
        sourceId,
        moduleId: search.moduleId,
        modules: loadLearningModules(),
        getStaticSourceImport: getSourceImportById,
      }),
    [sourceId, search.moduleId],
  );
  const [customQuestion, setCustomQuestion] = useState("");
  const sourceBoundQuestion = search.customQuestion?.trim();
  const sourceBoundTargetTopicId = search.targetTopicId?.trim();

  if (!sourceImport) {
    return (
      <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-transparent px-8">
        <div className="max-w-xl border-l border-cyan-400/40 pl-6">
          <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.22em] text-slate-400 dark:text-slate-400">
            Source unavailable
          </p>
          <h1 className="text-3xl font-light tracking-tight text-slate-900 dark:text-slate-100">
            This source is not ready for a ladder yet.
          </h1>
          <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
            The page could not find a matching imported source or saved learning
            module. Return to Start and attach the source again.
          </p>
          <button
            type="button"
            onClick={() => void navigate({ to: "/" })}
            className="mt-8 border border-cyan-500/50 px-5 py-2 text-xs uppercase tracking-widest text-cyan-700 transition-colors hover:bg-cyan-500 hover:text-white dark:text-cyan-300 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-200"
          >
            [ Back to Start ]
          </button>
        </div>
      </section>
    );
  }

  const goToTopic = (topicId: string, angleId?: string, nextQuestion?: string) => {
    void navigate({
      to: "/topic/$id",
      params: { id: topicId },
      search: {
        angle: angleId,
        customQuestion: nextQuestion,
        sourceId,
        sourceLabel: search.sourceLabel ?? sourceImport.projectName,
      },
    });
  };

  return (
    <section className="relative min-h-[calc(100vh-5rem)] w-full overflow-hidden bg-transparent">
      <div className="flex h-[calc(100vh-5rem)] w-full overflow-hidden">
        <div className="stealth-scrollbar flex-1 overflow-y-auto bg-transparent px-8 py-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10">
              <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">
                Imported source
              </p>
              <h1 className="max-w-[20ch] text-balance text-3xl font-light tracking-tight text-slate-900 dark:text-slate-100 dark:[text-shadow:0_0_12px_#0a0f1a,_0_0_24px_#0a0f1a] sm:text-4xl">
                {sourceImport.projectName}
              </h1>
            </div>

            <div className="space-y-5 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
              {sourceImport.overview.map((paragraph) => (
                <p
                  key={paragraph}
                  className="dark:[text-shadow:0_0_10px_#0a0f1a,_0_0_20px_#0a0f1a]"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {sourceBoundQuestion && sourceBoundTargetTopicId ? (
              <div className="mt-10 border-l border-cyan-400/55 py-1 pl-6">
                <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">
                  Source-aligned question
                </p>
                <p className="max-w-2xl text-2xl font-light leading-snug tracking-tight text-slate-900 dark:text-slate-100">
                  {sourceBoundQuestion}
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                  This question is now attached to the source context. Enter the
                  learning chain when you are ready, or choose another guided
                  path below if the source suggests a better first step.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    goToTopic(
                      sourceBoundTargetTopicId,
                      "angle-custom-followup",
                      sourceBoundQuestion,
                    )
                  }
                  className="mt-6 border border-cyan-500/45 px-5 py-2 text-xs uppercase tracking-widest text-cyan-700 transition-colors hover:bg-cyan-500 hover:text-white dark:text-cyan-300 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-200"
                >
                  [ Enter learning chain ]
                </button>
              </div>
            ) : null}

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {sourceImport.guidedQuestions.map((question) => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => goToTopic(question.topicId, question.angleId)}
                  className={cn(
                    "rounded-2xl border p-5 text-left transition-colors",
                    "border-slate-200/50 bg-white/[0.04] backdrop-blur-[2px] hover:border-cyan-400/50 hover:text-cyan-700",
                    "dark:border-cyan-800/30 dark:bg-slate-950/35 dark:text-slate-300 dark:hover:border-cyan-400/40 dark:hover:text-cyan-400",
                  )}
                >
                  <span className="block text-[10px] font-mono uppercase tracking-[0.22em] text-slate-400 dark:text-slate-400">
                    Guided Question
                  </span>
                  <span className="mt-3 block text-sm leading-6">{question.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-slate-200/50 p-5 dark:border-cyan-800/30">
              <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.22em] text-slate-400 dark:text-slate-400">
                My own why
              </p>
              <textarea
                rows={2}
                value={customQuestion}
                onChange={(event) => setCustomQuestion(event.target.value)}
                placeholder="Or ask the source your own why..."
                className="w-full resize-none border-b border-slate-300 bg-transparent pb-2 text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none dark:border-cyan-700/45 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
              />

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    customQuestion.trim()
                      ? goToTopic(
                          sourceImport.guidedQuestions[0]?.topicId ?? "topic-login-jwt",
                          "angle-custom-followup",
                          customQuestion.trim(),
                        )
                      : undefined
                  }
                  className="border border-cyan-600/50 px-5 py-2 text-xs uppercase tracking-widest text-cyan-700 transition-colors hover:bg-cyan-500 hover:text-white dark:border-cyan-400/45 dark:text-cyan-400 dark:hover:bg-cyan-400/12"
                >
                  [ Start from my question ]
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden w-[min(24rem,30vw)] min-w-[20rem] shrink-0 border-l border-slate-200/50 bg-transparent p-8 xl:block dark:border-cyan-800/30">
          <p className="mb-6 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">
            Source structure
          </p>
          <div className="space-y-3">
            {sourceImport.fileTree.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToTopic(item.topicId, item.angleId, item.customQuestion)}
                className="block w-full rounded-xl border border-slate-200/40 px-4 py-3 text-left text-sm text-slate-600 transition-colors hover:border-cyan-400 hover:text-cyan-700 dark:border-cyan-800/25 dark:text-slate-300 dark:hover:border-cyan-400 dark:hover:text-cyan-400"
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
