import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { guidedQuestions } from "@/mock/data/guided-questions";
import { constellationTopic } from "@/mock/data/constellation-topic";
import { cn } from "@/lib/utils";
import { useThemeMode } from "@/app/theme/theme-provider";
import { ThemedAmbientBackground } from "@/components/ui/themed-ambient-background";
import { StartAskPanel } from "./start-ask-panel";
import { SourcePreviewLens } from "./source-preview-lens";
import { RecentSourceConstellation } from "./recent-source-constellation";
import {
  type StartSource,
} from "./start-page-utils";
import { useStartPageFlow } from "./start-page-flow";
import { TypewriterHeading } from "./typewriter-heading";

const wakeLine = "Echowhy, emm?";
const bubblePlacements = [
  "left-1/2 top-[12%] -translate-x-1/2",
  "right-[8%] top-[42%]",
  "left-[8%] top-[46%]",
] as const;

const seedRecentSources: StartSource[] = [
  {
    id: constellationTopic.sourceImport.id,
    label: constellationTopic.sourceImport.projectName,
    caption: "RBAC source",
    kind: "project",
    children: constellationTopic.sourceImport.guidedQuestions.map((question) => ({
      id: question.id,
      label: question.label,
      topicId: question.topicId,
      angleId: question.angleId,
    })),
  },
];

