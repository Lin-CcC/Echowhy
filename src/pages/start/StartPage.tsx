import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { QuestionEntry } from "@/features/start-entry/components/question-entry";
import { guidedQuestions } from "@/mock/data/guided-questions";
import { cn } from "@/lib/utils";

const wakeLine = "Echowhy, emm?";
const bubblePlacements = [
  "left-1/2 top-[12%] -translate-x-1/2",
  "right-[8%] top-[42%]",
  "left-[8%] top-[46%]",
] as const;

export function StartPage() {
  const navigate = useNavigate();
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [isAwake, setIsAwake] = useState(false);
  const [textVisible, setTextVisible] = useState(true);

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

  const showGuidedPaths = isAwake && Boolean(sourceId);

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
    <section className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#02040a]" />
        <div className="absolute -left-[12%] -top-[18%] h-[70vw] w-[70vw] rounded-full bg-indigo-900/20 blur-[120px] mix-blend-screen" />
        <div className="absolute -bottom-[18%] -right-[12%] h-[62vw] w-[62vw] rounded-full bg-cyan-950/20 blur-[120px] mix-blend-screen" />
        <div className="absolute left-1/2 top-1/2 h-[42vw] w-[42vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/5 blur-[110px]" />
        <motion.div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.95), transparent),
              radial-gradient(1px 1px at 28% 64%, rgba(226,232,240,0.75), transparent),
              radial-gradient(2px 2px at 77% 24%, rgba(255,255,255,0.75), transparent),
              radial-gradient(1px 1px at 84% 82%, rgba(226,232,240,0.85), transparent),
              radial-gradient(1px 1px at 58% 32%, rgba(255,255,255,0.55), transparent)
            `,
            backgroundSize: "220px 220px",
          }}
          animate={{ opacity: [0.28, 0.56, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(200,240,255,0.08) 0%, rgba(6,182,212,0) 70%)",
          transform: "translate(-50%, -50%)",
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={isAwake ? { width: "200vw", height: "200vw", opacity: 1 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      <AnimatePresence>
        {textVisible ? (
          <motion.div
            key="wake-text"
            className="pointer-events-none absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 text-2xl font-light tracking-[0.08em] text-slate-100 sm:text-4xl"
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
                className="ml-1 h-7 w-[2px] self-center bg-white/70"
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
        <div className="relative flex min-h-[34rem] w-full items-center justify-center">
          {guidedQuestions.map((question, index) => (
            <motion.button
              key={question.id}
              type="button"
              custom={index}
              variants={questionBubbleVariants}
              initial="hidden"
              animate={showGuidedPaths ? "visible" : "hidden"}
              onClick={() => goToTopic(question.topicId)}
              className={cn(
                "absolute max-w-[17rem] rounded-full bg-white/5 px-5 py-3 text-left text-sm leading-6 text-slate-100 shadow-[0_14px_50px_rgba(2,6,23,0.16)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 hover:bg-white/8",
                "animate-float-drift",
                bubblePlacements[index],
              )}
              style={{ animationDelay: `${index * 0.9}s` }}
            >
              <span className="block text-[10px] uppercase tracking-[0.24em] text-sky-100/34">
                guided path
              </span>
              <span className="mt-2 block">{question.label}</span>
            </motion.button>
          ))}

          <div className="relative flex w-full flex-col items-center justify-center gap-12 text-center">
            <h2 className="text-2xl font-extralight tracking-[0.08em] text-slate-100 drop-shadow-sm sm:text-3xl">
              What are you trying to understand?
            </h2>

            <div className="relative flex flex-col items-center">
              {/* 真正的气态星云团 (Organic Nebula Cluster) - 打破几何对称 */}
              <div className="pointer-events-none absolute left-1/2 top-[58%] z-0 h-[13rem] w-[95vw] -translate-x-1/2 -translate-y-1/2 sm:h-[15rem] sm:w-[50rem]">
                {/* 1. 核心高光：托住输入框中心 */}
                <div className="absolute left-1/2 top-1/2 h-[3.5rem] w-[17rem] -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-cyan-300/14 blur-[34px] sm:h-[4rem] sm:w-[25rem] sm:blur-[40px]" />

                {/* 2. 左侧靛紫气团：倾斜 + 慢呼吸 */}
                <motion.div
                  className="absolute left-[36%] top-[40%] h-[6.8rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-[100%] bg-indigo-600/23 blur-[52px] sm:h-[8rem] sm:w-[28rem] sm:blur-[60px]"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.28, 0.58, 0.28],
                  }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* 3. 右侧幽青星尘：错峰呼吸 */}
                <motion.div
                  className="absolute left-[65%] top-[60%] h-[8rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-[100%] bg-cyan-700/20 blur-[60px] sm:h-[10rem] sm:w-[30rem] sm:blur-[70px]"
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

                {/* 4. 底部暗蓝沉淀：增加体积 */}
                <div className="absolute left-1/2 top-[76%] h-[6rem] w-[23rem] -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-blue-900/28 blur-[62px] sm:h-[8rem] sm:w-[45rem] sm:blur-[80px]" />

                {/* 5. 低亮恒星核：补充“星体”语义，避免纯几何光斑 */}
                <motion.div
                  className="absolute left-[43%] top-[49%] h-1.5 w-1.5 rounded-full bg-cyan-100/80 blur-[1px]"
                  animate={{ opacity: [0.45, 0.9, 0.45], scale: [0.9, 1.18, 0.9] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute left-[58%] top-[55%] h-1 w-1 rounded-full bg-indigo-100/70 blur-[1px]"
                  animate={{ opacity: [0.32, 0.72, 0.32], scale: [0.92, 1.12, 0.92] }}
                  transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
                />
              </div>

              <div className="relative z-10">
                <QuestionEntry
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
