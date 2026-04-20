import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { getSourceImportById } from "@/mock/data/constellation-topic";
import { cn } from "@/lib/utils";

export function GuidedLadderPage() {
  const { sourceId } = useParams({ from: "/ladder/$sourceId" });
  const navigate = useNavigate();
  const sourceImport = getSourceImportById(sourceId);
  const [customQuestion, setCustomQuestion] = useState("");

  if (!sourceImport) {
    return null;
  }

  const goToTopic = (topicId: string, angleId?: string, nextQuestion?: string) => {
    void navigate({
      to: "/topic/$id",
      params: { id: topicId },
      search: {
        angle: angleId,
        customQuestion: nextQuestion,
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
                placeholder="或者，你也可以问任何你想了解的问题..."
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
