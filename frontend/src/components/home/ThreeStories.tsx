

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  selectFeaturedProduct,
} from "@/lib/featured-nav";

const STORIES = [
  {
    id: "void" as const,
    title: "THE VOID",
    tagline: "Chaos creates clarity.",
    src: "/story/The_Void.png",
    accent: "01",
  },
  {
    id: "eternal" as const,
    title: "THE ETERNAL",
    tagline: "Grace in the unknown.",
    src: "/story/The_Eternal.png",
    accent: "02",
  },
  {
    id: "ascendant" as const,
    title: "THE ASCENDANT",
    tagline: "Freedom in every step.",
    src: "/story/The_Ascendant.png",
    accent: "03",
  },
] as const;

function StoryPanel({
  story,
  index,
  progress,
  total,
}: {
  story: (typeof STORIES)[number];
  index: number;
  progress: MotionValue<number>;
  total: number;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const peek = Math.min(1, end + 0.08);

  // Enter from below, then hold; next story peels over
  const y = useTransform(
    progress,
    [start, start + 0.12, end, peek],
    [index === 0 ? "0%" : "110%", "0%", "0%", "-6%"],
  );
  const scale = useTransform(
    progress,
    [start, end, peek],
    [1, 1, 0.92],
  );
  const brightness = useTransform(
    progress,
    [start, end, peek],
    [1, 1, 0.72],
  );
  const textOpacity = useTransform(
    progress,
    [start, start + 0.1, end - 0.05, end],
    [index === 0 ? 1 : 0, 1, 1, 0],
  );
  const textY = useTransform(
    progress,
    [start, start + 0.12, end - 0.04, end],
    [28, 0, 0, -16],
  );
  const filter = useTransform(brightness, (b) => `brightness(${b})`);

  return (
    <motion.article
      style={{ y, scale, zIndex: index + 1 }}
      className="absolute inset-0 origin-top overflow-hidden bg-[#E8E8E6] will-change-transform"
    >
      <motion.div className="absolute inset-0" style={{ filter }}>
        <img
          src={story.src}
          alt={story.title}
          className={
            story.id === "void"
              ? "h-full w-full object-cover object-[center_42%] md:object-[center_48%]"
              : "h-full w-full object-cover object-[center_20%]"
          }
          draggable={false}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
          aria-hidden
        />
        {/* Keep desktop header readable over Ep1 character art */}
        {story.id === "void" ? (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 hidden h-28 bg-gradient-to-b from-[#F4F4F2]/92 via-[#F4F4F2]/45 to-transparent md:block lg:h-32"
            aria-hidden
          />
        ) : null}
      </motion.div>

      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-6 md:p-10 lg:max-w-xl lg:p-14"
      >
        <span className="font-sans text-[11px] tracking-[0.35em] text-white/70">
          {story.accent}
        </span>
        <h3 className="font-sans text-[clamp(1.75rem,4vw,3rem)] font-semibold tracking-[0.06em] text-white uppercase">
          {story.title}
        </h3>
        <p className="max-w-sm text-[14px] text-white/80 md:text-[15px]">
          {story.tagline}
        </p>
        <button
          type="button"
          onClick={() => selectFeaturedProduct(story.id)}
          className="mt-2 inline-flex w-fit items-center gap-2 border-b border-white/80 pb-1 text-[11px] font-semibold tracking-[0.22em] text-white uppercase transition-opacity hover:opacity-70"
        >
          Shop Now
          <ArrowRight className="size-3.5" strokeWidth={1.75} />
        </button>
      </motion.div>
    </motion.article>
  );
}

function ProgressRail({
  progress,
  total,
}: {
  progress: MotionValue<number>;
  total: number;
}) {
  const fill = useTransform(progress, [0, 1], ["0%", "100%"]);

  return (
    <div className="pointer-events-none absolute top-1/2 right-5 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex lg:right-8">
      <span className="text-[10px] tracking-[0.28em] text-white/60">01</span>
      <div className="relative h-28 w-[2px] overflow-hidden bg-white/25">
        <motion.div
          className="absolute top-0 left-0 w-full bg-white"
          style={{ height: fill }}
        />
      </div>
      <span className="text-[10px] tracking-[0.28em] text-white/60">
        {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}

export function ThreeStories() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  return (
    <section id="stories" className="relative scroll-mt-20 bg-[#F4F4F2]">
      {/* Editorial header — not a card row */}
      <div className="mx-auto flex max-w-[1380px] flex-col gap-6 px-5 pt-16 pb-10 md:flex-row md:items-end md:justify-between md:px-8 md:pt-24 md:pb-14">
        <div>
          <p className="text-[10px] font-medium tracking-[0.35em] text-neutral-500 uppercase md:text-[11px]">
            Our Collections
          </p>
          <h2 className="mt-3 font-sans text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-[0.04em] text-neutral-900 uppercase">
            The Three Stories
          </h2>
        </div>
        <p className="max-w-[220px] text-right text-[12px] leading-relaxed text-neutral-500 md:text-[13px]">
          Three unique visions.
          <br />
          Three different paths.
          <br />
          One universe.
        </p>
      </div>

      {/* Scroll theatre — stacked peel, inspired by stacking-card patterns */}
      <div ref={trackRef} className="relative h-[320vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div className="relative h-full w-full">
            {STORIES.map((story, i) => (
              <StoryPanel
                key={story.id}
                story={story}
                index={i}
                progress={scrollYProgress}
                total={STORIES.length}
              />
            ))}
            <ProgressRail progress={scrollYProgress} total={STORIES.length} />
          </div>
        </div>
      </div>
    </section>
  );
}
