import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { QuestionEntry } from "@/features/start-entry/components/question-entry";
import { guidedQuestions } from "@/mock/data/guided-questions";
import { cn } from "@/lib/utils";
import { useThemeMode } from "@/app/theme/theme-provider";

const wakeLine = "Echowhy, emm?";
const bubblePlacements = [
  "left-1/2 top-[12%] -translate-x-1/2",
  "right-[8%] top-[42%]",
  "left-[8%] top-[46%]",
] as const;

const lightLabelItems = [
  {
    label: "phi = 1.618",
    dotClass:
      "absolute left-[12rem] top-[5.95rem] h-1.5 w-1.5 rounded-full bg-slate-500/60 shadow-[0_0_0_3px_rgba(148,163,184,0.08)]",
    lineClass:
      "absolute left-[5rem] top-[4.9rem] h-px w-[6.5rem] bg-gradient-to-r from-slate-500/72 to-transparent",
    textClass:
      "absolute left-[5rem] top-[5rem] text-[10px] font-mono tracking-[0.12em] text-slate-600/92",
    delay: 0,
    duration: 17,
  },
  {
    label: "theta = pi/2",
    dotClass:
      "absolute right-[23rem] top-[8rem] h-1.5 w-1.5 rounded-full bg-slate-500/58 shadow-[0_0_0_3px_rgba(148,163,184,0.08)]",
    lineClass:
      "absolute right-[6rem] top-[7.9rem] h-px w-[5.3rem] bg-gradient-to-l from-slate-500/68 to-transparent",
    textClass:
      "absolute right-[6rem] top-[8rem] text-[10px] font-mono tracking-[0.12em] text-slate-600/92",
    delay: 4,
    duration: 19,
  },
  {
    label: "r = 4.0u",
    dotClass:
      "absolute left-[7rem] bottom-[6.9rem] h-1.5 w-1.5 rounded-full bg-slate-500/56 shadow-[0_0_0_3px_rgba(148,163,184,0.08)]",
    lineClass:
      "absolute left-[4rem] bottom-[6.95rem] h-px w-[5rem] bg-gradient-to-r from-slate-500/68 to-transparent",
    textClass:
      "absolute left-[4rem] bottom-[7rem] text-[10px] font-mono tracking-[0.12em] text-slate-600/90",
    delay: 8,
    duration: 21,
  },
  {
    label: "lim x->inf",
    dotClass:
      "absolute right-[18rem] bottom-[7.9rem] h-1.5 w-1.5 rounded-full bg-slate-500/58 shadow-[0_0_0_3px_rgba(148,163,184,0.08)]",
    lineClass:
      "absolute right-[7rem] bottom-[9.95rem] h-px w-[5.4rem] bg-gradient-to-l from-slate-500/68 to-transparent",
    textClass:
      "absolute right-[7rem] bottom-[10rem] text-[10px] font-mono tracking-[0.12em] text-slate-600/90",
    delay: 12,
    duration: 18,
  },
] as const;

