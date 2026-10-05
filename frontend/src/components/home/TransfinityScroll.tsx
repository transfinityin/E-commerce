

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
import { SiteNav } from "@/components/home/SiteNav";
import { HeroFinale } from "@/components/home/HeroFinale";

const FRAME_COUNT = 50;
const FRAME_PATH = (index: number) =>
  `/start/ezgif-frame-${String(FRAME_COUNT - index).padStart(3, "0")}.jpg`;

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

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!ready) return;
    const frame = clamp(Math.round(latest * (FRAME_COUNT - 1)), 0, FRAME_COUNT - 1);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => paintFrame(frame));
    setFinaleActive(latest >= FINALE_START);
  });

  return (
    <>
      {!ready ? (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-[#F4F4F2]">
          <div className="relative size-10">
            <div className="absolute inset-0 animate-spin rounded-full border border-neutral-300 border-t-neutral-800" />
          </div>
          <p className="font-mono text-[11px] tracking-[0.28em] text-neutral-500">
            {loadProgress}%
          </p>
        </div>
      ) : null}

      {ready ? (
        <SiteNav tone={finaleActive ? "light" : "dark"} overlay />
      ) : null}

      <div ref={containerRef} className="relative h-[560vh] bg-[#F4F4F2]">
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#F4F4F2]">
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
