import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Truck,
  Shield,
  RefreshCw,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Infinity,
  Eye,
} from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

/* ─────────────────────────────────────────────
   Auto-Sliding Hero Banner Carousel
───────────────────────────────────────────── */
function HeroBannerCarousel({ banners }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)

  const intervalRef = useRef(null)
  const total = banners.length

  const goTo = useCallback(
    (idx) => {
      if (!total) return

      setIsAnimating(false)

      setTimeout(() => {
        setCurrent((idx + total) % total)
        setIsAnimating(true)
      }, 80)
    },
    [total]
  )

  const next = useCallback(() => {
    goTo(current + 1)
  }, [current, goTo])

  const prev = useCallback(() => {
    goTo(current - 1)
  }, [current, goTo])

  useEffect(() => {
    if (paused || total < 2) return

    intervalRef.current = setInterval(next, 5000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [next, paused, total])

  if (!total) return null

  const banner = banners[current]

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      
      {/* Background */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: isAnimating ? 1 : 0 }}
      >
        {banner.mobile_image_url && (
          <img
            src={banner.mobile_image_url}
            alt={banner.title || 'Transfinity banner'}
            className="w-full h-full object-cover object-top sm:hidden"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        )}

        {banner.image_url && (
          <img
            src={banner.image_url}
            alt={banner.title || 'Transfinity banner'}
            className={`w-full h-full object-cover ${
              banner.mobile_image_url ? 'hidden sm:block' : ''
            }`}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fallback =
                e.currentTarget.parentElement?.querySelector('.fallback-gradient')
              if (fallback) fallback.style.display = 'block'
            }}
          />
        )}

      <div className="absolute  bg-black/5" />

<div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.10)_35%,rgba(0,0,0,0.10)_65%,rgba(0,0,0,0.55)_100%)]" />

<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,transparent_35%,rgba(0,0,0,0.70)_100%)]" />

