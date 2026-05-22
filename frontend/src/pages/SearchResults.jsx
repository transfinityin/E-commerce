import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, ArrowRight, Sparkles, SlidersHorizontal } from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(0)
  const [sortBy, setSortBy] = useState('relevance')
  const q = searchParams.get('q') || ''

  useEffect(() => {
    if (!q.trim()) return
    setLoading(true)

    Promise.all([
      api.get(`/products/search/?q=${encodeURIComponent(q)}`).catch(() => ({ data: [] })),
      api.get(`/products/?search=${encodeURIComponent(q)}`).catch(() => ({ data: [] })),
    ]).then(([r1, r2]) => {
      const all = [
        ...(r1.data.results || r1.data || []),
        ...(r2.data.results || r2.data || []),
      ]
      const unique = Array.from(new Map(all.map(p => [p.id, p])).values())
      setProducts(unique)
      setCount(unique.length)
    }).finally(() => setLoading(false))
  }, [q])

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price_low') return (a.effective_price || a.price) - (b.effective_price || b.price)
    if (sortBy === 'price_high') return (b.effective_price || b.price) - (a.effective_price || a.price)
    if (sortBy === 'rating') return (b.rating_avg || 0) - (a.rating_avg || 0)
    return 0
  })

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">

      {/* Header bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-10 shadow-sm">
        <div className="page-container py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center shrink-0">
              <Search size={14} className="sm:w-4 sm:h-4 text-[var(--color-primary)]" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-lg font-bold text-[var(--color-text)] truncate">
                Results for <span className="text-[var(--color-primary)]">"{q}"</span>
              </h1>
              <span className="text-[10px] sm:text-sm font-normal text-[var(--color-muted)]">
                {!loading && `(${count} found)`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sort Bar - Mobile */}
      {products.length > 0 && (
        <div className="page-container py-2 sm:py-3 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-xs text-[var(--color-muted)] font-medium">Sort by:</span>
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide">
              {[
                { label: 'Relevance', value: 'relevance' },
                { label: 'Price: Low', value: 'price_low' },
                { label: 'Price: High', value: 'price_high' },
                { label: 'Top Rated', value: 'rating' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`text-[10px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                    sortBy === opt.value
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="page-container py-4 sm:py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-gradient-to-r from-[var(--color-bg-alt)] via-[var(--color-border-light)] to-[var(--color-bg-alt)] bg-[length:200%_100%] animate-shimmer"
                style={{ aspectRatio: '3/4' }}
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 sm:py-20 px-4 sm:px-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center mx-auto mb-4 sm:mb-5">
              <Search size={24} className="sm:w-7 sm:h-7 text-[var(--color-muted)]" />
            </div>
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">
              No Results
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text)] mb-2">
              No results for "{q}"
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] mb-6 sm:mb-8 max-w-sm mx-auto">
              Try different keywords or browse our full collection to find what you're looking for.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-light)] text-[var(--color-text-inverse)] rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 px-5 sm:px-6 py-2.5 sm:py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Browse All Products <ArrowRight size={14} className="sm:w-4 sm:h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
            {sortedProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}