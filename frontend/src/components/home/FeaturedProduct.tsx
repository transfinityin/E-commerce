import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Shirt,
  Weight,
  Flower2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  FEATURED_SELECT_EVENT,
  type FeaturedSlug,
} from "@/lib/featured-nav";
import api from "@/services/api";
import useAuthStore from "@/store/authStore";
import useCartStore from "@/store/cartStore";

type FeaturedItem = {
  id: string;
  slug: string;
  short: string;
  name: string;
  description: string;
  price: string;
  images: string[];
  available_sizes: string[];
  productId: string | null;
};

const FALLBACK: FeaturedItem[] = [
  {
    id: "product-1",
    slug: "void",
    short: "VOID",
    name: "THE VOID TEE",
    description:
      "Premium oversized fit. 240 GSM. 100% pure cotton. Built for those who go beyond.",
    price: "₹ 1,699",
    images: [1, 2, 3, 4].map((n) => `/product/product-1/${n}.jpeg`),
    available_sizes: ["S", "M", "L", "XL"],
    productId: null,
  },
  {
    id: "product-2",
    slug: "eternal",
    short: "ETERNAL",
    name: "THE ETERNAL TEE",
    description:
      "Premium oversized fit. 240 GSM. 100% pure cotton. Built for those who go beyond.",
    price: "₹ 1,699",
    images: [1, 2, 3, 4].map((n) => `/product/product-2/${n}.png`),
    available_sizes: ["S", "M", "L", "XL"],
    productId: null,
  },
  {
    id: "product-3",
    slug: "ascendant",
    short: "ASCENDANT",
    name: "THE ASCENDANT TEE",
    description:
      "Premium oversized fit. 240 GSM. 100% pure cotton. Built for those who go beyond.",
    price: "₹ 1,699",
    images: [1, 2, 3, 4].map((n) => `/product/product-3/${n}.png`),
    available_sizes: ["S", "M", "L", "XL"],
    productId: null,
  },
];

const PRODUCT_AUTO_MS = 4500;
const IDLE_RESUME_MS = 3000;

const SPECS = [
  { label: "240 GSM", Icon: Weight },
  { label: "100% COTTON", Icon: Flower2 },
  { label: "OVERSIZED FIT", Icon: Shirt },
] as const;

const ease = [0.22, 1, 0.36, 1] as const;

function shortFromName(name: string, slug: string) {
  const known = ["void", "eternal", "ascendant"] as const;
  const hit = known.find((k) => slug.includes(k) || name.toLowerCase().includes(k));
  if (hit) return hit.toUpperCase();
  return name.split(/\s+/).filter(Boolean).slice(0, 1).join(" ").toUpperCase() || "TEE";
}

function storySlug(slug: string, name: string): FeaturedSlug | null {
  const known = ["void", "eternal", "ascendant"] as const;
  return known.find((k) => slug.includes(k) || name.toLowerCase().includes(k)) ?? null;
}

function formatPrice(value: string | number) {
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return `₹ ${n.toLocaleString("en-IN")}`;
}

