import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, Sparkles } from 'lucide-react'

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
    <div className="bg-[#FAFAF8]">
      {/* Hero Section */}
      <section className="bg-[#F5F2EE] text-[#0D0D0D]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 xl:py-20">
          <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6 animate-[fadeIn_0.5s_ease]">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/30 rounded-full">
              <Sparkles size={14} className="sm:w-4 sm:h-4 text-[#C8A96E]" />
              <span className="text-xs sm:text-sm font-medium">Premium Shopping Experience</span>
            </div>
            
            <h1 className="font-[Playfair_Display] text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              Discover Amazing Deals
            </h1>
            
            <p className="text-sm sm:text-base lg:text-lg text-[#3A3A3A] max-w-2xl px-2 sm:px-0">
              Shop thousands of hand-picked products at unbeatable prices. Fast shipping, secure payment, and easy returns guaranteed.
            </p>
            
            <Link to="/products"
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-white text-[#0D0D0D] rounded-xl sm:rounded-2xl font-bold hover:shadow-[0_12px_40px_rgba(13,13,13,0.12)] transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base">
              Explore Collection
              <ArrowRight size={16} className="sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </section>
     

      {/* Treasure Hunt Promo Banner */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Link to="/treasure-hunt" 
              className="block relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white p-4 sm:p-6 lg:p-8 hover:shadow-xl transition-all hover:scale-[1.01]">
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 lg:gap-6">
            <div className="text-3xl sm:text-4xl lg:text-5xl">🗺️</div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">
                🏴‍☠️ Treasure Hunt is LIVE!
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-white/90">
                Buy any T-Shirt → Collect 12 Mystery Maps → Win ₹1,00,000!
              </p>
              <p className="text-[10px] sm:text-xs text-white/70 mt-1">
                Collect 3+ maps for instant ₹300 rewards
              </p>
            </div>
            <div className="flex-shrink-0 mt-2 sm:mt-0">
              <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white/20 backdrop-blur rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm">
                Start Hunting
                <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              </span>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </Link>
      </section>

      {/* Trust Badges Section */}
      <section className="bg-[#F5F2EE] border-b border-[#E8E4DE] py-6 sm:py-8 lg:py-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[
              {
                icon: Truck,
                title: 'Free Delivery',
                subtitle: 'Orders above ₹999',
              },
              {
                icon: Shield,
                title: 'Secure Payment',
                subtitle: '100% safe & secure',
              },
              {
                icon: RefreshCw,
                title: 'Easy Returns',
                subtitle: '30-day return policy',
              },
              {
                icon: Headphones,
                title: '24/7 Support',
                subtitle: 'Always here to help',
              },
            ].map((feature, idx) => {
              const IconComp = feature.icon
              return (
                <div
                  key={feature.title}
                  className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 rounded-xl bg-white border border-[#E8E4DE] hover:shadow-md transition-all duration-300 animate-[fadeUp_0.5s_ease_forwards]"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="shrink-0 p-1.5 sm:p-2 lg:p-3 rounded-lg bg-[#F2E8D5]">
                    <IconComp size={20} className="sm:w-6 sm:h-6 text-[#C8A96E]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#0D0D0D] text-xs sm:text-sm lg:text-base truncate">{feature.title}</p>
                    <p className="text-[10px] sm:text-xs lg:text-sm text-[#8A8A8A] truncate">{feature.subtitle}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 xl:py-20">
          <div className="mb-6 sm:mb-8 lg:mb-12 animate-[fadeUp_0.5s_ease]">
            <h2 className="font-[Playfair_Display] text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#0D0D0D] mb-1.5 sm:mb-2">
              Shop by Category
            </h2>
            <p className="text-[#8A8A8A] text-xs sm:text-sm lg:text-base">
              Browse our curated collections
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
            {categories.map((cat, idx) => (
              <Link
                key={cat.id}
                to={`/products?category_slug=${cat.slug}`}
                className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 lg:p-6 bg-white rounded-xl sm:rounded-2xl border-2 border-[#E8E4DE] hover:border-[#C8A96E] hover:shadow-lg transition-all duration-300 hover:scale-105 group animate-[fadeUp_0.5s_ease_forwards]"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-[#F2E8D5] rounded-lg flex items-center justify-center text-lg sm:text-xl">
                    📦
                  </div>
                )}
                <span className="text-[10px] sm:text-xs lg:text-sm font-bold text-[#0D0D0D] text-center line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featured.length > 0 && (
        <section className="bg-[#F5F2EE] py-8 sm:py-12 lg:py-16 xl:py-20 border-b border-[#E8E4DE]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 lg:mb-12 animate-[fadeUp_0.5s_ease]">
              <div>
                <h2 className="font-[Playfair_Display] text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#0D0D0D]">
                  Featured Products
                </h2>
                <p className="text-[#8A8A8A] text-xs sm:text-sm mt-1">
                  Handpicked for you
                </p>
              </div>
              <Link to="/products?is_featured=true"
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-[#C8A96E] font-bold hover:gap-3 transition-all duration-300 text-xs sm:text-sm lg:text-base">
                View all
                <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl sm:rounded-2xl aspect-square animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                {featured.map((p, idx) => (
                  <div key={p.id} className="animate-[fadeUp_0.5s_ease_forwards]" style={{ animationDelay: `${idx * 40}ms` }}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 xl:py-20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 lg:mb-12 animate-[fadeUp_0.5s_ease]">
            <div>
              <h2 className="font-[Playfair_Display] text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#0D0D0D]">
                New Arrivals
              </h2>
              <p className="text-[#8A8A8A] text-xs sm:text-sm mt-1">
                Latest products added
              </p>
            </div>
            <Link to="/products?ordering=-created_at"
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-[#C8A96E] font-bold hover:gap-3 transition-all duration-300 text-xs sm:text-sm lg:text-base">
              View all
              <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {newArrivals.map((p, idx) => (
              <div key={p.id} className="animate-[fadeUp_0.5s_ease_forwards]" style={{ animationDelay: `${idx * 40}ms` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-[#F5F2EE] text-[#0D0D0D] py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-6 animate-[fadeUp_0.5s_ease]">
          <h2 className="font-[Playfair_Display] text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold">
            Ready to Shop?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-[#3A3A3A] max-w-xl mx-auto px-2 sm:px-0">
            Browse our complete collection and find exactly what you're looking for.
          </p>
          <Link to="/products"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-white text-[#0D0D0D] rounded-xl sm:rounded-2xl font-bold hover:shadow-[0_12px_40px_rgba(13,13,13,0.12)] transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base">
            Start Shopping
            <ArrowRight size={16} className="sm:w-5 sm:h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}