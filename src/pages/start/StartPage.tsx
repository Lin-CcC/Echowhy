import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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

type ShapeDefinition = {
  id: "familyA" | "familyB" | "familyC" | "familyD";
};

const SHAPE_LIBRARY: ShapeDefinition[] = [
  { id: "familyA" },
  { id: "familyB" },
  { id: "familyC" },
  { id: "familyD" },
];

type HeterogeneousElement = {
  id: string;
  kind: ShapeDefinition["id"];
  left: number;
  top: number;
  width: number;
  height: number;
  rotate: number;
  scale: number;
  opacity: number;
  flipX: number;
  flipY: number;
  duration: number;
  delay: number;
  label: string;
  spiralPath: string;
};

function buildSpiralPath(turns: number, maxRadius: number) {
  const points: string[] = [];

  for (let t = 0; t <= turns * Math.PI * 2; t += 0.22) {
    const ratio = t / (turns * Math.PI * 2);
    const r = 6 + ratio * maxRadius;
    const x = 64 + Math.cos(t) * r;
    const y = 64 + Math.sin(t) * r;
    points.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return `M ${points.join(" L ")}`;
}

function drawFamilyA(element: HeterogeneousElement): ReactNode {
  return (
    <svg viewBox="0 0 160 160" className="h-full w-full" fill="none">
      <path
        d={element.spiralPath}
        className="stroke-slate-600/78"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function drawFamilyB(): ReactNode {
  return (
    <svg viewBox="0 0 160 120" className="h-full w-full" fill="none">
      <path
        d="M 18 96 L 130 96 L 74 24 Z"
        className="stroke-slate-600/85"
        strokeWidth="0.8"
      />
      <line
        x1="74"
        y1="24"
        x2="74"
        y2="96"
        className="stroke-slate-600/72"
        strokeWidth="0.7"
      />
      <line
        x1="18"
        y1="96"
        x2="74"
        y2="24"
        className="stroke-slate-600/62"
        strokeWidth="0.65"
        strokeDasharray="3 4"
      />
      <text
        x="84"
        y="40"
        className="fill-slate-600/84"
        fontSize="10"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        alpha
      </text>
      <text
        x="34"
        y="92"
        className="fill-slate-600/80"
        fontSize="9"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        90deg
      </text>
    </svg>
  );
}

function drawFamilyC(element: HeterogeneousElement): ReactNode {
  return (
    <svg viewBox="0 0 180 84" className="h-full w-full" fill="none">
      <text
        x="8"
        y="20"
        className="fill-slate-600/88"
        fontSize="9"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        {element.label}
      </text>
      <text
        x="8"
        y="42"
        className="fill-slate-600/82"
        fontSize="9"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        pi sum
      </text>
      <text
        x="8"
        y="64"
        className="fill-slate-600/80"
        fontSize="9"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        theta phi
      </text>
    </svg>
  );
}

function drawFamilyD(): ReactNode {
  return (
    <svg viewBox="0 0 150 120" className="h-full w-full" fill="none">
      <line
        x1="16"
        y1="92"
        x2="132"
        y2="28"
        className="stroke-slate-600/84"
        strokeWidth="0.7"
      />
      <line
        x1="20"
        y1="20"
        x2="124"
        y2="100"
        className="stroke-slate-600/78"
        strokeWidth="0.7"
      />
      <circle
        cx="73"
        cy="62"
        r="5.5"
        className="stroke-slate-600/72"
        strokeWidth="0.65"
      />
    </svg>
  );
}

export function StartPage() {
  const { theme, mode } = useThemeMode();
  const navigate = useNavigate();
  const pointerIdleTimerRef = useRef<number | null>(null);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [isAwake, setIsAwake] = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  const [lightPointer, setLightPointer] = useState<{
    x: number;
    y: number;
    nx: number;
    ny: number;
  } | null>(null);
  const [showPointerEcho, setShowPointerEcho] = useState(false);

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

  const isDarkDynamic = theme === "dark" && mode === "dynamic";
  const isLightDynamic = theme === "light" && mode === "dynamic";

  const heterogeneousElements = useMemo(() => {
    const randomBetween = (min: number, max: number) =>
      min + Math.random() * (max - min);

    const pickCount = Math.floor(randomBetween(4, 7));
    const randomPeripheralPosition = () => {
      let left = 0;
      let top = 0;
      let attempts = 0;

      do {
        left = randomBetween(4, 96);
        top = randomBetween(5, 95);
        attempts += 1;
      } while (left > 32 && left < 68 && top > 30 && top < 72 && attempts < 30);

      return { left, top };
    };

    const elements: HeterogeneousElement[] = [];

    const heroPosition = randomPeripheralPosition();
    elements.push({
      id: `familyA-hero-${Math.random().toString(36).slice(2, 7)}`,
      kind: "familyA",
      left: heroPosition.left,
      top: heroPosition.top,
      width: randomBetween(50, 68),
      height: randomBetween(44, 62),
      rotate: randomBetween(-16, 16),
      scale: randomBetween(1, 1.25),
      opacity: randomBetween(0.14, 0.22),
      flipX: Math.random() > 0.5 ? -1 : 1,
      flipY: Math.random() > 0.5 ? -1 : 1,
      duration: randomBetween(56, 84),
      delay: -randomBetween(0, 12),
      label: `(x.${randomBetween(0.111, 9.999).toFixed(3)}, y.${randomBetween(0.111, 9.999).toFixed(3)})`,
      spiralPath: buildSpiralPath(
        randomBetween(2.8, 4.4),
        randomBetween(40, 56),
      ),
    });

    const pool: ShapeDefinition["id"][] = SHAPE_LIBRARY.map(
      (item) => item.id,
    ).filter((id) => id !== "familyA");

    for (let i = 1; i < pickCount; i += 1) {
      const kind = pool[Math.floor(Math.random() * pool.length)];
      const position = randomPeripheralPosition();

      elements.push({
        id: `${kind}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        kind,
        left: position.left,
        top: position.top,
        width: randomBetween(14, 30),
        height: randomBetween(12, 24),
        rotate: randomBetween(-34, 34),
        scale: randomBetween(0.5, 1.5),
        opacity: randomBetween(0.28, 0.48),
        flipX: Math.random() > 0.5 ? -1 : 1,
        flipY: Math.random() > 0.5 ? -1 : 1,
        duration: randomBetween(24, 64),
        delay: -randomBetween(0, 12),
        label: `(x.${randomBetween(0.111, 9.999).toFixed(3)}, y.${randomBetween(0.111, 9.999).toFixed(3)})`,
        spiralPath: buildSpiralPath(
          randomBetween(2.1, 3.6),
          randomBetween(22, 36),
        ),
      });
    }

    return elements;
  }, []);

  useEffect(() => {
    return () => {
      if (pointerIdleTimerRef.current !== null) {
        window.clearTimeout(pointerIdleTimerRef.current);
      }
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
    <section
      className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 dark:bg-transparent"
      onPointerMove={(event) => {
        if (!isLightDynamic) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const nx = rect.width > 0 ? x / rect.width : 0;
        const ny = rect.height > 0 ? y / rect.height : 0;

        setLightPointer({ x, y, nx, ny });
        setShowPointerEcho(false);

        if (pointerIdleTimerRef.current !== null) {
          window.clearTimeout(pointerIdleTimerRef.current);
        }

        pointerIdleTimerRef.current = window.setTimeout(() => {
          setShowPointerEcho(true);
        }, 220);
      }}
      onPointerLeave={() => {
        if (pointerIdleTimerRef.current !== null) {
          window.clearTimeout(pointerIdleTimerRef.current);
          pointerIdleTimerRef.current = null;
        }
        setShowPointerEcho(false);
      }}
    >
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
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-95">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4755693a_1px,transparent_1px),linear-gradient(to_bottom,#4755693a_1px,transparent_1px)] bg-size-[80px_80px]" />

          {lightPointer ? (
            <motion.div
              className="absolute inset-0 bg-[linear-gradient(to_right,#33415555_1px,transparent_1px),linear-gradient(to_bottom,#33415555_1px,transparent_1px)] bg-size-[76px_76px]"
              style={{
                maskImage: `radial-gradient(150px 150px at ${lightPointer.x}px ${lightPointer.y}px, rgba(0,0,0,0.9), rgba(0,0,0,0))`,
                WebkitMaskImage: `radial-gradient(150px 150px at ${lightPointer.x}px ${lightPointer.y}px, rgba(0,0,0,0.9), rgba(0,0,0,0))`,
              }}
              animate={{
                x: (lightPointer.nx - 0.5) * 8,
                y: (lightPointer.ny - 0.5) * 8,
                scale: 1.03,
                opacity: [0.34, 0.7, 0.34],
              }}
              transition={{ duration: 6, ease: "easeInOut" }}
            />
          ) : null}

          <motion.div
            className="absolute inset-0"
            animate={{
              x: [-10, 10, -10],
              y: [-5, 5, -5],
              opacity: [0.5, 0.95, 0.5],
            }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            {heterogeneousElements.map((element) => {
              const categoryAnimation =
                element.kind === "familyA"
                  ? {
                      rotate: [
                        element.rotate,
                        element.rotate + 10,
                        element.rotate,
                      ],
                      opacity: [
                        element.opacity * 0.55,
                        element.opacity,
                        element.opacity * 0.55,
                      ],
                    }
                  : element.kind === "familyD"
                    ? {
                        x: [-5, 5, -5],
                        opacity: [
                          element.opacity * 0.65,
                          element.opacity,
                          element.opacity * 0.65,
                        ],
                      }
                    : element.kind === "familyC"
                      ? {
                          opacity: [
                            element.opacity * 0.4,
                            element.opacity,
                            element.opacity * 0.4,
                          ],
                          scale: [
                            element.scale * 0.98,
                            element.scale,
                            element.scale * 0.98,
                          ],
                        }
                      : {
                          opacity: [
                            element.opacity * 0.5,
                            element.opacity,
                            element.opacity * 0.5,
                          ],
                          y: [0, -3, 0],
                        };

              return (
                <motion.div
                  key={element.id}
                  className="absolute"
                  style={{
                    left: `${element.left}%`,
                    top: `${element.top}%`,
                    width: `${element.width}vw`,
                    height: `${element.height}vw`,
                    opacity: element.opacity,
                    transform: `translate(-50%, -50%) scale(${element.scale * element.flipX}, ${element.scale * element.flipY}) rotate(${element.rotate}deg)`,
                    filter: "drop-shadow(0 0 1px rgba(71,85,105,0.22))",
                  }}
                  animate={categoryAnimation}
                  transition={{
                    duration: element.duration,
                    delay: element.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {element.kind === "familyA" ? drawFamilyA(element) : null}
                  {element.kind === "familyB" ? drawFamilyB() : null}
                  {element.kind === "familyC" ? drawFamilyC(element) : null}
                  {element.kind === "familyD" ? drawFamilyD() : null}
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            className="absolute bottom-14 left-14"
            animate={{
              x: [-6, 6, -6],
              y: [0, 3, 0],
              opacity: [0.42, 0.86, 0.42],
            }}
            transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
          >
            <div className="relative h-5 w-44 border-t border-slate-500/70">
              <div className="absolute -top-1 left-0 h-2 w-px bg-slate-500/70" />
              <div className="absolute -top-1 left-[25%] h-2 w-px bg-slate-500/58" />
              <div className="absolute -top-1 left-[50%] h-2 w-px bg-slate-500/70" />
              <div className="absolute -top-1 left-[75%] h-2 w-px bg-slate-500/58" />
              <div className="absolute -top-1 right-0 h-2 w-px bg-slate-500/70" />
              <div className="absolute top-2 left-0 text-[9px] font-mono tracking-[0.12em] text-slate-500/65">
                scale 0-4u
              </div>
            </div>
          </motion.div>

          {lightPointer && showPointerEcho ? (
            <motion.div
              className="absolute"
              style={{ left: lightPointer.x, top: lightPointer.y }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.62, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <div className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-slate-500/65" />
                <div className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-slate-500/65" />
                <div className="absolute left-3 top-3 text-[9px] font-mono text-slate-500/70">
                  ({lightPointer.nx.toFixed(3)}, {lightPointer.ny.toFixed(3)})
                </div>
              </div>
            </motion.div>
          ) : null}
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
