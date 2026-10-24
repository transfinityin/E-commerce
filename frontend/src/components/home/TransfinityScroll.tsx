import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import Lenis from "lenis";
import { SiteNav } from "@/components/home/SiteNav";
import { HeroFinale } from "@/components/home/HeroFinale";
import { BootExperience } from "@/components/home/BootExperience";

const FRAME_COUNT = 40;
const FRAME_PATH = (index: number) =>
  `/hero/ezgif-frame-${String(FRAME_COUNT - index).padStart(3, "0")}.jpg`;

/** When scroll reaches this, hero copy + left vignette take over */
const FINALE_START = 0.72;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number,
) {
  const scale = Math.max(canvasW / img.naturalWidth, canvasH / img.naturalHeight);
  const drawW = img.naturalWidth * scale;
  const drawH = img.naturalHeight * scale;
  const dx = (canvasW - drawW) / 2;
  const dy = (canvasH - drawH) / 2;
  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.drawImage(img, dx, dy, drawW, drawH);
}

export default function TransfinityScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastFrameRef = useRef(-1);
  const rafRef = useRef(0);
  const smoothFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const lerpRafRef = useRef(0);

  const [loadProgress, setLoadProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [finaleActive, setFinaleActive] = useState(false);

  const frameUrls = useMemo(
    () => Array.from({ length: FRAME_COUNT }, (_, i) => FRAME_PATH(i)),
    [],
  );

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const vignetteOpacity = useTransform(
    scrollYProgress,
    [FINALE_START - 0.08, FINALE_START + 0.04],
    [0, 1],
  );

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const frame = lastFrameRef.current >= 0 ? lastFrameRef.current : 0;
    const img = imagesRef.current[frame];
    if (ctx && img?.complete && img.naturalWidth) {
      drawCover(ctx, img, w, h);
    }
  }, []);

  const paintFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img?.complete || !img.naturalWidth) return;
    if (lastFrameRef.current === index) return;
    lastFrameRef.current = index;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawCover(ctx, img, window.innerWidth, window.innerHeight);
  }, []);

  const tickLerp = useCallback(() => {
    const target = targetFrameRef.current;
    const current = smoothFrameRef.current;
    const next = current + (target - current) * 0.18;
    smoothFrameRef.current = next;
    const frame = clamp(Math.round(next), 0, FRAME_COUNT - 1);
    paintFrame(frame);
    if (Math.abs(target - next) > 0.02) {
      lerpRafRef.current = requestAnimationFrame(tickLerp);
    } else {
      smoothFrameRef.current = target;
      paintFrame(clamp(Math.round(target), 0, FRAME_COUNT - 1));
      lerpRafRef.current = 0;
    }
  }, [paintFrame]);

  useLayoutEffect(() => {
    document.documentElement.classList.add("tf-scroll-lock");
    return () => {
      document.documentElement.classList.remove("tf-scroll-lock");
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loaded = 0;

    const images = frameUrls.map((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      return img;
    });
    imagesRef.current = images;

    const onOne = () => {
      if (cancelled) return;
      loaded += 1;
      setLoadProgress(Math.round((loaded / FRAME_COUNT) * 100));
      if (loaded >= FRAME_COUNT) {
        setReady(true);
        document.documentElement.classList.remove("tf-scroll-lock");
        requestAnimationFrame(() => {
          resizeCanvas();
          lastFrameRef.current = -1;
          paintFrame(0);
        });
      }
    };

    images.forEach((img) => {
      if (img.complete && img.naturalWidth) onOne();
      else {
        img.addEventListener("load", onOne, { once: true });
        img.addEventListener("error", onOne, { once: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [frameUrls, paintFrame, resizeCanvas]);

  useEffect(() => {
    if (!ready) return;
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [ready, resizeCanvas]);

  // Inertial smooth scrolling for the whole page (fixes abrupt hero stop)
  useEffect(() => {
    if (!ready) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.35,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [ready]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!ready) return;
    const frame = clamp(latest * (FRAME_COUNT - 1), 0, FRAME_COUNT - 1);
    targetFrameRef.current = frame;
    if (!lerpRafRef.current) {
      lerpRafRef.current = requestAnimationFrame(tickLerp);
    }
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setFinaleActive(latest >= FINALE_START);
    });
  });

  useEffect(() => {
    return () => {
      cancelAnimationFrame(lerpRafRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {!ready ? <BootExperience progress={loadProgress} /> : null}

      {ready ? (
        <SiteNav tone={finaleActive ? "light" : "dark"} overlay />
      ) : null}

      <div
        ref={containerRef}
        className="relative h-[380vh] bg-[#F4F4F2] md:h-[560vh]"
      >
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-[#F4F4F2]">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            aria-label="Transfinity scroll frames"
          />

          <motion.div
            style={{ opacity: vignetteOpacity }}
            className="pointer-events-none absolute inset-0 z-10"
            aria-hidden
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.55) 30%, rgba(255,255,255,0.18) 55%, transparent 78%)",
              }}
            />
          </motion.div>

          <HeroFinale active={finaleActive} />
        </div>
      </div>
    </>
  );
}
