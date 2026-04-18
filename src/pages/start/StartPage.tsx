import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

type EuclidShape = {
  id: number;
  sizeTier: "small" | "medium" | "large" | "hero";
  kind:
    | "circle"
    | "square"
    | "triangle"
    | "pentagon"
    | "rectangle"
    | "hexagon"
    | "diamond"
    | "ellipse"
    | "trapezoid";
  width: number;
  height: number;
  lifecycleDuration: number;
  moveDurationX: number;
  moveDurationY: number;
  rotateDuration: number;
  rotateDirection: 1 | -1;
  delay: number;
  top: number;
  left: number;
  rotateStart: number;
  driftX1: number;
  driftX2: number;
  driftY1: number;
  driftY2: number;
  appearAt: number;
  holdUntil: number;
  peakOpacity: number;
  borderAlpha: number;
};

export function StartPage() {
  const { theme, mode } = useThemeMode();
  const navigate = useNavigate();
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [isAwake, setIsAwake] = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  const [shapeCount, setShapeCount] = useState(20);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

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

  useEffect(() => {
    const visitedKey = "echowhy-start-visited";
    const visited = window.sessionStorage.getItem(visitedKey);
    if (!visited) {
      setShapeCount(32);
      window.sessionStorage.setItem(visitedKey, "true");
      return;
    }

    setShapeCount(20);
  }, []);

  useEffect(() => {
    const syncViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);

    return () => {
      window.removeEventListener("resize", syncViewport);
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

  const euclidShapes = useMemo<EuclidShape[]>(() => {
    const viewportWidth = Math.max(1280, viewport.width);
    const viewportHeight = Math.max(720, viewport.height);
    const viewportArea = Math.max(1280 * 720, viewport.width * viewport.height);
    const heroMinArea = viewportArea * 0.25;

    const tierPool: EuclidShape["sizeTier"][] = ["hero"];
    for (let i = 1; i < shapeCount; i += 1) {
      const r = Math.random();
      tierPool.push(r < 0.58 ? "large" : r < 0.9 ? "medium" : "small");
    }

    for (let i = tierPool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [tierPool[i], tierPool[j]] = [tierPool[j], tierPool[i]];
    }

    const largeAnchors = [
      { x: 28, y: 33 },
      { x: 72, y: 64 },
    ];
    const heroAnchors = [
      { x: 22, y: 30 },
      { x: 78, y: 68 },
    ];

    const placedRegions: Array<{
      cx: number;
      cy: number;
      rx: number;
      ry: number;
    }> = [];

    const sampleAnchoredPosition = (sizeTier: EuclidShape["sizeTier"]) => {
      if (sizeTier === "hero") {
        const anchor =
          heroAnchors[Math.floor(Math.random() * heroAnchors.length)];
        return {
          top: Math.min(94, Math.max(6, anchor.y + (Math.random() * 20 - 10))),
          left: Math.min(94, Math.max(6, anchor.x + (Math.random() * 22 - 11))),
        };
      }

      if (sizeTier === "large") {
        const anchor =
          largeAnchors[Math.floor(Math.random() * largeAnchors.length)];
        return {
          top: Math.min(95, Math.max(5, anchor.y + (Math.random() * 18 - 9))),
          left: Math.min(95, Math.max(5, anchor.x + (Math.random() * 20 - 10))),
        };
      }

      return { top: Math.random() * 100, left: Math.random() * 100 };
    };

    const pickPositionWithSpacing = (
      sizeTier: EuclidShape["sizeTier"],
      width: number,
      height: number,
    ) => {
      const gapScale =
        sizeTier === "hero" ? 0.78 : sizeTier === "large" ? 0.72 : 0.62;
      let fallback = sampleAnchoredPosition(sizeTier);

      for (let tries = 0; tries < 22; tries += 1) {
        const candidate = sampleAnchoredPosition(sizeTier);
        fallback = candidate;

        const cx = (candidate.left / 100) * viewportWidth + width / 2;
        const cy = (candidate.top / 100) * viewportHeight + height / 2;
        const rx = width / 2;
        const ry = height / 2;

        const hasHeavyOverlap = placedRegions.some((region) => {
          const nx =
            Math.abs(cx - region.cx) / Math.max(1, (rx + region.rx) * gapScale);
          const ny =
            Math.abs(cy - region.cy) / Math.max(1, (ry + region.ry) * gapScale);
          return nx * nx + ny * ny < 1;
        });

        if (!hasHeavyOverlap) {
          placedRegions.push({ cx, cy, rx, ry });
          return candidate;
        }
      }

      placedRegions.push({
        cx: (fallback.left / 100) * viewportWidth + width / 2,
        cy: (fallback.top / 100) * viewportHeight + height / 2,
        rx: width / 2,
        ry: height / 2,
      });

      return fallback;
    };

    return [...Array(shapeCount)].map((_, i) => {
      const sizeTier = tierPool[i] ?? "medium";
      const lifecycleDuration = Math.random() * 24 + 18;
      const appearAt = Math.random() * 0.18 + 0.1;
      const holdUntil = appearAt + Math.random() * 0.34 + 0.36;
      const kinds: EuclidShape["kind"][] = [
        "circle",
        "square",
        "triangle",
        "pentagon",
        "rectangle",
        "hexagon",
        "diamond",
        "ellipse",
        "trapezoid",
      ];
      const kind = kinds[i % kinds.length];
      const baseSize =
        sizeTier === "small"
          ? 34 + Math.random() * 30
          : sizeTier === "medium"
            ? 74 + Math.random() * 70
            : sizeTier === "large"
              ? 160 + Math.random() * 240
              : 320 + Math.random() * 300;

      let width =
        kind === "rectangle"
          ? Math.max(56, baseSize * (1.2 + Math.random() * 1.1))
          : baseSize;
      let height =
        kind === "rectangle"
          ? Math.max(34, baseSize * (0.45 + Math.random() * 0.5))
          : baseSize;

      if (sizeTier === "hero") {
        const currentArea = Math.max(1, width * height);
        if (currentArea < heroMinArea) {
          const scale = Math.sqrt(heroMinArea / currentArea);
          width *= scale;
          height *= scale;
        }
      }

      const placement = pickPositionWithSpacing(sizeTier, width, height);

      const maxDimension = Math.max(width, height);
      const sizeFactor = Math.min(1, Math.max(0, (maxDimension - 38) / 320));
      const moveDurationX =
        (sizeTier === "hero" ? 34 : 22) + sizeFactor * 28 + Math.random() * 10;
      const moveDurationY =
        (sizeTier === "hero" ? 36 : 24) + sizeFactor * 26 + Math.random() * 10;
      const rotateDuration =
        (sizeTier === "hero" ? 130 : 78) +
        sizeFactor * 110 +
        Math.random() * 24;
      const rotateDirection = Math.random() > 0.5 ? 1 : -1;

      return {
        id: i,
        sizeTier,
        kind,
        width,
        height,
        lifecycleDuration,
        moveDurationX,
        moveDurationY,
        rotateDuration,
        rotateDirection,
        delay: Math.random() * 3.8,
        top: placement.top,
        left: placement.left,
        rotateStart: Math.random() * 360,
        driftX1: Math.random() * 120 - 60,
        driftX2: Math.random() * 180 - 90,
        driftY1: Math.random() * 120 - 60,
        driftY2: Math.random() * 180 - 90,
        appearAt,
        holdUntil,
        peakOpacity:
          sizeTier === "small"
            ? Math.random() * 0.08 + 0.18
            : sizeTier === "medium"
              ? Math.random() * 0.12 + 0.3
              : sizeTier === "large"
                ? Math.random() * 0.16 + 0.4
                : Math.random() * 0.1 + 0.3,
        borderAlpha:
          sizeTier === "small"
            ? Math.random() * 0.08 + 0.18
            : sizeTier === "medium"
              ? Math.random() * 0.14 + 0.28
              : sizeTier === "large"
                ? Math.random() * 0.18 + 0.34
                : Math.random() * 0.12 + 0.24,
      };
    });
  }, [shapeCount, viewport.height, viewport.width]);

  const isDarkDynamic = theme === "dark" && mode === "dynamic";
  const isLightDynamic = theme === "light" && mode === "dynamic";

  return (
    <section className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 dark:bg-transparent">
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
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {euclidShapes.map((shape) => {
            const borderColor = `rgba(148,163,184,${shape.borderAlpha})`;
            const fillColor = `rgba(148,163,184,${Math.max(0.06, shape.borderAlpha * 0.12)})`;

            const clipPath =
              shape.kind === "triangle"
                ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                : shape.kind === "pentagon"
                  ? "polygon(50% 0%, 95% 35%, 78% 100%, 22% 100%, 5% 35%)"
                  : shape.kind === "hexagon"
                    ? "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
                    : shape.kind === "diamond"
                      ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
                      : shape.kind === "trapezoid"
                        ? "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)"
                        : "none";

            return (
              <motion.div
                key={shape.id}
                className="absolute flex items-center justify-center font-extralight mix-blend-multiply text-slate-500/55"
                style={{
                  top: `${shape.top}%`,
                  left: `${shape.left}%`,
                  width: shape.width,
                  height: shape.height,
                  border: `1px solid ${borderColor}`,
                  borderRadius:
                    shape.kind === "circle"
                      ? "50%"
                      : shape.kind === "ellipse"
                        ? "50% / 38%"
                        : "0",
                  backgroundColor: fillColor,
                  clipPath,
                  transform: `rotate(${shape.rotateStart}deg)`,
                }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, shape.peakOpacity, shape.peakOpacity, 0],
                  x: [0, shape.driftX1, shape.driftX2],
                  y: [0, shape.driftY1, shape.driftY2],
                  rotate: [
                    0,
                    72 * shape.rotateDirection,
                    138 * shape.rotateDirection,
                  ],
                }}
                transition={{
                  opacity: {
                    duration: shape.lifecycleDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: shape.delay,
                    times: [0, shape.appearAt, shape.holdUntil, 1],
                  },
                  x: {
                    duration: shape.moveDurationX,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: shape.delay,
                    repeatType: "mirror",
                  },
                  y: {
                    duration: shape.moveDurationY,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: shape.delay,
                    repeatType: "mirror",
                  },
                  rotate: {
                    duration: shape.rotateDuration,
                    repeat: Infinity,
                    ease: "linear",
                    delay: shape.delay,
                    repeatType: "mirror",
                  },
                }}
              />
            );
          })}
        </div>
      ) : null}

      {mode === "dynamic" ? (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 rounded-full"
          style={{
            background:
              theme === "dark"
                ? "radial-gradient(circle, rgba(200,240,255,0.08) 0%, rgba(6,182,212,0) 70%)"
                : "radial-gradient(circle, rgba(14,165,233,0.12) 0%, rgba(14,165,233,0) 70%)",
            transform: "translate(-50%, -50%)",
          }}
          initial={{ width: 0, height: 0, opacity: 0 }}
          animate={
            isAwake ? { width: "200vw", height: "200vw", opacity: 1 } : {}
          }
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      ) : null}

      <AnimatePresence>
        {textVisible && mode === "dynamic" ? (
          <motion.div
            key="wake-text"
            className={cn(
              "pointer-events-none absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 text-2xl font-light tracking-[0.08em] sm:text-4xl",
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
        transition={{
          duration: 1.2,
          ease: [0.19, 1, 0.22, 1],
          delay: 0.05,
        }}
      >
        <div className="relative flex min-h-136 w-full items-center justify-center">
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
                "text-2xl font-extralight tracking-[0.08em] sm:text-3xl",
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
                  onAttachSource={
                    !sourceId ? () => setSourceId("source-rbac") : undefined
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