export function StartPage() {
  const { theme, mode } = useThemeMode();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [isAwake, setIsAwake] = useState(false);
  const [textVisible, setTextVisible] = useState(true);

  const isDarkDynamic = theme === "dark" && mode === "dynamic";
  const isLightDynamic = theme === "light" && mode === "dynamic";

  useEffect(() => {
    const textTimer = window.setTimeout(() => {
      setTextVisible(false);
    }, 2800);

    const awakeTimer = window.setTimeout(() => {
      setIsAwake(true);
    }, 2850);

    return () => {
      window.clearTimeout(textTimer);
      window.clearTimeout(awakeTimer);
    };
  }, []);

  const goToTopic = (topicId: string) => {
    void navigate({ to: "/topic/$id", params: { id: topicId } });
  };

  const showGuidedPaths = isAwake && Boolean(sourceId) && mode === "dynamic";

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
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          theme === "dark" ? "bg-[#020308]" : "bg-slate-50",
        )}
      />

      {isDarkDynamic ? (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <motion.div
            className="absolute -left-[10%] -top-[30%] h-[80vw] w-[80vw] rounded-full bg-indigo-900/10 blur-[160px] mix-blend-screen"
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-[30%] -right-[10%] h-[70vw] w-[70vw] rounded-full bg-cyan-900/10 blur-[160px] mix-blend-screen"
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <motion.div
            className="absolute -inset-full opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(1px 1px at 10% 10%, #fff, transparent), radial-gradient(1px 1px at 40% 60%, #fff, transparent), radial-gradient(1px 1px at 80% 30%, #fff, transparent)",
              backgroundSize: "150px 150px",
            }}
            animate={{ y: ["0%", "-30%"], opacity: [0.2, 0.5, 0.2] }}
            transition={{
              y: { duration: 150, repeat: Infinity, ease: "linear" },
              opacity: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
          />
          <motion.div
            className="absolute -inset-full opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(1.5px 1.5px at 20% 80%, #cbd5e1, transparent), radial-gradient(1.5px 1.5px at 70% 20%, #fff, transparent)",
              backgroundSize: "250px 250px",
            }}
            animate={{ y: ["0%", "-40%"], opacity: [0.1, 0.8, 0.1] }}
            transition={{
              y: { duration: 100, repeat: Infinity, ease: "linear" },
              opacity: {
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              },
            }}
          />
          <motion.div
            className="absolute -inset-full opacity-45"
            style={{
              backgroundImage:
                "radial-gradient(2px 2px at 15% 35%, #ffffff, transparent), radial-gradient(2px 2px at 55% 75%, #dbeafe, transparent)",
              backgroundSize: "360px 360px",
            }}
            animate={{ y: ["0%", "-52%"], opacity: [0.12, 0.7, 0.12] }}
            transition={{
              y: { duration: 72, repeat: Infinity, ease: "linear" },
              opacity: {
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              },
            }}
          />
        </div>
      ) : null}

      {isLightDynamic ? (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-100">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(71,85,105,0.02) 1px, transparent 0)",
              backgroundSize: "92px 92px",
            }}
          />

          <div
            className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 70%)",
            }}
          />

          <div className="absolute right-[18rem] top-[7rem] h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

          <motion.svg
            viewBox="0 0 1440 900"
            className="absolute left-0 top-0 h-full w-full overflow-visible"
            fill="none"
            animate={prefersReducedMotion ? {} : { opacity: [0.22, 0.34, 0.22] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          >
            <defs>
              <linearGradient id="main-axis-gradient" x1="120" y1="760" x2="1320" y2="150" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(100,116,139,0)" />
                <stop offset="18%" stopColor="rgba(100,116,139,0.22)" />
                <stop offset="50%" stopColor="rgba(100,116,139,0.38)" />
                <stop offset="82%" stopColor="rgba(100,116,139,0.22)" />
                <stop offset="100%" stopColor="rgba(100,116,139,0)" />
              </linearGradient>
            </defs>
            <motion.path
              d="M 60 760 C 360 640, 640 470, 900 330 S 1230 180, 1380 120"
              stroke="url(#main-axis-gradient)"
              strokeWidth="0.7"
              strokeLinecap="round"
              strokeDasharray="4 24 12 24"
              animate={prefersReducedMotion ? {} : { strokeDashoffset: [0, -180] }}
              transition={{ duration: 96, repeat: Infinity, ease: "linear" }}
            />
          </motion.svg>

          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(78% 74% at 16% 22%, rgba(191,219,254,0.22) 0%, rgba(191,219,254,0.06) 26%, rgba(248,250,252,0) 58%), radial-gradient(84% 76% at 84% 18%, rgba(125,211,252,0.18) 0%, rgba(125,211,252,0.05) 24%, rgba(248,250,252,0) 56%), radial-gradient(70% 66% at 76% 74%, rgba(199,210,254,0.12) 0%, rgba(199,210,254,0.04) 24%, rgba(248,250,252,0) 54%)",
            }}
            animate={{ opacity: [0.92, 1, 0.94] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />

          <div
            className="absolute inset-0"
            style={{
              maskImage:
                "radial-gradient(circle at 50% 53%, transparent 0 150px, black 230px 100%)",
              WebkitMaskImage:
                "radial-gradient(circle at 50% 53%, transparent 0 150px, black 230px 100%)",
            }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ transformOrigin: "18% 22%" }}
              animate={prefersReducedMotion ? {} : { rotate: [0, 360] }}
              transition={{ duration: 260, repeat: Infinity, ease: "linear" }}
            >
              <motion.div
                className="absolute -left-[14rem] -top-[10rem] h-[38rem] w-[38rem] rounded-full border border-slate-500/40 shadow-[0_0_0_1px_rgba(148,163,184,0.08)]"
                animate={
                  prefersReducedMotion
                    ? {}
                    : { scale: [1, 1.016, 1], opacity: [0.34, 0.56, 0.34] }
                }
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute -left-[8rem] top-[5rem] h-[26rem] w-[26rem] rounded-full border border-slate-500/30"
                animate={
                  prefersReducedMotion
                    ? {}
                    : { scale: [1, 1.012, 1], opacity: [0.24, 0.42, 0.24] }
                }
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.6,
                }}
              />
              <motion.div
                className="absolute left-[4rem] top-[6rem] h-px w-[22rem] origin-left bg-gradient-to-r from-slate-500/70 via-slate-500/26 to-transparent"
                animate={
                  prefersReducedMotion
                    ? {}
                    : { opacity: [0.42, 0.62, 0.42], scaleX: [0.98, 1.02, 0.98] }
                }
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            <motion.div
              className="absolute inset-0"
              style={{ transformOrigin: "84% 18%" }}
              animate={prefersReducedMotion ? {} : { rotate: [0, -360] }}
              transition={{ duration: 300, repeat: Infinity, ease: "linear" }}
            >
              <motion.div
                className="absolute -right-[12rem] top-[8rem] h-[34rem] w-[34rem] rounded-full border border-slate-500/38 shadow-[0_0_0_1px_rgba(148,163,184,0.06)]"
                animate={
                  prefersReducedMotion
                    ? {}
                    : { scale: [1, 1.016, 1], opacity: [0.32, 0.52, 0.32] }
                }
                transition={{
                  duration: 24,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8,
                }}
              />
              <motion.div
                className="absolute right-[4rem] top-[2rem] h-[24rem] w-[24rem] rounded-full border border-slate-500/28"
                animate={
                  prefersReducedMotion
                    ? {}
                    : { scale: [1, 1.014, 1], opacity: [0.22, 0.38, 0.22] }
                }
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2.8,
                }}
              />
              <motion.div
                className="absolute right-[6rem] bottom-[8rem] h-px w-[18rem] origin-right bg-gradient-to-l from-slate-500/66 via-slate-500/24 to-transparent"
                animate={
                  prefersReducedMotion
                    ? {}
                    : { opacity: [0.4, 0.58, 0.4], scaleX: [0.98, 1.03, 0.98] }
                }
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
              />
            </motion.div>

            <svg
              viewBox="0 0 560 360"
              className="absolute left-0 top-0 h-full w-full overflow-visible"
              fill="none"
            >
              <motion.path
                d="M 52 146 C 136 108, 212 88, 308 84"
                stroke="rgba(100,116,139,0.36)"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeDasharray="4 20 12 20"
                animate={prefersReducedMotion ? {} : { strokeDashoffset: [0, -180] }}
                transition={{ duration: 72, repeat: Infinity, ease: "linear" }}
              />
              <motion.path
                d="M 510 118 C 470 126, 432 144, 384 178"
                stroke="rgba(100,116,139,0.32)"
                strokeWidth="0.75"
                strokeLinecap="round"
                strokeDasharray="4 20 12 20"
                animate={prefersReducedMotion ? {} : { strokeDashoffset: [0, 150] }}
                transition={{ duration: 64, repeat: Infinity, ease: "linear" }}
              />
            </svg>

            {lightLabelItems.map((item) => (
              <motion.div
                key={item.label}
                animate={
                  prefersReducedMotion ? {} : { opacity: [0.15, 0.4, 0.15] }
                }
                transition={{
                  duration: item.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: item.delay,
                }}
              >
                <div className={item.dotClass} />
                <div className={item.lineClass} />
                <div className={item.textClass}>{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : null}

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
            <h2
              className={cn(
                "text-2xl font-extralight tracking-[0.06em] sm:text-3xl",
                theme === "dark"
                  ? "text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  : "text-slate-800",
              )}
            >
              What are you trying to understand?
            </h2>

            <div className="relative flex flex-col items-center">
              {isDarkDynamic ? (
                <div className="pointer-events-none absolute left-1/2 top-[58%] z-0 h-52 w-[95vw] -translate-x-1/2 -translate-y-1/2 sm:h-60 sm:w-200">
                  <div className="absolute left-1/2 top-1/2 h-14 w-68 -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-cyan-300/14 blur-[34px] sm:h-16 sm:w-100 sm:blur-2xl" />

                  <motion.div
                    className="absolute left-[36%] top-[40%] h-[6.8rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-[100%] bg-indigo-600/23 blur-[52px] sm:h-32 sm:w-md sm:blur-[60px]"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.28, 0.58, 0.28],
                    }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  <motion.div
                    className="absolute left-[65%] top-[60%] h-32 w-80 -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-[100%] bg-cyan-700/20 blur-[60px] sm:h-40 sm:w-120 sm:blur-[70px]"
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.35, 0.68, 0.35],
                    }}
                    transition={{
                      duration: 5.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.4,
                    }}
                  />

                  <div className="absolute left-1/2 top-[76%] h-24 w-92 -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-blue-900/28 blur-[62px] sm:h-32 sm:w-180 sm:blur-[80px]" />
                </div>
              ) : null}

              <div className="relative z-10">
                <QuestionEntry
                  theme={theme}
                  onSubmit={() => goToTopic("topic-login-jwt")}
                  onAttachSource={!sourceId ? () => setSourceId("source-rbac") : undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