export function StartPage() {
  const { theme, mode } = useThemeMode();
  const navigate = useNavigate();
  const {
    isAwake,
    textVisible,
    startMode,
    setStartMode,
    selectedSource,
    attachedFiles,
    isSourceLensOpen,
    setIsSourceLensOpen,
    sourceLensIndex,
    setSourceLensIndex,
    hoveredSourceId,
    setHoveredSourceId,
    selectingSourceId,
    trackPulseKey,
    isTrackPulseActive,
    activeHeading,
    recentSources,
    recentSourcePoints,
    recentSourcePath,
    selectingSourceIndex,
    selectingSourcePath,
    goToTopic,
    createWhyFromQuestion,
    clearSelectedSource,
    handleFilesSelected,
    handleSelectRecentSource,
    handlePulseRecentTrack,
  } = useStartPageFlow({
    seedRecentSources,
  });

  const isDarkDynamic = theme === "dark" && mode === "dynamic";
  const showGuidedPaths = false;

  const questionBubbleVariants = useMemo(
    () => ({
      hidden: { opacity: 0, scale: 0.94, y: 14 },
      visible: (index: number) => ({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          delay: 0.18 * index,
          duration: 0.78,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      }),
    }),
    [],
  );

  return (
    <section className="relative isolate flex h-screen w-full items-center justify-center overflow-hidden bg-slate-50 dark:bg-transparent">
      <ThemedAmbientBackground
        showLightDynamicAnnotations
        showLightDynamicCenterMask
      />

      {mode === "dynamic" ? (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 rounded-full"
          style={{
            background:
              theme === "dark"
                ? "radial-gradient(circle, rgba(200,240,255,0.08) 0%, rgba(6,182,212,0) 70%)"
                : "radial-gradient(circle, rgba(14,165,233,0) 0%, rgba(14,165,233,0) 70%)",
            transform: "translate(-50%, -50%)",
          }}
          initial={{ width: 0, height: 0, opacity: 0 }}
          animate={isAwake ? { width: "200vw", height: "200vw", opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      ) : null}

      <AnimatePresence>
        {textVisible && mode === "dynamic" ? (
          <motion.div
            key="wake-text"
            className={cn(
              "pointer-events-none absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 text-2xl font-light tracking-[0.04em] sm:text-4xl",
              theme === "dark" ? "text-slate-100" : "text-slate-700",
            )}
            initial={{ opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }}
            exit={{ opacity: 0, filter: "blur(20px)", scale: 2.8, y: -40 }}
            transition={{ duration: 0.35, ease: [0.7, 0, 1, 1] }}
          >
            {wakeLine.split("").map((char, index) => (
              <motion.span
                key={`${char}-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.05, delay: 0.5 + index * 0.1 }}
              >
                {char}
              </motion.span>
            ))}

            {!isAwake ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0, 1, 0] }}
                transition={{
                  duration: 0.8,
                  delay: 0.5 + wakeLine.length * 0.1,
                }}
                className={cn(
                  "ml-1 h-7 w-0.5 self-center",
                  theme === "dark" ? "bg-white/70" : "bg-slate-500",
                )}
              />
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        className="relative z-20 flex w-full max-w-6xl flex-col items-center justify-center px-4 py-10 sm:px-6"
        initial={{ opacity: 0, scale: 0.85, filter: "blur(15px)" }}
        animate={isAwake ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1], delay: 0.05 }}
      >
        <div className="relative flex h-screen w-full items-center justify-center overflow-hidden">
          {mode === "dynamic"
            ? guidedQuestions.map((question, index) => (
                <motion.button
                  key={question.id}
                  type="button"
                  custom={index}
                  variants={questionBubbleVariants}
                  initial="hidden"
                  animate={showGuidedPaths ? "visible" : "hidden"}
                  onClick={() => goToTopic(question.topicId)}
                  className={cn(
                    "absolute max-w-68 rounded-full px-5 py-3 text-left text-sm leading-6 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1",
                    theme === "dark"
                      ? "bg-white/5 text-slate-100 shadow-[0_14px_50px_rgba(2,6,23,0.16)] hover:bg-white/8"
                      : "bg-white/70 text-slate-700 shadow-[0_14px_50px_rgba(15,23,42,0.08)] hover:bg-white/85",
                    "animate-float-drift",
                    bubblePlacements[index],
                  )}
                  style={{ animationDelay: `${index * 0.9}s` }}
                >
                  <span className="block text-[10px] uppercase tracking-[0.24em] text-slate-400">
                    guided path
                  </span>
                  <span className="mt-2 block">{question.label}</span>
                </motion.button>
              ))
            : null}

          <div className="relative flex w-full flex-col items-center justify-center gap-12 text-center">
            <TypewriterHeading text={activeHeading} theme={theme} />

            <div className="relative flex flex-col items-center">
              {isDarkDynamic ? (
                <div className="pointer-events-none absolute left-1/2 top-[58%] z-0 h-52 w-[95vw] -translate-x-1/2 -translate-y-1/2 sm:h-60 sm:w-200">
                  <div className="absolute left-1/2 top-1/2 h-14 w-68 -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-cyan-300/14 blur-[34px] sm:h-16 sm:w-100 sm:blur-2xl" />

                  <div className="absolute left-1/2 top-[76%] h-24 w-92 -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-blue-900/28 blur-[62px] sm:h-32 sm:w-180 sm:blur-[80px]" />
                </div>
              ) : null}

              <div className="relative z-10">
                <AnimatePresence mode="wait">
                  {startMode === "ask" ? (
                    <StartAskPanel
                      key="ask"
                      theme={theme}
                      selectedSource={selectedSource}
                      attachedFiles={attachedFiles}
                      isSourceLensOpen={isSourceLensOpen}
                      onSubmit={createWhyFromQuestion}
                      onFilesSelected={handleFilesSelected}
                      onShowRecentSources={() => {
                        setIsSourceLensOpen(false);
                        setStartMode("recent");
                      }}
                      onPreviewSource={() => setIsSourceLensOpen((isOpen) => !isOpen)}
                      onClearSelectedSource={clearSelectedSource}
                    />
                  ) : null}

                  {startMode === "recent" ? (
                    <RecentSourceConstellation
                      theme={theme}
                      recentSources={recentSources}
                      recentSourcePoints={recentSourcePoints}
                      recentSourcePath={recentSourcePath}
                      selectingSourcePath={selectingSourcePath}
                      selectingSourceId={selectingSourceId}
                      selectingSourceIndex={selectingSourceIndex}
                      hoveredSourceId={hoveredSourceId}
                      trackPulseKey={trackPulseKey}
                      isTrackPulseActive={isTrackPulseActive}
                      onHoverSource={setHoveredSourceId}
                      onSelectSource={handleSelectRecentSource}
                      onOpenSourceChild={goToTopic}
                      onPulseTrack={handlePulseRecentTrack}
                      onBackToAsk={() => setStartMode("ask")}
                      onOpenLibrary={() => void navigate({ to: "/library" })}
                    />
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isSourceLensOpen && attachedFiles.length > 0 ? (
          <SourcePreviewLens
            files={attachedFiles}
            activeIndex={sourceLensIndex}
            onActiveIndexChange={setSourceLensIndex}
            onClose={() => setIsSourceLensOpen(false)}
            theme={theme}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