<div className="absolute inset-0 grid-bg opacity-10" />
      </div>

      {/* Content */}
      {/* <div
        className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-10 lg:px-12 pt-[76px] sm:pt-[88px] lg:pt-[96px] transition-all duration-700"
        style={{
          opacity: isAnimating ? 1 : 0,
          transform: isAnimating ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        <p className="label-gold mb-3 sm:mb-4">
          {banner.subtitle || '✦ PHASE 01 · WANDERER ARC ✦'}
        </p>

        <h1 className="font-display text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white tracking-[0.11em] sm:tracking-[0.15em] leading-tight mb-4 sm:mb-6 max-w-5xl">
          {banner.title || 'THE WANDERER ARC'}
        </h1>

        <p className="text-muted text-sm sm:text-base lg:text-lg max-w-xl mx-auto mb-7 sm:mb-9 leading-relaxed font-mono tracking-wider">
          {banner.description ||
            'Beyond the veil of the physical, the eternal traveler begins.'}
        </p>

        {banner.cta_text && (
          <Link
            to={banner.cta_link || '/products'}
            className="btn-primary inline-flex items-center justify-center gap-2 w-full max-w-[260px] sm:w-auto"
          >
            {banner.cta_text}
            <ArrowRight size={16} />
          </Link>
        )}
      </div> */}

      {/* Navigation Arrows */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="hidden sm:flex absolute left-3 sm:left-5 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-12 lg:h-12 border border-gold/20 bg-black/60 backdrop-blur-sm items-center justify-center text-gold/65 hover:text-gold hover:border-gold/50 hover:bg-gold/5 active:scale-95 transition-all duration-300"
            aria-label="Previous banner"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={next}
            className="hidden sm:flex absolute right-3 sm:right-5 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-12 lg:h-12 border border-gold/20 bg-black/60 backdrop-blur-sm items-center justify-center text-gold/65 hover:text-gold hover:border-gold/50 hover:bg-gold/5 active:scale-95 transition-all duration-300"
            aria-label="Next banner"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bottom-6 sm:bottom-8 lg:bottom-10">
          {banners.map((_, i) => (
            <button
              type="button"
              key={i}
              onClick={() => goTo(i)}
              className={`h-[2px] transition-all duration-500 ${
                i === current
                  ? 'w-9 bg-gold'
                  : 'w-4 bg-gold/30 hover:bg-gold/60'
              }`}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {total > 1 && (
        <div className="absolute z-20 top-[88px] sm:top-[104px] lg:top-[116px] right-4 sm:right-6 text-[10px] sm:text-xs font-mono tracking-wider text-gold/45">
          {String(current + 1).padStart(2, '0')} /{' '}
          {String(total).padStart(2, '0')}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-28 sm:h-36 bg-gradient-to-t from-black to-transparent z-10" />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Horizontal Product Scroller
───────────────────────────────────────────── */
function ProductScroller({ products, loading, title, subtitle, viewAllLink }) {
  const scrollRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return

    setCanLeft(el.scrollLeft > 10)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    checkScroll()

    const el = scrollRef.current
    if (!el) return

    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [products, loading, checkScroll])

  const scroll = (dir) => {
    const amount = window.innerWidth < 640 ? 220 : window.innerWidth < 1024 ? 300 : 360

    scrollRef.current?.scrollBy({
      left: dir * amount,
      behavior: 'smooth',
    })
  }

  if (loading) {
    return (
      <section className="py-10 sm:py-12 lg:py-16 border-t border-gold/10">
        <div className="page-container">
          <div className="flex gap-3 sm:gap-4 lg:gap-6 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="shrink-0 w-[170px] sm:w-[220px] md:w-[240px] lg:w-[270px]"
              >
                <div className="skeleton-dark border border-gold/10 aspect-product mb-3" />
                <div className="h-3 skeleton-dark w-[72%] mb-2" />
                <div className="h-3 skeleton-dark w-[42%]" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!products?.length) return null

  return (
    <section className="py-10 sm:py-12 lg:py-16 border-t border-gold/10">
      <div className="page-container">
        {/* Section Header */}
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8 lg:mb-10">
          <div className="min-w-0">
            <p className="label-gold mb-2">{subtitle}</p>
            <h2 className="heading-section text-white leading-tight">{title}</h2>
          </div>

          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-[10px] sm:text-xs font-mono tracking-[0.18em] uppercase text-muted hover:text-gold transition-colors duration-300 flex items-center gap-1 shrink-0"
            >
              View All <ArrowRight size={12} />
            </Link>
          )}
        </div>

        {/* Scroller */}
        <div className="relative">
          {canLeft && (
            <button
              type="button"
              onClick={() => scroll(-1)}
              className="hidden sm:flex absolute left-0 top-[40%] -translate-y-1/2 z-10 w-11 h-11 lg:w-12 lg:h-12 border border-gold/20 bg-black/85 backdrop-blur-sm items-center justify-center text-gold/65 hover:text-gold hover:border-gold/50 transition-all duration-300 -ml-3"
              aria-label="Scroll products left"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {canRight && (
            <button
              type="button"
              onClick={() => scroll(1)}
              className="hidden sm:flex absolute right-0 top-[40%] -translate-y-1/2 z-10 w-11 h-11 lg:w-12 lg:h-12 border border-gold/20 bg-black/85 backdrop-blur-sm items-center justify-center text-gold/65 hover:text-gold hover:border-gold/50 transition-all duration-300 -mr-3"
              aria-label="Scroll products right"
            >
              <ChevronRight size={18} />
            </button>
          )}

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto pb-5 scrollbar-hide snap-x snap-mandatory"
          >
            {products.map((product, index) => (
              <div
                key={product.id}
                className="shrink-0 w-[170px] sm:w-[220px] md:w-[240px] lg:w-[270px] snap-start animate-fadeUp"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Home Page
───────────────────────────────────────────── */
export default function Home() {
  const [featured, setFeatured] = useState([])
  const [newArr, setNewArr] = useState([])
  const [categories, setCategories] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    api
      .get('/core/hero-banners/')
      .then((res) => {
        if (!mounted) return
        setBanners(res.data || [])
      })
      .catch(() => {
        if (!mounted) return
        setBanners([])
      })

    Promise.all([
      api.get('/products/featured/'),
      api.get('/products/new-arrivals/'),
      api.get('/products/categories/'),
    ])
      .then(([featuredRes, newArrivalsRes, categoriesRes]) => {
        if (!mounted) return

        setFeatured(featuredRes.data.results || featuredRes.data || [])
        setNewArr(newArrivalsRes.data.results || newArrivalsRes.data || [])
        setCategories(categoriesRes.data.results || categoriesRes.data || [])
      })
      .catch(() => {
        if (!mounted) return

        setFeatured([])
        setNewArr([])
        setCategories([])
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="bg-black min-h-screen overflow-x-hidden">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative w-full overflow-hidden h-[72vh] sm:h-[82vh] lg:h-[92vh] min-h-[470px] sm:min-h-[540px] lg:min-h-[640px]">
        {banners.length > 0 ? (
          <HeroBannerCarousel banners={banners} />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden px-4 sm:px-6 pt-[76px] sm:pt-[88px] lg:pt-[96px]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)]" />
            <div className="absolute inset-0 grid-bg opacity-25" />

            <div className="relative z-10 text-center max-w-4xl mx-auto">
              <p className="label-gold mb-4">✦ PHASE 01 · WANDERER ARC ✦</p>

              <h1 className="font-display text-[2.25rem] sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-[0.14em] leading-tight mb-5 sm:mb-6">
                TRANS<span className="text-gradient-gold">FINITY</span>
              </h1>

              <p className="text-muted text-sm sm:text-base lg:text-lg mb-7 sm:mb-9 max-w-xl mx-auto font-mono tracking-wider leading-relaxed">
                Beyond the veil of the physical. Luxury technical garments for the
                multi-dimensional soul.
              </p>

              <Link
                to="/products"
                className="btn-primary inline-flex items-center justify-center gap-2 w-full max-w-[260px] sm:w-auto"
              >
                ENTER THE ARC
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black to-transparent" />
          </div>
        )}
      </section>

      {/* ==================== ARC PROGRESSION ==================== */}
      <section className="py-10 sm:py-12 lg:py-16 border-t border-gold/10">
        <div className="page-container">
          <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 min-w-0">
              <Infinity size={18} className="text-gold shrink-0" />
              <span className="font-mono text-[10px] sm:text-xs tracking-[0.28em] uppercase text-gold truncate">
                Arc Progression
              </span>
            </div>

            <Link
              to="/arcs"
              className="text-[10px] sm:text-xs font-mono tracking-wider uppercase text-muted hover:text-gold transition-colors duration-300 flex items-center gap-1 shrink-0"
            >
              Full Map <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { num: '01', name: 'WANDERER', status: 'UNLOCKED', active: true },
              { num: '02', name: 'CITADEL', status: 'LOCKED', active: false },
              { num: '03', name: 'GHOSTING', status: 'LOCKED', active: false },
              { num: '04', name: 'VOID GATE', status: 'LOCKED', active: false },
            ].map((arc) => (
              <Link
                to="/arcs"
                key={arc.num}
                className={`relative p-4 sm:p-5 lg:p-6 border transition-all duration-500 group overflow-hidden ${
                  arc.active
                    ? 'border-gold/40 bg-gold/5 hover:border-gold/70'
                    : 'border-gold/10 bg-[#050505] hover:border-gold/30 hover:bg-gold/5'
                }`}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex items-start justify-between gap-3 mb-4">
                  <span
                    className={`font-mono text-xl sm:text-2xl ${
                      arc.active ? 'text-gold' : 'text-muted'
                    }`}
                  >
                    {arc.num}
                  </span>

                  <span
                    className={`text-[9px] sm:text-[10px] font-mono tracking-wider uppercase ${
                      arc.active ? 'text-green-400' : 'text-muted'
                    }`}
                  >
                    {arc.status}
                  </span>
                </div>

                <h3
                  className={`font-display text-sm sm:text-base tracking-[0.15em] uppercase mb-2 ${
                    arc.active ? 'text-white' : 'text-muted'
                  }`}
                >
                  {arc.name}
                </h3>

                <div
                  className={`h-[1px] w-8 transition-all duration-500 group-hover:w-full ${
                    arc.active ? 'bg-gold/60' : 'bg-gold/20'
                  }`}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TRUST SECTION ==================== */}
      <section className="py-7 sm:py-9 lg:py-10 border-t border-gold/10 bg-[#050505]">
        <div className="page-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: Truck, title: 'Signal Transmission', sub: 'Orders above ₹999' },
              { icon: Shield, title: 'Encrypted Payment', sub: '256-bit SSL' },
              { icon: RefreshCw, title: 'Temporal Returns', sub: '7-day return window' },
              { icon: Headphones, title: '24/7 Support', sub: 'Always connected' },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 p-4 border border-gold/10 hover:border-gold/25 bg-black/40 hover:bg-gold/5 transition-all duration-300 group"
              >
                <div className="shrink-0 w-10 h-10 border border-gold/20 flex items-center justify-center text-gold/65 group-hover:text-gold group-hover:border-gold/40 transition-all duration-300">
                  <item.icon size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-semibold text-white tracking-wider uppercase truncate">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-muted font-mono tracking-wider truncate mt-0.5">
                    {item.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURED PRODUCTS ==================== */}
      {(featured.length > 0 || loading) && (
        <ProductScroller
          products={featured}
          loading={loading}
          title={
            <>
              SELECTED <span className="text-gradient-gold">ARTIFACTS</span>
            </>
          }
          subtitle="Current Manifesto"
          viewAllLink="/products?is_featured=true"
        />
      )}

      {/* ==================== FOUNDER PROMO ==================== */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 border-t border-gold/10">
        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-center">
            <div className="relative aspect-[4/5] sm:aspect-[16/12] lg:aspect-[4/5] overflow-hidden border border-gold/20 group bg-[#0A0A0A]">
              <img
                src="/founder-kairos.jpg"
                alt="Kairos - The Architect"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              <div className="absolute bottom-5 sm:bottom-6 left-5 sm:left-6">
                <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-gold mb-2">
                  The Architect
                </p>
                <p className="font-display text-2xl sm:text-3xl text-white tracking-wider">
                  KAIROS
                </p>
              </div>
            </div>

            <div className="space-y-5 sm:space-y-6">
              <p className="label-gold">Encrypted Transmission</p>

              <h2 className="heading-section text-white leading-tight">
                "TIME IS NOT
                <br />
                <span className="text-gradient-gold">A LINE.</span> IT IS
                <br />
                A LOOP."
              </h2>

              <p className="text-muted text-sm sm:text-base leading-relaxed font-mono tracking-wider max-w-xl">
                Kairos exists between recorded moments. The masked architect of
                Transfinity designs each garment as a relic — a piece of equipment
                for the wanderer who refuses to be located.
              </p>

              <div className="flex flex-wrap gap-7 sm:gap-10 pt-2">
                <div>
                  <p className="font-display text-3xl sm:text-4xl text-gold">
                    1/10
                  </p>
                  <p className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-muted mt-1">
                    Arcs Planned
                  </p>
                </div>

                <div>
                  <p className="font-display text-3xl sm:text-4xl text-gold">
                    2104
                  </p>
                  <p className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-muted mt-1">
                    Year Zero
                  </p>
                </div>
              </div>

              <Link
                to="/founder"
                className="btn-outline inline-flex items-center justify-center gap-2 w-full sm:w-auto mt-2"
              >
                WITNESS THE ARCHITECT
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== NEW ARRIVALS ==================== */}
      {newArr.length > 0 && (
        <ProductScroller
          products={newArr.slice(0, 10)}
          loading={false}
          title={
            <>
              FRESH <span className="text-gradient-gold">SIGNALS</span>
            </>
          }
          subtitle="New Arrivals"
          viewAllLink="/products?ordering=-created_at"
        />
      )}

      {/* ==================== CATEGORIES ==================== */}
      {categories.length > 0 && (
        <section className="py-10 sm:py-12 lg:py-16 border-t border-gold/10">
          <div className="page-container">
            <div className="mb-6 sm:mb-8 lg:mb-10">
              <p className="label-gold mb-2">Browse the Archives</p>
              <h2 className="heading-section text-white">CATEGORIES</h2>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category_slug=${cat.slug}`}
                  className="flex flex-col items-center justify-center gap-3 p-4 sm:p-5 lg:p-6 min-h-[130px] sm:min-h-[150px] border border-gold/10 hover:border-gold/35 bg-[#0A0A0A] hover:bg-gold/5 transition-all duration-500 group"
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 border border-gold/20 flex items-center justify-center text-gold/45 group-hover:text-gold group-hover:border-gold/40 transition-colors duration-300">
                      <Eye size={20} />
                    </div>
                  )}

                  <span className="text-[10px] sm:text-xs font-display tracking-wider uppercase text-muted group-hover:text-white transition-colors duration-300 text-center line-clamp-2 leading-relaxed">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== BOTTOM CTA ==================== */}
      <section className="relative py-16 sm:py-20 lg:py-28 overflow-hidden border-t border-gold/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.07)_0%,transparent_70%)]" />
        <div className="absolute inset-0 grid-bg opacity-20" />

        <div className="page-container relative z-10 text-center">
          <p className="label-gold mb-4 sm:mb-6">The Journey Continues</p>

          <h2 className="heading-section text-white mb-4 sm:mb-6">
            READY TO <span className="text-gradient-gold">CROSS?</span>
          </h2>

          <p className="text-muted text-sm sm:text-base max-w-xl mx-auto mb-8 sm:mb-10 font-mono tracking-wider leading-relaxed">
            Each artifact is a key. Each purchase is a crossing. The next arc opens
            when you stop counting.
          </p>

          <Link
            to="/register"
            className="btn-primary inline-flex items-center justify-center gap-2 w-full max-w-[260px] sm:w-auto"
          >
            CREATE ACCOUNT
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}