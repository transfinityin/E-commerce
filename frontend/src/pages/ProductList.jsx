import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronDown, Loader2, Search } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import api from '../services/api'
import ProductCard from '../components/ProductCard'
import { cn } from '@/lib/utils'

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
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef(null)
  const reduceMotion = useReducedMotion()

  const activeSort =
    SORT_OPTIONS.find((o) => o.value === ordering) || SORT_OPTIONS[0]

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

  useEffect(() => {
    if (!sortOpen) return
    const onPointer = (e) => {
      if (!sortRef.current?.contains(e.target)) setSortOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setSortOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [sortOpen])

  return (
    <div className="min-h-screen bg-[#EFEFEF] pb-16 text-neutral-900 md:pb-20">
      <div className="mx-auto max-w-[1180px] px-4 pt-4 sm:px-6 sm:pt-5 md:px-8 md:pt-6">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-400 sm:mb-8">
          <Link to="/" className="transition-colors hover:text-neutral-700">
            Home
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-neutral-700">Shop</span>
        </nav>

        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="text-[10px] font-medium tracking-[0.28em] text-neutral-500 uppercase">
              Collection
            </p>
            <h1 className="mt-2 font-sans text-[clamp(1.55rem,2.8vw,2.25rem)] font-semibold tracking-[0.03em] text-neutral-900 uppercase leading-[1.15]">
              The Drop
            </h1>
            <p className="mt-2 text-[13px] text-neutral-500">
              {count} {count === 1 ? 'piece' : 'pieces'}
              <span className="mx-1.5 text-neutral-300">·</span>
              Oversized tees
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <label className="relative block w-full sm:w-[240px]">
              <Search
                className="pointer-events-none absolute top-1/2 left-4 z-[1] size-3.5 -translate-y-1/2 text-neutral-400"
                strokeWidth={1.5}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search the drop"
                className="tf-shop-pill tf-shop-pill--input"
              />
            </label>

            <div ref={sortRef} className="relative w-full sm:w-[200px]">
              <button
                type="button"
                onClick={() => setSortOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={sortOpen}
                className="tf-shop-pill tf-shop-pill--trigger"
              >
                <span className="truncate">{activeSort.label}</span>
                <ChevronDown
                  className={cn(
                    'size-3.5 shrink-0 text-neutral-400 transition-transform duration-300',
                    sortOpen && 'rotate-180',
                  )}
                  strokeWidth={1.5}
                />
              </button>

              <AnimatePresence>
                {sortOpen && (
                  <motion.ul
                    role="listbox"
                    initial={reduceMotion ? false : { opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="tf-shop-menu absolute top-[calc(100%+8px)] right-0 left-0 z-30 overflow-hidden py-1.5"
                  >
                    {SORT_OPTIONS.map((o) => {
                      const active = o.value === ordering
                      return (
                        <li key={o.value} role="option" aria-selected={active}>
                          <button
                            type="button"
                            onClick={() => {
                              setOrdering(o.value)
                              setSortOpen(false)
                            }}
                            className={cn(
                              'flex w-full items-center px-4 py-2.5 text-left text-[12px] tracking-[0.04em] transition-colors',
                              active
                                ? 'bg-neutral-950 text-white'
                                : 'bg-transparent text-neutral-700 hover:bg-neutral-100',
                            )}
                          >
                            {o.label}
                          </button>
                        </li>
                      )
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.header>

        {loading ? (
          <div className="flex min-h-[42vh] items-center justify-center text-neutral-400">
            <Loader2 className="size-6 animate-spin" strokeWidth={1.5} />
          </div>
        ) : products.length === 0 ? (
          <p className="mt-24 text-center text-sm text-neutral-500">
            No products yet. Check back soon.
          </p>
        ) : (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 grid grid-cols-2 gap-4 sm:mt-12 sm:gap-5 md:grid-cols-3 lg:grid-cols-3 lg:gap-7 xl:grid-cols-3"
          >
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
