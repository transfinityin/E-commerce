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

const GOLD = '#D4AF37'

/* ─── Filter Section ─── */
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[var(--color-border)] last:border-0">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full bg-transparent border-none cursor-pointer text-sm font-semibold text-white hover:text-gold transition-colors tracking-wide"
        style={{ padding: '16px 0' }}
      >
        {title}
        <ChevronDown 
          size={16} 
          className={`text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
        />
      </button>
      {open && (
        <div className="animate-fadeUp" style={{ paddingBottom: '16px' }}>
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
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-body">

      {/* ===== TRANSFINITY HEADER ===== */}
      <header className="nav-transfinity fixed top-0 left-0 right-0 z-50">
        <div className="page-container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="text-gold text-2xl">∞</span>
            <span className="font-display text-gold text-sm tracking-[0.3em]">TRANSFINITY</span>
          </div>
          <nav className="hidden sm:flex gap-8">
            <a href="/" className="nav-link">HOME</a>
            <a href="/arcs" className="nav-link">ARCS</a>
            <a href="/shop" className="nav-link nav-link-active">SHOP</a>
            <a href="/founder" className="nav-link">FOUNDER</a>
          </nav>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Mobile Filter Overlay */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div 
            className="absolute left-0 top-0 h-full bg-[var(--color-bg)] border-r border-[var(--color-border)] shadow-2xl overflow-y-auto"
            style={{ width: '320px' }}
          >
            <div style={{ padding: '24px' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="heading-card text-sm">FILTERS</h2>
                <button 
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-8 h-8 border border-[var(--color-border)] flex items-center justify-center text-muted hover:text-gold hover:border-gold transition-colors bg-transparent cursor-pointer"
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

      <div className="flex mx-auto page-container" style={{ maxWidth: '1600px' }}>

        {/* ═══ LEFT SIDEBAR ═══ */}
        <aside className="group relative flex-shrink-0 hidden lg:block z-30">

          {/* Collapsed Strip */}
          <div 
            className="h-screen bg-[var(--color-bg)] sticky top-0 flex flex-col items-center transition-all duration-300 group-hover:opacity-0 group-hover:w-0 overflow-hidden border-r border-[var(--color-border)]"
            style={{ width: '56px', padding: '32px 0', gap: '16px' }}
          >
            <SlidersHorizontal className="text-gold" size={22} />
            <div className="flex-1 flex items-center justify-center">
              <span 
                className="text-muted text-xs font-bold tracking-[0.2em] uppercase"
                style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
              >
                Filters
              </span>
            </div>
            {activeFilterCount > 0 && (
              <span 
                className="w-5 h-5 flex items-center justify-center bg-gold text-black text-[10px] font-bold"
              >
                {activeFilterCount}
              </span>
            )}
          </div>

          {/* Expanded Panel */}
          <div 
            className="absolute left-0 top-0 h-screen bg-[var(--color-bg)] border-r border-[var(--color-border)] shadow-2xl -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out overflow-y-auto"
            style={{ width: '320px' }}
          >
            <div style={{ padding: '24px' }}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="text-gold" size={20} />
                  <h2 className="heading-card text-sm">FILTERS</h2>
                </div>
                {activeFilterCount > 0 && (
                  <button 
                    onClick={clearFilters}
                    className="text-xs font-medium text-gold hover:text-gold-light transition-colors bg-transparent border-none cursor-pointer"
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
            className="sticky top-20 z-20 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)]"
            style={{ padding: '16px 24px' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

              {/* Breadcrumb */}
              <div>
                <div className="flex items-center gap-2 mb-1 text-xs text-muted">
                  <Link to="/" className="hover:text-gold transition-colors">Home</Link>
                  <ArrowRight size={12} className="text-muted" />
                  <span className="text-white font-medium tracking-wide">SHOP</span>
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="heading-section text-lg sm:text-xl lg:text-2xl">
                    ALL ARTIFACTS
                  </h1>
                  <span className="text-sm text-muted">
                    ({products.length} found)
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                {/* Mobile Filter */}
                <button 
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-xs font-medium hover:border-gold transition-colors cursor-pointer"
                  style={{ padding: '8px 16px', gap: '8px' }}
                >
                  <SlidersHorizontal size={16} className="text-gold" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 flex items-center justify-center bg-gold text-black text-[10px] font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort */}
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-[var(--color-surface)] border border-[var(--color-border)] text-xs sm:text-sm font-medium text-white hover:border-gold focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all cursor-pointer"
                    style={{ padding: '8px 32px 8px 16px' }}
                  >
                    <option value="-created_at">Newest Arrivals</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="-rating_avg">Top Rated</option>
                    <option value="-sold_count">Most Acquired</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>

                {/* View Mode */}
                <div className="hidden sm:flex items-center border border-[var(--color-border)] overflow-hidden">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors border-none cursor-pointer ${viewMode === 'grid' ? 'bg-gold text-black' : 'bg-[var(--color-surface)] text-muted hover:text-white'}`}
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors border-none cursor-pointer ${viewMode === 'list' ? 'bg-gold text-black' : 'bg-[var(--color-surface)] text-muted hover:text-white'}`}
                  >
                    <LayoutList size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
                <span className="label-gold text-[10px]">ACTIVE:</span>
                {selectedCats.map(catId => {
                  const cat = categories.find(c => c.id === catId)
                  return cat ? (
                    <span 
                      key={catId} 
                      className="inline-flex items-center border border-[var(--color-border)] bg-[var(--color-surface)] text-white text-xs"
                      style={{ padding: '4px 12px', gap: '4px' }}
                    >
                      {cat.name}
                      <button onClick={() => toggleCat(catId)} className="hover:text-gold bg-transparent border-none cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  ) : null
                })}
                {selectedRating && (
                  <span 
                    className="inline-flex items-center border border-[var(--color-border)] bg-[var(--color-surface)] text-white text-xs"
                    style={{ padding: '4px 12px', gap: '4px' }}
                  >
                    {selectedRating}+ Stars
                    <button onClick={() => setSelectedRating(null)} className="hover:text-gold bg-transparent border-none cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedSizes.map(size => (
                  <span 
                    key={size} 
                    className="inline-flex items-center border border-[var(--color-border)] bg-[var(--color-surface)] text-white text-xs"
                    style={{ padding: '4px 12px', gap: '4px' }}
                  >
                    Size {size}
                    <button onClick={() => toggleSize(size)} className="hover:text-gold bg-transparent border-none cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {(priceRange.min || priceRange.max) && (
                  <span 
                    className="inline-flex items-center border border-[var(--color-border)] bg-[var(--color-surface)] text-white text-xs"
                    style={{ padding: '4px 12px', gap: '4px' }}
                  >
                    ₹{priceRange.min || '0'} - ₹{priceRange.max || '∞'}
                    <button onClick={() => setPriceRange({ min: '', max: '' })} className="hover:text-gold bg-transparent border-none cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Products */}
          <div className="py-6 sm:py-8 px-4 sm:px-6">
            {loading ? (
              <div className={`grid gap-3 sm:gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="card-dark overflow-hidden animate-pulse">
                    <div className="bg-[var(--color-surface)]" style={{ aspectRatio: '3/4' }} />
                    <div className="p-3 sm:p-4 flex flex-col gap-3">
                      <div className="h-3 bg-[var(--color-surface)] w-3/4" />
                      <div className="h-3 bg-[var(--color-surface)] w-1/2" />
                      <div className="h-6 bg-[var(--color-surface)] w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 sm:py-32">
                <div className="w-16 h-16 border border-[var(--color-border)] flex items-center justify-center mb-6">
                  <Search size={24} className="text-muted" />
                </div>
                <p className="label-gold mb-2">NO SIGNAL</p>
                <h3 className="heading-card text-lg sm:text-xl mb-2">No Artifacts Found</h3>
                <p className="text-muted text-sm mb-8 max-w-sm">
                  Adjust your filter parameters or browse the full collection to locate your desired relics.
                </p>
                <button 
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  RESET FILTERS
                </button>
              </div>
            ) : (
              <div className={`grid gap-3 sm:gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {products.map((product, i) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={i}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="footer-transfinity mt-16">
        <div className="page-container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <p className="label-gold mb-4">NAVIGATE</p>
              <div className="space-y-2">
                <a href="/shop" className="footer-link block">Shop All</a>
                <a href="/arcs" className="footer-link block">Arc Index</a>
                <a href="/manifesto" className="footer-link block">Manifesto</a>
              </div>
            </div>
            <div>
              <p className="label-gold mb-4">ACCOUNT</p>
              <div className="space-y-2">
                <a href="/login" className="footer-link block">Sign In</a>
                <a href="/register" className="footer-link block">Create Account</a>
              </div>
            </div>
            <div>
              <p className="label-gold mb-4">TRANSMIT</p>
              <div className="space-y-2">
                <a href="#" className="footer-link block">Instagram</a>
                <a href="#" className="footer-link block">Discord</a>
                <a href="#" className="footer-link block">X-Link</a>
              </div>
            </div>
          </div>
          <div className="divider-gold mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gold text-lg">∞</span>
              <span className="font-display text-gold text-xs tracking-[0.3em]">TRANSFINITY</span>
            </div>
            <p className="text-muted text-xs tracking-wider">
              LONDON // TOKYO // DIGITAL VOID
            </p>
            <p className="text-muted text-[10px]">
              © 2104 Transfinity Systems
            </p>
          </div>
        </div>
      </footer>
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
    <div className="flex flex-col gap-1">
      {/* Categories */}
      <FilterSection title="CATEGORIES">
        <div className="flex flex-col gap-2">
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center cursor-pointer group gap-3">
              <div 
                className={`w-5 h-5 border-2 flex items-center justify-center transition-all ${
                  selectedCats.includes(cat.id) 
                    ? 'border-gold bg-gold' 
                    : 'border-[var(--color-border)] group-hover:border-gold/60'
                }`}
              >
                {selectedCats.includes(cat.id) && <CheckIcon />}
              </div>
              <span className={`text-sm ${selectedCats.includes(cat.id) ? 'text-white font-medium' : 'text-muted'}`}>
                {cat.name}
              </span>
              <span className="text-xs text-muted ml-auto">{cat.product_count || 0}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="PRICE RANGE">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">₹</span>
              <input 
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-white focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all placeholder:text-muted"
                style={{ padding: '8px 8px 8px 28px' }}
              />
            </div>
            <span className="text-muted">-</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">₹</span>
              <input 
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-white focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all placeholder:text-muted"
                style={{ padding: '8px 8px 8px 28px' }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Under ₹500', '₹500 - ₹1000', '₹1000 - ₹2000', 'Over ₹2000'].map(range => (
              <button 
                key={range}
                onClick={() => {
                  if (range === 'Under ₹500') setPriceRange({ min: '', max: '500' })
                  else if (range === '₹500 - ₹1000') setPriceRange({ min: '500', max: '1000' })
                  else if (range === '₹1000 - ₹2000') setPriceRange({ min: '1000', max: '2000' })
                  else setPriceRange({ min: '2000', max: '' })
                }}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-medium text-muted hover:border-gold hover:text-gold transition-all bg-transparent cursor-pointer"
                style={{ padding: '6px 12px' }}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="RATING">
        <div className="flex flex-col gap-2">
          {ratings.map(rating => (
            <button 
              key={rating}
              onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
              className={`flex items-center w-full transition-all border bg-transparent cursor-pointer ${
                selectedRating === rating 
                  ? 'bg-[var(--color-bg-alt)] border-gold' 
                  : 'hover:bg-[var(--color-bg-alt)] border-transparent'
              }`}
              style={{ padding: '8px 12px', gap: '8px' }}
            >
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star 
                    key={s} 
                    size={14} 
                    className={s <= rating ? 'text-gold fill-gold' : 'text-[var(--color-border)]'} 
                  />
                ))}
              </div>
              <span className={`text-sm ${selectedRating === rating ? 'text-gold font-medium' : 'text-muted'}`}>
                & Up
              </span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="SIZE">
        <div className="flex flex-wrap gap-2">
          {sizes.map(size => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`border-2 text-sm font-bold transition-all bg-transparent cursor-pointer ${
                selectedSizes.includes(size) 
                  ? 'bg-gold border-gold text-black' 
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-muted hover:border-gold'
              }`}
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
        className="sticky bottom-0 bg-[var(--color-bg)] border-t border-[var(--color-border)]"
        style={{ margin: '24px -24px 0', padding: '16px 24px 24px' }}
      >
        <button 
          onClick={() => {
            props.onClose()
          }}
          className="w-full btn-primary"
        >
          SHOW {props.activeFilterCount > 0 ? 'FILTERED' : 'ALL'} RESULTS
        </button>
      </div>
    </>
  )
}

/* ─── Check Icon ─── */
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6L5 9L10 3" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}