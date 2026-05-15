import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  Star, 
  Search,
  ArrowRight,
  Grid3X3,
  LayoutList
} from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

const ACCENT = '#C8A96E'

/* ─── Filter Section ─── */
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full bg-transparent border-none cursor-pointer text-sm font-semibold text-slate-900 hover:text-amber-600 transition-colors"
        style={{ padding: '16px 0' }}
      >
        {title}
        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
        />
      </button>
      {open && (
        <div className="animate-[fadeIn_0.2s_ease]" style={{ paddingBottom: '16px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ─── */
export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  
  const [selectedCats, setSelectedCats] = useState([])
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [selectedRating, setSelectedRating] = useState(null)
  const [selectedSizes, setSelectedSizes] = useState([])
  const [sortBy, setSortBy] = useState(searchParams.get('ordering') || '-created_at')

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const ratings = [4, 3, 2, 1]

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [searchParams, sortBy, selectedCats, priceRange, selectedRating])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(searchParams)
      params.set('ordering', sortBy)
      if (selectedCats.length) params.set('categories', selectedCats.join(','))
      if (priceRange.min) params.set('price_min', priceRange.min)
      if (priceRange.max) params.set('price_max', priceRange.max)
      if (selectedRating) params.set('rating_min', selectedRating)
      
      const { data } = await api.get(`/products/?${params.toString()}`)
      setProducts(data.results || data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/products/categories/')
      setCategories(data.results || data)
    } catch (err) {
      console.error(err)
    }
  }

  const toggleCat = (id) => {
    setSelectedCats(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    )
  }

  const clearFilters = () => {
    setSelectedCats([])
    setPriceRange({ min: '', max: '' })
    setSelectedRating(null)
    setSelectedSizes([])
    setSearchParams({})
  }

  const activeFilterCount = selectedCats.length + (priceRange.min || priceRange.max ? 1 : 0) + (selectedRating ? 1 : 0) + selectedSizes.length

  return (
    <div className="min-h-screen bg-slate-50">

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
                <h2 className="text-lg font-bold text-slate-900">Filters</h2>
                <button 
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors border-none cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <MobileFilters 
                categories={categories}
                selectedCats={selectedCats}
                toggleCat={toggleCat}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedRating={selectedRating}
                setSelectedRating={setSelectedRating}
                selectedSizes={selectedSizes}
                toggleSize={toggleSize}
                sizes={sizes}
                ratings={ratings}
                clearFilters={clearFilters}
                activeFilterCount={activeFilterCount}
                onClose={() => setMobileFilterOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex mx-auto" style={{ maxWidth: '1600px' }}>
        
        {/* ═══ LEFT SIDEBAR ═══ */}
        <aside className="group relative flex-shrink-0 hidden lg:block z-30">
          
          {/* Collapsed Strip */}
          <div 
            className="h-screen bg-slate-900 sticky top-0 flex flex-col items-center transition-all duration-300 group-hover:opacity-0 group-hover:w-0 overflow-hidden"
            style={{ width: '56px', padding: '32px 0', gap: '16px' }}
          >
            <SlidersHorizontal style={{ color: ACCENT }} size={22} />
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
            style={{ width: '320px' }}
          >
            <div style={{ padding: '24px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <SlidersHorizontal className="text-slate-900" size={20} />
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
                selectedCats={selectedCats}
                toggleCat={toggleCat}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedRating={selectedRating}
                setSelectedRating={setSelectedRating}
                selectedSizes={selectedSizes}
                toggleSize={toggleSize}
                sizes={sizes}
                ratings={ratings}
              />
            </div>
          </div>
        </aside>

        {/* ═══ MAIN CONTENT ═══ */}
        <main className="flex-1 min-w-0">
          
          {/* Top Bar */}
          <div 
            className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200"
            style={{ padding: '16px 24px' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between" style={{ gap: '16px' }}>
              
              {/* Breadcrumb */}
              <div>
                <div className="flex items-center text-xs text-slate-500" style={{ gap: '8px', marginBottom: '4px' }}>
                  <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
                  <ArrowRight size={12} />
                  <span className="text-slate-900 font-medium">Products</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                  All Products
                  <span className="text-sm font-normal text-slate-500 font-sans" style={{ marginLeft: '8px' }}>
                    ({products.length} items)
                  </span>
                </h1>
              </div>

              {/* Controls */}
              <div className="flex items-center" style={{ gap: '12px' }}>
                {/* Mobile Filter */}
                <button 
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors border-none cursor-pointer"
                  style={{ padding: '8px 16px', gap: '8px' }}
                >
                  <SlidersHorizontal size={16} />
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

                {/* Sort */}
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-900 hover:border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all cursor-pointer"
                    style={{ padding: '8px 32px 8px 16px' }}
                  >
                    <option value="-created_at">Newest First</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="-rating_avg">Top Rated</option>
                    <option value="-sold_count">Best Selling</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* View Mode */}
                <div className="hidden sm:flex items-center border border-slate-200 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors border-none cursor-pointer ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:text-slate-900'}`}
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors border-none cursor-pointer ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:text-slate-900'}`}
                  >
                    <LayoutList size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center" style={{ gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <span className="text-xs font-medium text-slate-500">Active:</span>
                {selectedCats.map(catId => {
                  const cat = categories.find(c => c.id === catId)
                  return cat ? (
                    <span 
                      key={catId} 
                      className="inline-flex items-center rounded-full text-xs font-medium border border-amber-200 bg-amber-50 text-amber-700"
                      style={{ padding: '4px 12px', gap: '4px' }}
                    >
                      {cat.name}
                      <button onClick={() => toggleCat(catId)} className="hover:text-amber-900 bg-transparent border-none cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  ) : null
                })}
                {selectedRating && (
                  <span 
                    className="inline-flex items-center rounded-full text-xs font-medium border border-amber-200 bg-amber-50 text-amber-700"
                    style={{ padding: '4px 12px', gap: '4px' }}
                  >
                    {selectedRating}+ Stars
                    <button onClick={() => setSelectedRating(null)} className="hover:text-amber-900 bg-transparent border-none cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedSizes.map(size => (
                  <span 
                    key={size} 
                    className="inline-flex items-center rounded-full text-xs font-medium border border-amber-200 bg-amber-50 text-amber-700"
                    style={{ padding: '4px 12px', gap: '4px' }}
                  >
                    Size {size}
                    <button onClick={() => toggleSize(size)} className="hover:text-amber-900 bg-transparent border-none cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {(priceRange.min || priceRange.max) && (
                  <span 
                    className="inline-flex items-center rounded-full text-xs font-medium border border-amber-200 bg-amber-50 text-amber-700"
                    style={{ padding: '4px 12px', gap: '4px' }}
                  >
                    ₹{priceRange.min || '0'} - ₹{priceRange.max || '∞'}
                    <button onClick={() => setPriceRange({ min: '', max: '' })} className="hover:text-amber-900 bg-transparent border-none cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Products */}
          <div style={{ padding: '24px' }}>
            {loading ? (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
                    <div className="bg-slate-200" style={{ aspectRatio: '1' }} />
                    <div className="flex flex-col" style={{ padding: '16px', gap: '12px' }}>
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                      <div className="h-8 bg-slate-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center" style={{ padding: '80px 0' }}>
                <Search size={48} className="text-slate-300" style={{ marginBottom: '16px' }} />
                <h3 className="text-lg font-bold text-slate-900" style={{ marginBottom: '8px' }}>No products found</h3>
                <p className="text-slate-500" style={{ marginBottom: '24px' }}>Try adjusting your filters or search criteria</p>
                <button 
                  onClick={clearFilters}
                  className="bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors border-none cursor-pointer"
                  style={{ padding: '8px 24px' }}
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

/* ─── Filter Content ─── */
function FilterContent({ 
  categories, selectedCats, toggleCat, 
  priceRange, setPriceRange,
  selectedRating, setSelectedRating,
  selectedSizes, toggleSize, sizes, ratings
}) {
  return (
    <div className="flex flex-col" style={{ gap: '4px' }}>
      {/* Categories */}
      <FilterSection title="Categories">
        <div className="flex flex-col" style={{ gap: '8px' }}>
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center cursor-pointer group" style={{ gap: '12px' }}>
              <div 
                className={`rounded border-2 flex items-center justify-center transition-all ${selectedCats.includes(cat.id) ? 'border-amber-500' : 'border-slate-300 group-hover:border-amber-400'}`}
                style={{ 
                  width: '20px', 
                  height: '20px',
                  background: selectedCats.includes(cat.id) ? ACCENT : 'transparent'
                }}
              >
                {selectedCats.includes(cat.id) && <CheckIcon />}
              </div>
              <span className={`text-sm ${selectedCats.includes(cat.id) ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                {cat.name}
              </span>
              <span className="text-xs text-slate-400 ml-auto">{cat.product_count || 0}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="flex flex-col" style={{ gap: '12px' }}>
          <div className="flex items-center" style={{ gap: '8px' }}>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">₹</span>
              <input 
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                style={{ padding: '8px 8px 8px 28px' }}
              />
            </div>
            <span className="text-slate-400">-</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">₹</span>
              <input 
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                style={{ padding: '8px 8px 8px 28px' }}
              />
            </div>
          </div>
          <div className="flex flex-wrap" style={{ gap: '8px' }}>
            {['Under ₹500', '₹500 - ₹1000', '₹1000 - ₹2000', 'Over ₹2000'].map(range => (
              <button 
                key={range}
                onClick={() => {
                  if (range === 'Under ₹500') setPriceRange({ min: '', max: '500' })
                  else if (range === '₹500 - ₹1000') setPriceRange({ min: '500', max: '1000' })
                  else if (range === '₹1000 - ₹2000') setPriceRange({ min: '1000', max: '2000' })
                  else setPriceRange({ min: '2000', max: '' })
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:border-amber-500 hover:text-amber-600 transition-all bg-transparent cursor-pointer"
                style={{ padding: '6px 12px' }}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating">
        <div className="flex flex-col" style={{ gap: '8px' }}>
          {ratings.map(rating => (
            <button 
              key={rating}
              onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
              className={`flex items-center w-full rounded-lg transition-all border bg-transparent cursor-pointer ${selectedRating === rating ? 'bg-amber-50 border-amber-200' : 'hover:bg-slate-50 border-transparent'}`}
              style={{ padding: '8px 12px', gap: '8px' }}
            >
              <div className="flex" style={{ gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <Star 
                    key={s} 
                    size={14} 
                    className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} 
                  />
                ))}
              </div>
              <span className={`text-sm ${selectedRating === rating ? 'text-amber-700 font-medium' : 'text-slate-600'}`}>
                & Up
              </span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        <div className="flex flex-wrap" style={{ gap: '8px' }}>
          {sizes.map(size => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`rounded-lg border-2 text-sm font-bold transition-all bg-transparent cursor-pointer ${selectedSizes.includes(size) ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}
              style={{ width: '40px', height: '40px' }}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  )
}

/* ─── Mobile Filters ─── */
function MobileFilters(props) {
  return (
    <>
      <FilterContent {...props} />
      <div 
        className="sticky bottom-0 bg-white border-t border-slate-200"
        style={{ margin: '24px -24px 0', padding: '16px 24px 24px' }}
      >
        <button 
          onClick={() => {
            props.onClose()
          }}
          className="w-full bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors border-none cursor-pointer"
          style={{ padding: '12px 0' }}
        >
          Show {props.activeFilterCount > 0 ? 'Filtered' : 'All'} Results
        </button>
      </div>
    </>
  )
}

/* ─── Check Icon ─── */
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}