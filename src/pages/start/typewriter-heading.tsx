import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type TypewriterHeadingProps = {
  text: string;
  theme: "light" | "dark";
};

export function TypewriterHeading({
  text,
  theme,
}: TypewriterHeadingProps) {
  return (
    <motion.h2
      key={text}
      className={cn(
        "min-h-9 text-2xl font-extralight tracking-[0.06em] sm:text-3xl",
        theme === "dark"
          ? "text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          : "text-slate-800",
      )}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.018,
          },
        },
      }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={`${text}-${char}-${index}`}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
          transition={{ duration: 0.03 }}
        >
          {char}
        </motion.span>
      ))}
    </motion.h2>
  );
}
