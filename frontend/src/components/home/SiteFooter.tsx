

import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { selectFeaturedProduct } from "@/lib/featured-nav";

const NAV: {
  label: string;
  href?: string;
  onClick?: () => void;
}[] = [
  { label: "Home", href: "/" },
  { label: "Arcs", href: "/arcs" },
  { label: "Shop", href: "/products" },
  { label: "Founder", href: "/founder" },
  { label: "QR Code", href: "/scan" },
];

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
        <rect x="2.5" y="5.5" width="19" height="13" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.5 9.5v5l5-2.5-5-2.5Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Discord",
    href: "https://discord.com",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
        <path d="M19.27 5.33A16.6 16.6 0 0 0 15.73 4.4l-.2.37a14.4 14.4 0 0 1 3.2 1.24 12.9 12.9 0 0 0-6.73-1.2h-.01a12.9 12.9 0 0 0-6.73 1.2 14.4 14.4 0 0 1 3.2-1.24l-.2-.37a16.6 16.6 0 0 0-3.54.93C2.64 9.07 2.1 12.7 2.3 16.28a16.8 16.8 0 0 0 5.1 2.59l.66-.9a11 11 0 0 1-1.67-.8l.4-.32a9.3 9.3 0 0 0 9.42 0l.4.32a11 11 0 0 1-1.67.8l.66.9a16.8 16.8 0 0 0 5.1-2.59c.4-4.05-.44-7.64-2.43-10.95ZM9.4 14.4c-.8 0-1.45-.74-1.45-1.65S8.6 11.1 9.4 11.1s1.46.74 1.45 1.65-.65 1.65-1.45 1.65Zm5.2 0c-.8 0-1.45-.74-1.45-1.65s.65-1.65 1.45-1.65 1.46.74 1.45 1.65-.65 1.65-1.45 1.65Z" />
      </svg>
    ),
  },
] as const;

const ease = [0.22, 1, 0.36, 1] as const;

function BrandLetters({ text }: { text: string }) {
  const letters = text.split("");
  return (
    <span className="inline-flex" aria-label={text}>
      {letters.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, delay: 0.05 * i, ease }}
          className="inline-block"
          style={{ marginRight: char === " " ? "0.35em" : "0.08em" }}
          aria-hidden
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

export function SiteFooter() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start end", "end start"],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1.04, 1.08]);
  const mist = useTransform(scrollYProgress, [0, 0.45, 1], [0.35, 0.15, 0.4]);
  const mistBg = useMotionTemplate`rgba(244, 244, 242, ${mist})`;
  const markOpacity = useTransform(scrollYProgress, [0.15, 0.45], [0, 0.06]);
  const markY = useTransform(scrollYProgress, [0, 1], ["12%", "-8%"]);

  return (
    <footer className="relative bg-[#F4F4F2]">
      {/* Cinematic closing stage */}
      <div
        ref={stageRef}
        className="relative h-[min(78vh,720px)] w-full overflow-hidden md:h-[min(82vh,820px)]"
      >
        <motion.div
          className="absolute inset-[-12%] will-change-transform"
          style={{ y: imgY, scale: imgScale }}
        >
          <img
            src="/footer/footer.png"
            alt=""
            className="h-full w-full object-cover object-center"
            draggable={false}
          />
        </motion.div>

        {/* Soft bloom / mist layers */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: mistBg }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#F4F4F2] via-transparent to-white/20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 55%, transparent 30%, rgba(244,244,242,0.55) 100%)",
          }}
          aria-hidden
        />

        {/* Giant ghost watermark */}
        <motion.p
          aria-hidden
          style={{ opacity: markOpacity, y: markY }}
          className="pointer-events-none absolute inset-x-0 top-[18%] text-center font-sans text-[clamp(3.5rem,14vw,11rem)] font-semibold tracking-[0.2em] text-neutral-900 uppercase select-none"
        >
          TRANSFINITY
        </motion.p>

        {/* Vertical Japanese line */}
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease }}
          className="absolute top-1/2 left-4 z-10 hidden -translate-y-1/2 text-[11px] tracking-[0.45em] text-neutral-800/70 md:left-8 md:block lg:left-12"
          style={{ writingMode: "vertical-rl" }}
        >
          共に、未来を創る
        </motion.p>

        {/* Center brand + CTA */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-5 text-center">
          <h2 className="font-sans text-[clamp(1.6rem,4.5vw,3.25rem)] font-semibold tracking-[0.28em] text-neutral-900 uppercase">
            <BrandLetters text="TRANSFINITY" />
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.45, ease }}
            className="mt-3 text-[10px] font-medium tracking-[0.42em] text-neutral-600 uppercase md:text-[11px]"
          >
            Beyond The Limits
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.6, ease }}
            className="mt-8"
          >
            <motion.button
              type="button"
              onClick={() => window.location.assign("/products")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex h-12 items-center gap-2.5 bg-neutral-950 px-8 text-[11px] font-semibold tracking-[0.24em] text-white uppercase"
            >
              Shop All
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Minimal bar */}
      <div className="border-t border-neutral-200/80 bg-[#EFEFEF]">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-8 px-5 py-10 md:flex-row md:items-center md:justify-between md:gap-6 md:px-8 md:py-12">
          <Link
            to="/"
            className="font-sans text-[13px] font-semibold tracking-[0.28em] text-neutral-900 uppercase"
          >
            Transfinity
          </Link>

          <nav className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {NAV.map((item) =>
              item.onClick ? (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className="text-[10px] font-medium tracking-[0.32em] text-neutral-600 uppercase transition-colors hover:text-neutral-950"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.href ?? "/"}
                  className="text-[10px] font-medium tracking-[0.32em] text-neutral-600 uppercase transition-colors hover:text-neutral-950"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex items-center gap-4 text-neutral-700">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="transition-opacity hover:opacity-55"
                >
                  {s.icon}
                </a>
              ))}
            </div>
            <p className="text-[9px] tracking-[0.18em] text-neutral-400 uppercase">
              © 2026 Transfinity. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
