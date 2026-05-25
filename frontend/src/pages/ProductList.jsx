import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Grid3X3,
  LayoutGrid,
  LayoutList,
  Search,
  Loader2,
} from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹1000', min: 500, max: 1000 },
  { label: '₹1000 – ₹2000', min: 1000, max: 2000 },
  { label: 'Above ₹2000', min: 2000, max: '' },
]

const SORT_OPTIONS = [
  { label: 'Featured', value: '-is_featured' },
  { label: 'Latest', value: '-created_at' },
  { label: 'Price: Low–High', value: 'price' },
  { label: 'Price: High–Low', value: '-price' },
  { label: 'Top Rated', value: '-rating_avg' },
]

const EXTRA_FILTERS = [
  { title: 'SIZE', options: ['S', 'M', 'L', 'XL', 'XXL'] },
  { title: 'COLOR', options: ['Lilac', 'Navy', 'Royal Blue', 'Sky Blue', 'Aqua Blue'] },
  { title: 'FABRIC', options: ['Textured', '100% Cotton'] },
  { title: 'CHARACTER', options: ['Spiderman', 'Thor', 'Marvel', 'Disney'] },
  { title: 'PATTERN', options: ['Printed', 'Textured', 'Puff Print'] },
  { title: 'PATTERN COVERAGE', options: ['Back', 'Front', 'All Over'] },
  { title: 'PRODUCT TYPE', options: ['T-shirt', 'Oversized Tshirt'] },
]

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gold/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center bg-transparent border-none cursor-pointer text-white hover:text-gold transition-colors py-4"
      >
        <span className="text-xs font-mono tracking-[0.18em] uppercase">
          {title}
        </span>

        {open ? (
          <ChevronUp size={15} className="text-gold" />
        ) : (
          <ChevronDown size={15} className="text-muted" />
        )}
      </button>

      {open && <div className="animate-fadeIn pb-4">{children}</div>}
    </div>
  )
}

function OptionButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-center justify-between gap-3 border px-3 py-2.5 transition-all duration-300 ${
        active
          ? 'bg-gold/10 border-gold/45 text-gold'
          : 'bg-black border-gold/10 text-muted hover:text-white hover:border-gold/30'
      }`}
    >
      <span className="text-xs font-mono tracking-wider leading-relaxed">
        {children}
      </span>

      <span
        className={`w-3.5 h-3.5 border shrink-0 flex items-center justify-center ${
          active ? 'border-gold bg-gold' : 'border-gold/25 bg-black'
        }`}
      >
        {active && <span className="w-1.5 h-1.5 bg-black block" />}
      </span>
    </button>
  )
}

function FilterContent({
  categories,
  filters,
  updateFilter,
  applyPriceRange,
  extraFilters,
  toggleExtraFilter,
}) {
  return (
    <div className="flex flex-col">
      <FilterSection title="Category">
        <div className="flex flex-col gap-2">
          <OptionButton
            active={filters.category === ''}
            onClick={() => updateFilter('category', '')}
          >
            All Categories
          </OptionButton>

          {categories.map((category) => (
            <OptionButton
              key={category.id}
              active={filters.category === category.slug}
              onClick={() => updateFilter('category', category.slug)}
            >
              {category.name}
            </OptionButton>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="flex flex-col gap-2">
          {PRICE_RANGES.map((range) => (
            <OptionButton
              key={range.label}
              active={
                String(filters.min_price) === String(range.min) &&
                String(filters.max_price) === String(range.max)
              }
              onClick={() => applyPriceRange(range)}
            >
              {range.label}
            </OptionButton>
          ))}

          <div className="grid grid-cols-2 gap-2 mt-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.min_price}
              onChange={(event) => updateFilter('min_price', event.target.value)}
              className="bg-black border border-gold/15 text-white placeholder:text-muted/50 text-xs font-mono tracking-wider outline-none px-3 py-3 focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)]"
            />

            <input
              type="number"
              placeholder="Max"
              value={filters.max_price}
              onChange={(event) => updateFilter('max_price', event.target.value)}
              className="bg-black border border-gold/15 text-white placeholder:text-muted/50 text-xs font-mono tracking-wider outline-none px-3 py-3 focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)]"
            />
          </div>
        </div>
      </FilterSection>

      {EXTRA_FILTERS.map((section) => (
        <FilterSection key={section.title} title={section.title} defaultOpen={false}>
          <div className="flex flex-col gap-2">
            {section.options.map((option) => {
              const key = `${section.title}-${option}`

              return (
                <OptionButton
                  key={option}
                  active={Boolean(extraFilters[key])}
                  onClick={() => toggleExtraFilter(section.title, option)}
                >
                  {option}
                </OptionButton>
              )
            })}
          </div>
        </FilterSection>
      ))}

      <FilterSection title="Availability">
        <OptionButton
          active={filters.in_stock === 'true'}
          onClick={() =>
            updateFilter('in_stock', filters.in_stock === 'true' ? '' : 'true')
          }
        >
          In Stock Only
        </OptionButton>
      </FilterSection>
    </div>
  )
}

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)

  const [gridCols, setGridCols] = useState(3)
  const [sortOpen, setSortOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const filterRef = useRef(null)
  const sortRef = useRef(null)
  const [searchParams] = useSearchParams()

  const [filters, setFilters] = useState({
    category: searchParams.get('category_slug') || searchParams.get('category') || '',
    min_price: '',
    max_price: '',
    ordering: searchParams.get('ordering') || '-created_at',
    in_stock: '',
    search: searchParams.get('q') || '',
  })

  const [extraFilters, setExtraFilters] = useState({})

  const activeSort = useMemo(() => {
    return SORT_OPTIONS.find((option) => option.value === filters.ordering)?.label || 'Latest'
  }, [filters.ordering])

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.min_price || filters.max_price ? 1 : 0) +
    (filters.in_stock ? 1 : 0) +
    Object.values(extraFilters).filter(Boolean).length

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) setGridCols(4)
      else if (window.innerWidth >= 768) setGridCols(3)
      else setGridCols(2)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false)
      }

      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    let mounted = true

    api
      .get('/products/categories/')
      .then((res) => {
        if (mounted) setCategories(res.data.results || res.data || [])
      })
      .catch(() => {
        if (mounted) setCategories([])
      })

    return () => {
      mounted = false
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)

    try {
      const params = {}

      if (filters.category) params.category_slug = filters.category
      if (filters.min_price) params.min_price = filters.min_price
      if (filters.max_price) params.max_price = filters.max_price
      if (filters.ordering) params.ordering = filters.ordering
      if (filters.in_stock) params.in_stock = filters.in_stock
      if (filters.search) params.search = filters.search

      const { data } = await api.get('/products/', { params })
      const list = data.results || data || []

      setProducts(list)
      setCount(data.count || list.length)
    } catch (error) {
      console.error(error)
      setProducts([])
      setCount(0)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      min_price: '',
      max_price: '',
      ordering: '-created_at',
      in_stock: '',
      search: '',
    })

    setExtraFilters({})
    setFilterOpen(false)
    setMobileFilterOpen(false)
  }

  const applyPriceRange = (range) => {
    setFilters((prev) => ({
      ...prev,
      min_price: range.min,
      max_price: range.max,
    }))
  }

  const applySort = (option) => {
    updateFilter('ordering', option.value)
    setSortOpen(false)
  }

  const toggleExtraFilter = (section, option) => {
    setExtraFilters((prev) => {
      const key = `${section}-${option}`

      return {
        ...prev,
        [key]: !prev[key],
      }
    })
  }

  const gridClass =
    gridCols === 2
      ? 'grid-cols-2'
      : gridCols === 3
        ? 'grid-cols-2 sm:grid-cols-3'
        : 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4'

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] pb-14 overflow-x-hidden">
      {/* Header */}
      <section className="border-b border-gold/10 bg-[#050505]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <p className="label-gold mb-3">Artifact Archive</p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl text-white tracking-[0.12em] leading-tight">
                SHOP <span className="text-gradient-gold">ALL</span>
              </h1>

              <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mt-3 max-w-2xl">
                Explore all Transfinity artifacts. Filter by category, price, stock,
                and arc-specific traits.
              </p>
            </div>

            <div className="relative w-full lg:w-[320px]">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />

              <input
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
                placeholder="Search artifacts..."
                className="w-full bg-black border border-gold/15 text-white placeholder:text-muted/50 text-sm font-mono tracking-wider outline-none pl-10 pr-4 py-3.5 focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="sticky top-[76px] sm:top-[88px] lg:top-[96px] z-30 border-b border-gold/10 bg-black/90 backdrop-blur-md">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Desktop filter */}
              <div className="relative hidden md:block" ref={filterRef}>
                <button
                  type="button"
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="inline-flex items-center gap-2 bg-gold text-black text-xs font-semibold tracking-wider uppercase px-4 py-3 hover:bg-gold-light transition-all"
                >
                  <SlidersHorizontal size={15} />
                  Filters

                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 bg-black text-gold text-[10px] flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}

                  <ChevronDown
                    size={14}
                    className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {filterOpen && (
                  <div className="absolute left-0 top-full mt-2 w-[340px] max-h-[72vh] overflow-y-auto bg-[#0A0A0A] border border-gold/20 shadow-[0_20px_80px_rgba(0,0,0,0.65)] z-50 p-5">
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal size={18} className="text-gold" />
                        <h2 className="font-display text-lg text-white tracking-[0.12em]">
                          FILTERS
                        </h2>
                      </div>

                      <div className="flex items-center gap-3">
                        {activeFilterCount > 0 && (
                          <button
                            type="button"
                            onClick={clearFilters}
                            className="text-[10px] font-mono tracking-wider uppercase text-red-400 hover:text-red-300 bg-transparent border-none cursor-pointer"
                          >
                            Clear
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setFilterOpen(false)}
                          className="w-8 h-8 bg-black border border-gold/15 flex items-center justify-center text-gold hover:bg-gold/10 transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    <FilterContent
                      categories={categories}
                      filters={filters}
                      updateFilter={updateFilter}
                      applyPriceRange={applyPriceRange}
                      extraFilters={extraFilters}
                      toggleExtraFilter={toggleExtraFilter}
                    />
                  </div>
                )}
              </div>

              {/* Mobile filter */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="md:hidden inline-flex items-center gap-2 bg-gold text-black text-xs font-semibold tracking-wider uppercase px-4 py-3"
              >
                <SlidersHorizontal size={15} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-black text-gold text-[10px] flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <span className="text-[10px] sm:text-xs text-muted font-mono tracking-wider uppercase truncate">
                {count} Products
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Grid toggle */}
              <div className="hidden sm:flex border border-gold/15 bg-[#0A0A0A] overflow-hidden">
                {[
                  { n: 2, icon: LayoutList },
                  { n: 3, icon: Grid3X3 },
                  { n: 4, icon: LayoutGrid },
                ].map(({ n, icon: Icon }) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setGridCols(n)}
                    className={`w-10 h-10 flex items-center justify-center transition-all ${
                      gridCols === n
                        ? 'bg-gold text-black'
                        : 'bg-transparent text-muted hover:text-gold hover:bg-gold/5'
                    }`}
                    aria-label={`Grid ${n}`}
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="relative" ref={sortRef}>
                <button
                  type="button"
                  onClick={() => setSortOpen(!sortOpen)}
                  className="inline-flex items-center gap-2 border border-gold/15 bg-[#0A0A0A] text-white text-[10px] sm:text-xs font-mono tracking-wider uppercase px-3 sm:px-4 py-3 hover:border-gold/45 transition-all whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Sort By:</span> {activeSort}
                  <ChevronDown size={14} />
                </button>

                {sortOpen && (
                  <div className="absolute right-0 top-full mt-2 min-w-[210px] bg-[#0A0A0A] border border-gold/20 shadow-[0_20px_80px_rgba(0,0,0,0.65)] z-50 py-2">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => applySort(option)}
                        className={`block w-full text-left border-none cursor-pointer text-xs font-mono tracking-wider px-4 py-3 transition-all ${
                          filters.ordering === option.value
                            ? 'bg-gold/10 text-gold'
                            : 'bg-transparent text-muted hover:bg-gold/5 hover:text-white'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className={`grid ${gridClass} gap-3 sm:gap-5 lg:gap-6`}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="flex flex-col gap-3">
                <div className="skeleton-dark aspect-product border border-gold/10" />
                <div className="h-3 skeleton-dark w-4/5" />
                <div className="h-4 skeleton-dark w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 sm:py-24 px-4">
            <div className="w-16 h-16 border border-gold/20 bg-[#0A0A0A] flex items-center justify-center mx-auto mb-5">
              <Search size={28} className="text-gold/60" />
            </div>

            <p className="label-gold mb-3">No Signal</p>

            <h2 className="font-display text-xl sm:text-2xl text-white tracking-[0.12em] mb-3">
              NO PRODUCTS <span className="text-gradient-gold">FOUND</span>
            </h2>

            <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mb-6">
              Try adjusting your filters or search query.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              CLEAR FILTERS
            </button>
          </div>
        ) : (
          <div className={`grid ${gridClass} gap-3 sm:gap-5 lg:gap-6`}>
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </main>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileFilterOpen(false)}
          />

          <div className="absolute right-0 top-0 bottom-0 w-[88%] max-w-sm bg-[#0A0A0A] border-l border-gold/20 p-5 overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-gold" />
                <h2 className="font-display text-lg text-white tracking-[0.12em]">
                  FILTERS
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-9 h-9 bg-black border border-gold/15 flex items-center justify-center text-gold"
              >
                <X size={17} />
              </button>
            </div>

            <FilterContent
              categories={categories}
              filters={filters}
              updateFilter={updateFilter}
              applyPriceRange={applyPriceRange}
              extraFilters={extraFilters}
              toggleExtraFilter={toggleExtraFilter}
            />

            <div className="sticky bottom-0 bg-[#0A0A0A] pt-4 mt-4 border-t border-gold/10 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={clearFilters}
                className="btn-outline !px-4 !py-3"
              >
                CLEAR
              </button>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="btn-primary !px-4 !py-3"
              >
                APPLY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}