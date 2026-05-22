import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

/* ─── Auto-Sliding Hero Banner Carousel ─────────────────── */
function HeroBannerCarousel({ banners }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)
  const intervalRef = useRef(null)
  const total = banners.length

  const goTo = useCallback((idx) => {
    setIsAnimating(false)
    setTimeout(() => {
      setCurrent((idx + total) % total)
      setIsAnimating(true)
    }, 50)
  }, [total])

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    if (paused || total < 2) return
    intervalRef.current = setInterval(next, 4000)
    return () => clearInterval(intervalRef.current)
  }, [next, paused, total])

  if (!total) return null

  const banner = banners[current]

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background Image */}
      <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: isAnimating ? 1 : 0 }}>
        {banner.image_url ? (
          <img
            src={banner.image_url}
            alt={banner.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
        ) : null}
        <div className="absolute inset-0 hidden bg-gradient-to-br from-[var(--color-secondary)] via-[#16213e] to-[#0f3460]" />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div
  className="absolute inset-0 z-10 flex flex-col justify-center transition-all duration-700 px-4 sm:px-6 lg:px-12 pt-[100px] sm:pt-[110px]"
  style={{
    opacity: isAnimating ? 1 : 0,
    transform: isAnimating ? 'translateY(0)' : 'translateY(20px)',
  }}
>
        {/* <div className="page-container">
          <span className="text-[10px] sm:text-xs lg:text-sm font-bold tracking-[0.2em] uppercase block mb-2 sm:mb-3 text-[var(--color-primary)]">
            {banner.subtitle || 'Exclusive Collection'}
          </span>

          <h1 className="font-[Playfair_Display] text-xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white max-w-2xl leading-tight mb-3 sm:mb-6">
            {banner.title}
          </h1>

          <p className="text-xs sm:text-base lg:text-lg xl:text-xl max-w-lg mb-4 sm:mb-8 text-white/80">
            Discover premium fashion crafted for the modern individual
          </p>

          <Link
            to={banner.cta_link || '/products'}
            className="inline-flex items-center gap-2 sm:gap-3 bg-[var(--color-surface)] hover:bg-[var(--color-primary)] text-[var(--color-text)] hover:text-[var(--color-btn-text)] font-bold text-[10px] sm:text-sm transition-all duration-300 rounded-full px-4 sm:px-8 py-2 sm:py-4 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            {banner.cta_text || 'Shop Now'}
            <ArrowRight size={12} className="sm:w-[18px] sm:h-[18px]" />
          </Link>
        </div> */}
      </div>

      {/* Navigation Arrows */}
      {total > 1 && (
        <>
          {/* <button
            onClick={prev}
            className="absolute top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 bg-white/10 border border-white/20 text-white hover:bg-white/20 left-2 sm:left-4 lg:left-8"
          >
            <ChevronLeft size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </button> */}
          {/* <button
            onClick={next}
            className="absolute top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 bg-white/10 border border-white/20 text-white hover:bg-white/20 right-2 sm:right-4 lg:right-8"
          >
            <ChevronRight size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </button> */}
        </>
      )}

      {/* Dot Indicators */}
      {total > 1 && (
        <div className="absolute left-1/2 -translate-x-1/2 z-20 flex gap-2 sm:gap-3 bottom-3 sm:bottom-6 lg:bottom-8">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
                i === current 
                  ? 'w-6 sm:w-8 bg-[var(--color-primary)]' 
                  : 'w-1.5 sm:w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      <div className="absolute z-20 top-3 sm:top-4 lg:top-6 right-3 sm:right-4 lg:right-6 text-[10px] sm:text-xs font-mono tracking-wider text-white/40">
        {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>
    </div>
  )
}

/* ─── Horizontal Product Scroller ───────────────────────── */
function ProductScroller({ products, loading }) {
  const scrollRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 10)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * (window.innerWidth < 640 ? 200 : 280), behavior: 'smooth' })
  }

  if (loading) return (
    <div className="flex gap-3 sm:gap-4 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="shrink-0 w-[160px] sm:w-[200px] lg:w-[220px]">
          <div className="rounded-xl bg-[var(--color-bg-alt)] animate-pulse h-[220px] sm:h-[260px] lg:h-[300px] mb-2" />
          <div className="h-2.5 sm:h-3 bg-[var(--color-bg-alt)] rounded animate-pulse w-[70%] mb-2" />
          <div className="h-3 sm:h-4 bg-[var(--color-bg-alt)] rounded animate-pulse w-[40%]" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="relative">
      {canLeft && (
        <button
          onClick={() => scroll(-1)}
          className="absolute top-1/3 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-md flex items-center justify-center transition-all duration-200 bg-[var(--color-surface)] border border-[var(--color-border)] hover:shadow-lg -left-2 sm:-left-4 lg:-left-5"
        >
          <ChevronLeft size={16} className="sm:w-5 sm:h-5 text-[var(--color-text)]" />
        </button>
      )}
      {canRight && (
        <button
          onClick={() => scroll(1)}
          className="absolute top-1/3 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-md flex items-center justify-center transition-all duration-200 bg-[var(--color-surface)] border border-[var(--color-border)] hover:shadow-lg -right-2 sm:-right-4 lg:-right-5"
        >
          <ChevronRight size={16} className="sm:w-5 sm:h-5 text-[var(--color-text)]" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((p, i) => (
          <div
            key={p.id}
            className="shrink-0 w-[160px] sm:w-[200px] lg:w-[220px] animate-fadeUp"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Home Page ─────────────────────────────────────────── */
export default function Home() {
  const [featured, setFeatured] = useState([])
  const [newArr, setNewArr] = useState([])
  const [categories, setCategories] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/core/hero-banners/').then(r => {
      setBanners(r.data || [])
    }).catch(() => setBanners([]))

    Promise.all([
      api.get('/products/featured/'),
      api.get('/products/new-arrivals/'),
      api.get('/products/categories/'),
    ]).then(([f, n, c]) => {
      setFeatured(f.data.results || f.data)
      setNewArr(n.data.results || n.data)
      setCategories(c.data.results || c.data)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-[var(--color-bg)]">

      {/* HERO SECTION */}
      <section className="relative w-full overflow-hidden h-[60vh] sm:h-[75vh] lg:h-[88vh] min-h-[350px] sm:min-h-[450px] lg:min-h-[600px]">
        {banners.length > 0 ? (
          <HeroBannerCarousel banners={banners} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-secondary)] via-[#1a1a2e] to-[var(--color-secondary)]">
            <div className="text-center text-white px-4">
              <h1 className="font-[Playfair_Display] text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-6">
                TransFinity
              </h1>
              <p className="text-sm sm:text-lg lg:text-xl mb-5 sm:mb-8 text-white/60">
                Premium Fashion Collection
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-[var(--color-surface)] hover:bg-[var(--color-primary)] text-[var(--color-text)] hover:text-[var(--color-btn-text)] font-bold text-[10px] sm:text-sm transition-all duration-300 rounded-full px-4 sm:px-8 py-2 sm:py-4 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Explore Collection <ArrowRight size={12} className="sm:w-[18px] sm:h-[18px]" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* TRUST BADGES */}
      <section className="bg-[var(--color-bg-alt)] border-b border-[var(--color-border)]">
        <div className="page-container py-3 sm:py-6 lg:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6 lg:gap-8">
            {[
              { icon: Truck, title: 'Free Delivery', sub: 'Orders above ₹999' },
              { icon: Shield, title: 'Secure Payment', sub: '256-bit SSL' },
              { icon: RefreshCw, title: 'Easy Returns', sub: '7-day returns' },
              { icon: Headphones, title: '24/7 Support', sub: 'Always here' },
            ].map(f => (
              <div key={f.title} className="flex items-center gap-2 sm:gap-3">
                <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]">
                  <f.icon size={14} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-sm font-semibold text-[var(--color-text)] truncate">{f.title}</p>
                  <p className="text-[9px] sm:text-xs text-[var(--color-muted)] truncate">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {(featured.length > 0 || loading) && (
        <section className="bg-[var(--color-bg-alt)] border-y border-[var(--color-border)]">
          <div className="page-container py-5 sm:py-8 lg:py-10 xl:py-14">
            <div className="flex items-end justify-between flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-8">
              <div>
                <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary-dark)] mb-1 sm:mb-2">
                  Handpicked for you
                </p>
                <h2 className="font-[Playfair_Display] text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-text)]">
                  Featured Collection
                </h2>
              </div>
              <Link
                to="/products?is_featured=true"
                className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-semibold text-[var(--color-text)] border-b-2 border-[var(--color-primary)] pb-1 hover:text-[var(--color-primary)] transition-colors"
              >
                View all <ArrowRight size={12} className="sm:w-[15px] sm:h-[15px]" />
              </Link>
            </div>
            <ProductScroller products={featured} loading={loading} />
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      {newArr.length > 0 && (
        <section className="page-container py-5 sm:py-8 lg:py-10 xl:py-14">
          <div className="flex items-end justify-between flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-8">
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary-dark)] mb-1 sm:mb-2">
                Just dropped
              </p>
              <h2 className="font-[Playfair_Display] text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-text)]">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/products?ordering=-created_at"
              className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-semibold text-[var(--color-text)] border-b-2 border-[var(--color-primary)] pb-1 hover:text-[var(--color-primary)] transition-colors"
            >
              View all <ArrowRight size={12} className="sm:w-[15px] sm:h-[15px]" />
            </Link>
          </div>
          <ProductScroller products={newArr.slice(0, 10)} loading={false} />
        </section>
      )}

      {/* BOTTOM CTA */}
      <section className="bg-[var(--color-secondary)] py-10 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-3 sm:mb-6">
            Exclusive offers
          </p>
          <h2 className="font-[Playfair_Display] text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 sm:mb-6">
            Join our <span className="italic text-[var(--color-primary)]">inner circle</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed mb-6 sm:mb-10 max-w-md mx-auto">
            Get early access to new drops, exclusive discounts, and style inspiration delivered straight to you.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 sm:gap-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[var(--color-btn-text)] font-semibold text-[10px] sm:text-sm transition-all duration-300 rounded-full px-5 sm:px-8 py-2.5 sm:py-4 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Create Account — It's Free
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp {
          animation: fadeUp 0.5s ease forwards;
          opacity: 0;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}