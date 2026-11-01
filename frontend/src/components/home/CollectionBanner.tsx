import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Stable cache bust — bump when you replace files in /public/banner */
const BANNER_CACHE = "v11-mp4";
const SLIDE_MS = 7000;
const TEXT_OUT_MS = 280;

const BANNERS = [
  {
    id: 1,
    src: "/banner/banner_1.mp4",
    title: ["THE", "VOID"],
    tagline: ["Born from chaos.", "Made for more."],
    href: "/products",
    align: "right" as const,
  },
  {
    id: 2,
    src: "/banner/banner_2.mp4",
    title: ["THE", "ETERNAL"],
    tagline: ["Beyond time. Beyond limits.", "Beyond you."],
    href: "/products",
    align: "right" as const,
  },
  {
    id: 3,
    src: "/banner/banner_3.mp4",
    title: ["THE", "ASCENDANT"],
    tagline: ["Rise above the ordinary.", "Claim the arc."],
    href: "/products",
    align: "left" as const,
  },
] as const;

const ease = [0.22, 1, 0.36, 1] as const;

function BannerCopy({
  slide,
  index,
  total,
  isRight,
  textVisible,
  compact = false,
}: {
  slide: (typeof BANNERS)[number];
  index: number;
  total: number;
  isRight: boolean;
  textVisible: boolean;
  compact?: boolean;
}) {
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <AnimatePresence mode="wait">
      {textVisible ? (
        <motion.div
          key={`copy-${slide.id}-${compact ? "m" : "d"}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: TEXT_OUT_MS / 1000, ease }}
          className={cn(
            "pointer-events-auto w-full",
            compact ? "max-w-none" : "max-w-sm",
            !compact && isRight && "text-right",
          )}
        >
          {!compact ? (
            <div
              className={cn(
                "mb-5 flex items-center gap-3",
                isRight && "flex-row-reverse",
              )}
            >
              <p className="font-sans text-[10px] font-medium tracking-[0.22em] text-neutral-500 uppercase md:text-[11px]">
                {pad(index + 1)} / {pad(total)}
              </p>
              <span className="h-px w-10 bg-neutral-800/70 md:w-14" />
            </div>
          ) : null}

          {compact ? (
            <>
              {/* Fill the empty right: title left, Explore right */}
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2.5 flex items-center gap-2.5">
                    <p className="font-sans text-[10px] font-medium tracking-[0.22em] text-neutral-500 uppercase">
                      {pad(index + 1)} / {pad(total)}
                    </p>
                    <span className="h-px min-w-[2rem] flex-1 bg-neutral-800/50" />
                  </div>
                  <h2 className="font-sans text-[1.55rem] font-semibold leading-[0.95] tracking-[0.04em] text-neutral-900 uppercase">
                    {slide.title.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </h2>
                </div>

                <Link
                  to={slide.href}
                  className="mb-0.5 inline-flex shrink-0 flex-col items-end gap-1.5 text-[10px] font-semibold tracking-[0.22em] text-neutral-900 uppercase transition-opacity hover:opacity-70"
                >
                  <span className="inline-flex items-center gap-1.5">
                    Explore
                    <ArrowRight className="size-3.5" strokeWidth={1.75} />
                  </span>
                  <span className="h-px w-full min-w-[4.5rem] bg-neutral-900" />
                </Link>
              </div>

              <p className="mt-3 max-w-[18rem] text-[12px] leading-relaxed text-neutral-600">
                {slide.tagline.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </>
          ) : (
            <>
              <h2 className="font-sans text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[0.95] tracking-[0.04em] text-neutral-900 uppercase">
                {slide.title.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>

              <p className="mt-4 text-[12px] leading-relaxed text-neutral-600 md:text-[13px]">
                {slide.tagline.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>

              <Link
                to={slide.href}
                className={cn(
                  "mt-6 inline-flex flex-col gap-1.5 text-[11px] font-semibold tracking-[0.28em] text-neutral-900 uppercase transition-opacity hover:opacity-70",
                  isRight && "items-end",
                )}
              >
                <span className="inline-flex items-center gap-2">
                  Explore
                  <ArrowRight className="size-3.5" strokeWidth={1.75} />
                </span>
                <span className="h-px w-full min-w-[7rem] bg-neutral-900" />
              </Link>
            </>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function CollectionBanner() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [textVisible, setTextVisible] = useState(true);
  const transitioning = useRef(false);
  const total = BANNERS.length;
  const slide = BANNERS[index];
  const isRight = slide.align === "right";

  const changeTo = useCallback(
    (next: number) => {
      if (transitioning.current) return;
      const target = ((next % total) + total) % total;
      if (target === index) return;

      transitioning.current = true;
      setDirection(target > index || (index === total - 1 && target === 0) ? 1 : -1);
      setTextVisible(false);

      window.setTimeout(() => {
        setIndex(target);
        requestAnimationFrame(() => {
          setTextVisible(true);
          transitioning.current = false;
        });
      }, TEXT_OUT_MS);
    },
    [index, total],
  );

  const goTo = useCallback(
    (next: number) => {
      changeTo(next);
    },
    [changeTo],
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      changeTo(index + 1);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [changeTo, index]);

  return (
    <section className="relative w-full overflow-hidden bg-[#F4F4F2]">
      {/* Same 8/3 frame everywhere — heroes stay fully framed */}
      <div className="relative aspect-[8/3] w-full">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={`${slide.id}-${BANNER_CACHE}`}
            custom={direction}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease }}
            className="absolute inset-0"
          >
            <video
              key={`${slide.src}-${BANNER_CACHE}`}
              src={`${slide.src}?v=${BANNER_CACHE}`}
              className="absolute inset-0 h-full w-full object-cover object-center"
              autoPlay
              muted
              loop
              playsInline
              aria-label={slide.title.join(" ")}
            />
            <div
              className="absolute inset-0 hidden md:block"
              style={{
                background: isRight
                  ? "linear-gradient(270deg, rgba(244,244,242,0.88) 0%, rgba(244,244,242,0.55) 28%, rgba(244,244,242,0.12) 52%, transparent 72%)"
                  : "linear-gradient(90deg, rgba(244,244,242,0.88) 0%, rgba(244,244,242,0.55) 28%, rgba(244,244,242,0.12) 52%, transparent 72%)",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Desktop / tablet: original in-frame overlay copy */}
        <div
          className={cn(
            "pointer-events-none relative z-10 hidden h-full items-center px-6 md:flex md:px-12 lg:px-16",
            isRight
              ? "justify-end pr-14 md:pr-20 lg:pr-24"
              : "justify-start pl-12 md:pl-16 lg:pl-20",
          )}
        >
          <BannerCopy
            slide={slide}
            index={index}
            total={total}
            isRight={isRight}
            textVisible={textVisible}
          />
        </div>

        {/* Side dots — desktop language */}
        <div
          className={cn(
            "absolute top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center md:flex",
            isRight ? "right-4 md:right-7" : "left-4 md:left-7",
          )}
        >
          <div className="absolute top-0 bottom-0 w-px bg-neutral-400/50" />
          <div className="relative flex flex-col items-center gap-4 py-0.5">
            {BANNERS.map((b, i) => {
              const active = i === index;
              return (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`Go to ${b.title.join(" ")}`}
                  aria-current={active ? "true" : undefined}
                  onClick={() => goTo(i)}
                  className="relative z-10 flex size-4 items-center justify-center"
                >
                  <span
                    className={`rounded-full border transition-all duration-300 ${
                      active
                        ? "size-2.5 border-neutral-900 bg-neutral-900"
                        : "size-2 border-neutral-500 bg-transparent hover:border-neutral-800"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/*
        Mobile magic: keep the 8/3 hero frame pure, put the text under it
        so nothing clips inside the short strip.
      */}
      <div className="relative px-4 pt-4 pb-5 md:hidden">
        <BannerCopy
          slide={slide}
          index={index}
          total={total}
          isRight={isRight}
          textVisible={textVisible}
          compact
        />

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="h-px min-w-[2rem] flex-1 bg-neutral-300" />
          <div className="flex items-center gap-3">
            {BANNERS.map((b, i) => {
              const active = i === index;
              return (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`Go to ${b.title.join(" ")}`}
                  aria-current={active ? "true" : undefined}
                  onClick={() => goTo(i)}
                  className="relative z-10 flex size-4 items-center justify-center"
                >
                  <span
                    className={`rounded-full border transition-all duration-300 ${
                      active
                        ? "size-2.5 border-neutral-900 bg-neutral-900"
                        : "size-2 border-neutral-500 bg-transparent hover:border-neutral-800"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <span className="h-px min-w-[2rem] flex-1 bg-neutral-300" />
        </div>
      </div>
    </section>
  );
}