function mapApiProduct(p: any): FeaturedItem {
  const imgs = (p.images || [])
    .slice()
    .sort((a: any, b: any) => Number(b.is_primary) - Number(a.is_primary) || (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((img: any) => img.image)
    .filter(Boolean);
  const primary = p.primary_image?.image;
  const images = imgs.length
    ? imgs
    : primary
      ? [primary]
      : [`/product/product-1/1.jpeg`];

  return {
    id: p.id,
    productId: p.id,
    slug: p.slug,
    short: shortFromName(p.name || "", p.slug || ""),
    name: p.name,
    description:
      p.description ||
      "Premium oversized fit. 240 GSM. 100% pure cotton. Built for those who go beyond.",
    price: formatPrice(p.effective_price ?? p.sale_price ?? p.price),
    images,
    available_sizes: Array.isArray(p.available_sizes) ? p.available_sizes : ["M"],
  };
}

export function FeaturedProduct() {
  const [products, setProducts] = useState<FeaturedItem[]>(FALLBACK);
  const [productIndex, setProductIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [adding, setAdding] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/products/featured/");
        const list = (data.results || data || []).map(mapApiProduct);
        if (!cancelled && list.length) {
          // Prefer void/eternal/ascendant order when present
          const order = ["void", "eternal", "ascendant"];
          list.sort((a: FeaturedItem, b: FeaturedItem) => {
            const ai = order.findIndex((k) => a.slug.includes(k));
            const bi = order.findIndex((k) => b.slug.includes(k));
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
          });
          setProducts(list.slice(0, 6));
          setProductIndex(0);
          setImageIndex(0);
        }
      } catch {
        /* keep fallback static tees */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const product = products[productIndex] || products[0];
  const images = product?.images?.length ? product.images : FALLBACK[0].images;
  const imageCount = images.length;

  const clearIdle = useCallback(() => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
  }, []);

  const onHotEnter = useCallback(() => {
    clearIdle();
    setPaused(true);
  }, [clearIdle]);

  const onHotLeave = useCallback(() => {
    clearIdle();
    idleTimer.current = setTimeout(() => {
      setPaused(false);
      setProgressKey((k) => k + 1);
      idleTimer.current = null;
    }, IDLE_RESUME_MS);
  }, [clearIdle]);

  const switchProduct = useCallback((next: number) => {
    setProductIndex(next);
    setImageIndex(0);
    setProgressKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const selectSlug = (slug: FeaturedSlug) => {
      const idx = products.findIndex(
        (p) => p.slug.includes(slug) || p.name.toLowerCase().includes(slug),
      );
      if (idx < 0) return;
      setProductIndex(idx);
      setImageIndex(0);
      setProgressKey((k) => k + 1);
      clearIdle();
      setPaused(true);
      idleTimer.current = setTimeout(() => {
        setPaused(false);
        setProgressKey((k) => k + 1);
        idleTimer.current = null;
      }, IDLE_RESUME_MS);
    };

    const onSelect = (e: Event) => {
      const slug = (e as CustomEvent<{ slug: FeaturedSlug }>).detail?.slug;
      if (slug) selectSlug(slug);
    };

    const applyFromHash = () => {
      const raw = window.location.hash.replace(/^#/, "");
      const match = raw.match(/^featured-(void|eternal|ascendant)$/);
      if (match?.[1]) selectSlug(match[1] as FeaturedSlug);
    };

    applyFromHash();
    window.addEventListener(FEATURED_SELECT_EVENT, onSelect);
    window.addEventListener("hashchange", applyFromHash);
    window.addEventListener("popstate", applyFromHash);
    return () => {
      window.removeEventListener(FEATURED_SELECT_EVENT, onSelect);
      window.removeEventListener("hashchange", applyFromHash);
      window.removeEventListener("popstate", applyFromHash);
    };
  }, [clearIdle, products]);

  const setImage = useCallback(
    (next: number) => {
      if (!imageCount) return;
      setImageIndex(((next % imageCount) + imageCount) % imageCount);
    },
    [imageCount],
  );

  const prevImage = useCallback(
    () => setImage(imageIndex - 1),
    [imageIndex, setImage],
  );
  const nextImage = useCallback(
    () => setImage(imageIndex + 1),
    [imageIndex, setImage],
  );

  useEffect(() => {
    if (paused || products.length < 2) return;
    const id = window.setInterval(() => {
      setProductIndex((i) => (i + 1) % products.length);
      setImageIndex(0);
      setProgressKey((k) => k + 1);
    }, PRODUCT_AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, progressKey, products.length]);

  useEffect(() => () => clearIdle(), [clearIdle]);

  const thumbWindow = useMemo(() => {
    if (imageCount <= 3) return Array.from({ length: imageCount }, (_, i) => i);
    if (imageIndex <= 0) return [0, 1, 2];
    if (imageIndex >= imageCount - 1)
      return [imageCount - 3, imageCount - 2, imageCount - 1];
    return [imageIndex - 1, imageIndex, imageIndex + 1];
  }, [imageIndex, imageCount]);

  const handleAddToCart = async () => {
    if (!product?.productId) {
      toast.error("Create this tee in Admin → Products to enable cart");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please sign in first");
      return;
    }
    setAdding(true);
    try {
      const size = product.available_sizes?.[0] || "M";
      await addToCart(product.productId, 1, size);
      toast.success("Added to cart");
    } catch {
      toast.error("Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (!product) return null;

  return (
    <section
      id="featured"
      className="relative w-full scroll-mt-20 bg-[#EFEFEF] py-16 md:py-20 lg:py-28"
    >
      <div className="mx-auto grid max-w-[1380px] grid-cols-1 items-center gap-12 px-5 md:px-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.85fr)_auto] lg:gap-6 xl:gap-10">
        <div className="relative flex min-h-[300px] items-center md:min-h-[440px] lg:min-h-[560px]">
          <div className="absolute top-1/2 left-0 z-20 hidden -translate-y-1/2 flex-col gap-6 md:flex">
            {images.map((_, i) => {
              const active = i === imageIndex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImage(i)}
                  className="group relative flex flex-col items-start"
                  aria-label={`View image ${String(i + 1).padStart(2, "0")}`}
                  aria-current={active ? "true" : undefined}
                >
                  <span
                    className={cn(
                      "mb-1.5 h-[2px] bg-neutral-900 transition-all duration-300",
                      active ? "w-7 opacity-100" : "w-0 opacity-0",
                    )}
                  />
                  <span
                    className={cn(
                      "font-sans text-[11px] tracking-[0.2em] transition-colors",
                      active
                        ? "font-semibold text-neutral-900"
                        : "font-medium text-neutral-400 group-hover:text-neutral-600",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative ml-0 w-full flex-1 md:ml-12 lg:ml-14">
            <div
              className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.055]"
              style={{
                background: `
                  radial-gradient(circle, transparent 38%, #111 39%, #111 40%, transparent 41%),
                  repeating-conic-gradient(from 0deg, #111 0deg 1.5deg, transparent 1.5deg 30deg)
                `,
              }}
              aria-hidden
            />

            <div
              className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[3/2]"
              onMouseEnter={onHotEnter}
              onMouseLeave={onHotLeave}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${product.id}-${imageIndex}`}
                  src={images[imageIndex]}
                  alt={`${product.name} view ${imageIndex + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.32, ease }}
                  className="absolute inset-0 h-full w-full object-contain object-center"
                  draggable={false}
                />
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-md lg:max-w-none lg:justify-self-start lg:pl-2">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[10px] font-medium tracking-[0.35em] text-neutral-500 uppercase md:text-[11px]">
              Featured Product
            </p>
            <p
              className="font-sans text-[10px] tracking-[0.28em] text-neutral-400 tabular-nums"
              aria-live="polite"
            >
              {String(productIndex + 1).padStart(2, "0")} /{" "}
              {String(products.length).padStart(2, "0")}
            </p>
          </div>

          <div
            className="mt-5"
            role="tablist"
            aria-label="Featured tees"
            onMouseEnter={onHotEnter}
            onMouseLeave={onHotLeave}
          >
            <p className="mb-3 text-[9px] font-medium tracking-[0.28em] text-neutral-400 uppercase">
              {products.length} tees · shop the drop
            </p>
            <div className="flex flex-wrap items-end gap-x-6 gap-y-3 sm:gap-x-8">
              {products.map((p, i) => {
                const active = i === productIndex;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => switchProduct(i)}
                    className="group relative flex flex-col items-start pb-2"
                  >
                    <span
                      className={cn(
                        "font-sans text-[11px] tracking-[0.28em] uppercase transition-colors duration-300 sm:text-[12px]",
                        active
                          ? "font-semibold text-neutral-900"
                          : "font-medium text-neutral-400 group-hover:text-neutral-700",
                      )}
                    >
                      {p.short}
                    </span>
                    <span className="relative mt-2 h-[2px] w-full overflow-hidden bg-neutral-300/70">
                      {active ? (
                        <span
                          key={progressKey}
                          className="absolute inset-y-0 left-0 w-full origin-left bg-neutral-900"
                          style={{
                            transform: "scaleX(0)",
                            animation: `featured-progress ${PRODUCT_AUTO_MS}ms linear forwards`,
                            animationPlayState: paused ? "paused" : "running",
                          }}
                        />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease }}
            >
              <h2
                className="mt-6 font-sans text-[clamp(1.85rem,3.2vw,2.85rem)] font-semibold tracking-[0.04em] text-neutral-900 uppercase"
                onMouseEnter={onHotEnter}
                onMouseLeave={onHotLeave}
              >
                {product.name}
              </h2>

              <p className="mt-4 max-w-[320px] text-[13px] leading-[1.7] text-neutral-600 md:text-[14px]">
                {product.description}
              </p>

              <div className="mt-9 flex flex-wrap gap-9 md:gap-11">
                {SPECS.map(({ label, Icon }) => (
                  <div key={label} className="flex flex-col items-start gap-2.5">
                    <Icon
                      className="size-[18px] text-neutral-800"
                      strokeWidth={1.35}
                    />
                    <span className="text-[9px] font-medium tracking-[0.2em] text-neutral-600 uppercase">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-11 font-sans text-[clamp(1.55rem,2.5vw,2.05rem)] font-semibold tracking-wide text-neutral-900">
                {product.price}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={adding}
                  onClick={handleAddToCart}
                  className="inline-flex h-12 items-center justify-center gap-2.5 bg-neutral-950 px-8 text-[11px] font-semibold tracking-[0.24em] text-white uppercase transition-colors hover:bg-neutral-800 disabled:opacity-60"
                >
                  {adding ? "Adding…" : "Add To Cart"}
                  <ArrowRight className="size-3.5" strokeWidth={1.75} />
                </button>
                {product.productId ? (
                  <Link
                    to={`/products/${product.slug}`}
                    className="inline-flex h-12 items-center justify-center border border-neutral-900 px-6 text-[11px] font-semibold tracking-[0.24em] text-neutral-900 uppercase hover:bg-neutral-900 hover:text-white transition-colors"
                  >
                    View
                  </Link>
                ) : null}
              </div>
              {storySlug(product.slug, product.name) ? (
                <p className="mt-3 text-[10px] tracking-[0.18em] text-neutral-400 uppercase">
                  Linked from stories · #{`featured-${storySlug(product.slug, product.name)}`}
                </p>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-row items-center gap-3 lg:flex-col lg:items-center lg:gap-3.5 lg:self-center">
          <div className="flex flex-1 flex-row gap-3 lg:flex-none lg:flex-col">
            {thumbWindow.map((i) => {
              const active = i === imageIndex;
              return (
                <button
                  key={`${product.id}-thumb-${i}`}
                  type="button"
                  onClick={() => setImage(i)}
                  className={cn(
                    "relative h-[72px] w-[72px] shrink-0 overflow-hidden bg-[#E4E4E4] transition-all md:h-[84px] md:w-[84px]",
                    active
                      ? "ring-1 ring-neutral-900"
                      : "opacity-75 hover:opacity-100",
                  )}
                  aria-label={`Thumbnail ${i + 1}`}
                  aria-current={active ? "true" : undefined}
                >
                  <img
                    src={images[i]}
                    alt=""
                    className="h-full w-full object-cover object-center"
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 text-neutral-800 lg:mt-1">
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous image"
              className="p-1 transition-opacity hover:opacity-50"
            >
              <ChevronLeft className="size-5" strokeWidth={1.4} />
            </button>
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="p-1 transition-opacity hover:opacity-50"
            >
              <ChevronRight className="size-5" strokeWidth={1.4} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
