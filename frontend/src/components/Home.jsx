import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, Sparkles, Infinity, MapPin, Eye } from 'lucide-react'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [f, n, c] = await Promise.all([
          api.get('/products/featured/'),
          api.get('/products/new-arrivals/'),
          api.get('/products/categories/'),
        ])
        setFeatured(f.data.results || f.data)
        setNewArrivals(n.data.results || n.data)
        setCategories(c.data.results || c.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="bg-black min-h-screen">

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated starfield background - CSS only */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.03)_0%,_transparent_70%)]" />
        <div className="absolute inset-0 grid-bg opacity-30" />

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-gold/40 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
          {/* Phase label */}
          <p className="label-gold mb-4 sm:mb-6 animate-fadeIn">
            ✦ PHASE 01 · WANDERER ARC ✦
          </p>

          {/* Main heading */}
          <h1 className="heading-hero mb-4 sm:mb-6 animate-fadeUp">
            <span className="text-white">THE </span>
            <span className="text-gradient-gold">WANDERER</span>
            <span className="text-white"> ARC</span>
          </h1>

          {/* Subtitle */}
          <p className="text-muted text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed animate-fadeUp" style={{ animationDelay: '0.2s' }}>
            The first chapter of the Transfinity saga explores the eternal traveler — 
            those who exist between the lines of reality and the digital frontier.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fadeUp" style={{ animationDelay: '0.4s' }}>
            <Link to="/products"
              className="btn-primary btn-mobile-full inline-flex items-center justify-center gap-2"
            >
              ENTER THE ARC
              <ArrowRight size={16} />
            </Link>
            <Link to="/arcs"
              className="btn-outline btn-mobile-full inline-flex items-center justify-center gap-2"
            >
              VIEW ARCHIVES
              <Eye size={16} />
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
            <div className="w-6 h-10 border border-gold/30 rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 bg-gold/60 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* ==================== ARC PROGRESSION ==================== */}
      <section className="py-12 sm:py-16 lg:py-20 border-t border-gold/10">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <div className="flex items-center gap-3">
              <Infinity size={20} className="text-gold" />
              <span className="font-mono text-[11px] sm:text-xs tracking-[0.3em] uppercase text-gold">
                Arc Progression
              </span>
            </div>
            <Link to="/arcs" className="text-[11px] sm:text-xs font-mono tracking-wider uppercase text-muted hover:text-gold transition-colors duration-300 flex items-center gap-1">
              Full Map <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { num: '01', name: 'WANDERER', status: 'UNLOCKED', active: true },
              { num: '02', name: 'CITADEL', status: 'LOCKED', active: false },
              { num: '03', name: 'GHOSTING', status: 'LOCKED', active: false },
              { num: '04', name: 'VOID GATE', status: 'LOCKED', active: false },
            ].map((arc, idx) => (
              <div 
                key={arc.num}
                className={`relative p-4 sm:p-6 border transition-all duration-500 group cursor-pointer
                  ${arc.active 
                    ? 'border-gold/40 bg-gold/5 hover:border-gold/70' 
                    : 'border-gold/10 bg-transparent hover:border-gold/30'
                  }
                `}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`font-mono text-lg sm:text-xl ${arc.active ? 'text-gold' : 'text-muted'}`}>
                    {arc.num}
                  </span>
                  <span className={`text-[9px] sm:text-[10px] font-mono tracking-wider uppercase
                    ${arc.active ? 'text-green-400' : 'text-muted'}
                  `}>
                    {arc.status}
                  </span>
                </div>
                <h3 className={`font-display text-sm sm:text-base tracking-[0.15em] uppercase mb-1
                  ${arc.active ? 'text-white' : 'text-muted'}
                `}>
                  {arc.name}
                </h3>
                <div className={`h-[1px] w-8 transition-all duration-500 group-hover:w-full
                  ${arc.active ? 'bg-gold/60' : 'bg-gold/20'}
                `} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SELECTED ARTIFACTS (FEATURED) ==================== */}
      {featured.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20 border-t border-gold/10">
          <div className="page-container">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-8 sm:mb-12">
              <div>
                <p className="label-gold mb-2">Current Manifesto</p>
                <h2 className="heading-section text-white">
                  SELECTED <span className="text-gradient-gold">ARTIFACTS</span>
                </h2>
              </div>
              <Link to="/products?is_featured=true"
                className="text-[11px] sm:text-xs font-mono tracking-wider uppercase text-muted hover:text-gold transition-colors duration-300 flex items-center gap-1 shrink-0"
              >
                View Full Drop <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-product bg-[#0A0A0A] border border-gold/10 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {featured.map((p, idx) => (
                  <div key={p.id} className="animate-fadeUp" style={{ animationDelay: `${idx * 80}ms` }}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ==================== THE ARCHITECT (FOUNDER PROMO) ==================== */}
      <section className="py-12 sm:py-16 lg:py-20 border-t border-gold/10">
        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Image side */}
            <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden border border-gold/20 group">
              <img 
                src="/founder-kairos.jpg" 
                alt="Kairos - The Architect"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6">
                <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-gold mb-1">
                  The Architect
                </p>
                <p className="font-display text-xl sm:text-2xl lg:text-3xl text-white tracking-wider">
                  KAIROS
                </p>
              </div>
            </div>

            {/* Content side */}
            <div className="space-y-4 sm:space-y-6">
              <p className="label-gold">Encrypted Transmission</p>

              <h2 className="heading-section text-white leading-tight">
                "TIME IS NOT<br />
                <span className="text-gradient-gold">A LINE.</span> IT IS<br />
                A LOOP."
              </h2>

              <p className="text-muted text-sm sm:text-base leading-relaxed">
                Kairos exists between recorded moments. The masked architect of 
                Transfinity designs each garment as a relic — a piece of equipment 
                for the wanderer who refuses to be located.
              </p>

              <div className="flex flex-wrap gap-6 sm:gap-8 pt-2">
                <div>
                  <p className="font-display text-2xl sm:text-3xl text-gold">1/10</p>
                  <p className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-muted mt-1">Arcs Planned</p>
                </div>
                <div>
                  <p className="font-display text-2xl sm:text-3xl text-gold">2104</p>
                  <p className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-muted mt-1">Year Zero</p>
                </div>
              </div>

              <Link to="/founder"
                className="btn-outline inline-flex items-center gap-2 mt-4"
              >
                WITNESS THE ARCHITECT
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== NEW ARRIVALS ==================== */}
      {newArrivals.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20 border-t border-gold/10">
          <div className="page-container">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-8 sm:mb-12">
              <div>
                <p className="label-gold mb-2">Fresh Signals</p>
                <h2 className="heading-section text-white">
                  NEW <span className="text-gradient-gold">ARRIVALS</span>
                </h2>
              </div>
              <Link to="/products?ordering=-created_at"
                className="text-[11px] sm:text-xs font-mono tracking-wider uppercase text-muted hover:text-gold transition-colors duration-300 flex items-center gap-1 shrink-0"
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {newArrivals.map((p, idx) => (
                <div key={p.id} className="animate-fadeUp" style={{ animationDelay: `${idx * 80}ms` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== TRUST / MANIFESTO ==================== */}
      <section className="py-12 sm:py-16 lg:py-20 border-t border-gold/10">
        <div className="page-container">
          <div className="text-center mb-8 sm:mb-12">
            <p className="label-gold mb-3">The Covenant</p>
            <h2 className="heading-section text-white">OUR <span className="text-gradient-gold">MANIFESTO</span></h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[
              {
                icon: Truck,
                title: 'Signal Transmission',
                subtitle: 'Free delivery above ₹999',
              },
              {
                icon: Shield,
                title: 'Encrypted Payment',
                subtitle: '100% secure transactions',
              },
              {
                icon: RefreshCw,
                title: 'Temporal Returns',
                subtitle: '30-day return window',
              },
              {
                icon: Headphones,
                title: '24/7 Support',
                subtitle: 'Always connected',
              },
            ].map((feature, idx) => {
              const IconComp = feature.icon
              return (
                <div
                  key={feature.title}
                  className="p-4 sm:p-6 border border-gold/10 hover:border-gold/30 transition-all duration-500 group"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="mb-3 sm:mb-4">
                    <IconComp size={20} className="sm:w-6 sm:h-6 text-gold/60 group-hover:text-gold transition-colors duration-300" />
                  </div>
                  <h3 className="font-display text-xs sm:text-sm tracking-[0.1em] uppercase text-white mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted font-mono tracking-wider">
                    {feature.subtitle}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ==================== CTA / ENTER THE VOID ==================== */}
      <section className="relative py-16 sm:py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.05)_0%,_transparent_70%)]" />
        <div className="page-container relative z-10 text-center">
          <p className="label-gold mb-4 sm:mb-6">The Journey Continues</p>

          <h2 className="heading-section text-white mb-4 sm:mb-6">
            READY TO <span className="text-gradient-gold">CROSS?</span>
          </h2>

          <p className="text-muted text-sm sm:text-base max-w-xl mx-auto mb-8 sm:mb-10">
            Each artifact is a key. Each purchase is a crossing. 
            The next arc opens when you stop counting.
          </p>

          <Link to="/products"
            className="btn-primary inline-flex items-center gap-2"
          >
            ENTER THE SHOP
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}