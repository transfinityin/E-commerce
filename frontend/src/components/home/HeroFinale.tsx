

import { useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import { ExploreCollectionButton } from "@/components/ui/glow-button";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const letter: Variants = {
  hidden: { y: "115%", opacity: 0 },
  show: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.55, ease },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease },
  },
};

const markLetter: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease },
  },
};

const HEADLINE_LINES = ["A STORY", "YOU WEAR"] as const;
const SIDE_MARK = "TRANSFINITY";

function AnimatedLine({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const chars = useMemo(() => text.split(""), [text]);

  return (
    <motion.span
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: 0.024, delayChildren: delay },
        },
      }}
      className={cn("flex flex-nowrap overflow-hidden", className)}
      aria-hidden
    >
      {chars.map((char, i) => (
        <span
          key={`${text}-${i}`}
          className="inline-block shrink-0 overflow-hidden leading-[1.05]"
        >
          <motion.span variants={letter} className="inline-block will-change-transform">
            {char === " " ? "\u00A0" : char}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

function VerticalBrandMark() {
  const chars = useMemo(() => SIDE_MARK.split(""), []);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.05, delayChildren: 0.85 } },
      }}
      className="pointer-events-none absolute top-1/2 right-4 z-30 hidden -translate-y-1/2 flex-col items-center gap-5 md:right-7 md:flex lg:right-9"
      aria-hidden
    >
      <div className="relative flex flex-col items-center">
        <p
          className="font-sans text-[13px] font-bold tracking-[0.55em] text-neutral-900 uppercase lg:text-[15px]"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          {chars.map((char, i) => (
            <motion.span key={`${char}-${i}`} variants={markLetter} className="inline-block">
              {char}
            </motion.span>
          ))}
        </p>
      </div>

      <motion.div variants={markLetter} className="relative flex flex-col items-center gap-3">
        <span className="text-[20px] font-light leading-none text-neutral-800 lg:text-[22px]">
          ∞
        </span>

        {/* Soft descending light points instead of a hard line */}
        <div className="flex flex-col items-center gap-2.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              className="block rounded-full bg-neutral-900"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{
                opacity: [0.15, 0.85, 0.15],
                scale: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2.4,
                delay: 1.2 + i * 0.18,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                width: i === 0 ? 4 : i === 4 ? 2 : 3,
                height: i === 0 ? 4 : i === 4 ? 2 : 3,
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

type HeroFinaleProps = {
  active: boolean;
};

export function HeroFinale({ active }: HeroFinaleProps) {
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[min(94vw,40rem)]"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.48) 42%, rgba(255,255,255,0.12) 72%, transparent 100%)",
        }}
        aria-hidden
      />

      <div className="pointer-events-auto relative z-10 w-full max-w-xl px-6 md:px-10 lg:px-14">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-5 text-[10px] font-medium tracking-[0.42em] text-neutral-500 uppercase md:text-[11px]"
        >
          Clothing × Culture × Beyond
        </motion.p>

        <h1
          className="font-sans text-[clamp(1.85rem,4.2vw,3.1rem)] font-extralight tracking-[0.2em] text-neutral-900 uppercase"
          aria-label="A story you wear"
        >
          <span className="block">
            <AnimatedLine text={HEADLINE_LINES[0]} delay={0.08} />
          </span>
          <span className="mt-1.5 block">
            <AnimatedLine text={HEADLINE_LINES[1]} delay={0.22} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease }}
          className="mt-5 max-w-sm text-[13px] font-normal leading-relaxed text-neutral-600 md:text-sm"
        >
          More than just t-shirts.
          <br />
          It&apos;s a world, a mindset, a movement.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.68, duration: 0.7, ease }}
          className="mt-8"
        >
          <ExploreCollectionButton />
        </motion.div>
      </div>

      <VerticalBrandMark />
    </div>
  );
}
