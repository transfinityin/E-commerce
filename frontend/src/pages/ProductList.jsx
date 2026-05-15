import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

const ACCENT = '#C8A96E'

const PRICE_RANGES = [
  { label: 'Under ₹500',       min: 0,    max: 500 },
  { label: '₹500 – ₹1000',    min: 500,  max: 1000 },
  { label: '₹1000 – ₹2000',   min: 1000, max: 2000 },
  { label: 'Above ₹2000',      min: 2000, max: '' },
]

const SORT_OPTIONS = [
  { label: 'Featured',         value: '-is_featured' },
  { label: 'Latest',           value: '-created_at' },
  { label: 'Price: Low–High',  value: 'price' },
  { label: 'Price: High–Low',  value: '-price' },
  { label: 'Top Rated',        value: '-rating_avg' },
]

const EXTRA_FILTERS = [
  { title: 'SIZE',             options: ['S', 'M', 'L', 'XL', 'XXL'] },
  { title: 'COLOR',            options: ['Lilac', 'Navy', 'Royal Blue', 'Sky Blue', 'Aqua Blue'] },
  { title: 'FABRIC',           options: ['Textured', '100% Cotton'] },
  { title: 'CHARACTER',        options: ['Spiderman', 'Thor', 'Marvel', 'Disney'] },
  { title: 'PATTERN',          options: ['Printed', 'Textured', 'Puff Print'] },
  { title: 'PATTERN COVERAGE', options: ['Back', 'Front', 'All Over'] },
  { title: 'PRODUCT TYPE',     options: ['T-shirt', 'Oversized Tshirt'] },
]

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center bg-transparent border-none cursor-pointer text-sm font-semibold text-slate-900 hover:text-amber-600 transition-colors"
        style={{ padding: '16px 0' }}
      >
        <span className="text-xs font-bold tracking-wider uppercase">{title}</span>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && (
        <div className="animate-[fadeIn_0.2s_ease]" style={{ paddingBottom: '16px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

export default function ProductList() {
  const [products,    setProducts]    = useState([])
  const [categories,  setCategories]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [count,       setCount]       = useState(0)
  const [showFilter,  setShowFilter]  = useState(true)
  const [gridCols,    setGridCols]    = useState(3)
  const [sortOpen,    setSortOpen]    = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [searchParams] = useSearchParams()

  const [filters, setFilters] = useState({
    category: searchParams.get('category_slug') || searchParams.get('category') || '',
    min_price: '',
    max_price: '',
    ordering:  searchParams.get('ordering') || '-created_at',
    in_stock:  '',
    search:    searchParams.get('q') || '',
  })

  const [extraFilters, setExtraFilters] = useState({})
  const [activeSort, setActiveSort] = useState('Latest')

  // ═══ FIX: Calculate selectedCats BEFORE activeFilterCount ═══
  const selectedCats = filters.category ? [filters.category] : []

  // ═══ FIX: Calculate activeFilterCount AFTER selectedCats ═══
  const activeFilterCount = selectedCats.length + 
    (filters.min_price || filters.max_price ? 1 : 0) + 
    (filters.in_stock ? 1 : 0) + 
    Object.values(extraFilters).filter(Boolean).length

  useEffect(() => {
    api.get('/products/categories/').then(r => setCategories(r.data.results || r.data))
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.category) params.category_slug = filters.category
      if (filters.min_price) params.min_price = filters.min_price
      if (filters.max_price) params.max_price = filters.max_price
      if (filters.ordering)  params.ordering  = filters.ordering
      if (filters.in_stock)  params.in_stock  = filters.in_stock
      if (filters.search)    params.search    = filters.search
      const { data } = await api.get('/products/', { params })
      setProducts(data.results || data)
      setCount(data.count || (data.results || data).length)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const updateFilter = (key, value) => setFilters(p => ({ ...p, [key]: value }))

  const clearFilters = () => {
    setFilters({
      category: '', min_price: '', max_price: '',
      ordering: '-created_at', in_stock: '', search: '',
    })
    setExtraFilters({})
  }

  const applyPriceRange = (range) => {
    setFilters(p => ({ ...p, min_price: range.min, max_price: range.max }))
  }

  const applySort = (opt) => {
    setActiveSort(opt.label)
    updateFilter('ordering', opt.value)
    setSortOpen(false)
  }

  // ✅ FIXED
const toggleExtraFilter = (section, option) => {
  setExtraFilters(prev => {
    const key = `${section}-${option}`
    return { ...prev, [key]: !prev[key] }
  })
}

  const gridClass = gridCols === 2 ? 'grid-cols-2' : gridCols === 3 ? 'grid-cols-3' : 'grid-cols-4'

  return (
    <div className="bg-white min-h-screen" style={{ paddingBottom: '64px' }}>

      {/* Mobile Filter Overlay */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div 
            className="absolute left-0 top-0 h-full bg-white shadow-2xl overflow-y-auto"
            style={{ width: '320px' }}
          >
            <div style={{ padding: '24px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <SlidersHorizontal size={20} style={{ color: ACCENT }} />
                  <h2 className="text-lg font-bold text-slate-900">Filters</h2>
                </div>
                <button 
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors border-none cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <FilterContent 
                categories={categories}
                filters={filters}
                updateFilter={updateFilter}
                applyPriceRange={applyPriceRange}
                extraFilters={extraFilters}
                toggleExtraFilter={toggleExtraFilter}
                clearFilters={clearFilters}
              />
              <div 
                className="sticky bottom-0 bg-white border-t border-slate-100"
                style={{ margin: '24px -24px 0', padding: '16px 24px 24px' }}
              >
                <button 
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors border-none cursor-pointer"
                  style={{ padding: '12px 0' }}
                >
                  Show Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div 
        className="border-b border-slate-100 bg-white sticky top-0 z-10"
        style={{ padding: '16px 24px' }}
      >
        <div className="flex items-center justify-between" style={{ gap: '16px' }}>
          <div className="flex items-center" style={{ gap: '16px' }}>
            {/* Mobile filter button */}
            <button 
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors border-none cursor-pointer"
              style={{ padding: '10px 16px', gap: '8px' }}
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span 
                  className="rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ width: '20px', height: '20px' }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Desktop: Show/Hide filter toggle */}
            <button 
              onClick={() => setShowFilter(!showFilter)} 
              className="hidden lg:flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg bg-white cursor-pointer text-xs font-semibold text-slate-900 transition-all hover:border-slate-900"
            >
              <SlidersHorizontal size={15} />
              {showFilter ? 'HIDE FILTERS' : 'SHOW FILTERS'}
            </button>
            
            <span className="text-xs text-slate-500 font-medium">
              {count} Products
            </span>
          </div>

          <div className="flex items-center" style={{ gap: '12px' }}>
            {/* Grid toggle */}
            <div className="hidden sm:flex border border-slate-200 rounded-lg overflow-hidden">
              {[2, 3, 4].map(n => (
                <button 
                  key={n} 
                  onClick={() => setGridCols(n)} 
                  className={`border-none cursor-pointer text-xs font-semibold transition-all ${gridCols === n ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:text-slate-900'}`}
                  style={{ padding: '10px 14px' }}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="relative">
              <button 
                onClick={() => setSortOpen(!sortOpen)} 
                className="flex items-center border border-slate-200 rounded-lg bg-white cursor-pointer text-xs font-semibold text-slate-900 whitespace-nowrap hover:border-slate-900"
                style={{ padding: '10px 16px', gap: '8px' }}
              >
                SORT BY: {activeSort}
                <ChevronDown size={14} />
              </button>
              {sortOpen && (
                <div 
                  className="absolute right-0 top-full bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden"
                  style={{ marginTop: '8px', minWidth: '192px', padding: '4px 0' }}
                >
                  {SORT_OPTIONS.map(opt => (
                    <button 
                      key={opt.value} 
                      onClick={() => applySort(opt)} 
                      className={`block w-full text-left border-none cursor-pointer text-xs transition-colors ${activeSort === opt.label ? 'bg-slate-100 font-bold text-slate-900' : 'bg-white font-normal text-slate-900'} hover:bg-slate-100`}
                      style={{ padding: '12px 16px' }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-80">

        {/* ═══ HOVER EXPAND SIDEBAR (Desktop) ═══ */}
        {showFilter && (
          <aside className="group relative flex-shrink-0 hidden lg:block z-30">
            
            {/* Collapsed Strip */}
            <div 
              className="h-screen bg-slate-900 sticky top-0 flex flex-col items-center transition-all duration-300 group-hover:opacity-0 group-hover:w-0 overflow-hidden"
              style={{ width: '56px', padding: '32px 0', gap: '16px' }}
            >
              <SlidersHorizontal size={22} style={{ color: ACCENT }} />
              <div className="flex-1 flex items-center justify-center">
                <span 
                  className="text-white/60 text-xs font-bold tracking-[0.2em] uppercase"
                  style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                >
                  Filters
                </span>
              </div>
              {activeFilterCount > 0 && (
                <span 
                  className="rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ width: '20px', height: '20px' }}
                >
                  {activeFilterCount}
                </span>
              )}
            </div>

            {/* Expanded Panel */}
            <div 
              className="absolute left-0 top-0 h-screen bg-white border-r border-slate-200 shadow-2xl -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out overflow-y-auto"
              style={{ width: '280px' }}
            >
              <div style={{ padding: '24px' }}>
                {/* Header */}
                <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
                  <div className="flex items-center" style={{ gap: '8px' }}>
                    <SlidersHorizontal size={20} style={{ color: ACCENT }} />
                    <h2 className="text-lg font-bold text-slate-900">Filters</h2>
                  </div>
                  {activeFilterCount > 0 && (
                    <button 
                      onClick={clearFilters}
                      className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors bg-transparent border-none cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
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
            </div>
          </aside>
        )}

        {/* Products */}
        <div className="flex-1" style={{ padding: '24px' }}>
          {loading ? (
            <div className={`grid ${gridClass} gap-5`}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col" style={{ gap: '12px' }}>
                  <div 
                    className="rounded-xl bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]"
                    style={{ aspectRatio: '3/4' }}
                  />
                  <div className="h-3.5 bg-slate-100 rounded w-4/5" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center" style={{ padding: '96px 20px' }}>
              <p className="text-5xl" style={{ marginBottom: '16px' }}>🔍</p>
              <h3 className="text-lg font-bold" style={{ marginBottom: '8px' }}>No products found</h3>
              <p className="text-slate-500" style={{ marginBottom: '24px' }}>Try adjusting your filters</p>
              <button 
                onClick={clearFilters} 
                className="bg-slate-900 text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-slate-800 transition-colors border-none"
                style={{ padding: '10px 32px' }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={`grid ${gridClass} gap-5`}>
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

/* ─── Shared Filter Content ─── */
function FilterContent({ categories, filters, updateFilter, applyPriceRange, extraFilters, toggleExtraFilter, clearFilters }) {
  return (
    <div className="flex flex-col" style={{ gap: '4px' }}>
      
      {/* Category */}
      <FilterSection title="Category">
        <div className="flex flex-col" style={{ gap: '10px' }}>
          <label className="flex items-center cursor-pointer" style={{ gap: '10px' }}>
            <input 
              type="radio" 
              name="cat" 
              value=""
              checked={filters.category === ''}
              onChange={() => updateFilter('category', '')}
              className="accent-amber-600 w-4 h-4"
            />
            <span className="text-xs text-slate-700">All Categories</span>
          </label>
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center cursor-pointer" style={{ gap: '10px' }}>
              <input 
                type="radio" 
                name="cat" 
                value={cat.slug}
                checked={filters.category === cat.slug}
                onChange={() => updateFilter('category', cat.slug)}
                className="accent-amber-600 w-4 h-4"
              />
              <span className="text-xs text-slate-700">{cat.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price Range">
        <div className="flex flex-col" style={{ gap: '10px' }}>
          {PRICE_RANGES.map(range => (
            <label key={range.label} className="flex items-center cursor-pointer" style={{ gap: '10px' }}>
              <input
                type="radio"
                name="price"
                checked={filters.min_price == range.min && filters.max_price == range.max}
                onChange={() => applyPriceRange(range)}
                className="accent-amber-600 w-4 h-4"
              />
              <span className="text-xs text-slate-700">{range.label}</span>
            </label>
          ))}
          <div className="flex" style={{ gap: '8px', marginTop: '4px' }}>
            <input
              type="number"
              placeholder="Min"
              value={filters.min_price}
              onChange={e => updateFilter('min_price', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md text-xs outline-none focus:border-amber-500"
              style={{ padding: '10px 12px' }}
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.max_price}
              onChange={e => updateFilter('max_price', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md text-xs outline-none focus:border-amber-500"
              style={{ padding: '10px 12px' }}
            />
          </div>
        </div>
      </FilterSection>

      {/* Extra Filters */}
      {EXTRA_FILTERS.map(section => (
        <FilterSection key={section.title} title={section.title}>
          <div className="flex flex-col" style={{ gap: '8px' }}>
            {section.options.map(option => {
              const key = `${section.title}-${option}`
              return (
                <label
                  key={option}
                  className="flex items-center justify-between cursor-pointer text-xs text-slate-700"
                  style={{ padding: '4px 0' }}
                >
                  <span>{option}</span>
                  <input
                    type="checkbox"
                    checked={!!extraFilters[key]}
                    onChange={() => toggleExtraFilter(section.title, option)}
                    className="accent-amber-600 w-4 h-4"
                  />
                </label>
              )
            })}
          </div>
        </FilterSection>
      ))}

      {/* Stock */}
      <FilterSection title="Availability">
        <label className="flex items-center cursor-pointer" style={{ gap: '10px' }}>
          <input
            type="checkbox"
            checked={filters.in_stock === 'true'}
            onChange={e => updateFilter('in_stock', e.target.checked ? 'true' : '')}
            className="accent-amber-600 w-4 h-4"
          />
          <span className="text-xs text-slate-700">In Stock Only</span>
        </label>
      </FilterSection>

    </div>
  )
}