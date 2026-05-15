import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ProductCard'
import HeroCarousel from '../components/HeroCarousel'
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
      <div 
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: isAnimating ? 1 : 0 }}
      >
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
        <div 
          className="absolute inset-0 hidden"
          style={{ background: 'linear-gradient(135deg, var(--color-secondary) 0%, #16213e 50%, #0f3460 100%)' }}
        />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
      </div>

      {/* Content */}
      <div 
        className="absolute inset-0 z-10 flex flex-col justify-center transition-all duration-700"
        style={{
          opacity: isAnimating ? 1 : 0,
          transform: isAnimating ? 'translateY(0)' : 'translateY(20px)',
          padding: '0 24px'
        }}
      >
        <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
          <span 
            className="text-xs sm:text-sm font-bold tracking-widest uppercase block"
            style={{ marginBottom: '10px', color: 'var(--color-primary)' }}
          >
            {banner.subtitle || 'Exclusive Collection'}
          </span>

          <h1 
            className="font-[Playfair_Display] text-4xl sm:text-5xl lg:text-7xl font-bold text-white max-w-2xl"
            style={{ lineHeight: 1.1, marginBottom: '24px' }}
          >
            {banner.title}
          </h1>

          <p 
            className="text-lg sm:text-xl max-w-lg"
            style={{ marginBottom: '32px', color: 'rgba(255,255,255,0.8)' }}
          >
            Discover premium fashion crafted for the modern individual
          </p>

          <Link
            to={banner.cta_link || '/products'}
            className="inline-flex items-center font-bold text-sm transition-all duration-300"
            style={{ 
              padding: '16px 32px', 
              borderRadius: '9999px',
              background: 'var(--color-surface)',
              color: 'var(--color-text)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--color-primary)'
              e.currentTarget.style.color = 'var(--color-btn-text)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--color-surface)'
              e.currentTarget.style.color = 'var(--color-text)'
            }}
          >
            {banner.cta_text || 'Shop Now'}
            <ArrowRight size={18} style={{ marginLeft: '12px' }} />
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center transition-all"
            style={{ 
              left: '16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'var(--color-text-inverse)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center transition-all"
            style={{ 
              right: '16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'var(--color-text-inverse)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {total > 1 && (
        <div className="absolute left-1/2 -translate-x-1/2 z-20 flex" style={{ bottom: '32px', gap: '12px' }}>
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: i === current ? '32px' : '8px',
                background: i === current ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)'
              }}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      <div 
        className="absolute z-20 text-xs font-mono tracking-wider"
        style={{ top: '24px', right: '24px', color: 'rgba(255,255,255,0.4)' }}
      >
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
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }

  if (loading) return (
    <div className="flex overflow-hidden" style={{ gap: '16px' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="shrink-0" style={{ width: '220px' }}>
          <div className="skeleton rounded-xl" style={{ height: '300px', marginBottom: '8px', background: 'var(--color-bg-alt)' }} />
          <div className="skeleton" style={{ height: '12px', width: '70%', marginBottom: '8px', background: 'var(--color-bg-alt)' }} />
          <div className="skeleton" style={{ height: '16px', width: '40%', background: 'var(--color-bg-alt)' }} />
        </div>
      ))}
    </div>
  )

  return (
    <div className="relative">
      {canLeft && (
        <button 
          onClick={() => scroll(-1)}
          className="absolute top-1/3 -translate-y-1/2 z-10 w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-all"
          style={{ 
            left: '-16px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)'
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
        >
          <ChevronLeft size={20} style={{ color: 'var(--color-text)' }} />
        </button>
      )}
      {canRight && (
        <button 
          onClick={() => scroll(1)}
          className="absolute top-1/3 -translate-y-1/2 z-10 w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-all"
          style={{ 
            right: '-16px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)'
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
        >
          <ChevronRight size={20} style={{ color: 'var(--color-text)' }} />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto"
        style={{ gap: '16px', paddingBottom: '8px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((p, i) => (
          <div 
            key={p.id} 
            className="shrink-0 animate-[fadeUp_0.5s_ease_forwards]"
            style={{ width: '220px', animationDelay: `${i * 0.06}s` }}
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
    <div style={{ background: 'var(--color-bg)' }}>

      {/* HERO SECTION */}
      <section className="relative w-full overflow-hidden" style={{ height: '88vh', minHeight: '600px' }}>
        {banners.length > 0 ? (
          // <HeroBannerCarousel banners={banners} />
                <HeroCarousel />

        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--color-secondary), #1a1a2e, var(--color-secondary))' }}>
            <div className="text-center text-white" style={{ padding: '0 16px' }}>
              <h1 className="font-[Playfair_Display] text-5xl sm:text-6xl font-bold" style={{ marginBottom: '24px' }}>
                TransFinity
              </h1>
              <p className="text-xl" style={{ marginBottom: '32px', color: 'rgba(255,255,255,0.6)' }}>Premium Fashion Collection</p>
              <Link 
                to="/products"
                className="inline-flex items-center font-bold transition-all"
                style={{ 
                  padding: '16px 32px', 
                  borderRadius: '9999px',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  gap: '8px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--color-primary)'
                  e.currentTarget.style.color = 'var(--color-btn-text)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--color-surface)'
                  e.currentTarget.style.color = 'var(--color-text)'
                }}
              >
                Explore Collection <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* TRUST BADGES */}
      <section style={{ background: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="mx-auto grid grid-cols-2 md:grid-cols-4" style={{ maxWidth: '1152px', padding: '24px 24px', gap: '34px' }}>
          {[
            { icon: Truck, title: 'Free Delivery', sub: 'Orders above ₹999' },
            { icon: Shield, title: 'Secure Payment', sub: '256-bit SSL' },
            { icon: RefreshCw, title: 'Easy Returns', sub: '7-day returns' },
            { icon: Headphones, title: '24/7 Support', sub: 'Always here' },
          ].map(f => (
            <div key={f.title} className="flex items-center" style={{ gap: '12px' }}>
              <div className="shrink-0 rounded-lg flex items-center justify-center" style={{ 
                width: '40px', 
                height: '40px',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary-dark)'
              }}>
                <f.icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{f.title}</p>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TREASURE HUNT PROMO */}
      {/* <section className="mx-auto" style={{ maxWidth: '1152px', padding: '32px 24px' }}>
        <Link 
          to="/treasure-hunt" 
          className="block relative overflow-hidden rounded-2xl transition-all hover:shadow-xl hover:scale-[1.01]"
          style={{ 
            padding: '24px 32px',
            background: 'linear-gradient(to right, var(--color-warning), #eab308, var(--color-warning))',
            color: 'var(--color-text-inverse)'
          }}
        >
          <div className="relative z-10 flex flex-col sm:flex-row items-center" style={{ gap: '24px' }}>
            <div className="text-4xl sm:text-5xl">🗺️</div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold" style={{ marginBottom: '4px' }}>🏴‍☠️ Treasure Hunt is LIVE!</h3>
              <p className="text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.9)' }}>
                Buy any T-Shirt → Collect 12 Mystery Maps → Win ₹1,00,000!
              </p>
              <p className="text-xs" style={{ marginTop: '4px', color: 'rgba(255,255,255,0.7)' }}>
                Collect 3+ maps for instant ₹300 rewards
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center rounded-xl font-bold text-sm backdrop-blur" style={{ 
                padding: '10px 20px', 
                gap: '8px',
                background: 'rgba(255,255,255,0.2)'
              }}>
                Start Hunting <ArrowRight size={16} />
              </span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full translate-y-1/2 -translate-x-1/2" style={{ background: 'rgba(255,255,255,0.1)' }} />
        </Link>
      </section> */}

      {/* CATEGORIES */}
      {/* {categories.length > 0 && (
        <section className="mx-auto" style={{ maxWidth: '1152px', padding: '48px 24px' }}>
          <div style={{ marginBottom: '32px' }}>
            <p className="text-xs font-bold tracking-widest uppercase" style={{ marginBottom: '8px', color: 'var(--color-primary-dark)' }}>
              Shop by Category
            </p>
            <h2 className="font-[Playfair_Display] text-3xl sm:text-4xl font-bold" style={{ color: 'var(--color-text)' }}>
              Find what you love
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6" style={{ gap: '16px' }}>
            {categories.map((cat, i) => (
              <Link 
                key={cat.id} 
                to={`/products?category_slug=${cat.slug}`}
                className="flex flex-col items-center rounded-xl transition-all duration-300 animate-[fadeUp_0.5s_ease_forwards]"
                style={{ 
                  padding: '20px', 
                  gap: '12px', 
                  animationDelay: `${i * 0.08}s`,
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div className="rounded-lg overflow-hidden flex items-center justify-center text-2xl" style={{ 
                  width: '56px', 
                  height: '56px',
                  background: 'var(--color-primary-light)'
                }}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : '🛍️'}
                </div>
                <span className="text-xs font-semibold text-center leading-tight" style={{ color: 'var(--color-text)' }}>
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )} */}

      {/* FEATURED PRODUCTS */}
      {(featured.length > 0 || loading) && (
        <section style={{ background: 'var(--color-bg-alt)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="mx-auto" style={{ maxWidth: '1302px', padding: '34px 24px' }}>
            <div className="flex items-end justify-between flex-wrap" style={{ marginBottom: '20px', gap: '16px' }}>
              <div>
                <p className="text-xs font-bold tracking-widest uppercase" style={{ marginBottom: '8px', color: 'var(--color-primary-dark)' }}>
                  Handpicked for you
                </p>
                <h2 className="font-[Playfair_Display] text-3xl sm:text-4xl font-bold" style={{ color: 'var(--color-text)' }}>
                  Featured Collection
                </h2>
              </div>
              <Link 
                to="/products?is_featured=true"
                className="inline-flex items-center text-sm font-semibold transition-all"
                style={{ 
                  gap: '8px', 
                  paddingBottom: '4px',
                  color: 'var(--color-text)',
                  borderBottom: '2px solid var(--color-primary)'
                }}
              >
                View all <ArrowRight size={15} />
              </Link>
            </div>
            <ProductScroller products={featured} loading={loading} />
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      {newArr.length > 0 && (
        <section className="mx-auto" style={{ maxWidth: '1302px', padding: '14px 14px' }}>
          <div className="flex items-end justify-between flex-wrap" style={{ marginBottom: '12px', gap: '16px' }}>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase" style={{ marginBottom: '8px', color: 'var(--color-primary-dark)' }}>
                Just dropped
              </p>
              <h2 className="font-[Playfair_Display] text-3xl sm:text-4xl font-bold" style={{ color: 'var(--color-text)' }}>
                New Arrivals
              </h2>
            </div>
            <Link 
              to="/products?ordering=-created_at"
              className="inline-flex items-center text-sm font-semibold transition-all"
              style={{ 
                gap: '8px', 
                paddingBottom: '4px',
                color: 'var(--color-text)',
                borderBottom: '2px solid var(--color-primary)'
              }}
            >
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <ProductScroller products={newArr.slice(0, 10)} loading={false} />
        </section>
      )}

      {/* BOTTOM CTA */}
      {/* <section className="text-center " style={{ 
        paddingLeft:"350px",
        background: 'var(--color-secondary)', 
        padding: '80px 24px' 
      }}>
        <div className="mx-auto" style={{ maxWidth: '512px' }}>
          <p className="text-xs font-bold tracking-widest uppercase" style={{ 
            marginBottom: '24px', 
            color: 'var(--color-primary)' 
          }}>
            Exclusive offers
          </p>
          <h2 className="font-[Playfair_Display] text-4xl sm:text-5xl font-bold leading-tight" style={{ 
            marginBottom: '24px',
            color: 'var(--color-text-inverse)'
          }}>
            Join our <span className="italic" style={{ color: 'var(--color-primary)' }}>inner circle</span>
          </h2>
          <p className="leading-relaxed" style={{ 
            marginBottom: '40px',
            color: 'rgba(255,255,255,0.5)'
          }}>
            Get early access to new drops, exclusive discounts, and style inspiration delivered straight to you.
          </p>
          <Link 
            to="/register"
            className="inline-flex items-center font-semibold transition-all duration-300"
            style={{ 
              padding: '16px 32px', 
              borderRadius: '9999px',
              background: 'var(--color-primary)',
              color: 'var(--color-btn-text)',
              gap: '12px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--color-primary-dark)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--color-primary)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Create Account — It's Free
          </Link>
        </div>
      </section> */}

    </div>
  )
}