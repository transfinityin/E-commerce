import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

const SORT_OPTIONS = [
  { label: 'Featured', value: '-is_featured' },
  { label: 'Latest', value: '-created_at' },
  { label: 'Price: Low–High', value: 'price' },
  { label: 'Price: High–Low', value: '-price' },
]

export default function ProductList() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState('-is_featured')
  const [search, setSearch] = useState(searchParams.get('q') || '')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { ordering }
      if (search) params.search = search
      const { data } = await api.get('/products/', { params })
      const list = data.results || data || []
      setProducts(list)
      setCount(data.count ?? list.length)
    } catch {
      setProducts([])
      setCount(0)
    } finally {
      setLoading(false)
    }
  }, [ordering, search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return (
    <div className="min-h-screen bg-[#F4F4F2] pb-20">
      <div className="mx-auto max-w-[1380px] px-5 pt-10 md:px-8 md:pt-14">
        <p className="text-[10px] font-medium tracking-[0.35em] text-neutral-500 uppercase">
          Shop
        </p>
        <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-sans text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[0.04em] text-neutral-900 uppercase">
              The Drop
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              {count} {count === 1 ? 'piece' : 'pieces'} · oversized tees
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="h-10 w-full min-w-[180px] border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-900 md:w-56"
            />
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="h-10 border border-neutral-300 bg-white px-3 text-[11px] tracking-[0.14em] text-neutral-800 uppercase outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center text-neutral-500">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <p className="mt-20 text-center text-sm text-neutral-500">
            No products yet. Check back soon.
          </p>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
