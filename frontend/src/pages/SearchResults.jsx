import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, ArrowRight, Sparkles } from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(0)
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

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">

      {/* Header bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-10 shadow-sm">
        <div className="page-container py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
              <Search size={16} className="text-[var(--color-primary)]" />
            </div>
            <h1 className="text-lg font-bold text-[var(--color-text)]">
              Results for <span className="text-[var(--color-primary)]">"{q}"</span>
              <span className="text-sm font-normal text-[var(--color-muted)] ml-2">
                {!loading && `(${count} found)`}
              </span>
            </h1>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-gradient-to-r from-[var(--color-bg-alt)] via-[var(--color-border-light)] to-[var(--color-bg-alt)] bg-[length:200%_100%] animate-shimmer"
                style={{ aspectRatio: '3/4' }}
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center mx-auto mb-5">
              <Search size={28} className="text-[var(--color-muted)]" />
            </div>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">
              No Results
            </p>
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">
              No results for "{q}"
            </h2>
            <p className="text-sm text-[var(--color-muted)] mb-8 max-w-sm mx-auto">
              Try different keywords or browse our full collection to find what you're looking for.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-light)] text-[var(--color-text-inverse)] rounded-xl text-sm font-semibold transition-all duration-300 px-6 py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Browse All Products <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {products.map((p, i) => (
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
      `}</style>
    </div>
  )
}