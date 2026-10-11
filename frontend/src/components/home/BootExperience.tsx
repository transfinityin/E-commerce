import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type Ripple = { id: number; x: number; y: number };

type BootExperienceProps = {
  progress: number;
};

const STATUS = [
  "Charting the trail",
  "Gathering the frames",
  "Tuning the light",
  "Almost there",
];

/**
 * Interactive wait surface while hero frames preload.
 * Pointer move + tap keep the blank load feeling alive.
 */
export function BootExperience({ progress }: BootExperienceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.45 });
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [statusIdx, setStatusIdx] = useState(0);
  const [charge, setCharge] = useState(0);
  const rippleId = useRef(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStatusIdx((i) => (i + 1) % STATUS.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (charge <= 0) return;
    const id = window.setTimeout(() => setCharge((c) => Math.max(0, c - 8)), 80);
    return () => window.clearTimeout(id);
  }, [charge]);

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPointer({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++rippleId.current;
    setRipples((prev) => [...prev.slice(-4), { id, x, y }]);
    setCharge((c) => Math.min(100, c + 18));
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 900);
  };

  const tiltX = (pointer.x - 0.5) * 18;
  const tiltY = (pointer.y - 0.5) * -14;
  const glowX = pointer.x * 100;
  const glowY = pointer.y * 100;
  const displayProgress = Math.min(100, Math.round(progress + charge * 0.12));

  return (
    <div
      ref={rootRef}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      className="tf-boot fixed inset-0 z-[100] flex cursor-pointer touch-none select-none flex-col items-center justify-center overflow-hidden bg-[#F4F4F2]"
      role="status"
      aria-live="polite"
      aria-label={`Loading Transfinity, ${displayProgress} percent`}
    >
      {/* Atmosphere that follows the pointer */}
      <div
        className="pointer-events-none absolute inset-0 transition-[background] duration-300"
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at ${glowX}% ${glowY}%, rgba(200,169,110,0.22), transparent 62%),
            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,0,0,0.04), transparent 55%),
            linear-gradient(180deg, #F7F6F3 0%, #F4F4F2 45%, #EFEFEF 100%)
          `,
        }}
        aria-hidden
      />

      {/* Soft grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      {ripples.map((r) => (
        <span
          key={r.id}
          className="tf-boot-ripple pointer-events-none absolute rounded-full border border-[#C8A96E]/50"
          style={{ left: r.x, top: r.y }}
          aria-hidden
        />
      ))}

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-8">
        <p className="mb-8 font-mono text-[10px] tracking-[0.42em] text-neutral-500 uppercase">
          Transfinity
        </p>

        {/* Infinity mark — tilts with pointer */}
        <div
          className="tf-boot-mark relative mb-10"
          style={{
            transform: `perspective(600px) rotateY(${tiltX}deg) rotateX(${tiltY}deg)`,
          }}
        >
          <svg
            width="120"
            height="56"
            viewBox="0 0 120 56"
            fill="none"
            className="text-neutral-900"
            aria-hidden
          >
            <path
              d="M20 28c0-10 8-18 20-18 14 0 22 18 40 18s26-8 26-18-12-18-26-18c-18 0-26 18-40 18S8 18 8 28s12 18 26 18c14 0 22-18 40-18s26 8 26 18-12 18-26 18c-18 0-26-18-40-18S20 38 20 28z"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="tf-boot-path"
            />
          </svg>
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              boxShadow: `0 0 ${24 + charge * 0.35}px ${8 + charge * 0.08}px rgba(200,169,110,${0.12 + charge * 0.004})`,
            }}
            aria-hidden
          />
        </div>

        <h1 className="font-display text-center text-[clamp(2rem,8vw,3.25rem)] leading-none tracking-[0.08em] text-neutral-900 uppercase">
          Beyond
          <span className="mt-1 block text-[0.55em] tracking-[0.28em] text-neutral-500">
            The Limits
          </span>
        </h1>

        <div className="mt-10 w-full max-w-[220px]">
          <div className="mb-3 flex items-end justify-between gap-3">
            <p className="font-mono text-[10px] tracking-[0.22em] text-neutral-500 uppercase">
              {STATUS[statusIdx]}
            </p>
            <p className="font-mono text-[11px] tracking-[0.16em] text-neutral-800 tabular-nums">
              {displayProgress}%
            </p>
          </div>
          <div className="h-[3px] overflow-hidden rounded-full bg-neutral-900/8">
            <div
              className="tf-boot-bar h-full rounded-full bg-neutral-900"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>

        <p className="mt-8 font-mono text-[10px] tracking-[0.2em] text-neutral-400 uppercase">
          Tap or drag while we load
        </p>
      </div>

      <style>{`
        .tf-boot-path {
          stroke-dasharray: 280;
          stroke-dashoffset: 280;
          animation: tf-boot-draw 2.4s ease forwards infinite alternate;
        }
        .tf-boot-mark {
          transition: transform 0.18s ease-out;
          will-change: transform;
        }
        .tf-boot-bar {
          transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .tf-boot-ripple {
          width: 12px;
          height: 12px;
          margin-left: -6px;
          margin-top: -6px;
          animation: tf-boot-ripple 0.85s ease-out forwards;
        }
        @keyframes tf-boot-draw {
          from { stroke-dashoffset: 280; opacity: 0.55; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes tf-boot-ripple {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(18); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tf-boot-path,
          .tf-boot-ripple,
          .tf-boot-mark {
            animation: none !important;
            transition: none !important;
          }
          .tf-boot-path { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
