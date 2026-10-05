import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type ArcNode = {
  no: string;
  title: string;
  subtitle: string;
  slug: string;
  href: string;
  unlocked: boolean;
};

type Props = {
  arcs: ArcNode[];
};

type GateState = "done" | "current" | "open";

const GATES: { x: number; y: number }[] = [
  { x: 28, y: 14 },
  { x: 62, y: 21 },
  { x: 34, y: 29 },
  { x: 68, y: 36 },
  { x: 32, y: 44 },
  { x: 70, y: 51 },
  { x: 36, y: 58 },
  { x: 66, y: 65 },
  { x: 30, y: 72 },
  { x: 68, y: 79 },
  { x: 34, y: 86 },
  { x: 56, y: 93 },
];

const MAP_ASPECT = "3 / 4";

function pathD(points: { x: number; y: number }[]) {
  if (!points.length) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const midY = (a.y + b.y) / 2;
    d += ` C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`;
  }
  return d;
}

function gateState(index: number, arcs: ArcNode[]): GateState {
  if (!arcs[index].unlocked) return "open";
  const next = arcs[index + 1];
  if (!next || !next.unlocked) return "current";
  return "done";
}

export function ArcsTrailMap({ arcs }: Props) {
  const reduceMotion = useReducedMotion();
  const d = useMemo(() => pathD(GATES), []);

  const currentIndex = useMemo(
    () => arcs.findIndex((_, i) => gateState(i, arcs) === "current"),
    [arcs],
  );
  const current = currentIndex >= 0 ? arcs[currentIndex] : arcs[0];
  const unlockedCount = arcs.filter((a) => a.unlocked).length;
  const doneCount = arcs.filter((_, i) => gateState(i, arcs) === "done").length;

  const progress =
    arcs.length <= 1
      ? 1
      : (Math.max(0, currentIndex) + 0.08) / (arcs.length - 1);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Status strip — light, matches shop/home */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/70 px-5 py-5 shadow-[0_14px_40px_rgba(17,17,17,0.06)] backdrop-blur-sm md:px-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-medium tracking-[0.32em] text-neutral-500 uppercase">
              Charted course
            </p>
            <h2 className="mt-2 font-sans text-xl font-semibold tracking-[0.05em] text-neutral-950 uppercase md:text-2xl">
              Arc {current?.no} — {current?.title}
            </h2>
            <p className="mt-1.5 max-w-md text-sm text-neutral-600 italic">
              {current?.subtitle}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2.5 md:items-end">
            <p className="text-[10px] tracking-[0.2em] text-neutral-500 uppercase">
              Gate {Math.max(unlockedCount, 1)} of {arcs.length}
              {doneCount > 0 ? ` · ${doneCount} cleared` : " · path begins"}
            </p>
            {current?.unlocked && (
              <Link
                to={current.href}
                className="tf-buy-now !h-11 !w-auto min-w-[160px] !text-[10px]"
              >
                <span>
                  Enter this gate
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Map — image unchanged */}
      <div className="relative mx-auto w-full max-w-[720px]">
        <div
          className="relative w-full overflow-hidden rounded-2xl bg-white shadow-[0_22px_60px_rgba(17,17,17,0.12)] ring-1 ring-black/[0.06]"
          style={{ aspectRatio: MAP_ASPECT }}
        >
          <img
            src="/arcs-fantasy-map.jpg?v=5"
            alt="Fantasy treasure map of the Twelve Arcs"
            className="absolute inset-0 h-full w-full select-none object-fill"
            draggable={false}
          />

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, transparent 45%, rgba(20,16,12,0.18) 100%)",
            }}
          />

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden
          >
            <path
              d={d}
              fill="none"
              stroke="rgba(40,30,18,0.22)"
              strokeWidth="0.55"
              strokeDasharray="1.4 1.2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <motion.path
              d={d}
              fill="none"
              stroke="rgba(20,16,10,0.88)"
              strokeWidth="0.7"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: Math.min(1, Math.max(0.04, progress)) }}
              transition={{
                duration: reduceMotion ? 0 : 1.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </svg>

          <div className="absolute inset-0">
            {arcs.map((arc, i) => {
              const mark = GATES[i] ?? { x: 50, y: 10 + i * 7 };
              const state = gateState(i, arcs);

              const node = (
                <motion.div
                  initial={reduceMotion ? false : { scale: 0.75, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(i * 0.035, 0.3),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative"
                >
                  {state === "current" && !reduceMotion && (
                    <span className="absolute inset-[-7px] animate-ping rounded-full bg-neutral-900/20 [animation-duration:2.4s] sm:inset-[-9px]" />
                  )}

                  {state === "current" && (
                    <span className="absolute -top-6 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-neutral-950 px-2 py-0.5 text-[7px] font-semibold tracking-[0.16em] text-white uppercase shadow-md sm:-top-7 sm:text-[8px]">
                      You are here
                    </span>
                  )}

                  <div
                    className={cn(
                      "relative grid place-items-center rounded-full border font-bold tracking-wider shadow-md",
                      "size-7 text-[9px] sm:size-8 sm:text-[10px] md:size-9 md:text-[11px]",
                      state === "current" &&
                        "border-neutral-950 bg-white text-neutral-950 ring-[3px] ring-neutral-950/20",
                      state === "done" &&
                        "border-neutral-900 bg-neutral-950 text-[#F4F4F2]",
                      state === "open" &&
                        "border-neutral-900/30 bg-white/85 text-neutral-500",
                    )}
                  >
                    {state === "open" ? (
                      <Lock className="size-2.5 sm:size-3" strokeWidth={1.75} />
                    ) : (
                      arc.no
                    )}
                  </div>

                  {(state === "current" || state === "done") && (
                    <p
                      className={cn(
                        "absolute top-[calc(100%+3px)] left-1/2 -translate-x-1/2 whitespace-nowrap text-[7px] font-semibold tracking-[0.14em] uppercase drop-shadow-[0_1px_0_rgba(255,255,255,0.9)] sm:text-[8px] md:text-[9px]",
                        state === "current" ? "text-neutral-950" : "text-neutral-800",
                      )}
                    >
                      {arc.title}
                    </p>
                  )}
                </motion.div>
              );

              return (
                <div
                  key={arc.slug}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
                >
                  {state === "open" ? (
                    <div
                      className="cursor-not-allowed"
                      title="Clear the previous gate to open this path"
                    >
                      {node}
                    </div>
                  ) : (
                    <Link
                      to={arc.href}
                      className="block outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                      aria-label={`${arc.no} ${arc.title}${state === "current" ? " — you are here" : ""}`}
                    >
                      {node}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2 sm:bottom-4 sm:left-4 sm:right-4">
            <p className="max-w-[160px] text-[7px] leading-relaxed tracking-[0.14em] text-white/85 uppercase drop-shadow sm:max-w-[220px] sm:text-[9px]">
              Walk the inked road · clear each gate
            </p>
            <p className="text-[7px] tracking-[0.24em] text-white/75 uppercase drop-shadow sm:text-[9px]">
              ∞ RE : BIRTH
            </p>
          </div>
        </div>
      </div>

      {/* Quest log */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/75 shadow-[0_14px_40px_rgba(17,17,17,0.05)] backdrop-blur-sm">
        <div className="border-b border-neutral-200/80 px-5 py-3 md:px-6">
          <p className="text-[10px] font-medium tracking-[0.28em] text-neutral-500 uppercase">
            Quest log
          </p>
        </div>
        <ol className="divide-y divide-neutral-200/70">
          {arcs.map((arc, i) => {
            const state = gateState(i, arcs);
            const row = (
              <div
                className={cn(
                  "flex items-center gap-4 px-5 py-3.5 transition-colors md:px-6",
                  state === "current" && "bg-neutral-950/[0.04]",
                  state === "open" && "opacity-55",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border text-[10px] font-semibold",
                    state === "done" &&
                      "border-neutral-900 bg-neutral-950 text-white",
                    state === "current" &&
                      "border-neutral-950 bg-white text-neutral-950 shadow-sm",
                    state === "open" && "border-neutral-300 text-neutral-400",
                  )}
                >
                  {state === "open" ? (
                    <Lock className="size-3" strokeWidth={1.5} />
                  ) : (
                    arc.no
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <h3 className="font-sans text-sm font-semibold tracking-[0.1em] text-neutral-950 uppercase">
                      {arc.title}
                    </h3>
                    <span className="text-[9px] tracking-[0.22em] text-neutral-500 uppercase">
                      {state === "current"
                        ? "Now"
                        : state === "done"
                          ? "Cleared"
                          : "Sealed"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-500 italic">{arc.subtitle}</p>
                </div>
              </div>
            );

            return (
              <li key={arc.slug}>
                {state === "open" ? (
                  row
                ) : (
                  <Link
                    to={arc.href}
                    className="block no-underline hover:bg-neutral-950/[0.03]"
                  >
                    {row}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
