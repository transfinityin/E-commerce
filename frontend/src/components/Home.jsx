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
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col items-center text-center space-y-6 animate-[fadeIn_0.5s_ease]">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/30 rounded-full">
              <Sparkles size={16} className="text-[#C8A96E]" />
              <span className="text-sm font-medium">Premium Shopping Experience</span>
            </div>
            
            <h1 className="font-[Playfair_Display] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Discover Amazing Deals
            </h1>
            
            <p className="text-base sm:text-lg text-[#3A3A3A] max-w-2xl">
              Shop thousands of hand-picked products at unbeatable prices. Fast shipping, secure payment, and easy returns guaranteed.
            </p>
            
            <Link to="/products"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#0D0D0D] rounded-2xl font-bold hover:shadow-[0_12px_40px_rgba(13,13,13,0.12)] transition-all duration-300 hover:scale-105 active:scale-95">
              Explore Collection
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
     

      {/* Treasure Hunt Promo Banner */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/treasure-hunt" 
              className="block relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white p-6 sm:p-8 hover:shadow-xl transition-all hover:scale-[1.01]">
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="text-4xl sm:text-5xl">🗺️</div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-1">
                🏴‍☠️ Treasure Hunt is LIVE!
              </h3>
              <p className="text-sm sm:text-base text-white/90">
                Buy any T-Shirt → Collect 12 Mystery Maps → Win ₹1,00,000!
              </p>
              <p className="text-xs text-white/70 mt-1">
                Collect 3+ maps for instant ₹300 rewards
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur rounded-xl font-bold text-sm">
                Start Hunting
                <ArrowRight size={16} />
              </span>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </Link>
      </section>

      {/* Trust Badges Section */}
      <section className="bg-[#F5F2EE] border-b border-[#E8E4DE] py-8 sm:py-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                  className="flex items-center gap-3 sm:gap-4 p-4 rounded-xl bg-white border border-[#E8E4DE] hover:shadow-md transition-all duration-300 animate-[fadeUp_0.5s_ease_forwards]"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="shrink-0 p-2 sm:p-3 rounded-lg bg-[#F2E8D5]">
                    <IconComp size={24} className="text-[#C8A96E]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#0D0D0D] text-sm sm:text-base">{feature.title}</p>
                    <p className="text-xs sm:text-sm text-[#8A8A8A]">{feature.subtitle}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="mb-8 sm:mb-12 animate-[fadeUp_0.5s_ease]">
            <h2 className="font-[Playfair_Display] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0D0D0D] mb-2">
              Shop by Category
            </h2>
            <p className="text-[#8A8A8A] text-sm sm:text-base">
              Browse our curated collections
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat, idx) => (
              <Link
                key={cat.id}
                to={`/products?category_slug=${cat.slug}`}
                className="flex flex-col items-center justify-center gap-2 p-4 sm:p-6 bg-white rounded-2xl border-2 border-[#E8E4DE] hover:border-[#C8A96E] hover:shadow-lg transition-all duration-300 hover:scale-105 group animate-[fadeUp_0.5s_ease_forwards]"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#F2E8D5] rounded-lg flex items-center justify-center text-xl">
                    📦
                  </div>
                )}
                <span className="text-xs sm:text-sm font-bold text-[#0D0D0D] text-center line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featured.length > 0 && (
        <section className="bg-[#F5F2EE] py-12 sm:py-16 lg:py-20 border-b border-[#E8E4DE]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-12 animate-[fadeUp_0.5s_ease]">
              <div>
                <h2 className="font-[Playfair_Display] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0D0D0D]">
                  Featured Products
                </h2>
                <p className="text-[#8A8A8A] text-sm mt-1">
                  Handpicked for you
                </p>
              </div>
              <Link to="/products?is_featured=true"
                    className="inline-flex items-center gap-2 px-4 py-2 text-[#C8A96E] font-bold hover:gap-3 transition-all duration-300 text-sm sm:text-base">
                View all
                <ArrowRight size={18} />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl aspect-square animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-12 animate-[fadeUp_0.5s_ease]">
            <div>
              <h2 className="font-[Playfair_Display] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0D0D0D]">
                New Arrivals
              </h2>
              <p className="text-[#8A8A8A] text-sm mt-1">
                Latest products added
              </p>
            </div>
            <Link to="/products?ordering=-created_at"
                  className="inline-flex items-center gap-2 px-4 py-2 text-[#C8A96E] font-bold hover:gap-3 transition-all duration-300 text-sm sm:text-base">
              View all
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {newArrivals.map((p, idx) => (
              <div key={p.id} className="animate-[fadeUp_0.5s_ease_forwards]" style={{ animationDelay: `${idx * 40}ms` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-[#F5F2EE] text-[#0D0D0D] py-12 sm:py-16 lg:py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 animate-[fadeUp_0.5s_ease]">
          <h2 className="font-[Playfair_Display] text-2xl sm:text-3xl lg:text-4xl font-bold">
            Ready to Shop?
          </h2>
          <p className="text-base sm:text-lg text-[#3A3A3A] max-w-xl mx-auto">
            Browse our complete collection and find exactly what you&apos;re looking for.
          </p>
          <Link to="/products"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#0D0D0D] rounded-2xl font-bold hover:shadow-[0_12px_40px_rgba(13,13,13,0.12)] transition-all duration-300 hover:scale-105 active:scale-95">
            Start Shopping
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}