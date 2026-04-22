import { cn } from "@/lib/utils";
import { ReadingLine } from "./reading-line";

type LearningPanelHeaderProps = {
  title: string;
  rootQuestion: string;
  useLightShield: boolean;
};

export function LearningPanelHeader({
  title,
  rootQuestion,
  useLightShield,
}: LearningPanelHeaderProps) {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-8">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          <ReadingLine shield={useLightShield}>Learning Topic</ReadingLine>
        </p>
        <h1
          className={cn(
            "max-w-[18ch] text-balance text-3xl font-light tracking-tight text-slate-900 dark:text-white dark:[text-shadow:0_0_12px_#0a0f1a,_0_0_24px_#0a0f1a] sm:max-w-[20ch] sm:text-4xl 2xl:max-w-none",
            useLightShield &&
              "text-halo-soft-light bg-slate-50/35 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]",
          )}
        >
          {title}
        </h1>
      </div>

      <div className="flex flex-col gap-6 border-l-[3px] border-slate-300 pl-6 pb-12 dark:border-cyan-800/42">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400">
          <ReadingLine shield={useLightShield}>Root Why</ReadingLine>
        </p>
        <p
          className={cn(
            "text-lg font-normal italic leading-[1.85] text-slate-600 dark:text-slate-200 dark:[text-shadow:0_0_10px_#0a0f1a,_0_0_20px_#0a0f1a]",
            useLightShield &&
              "text-halo-soft-light bg-slate-50/28 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]",
          )}
        >
          {rootQuestion}
        </p>
      </div>
    </div>
  );
}
