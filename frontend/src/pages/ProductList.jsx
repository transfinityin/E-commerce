// import { useEffect, useState, useCallback, useRef } from 'react'
// import { useSearchParams } from 'react-router-dom'
// import { SlidersHorizontal, ChevronDown, ChevronUp, X, Grid3X3, LayoutGrid, LayoutList, Search } from 'lucide-react'
// import api from '../services/api'
// import ProductCard from '../components/ProductCard'

// const PRICE_RANGES = [
//   { label: 'Under ₹500',       min: 0,    max: 500 },
//   { label: '₹500 – ₹1000',    min: 500,  max: 1000 },
//   { label: '₹1000 – ₹2000',   min: 1000, max: 2000 },
//   { label: 'Above ₹2000',      min: 2000, max: '' },
// ]

// const SORT_OPTIONS = [
//   { label: 'Featured',         value: '-is_featured' },
//   { label: 'Latest',           value: '-created_at' },
//   { label: 'Price: Low–High',  value: 'price' },
//   { label: 'Price: High–Low',  value: '-price' },
//   { label: 'Top Rated',        value: '-rating_avg' },
// ]

// const EXTRA_FILTERS = [
//   { title: 'SIZE',             options: ['S', 'M', 'L', 'XL', 'XXL'] },
//   { title: 'COLOR',            options: ['Lilac', 'Navy', 'Royal Blue', 'Sky Blue', 'Aqua Blue'] },
//   { title: 'FABRIC',           options: ['Textured', '100% Cotton'] },
//   { title: 'CHARACTER',        options: ['Spiderman', 'Thor', 'Marvel', 'Disney'] },
//   { title: 'PATTERN',          options: ['Printed', 'Textured', 'Puff Print'] },
//   { title: 'PATTERN COVERAGE', options: ['Back', 'Front', 'All Over'] },
//   { title: 'PRODUCT TYPE',     options: ['T-shirt', 'Oversized Tshirt'] },
// ]

// function FilterSection({ title, children, defaultOpen = true }) {
//   const [open, setOpen] = useState(defaultOpen)
//   return (
//     <div className="border-b border-[var(--color-border)] last:border-0">
//       <button
//         onClick={() => setOpen(!open)}
//         className="w-full flex justify-between items-center bg-transparent border-none cursor-pointer text-sm font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors py-4"
//       >
//         <span className="text-xs font-bold tracking-wider uppercase">{title}</span>
//         {open ? <ChevronUp size={16} className="text-[var(--color-muted)]" /> : <ChevronDown size={16} className="text-[var(--color-muted)]" />}
//       </button>
//       {open && (
//         <div className="animate-fadeIn pb-4">
//           {children}
//         </div>
//       )}
//     </div>
//   )
// }

// export default function ProductList() {
//   const [products, setProducts] = useState([])
//   const [categories, setCategories] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [count, setCount] = useState(0)
//   const [gridCols, setGridCols] = useState(3)
//   const [sortOpen, setSortOpen] = useState(false)
//   const [filterOpen, setFilterOpen] = useState(false)
//   const filterRef = useRef(null)
//   const [searchParams] = useSearchParams()

//   const [filters, setFilters] = useState({
//     category: searchParams.get('category_slug') || searchParams.get('category') || '',
//     min_price: '',
//     max_price: '',
//     ordering: searchParams.get('ordering') || '-created_at',
//     in_stock: '',
//     search: searchParams.get('q') || '',
//   })

//   const [extraFilters, setExtraFilters] = useState({})
//   const [activeSort, setActiveSort] = useState('Latest')

//   const selectedCats = filters.category ? [filters.category] : []
//   const activeFilterCount = selectedCats.length +
//     (filters.min_price || filters.max_price ? 1 : 0) +
//     (filters.in_stock ? 1 : 0) +
//     Object.values(extraFilters).filter(Boolean).length

//   // Click outside to close filter dropdown
//   useEffect(() => {
//     function handleClickOutside(e) {
//       if (filterRef.current && !filterRef.current.contains(e.target)) {
//         setFilterOpen(false)
//       }
//     }
//     if (filterOpen) {
//       document.addEventListener('mousedown', handleClickOutside)
//       return () => document.removeEventListener('mousedown', handleClickOutside)
//     }
//   }, [filterOpen])

//   useEffect(() => {
//     api.get('/products/categories/').then(r => setCategories(r.data.results || r.data))
//   }, [])

//   const fetchProducts = useCallback(async () => {
//     setLoading(true)
//     try {
//       const params = {}
//       if (filters.category) params.category_slug = filters.category
//       if (filters.min_price) params.min_price = filters.min_price
//       if (filters.max_price) params.max_price = filters.max_price
//       if (filters.ordering) params.ordering = filters.ordering
//       if (filters.in_stock) params.in_stock = filters.in_stock
//       if (filters.search) params.search = filters.search
//       const { data } = await api.get('/products/', { params })
//       setProducts(data.results || data)
//       setCount(data.count || (data.results || data).length)
//     } catch (err) {
//       console.error(err)
//     } finally {
//       setLoading(false)
//     }
//   }, [filters])

//   useEffect(() => { fetchProducts() }, [fetchProducts])

//   const updateFilter = (key, value) => setFilters(p => ({ ...p, [key]: value }))

//   const clearFilters = () => {
//     setFilters({
//       category: '', min_price: '', max_price: '',
//       ordering: '-created_at', in_stock: '', search: '',
//     })
//     setExtraFilters({})
//   }

//   const applyPriceRange = (range) => {
//     setFilters(p => ({ ...p, min_price: range.min, max_price: range.max }))
//   }

//   const applySort = (opt) => {
//     setActiveSort(opt.label)
//     updateFilter('ordering', opt.value)
//     setSortOpen(false)
//   }

//   const toggleExtraFilter = (section, option) => {
//     setExtraFilters(prev => {
//       const key = `${section}-${option}`
//       return { ...prev, [key]: !prev[key] }
//     })
//   }

//   const gridClass = gridCols === 2 ? 'grid-cols-2' : gridCols === 3 ? 'grid-cols-3' : 'grid-cols-4'

//   return (
//     <div className="min-h-screen bg-[var(--color-bg)] pb-16">

//       {/* Header bar */}
//       <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-20 shadow-sm">
//         <div className="page-container py-4">
//           <div className="flex items-center justify-between gap-4">
//             <div className="flex items-center gap-4">

//               {/* Filter Dropdown Button */}
//               <div className="relative" ref={filterRef}>
//                 <button
//                   onClick={() => setFilterOpen(!filterOpen)}
//                   className="flex items-center gap-2 bg-[var(--color-secondary)] text-[var(--color-text-inverse)] rounded-xl text-xs font-semibold hover:bg-[var(--color-secondary-light)] transition-colors border-none cursor-pointer px-4 py-2.5"
//                 >
//                   <SlidersHorizontal size={15} />
//                   Filters
//                   {activeFilterCount > 0 && (
//                     <span className="rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center w-5 h-5">
//                       {activeFilterCount}
//                     </span>
//                   )}
//                   <ChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
//                 </button>

//                 {/* Filter Dropdown Panel */}
//                 {filterOpen && (
//                   <div
//                     className="absolute left-0 top-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl z-50 overflow-y-auto mt-2"
//                     style={{ width: '320px', maxHeight: '70vh', padding: '24px' }}
//                   >
//                     <div className="flex items-center justify-between mb-5">
//                       <div className="flex items-center gap-2">
//                         <SlidersHorizontal size={20} className="text-[var(--color-primary)]" />
//                         <h2 className="text-lg font-bold text-[var(--color-text)]">Filters</h2>
//                       </div>
//                       <div className="flex items-center gap-3">
//                         {activeFilterCount > 0 && (
//                           <button
//                             onClick={clearFilters}
//                             className="text-xs font-medium text-[var(--color-danger)] hover:text-[var(--color-danger)] transition-colors bg-transparent border-none cursor-pointer"
//                           >
//                             Clear all
//                           </button>
//                         )}
//                         <button
//                           onClick={() => setFilterOpen(false)}
//                           className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center hover:bg-[var(--color-border-light)] transition-colors border-none cursor-pointer"
//                         >
//                           <X size={18} className="text-[var(--color-text)]" />
//                         </button>
//                       </div>
//                     </div>

//                     <FilterContent
//                       categories={categories}
//                       filters={filters}
//                       updateFilter={updateFilter}
//                       applyPriceRange={applyPriceRange}
//                       extraFilters={extraFilters}
//                       toggleExtraFilter={toggleExtraFilter}
//                     />
//                   </div>
//                 )}
//               </div>

//               <span className="text-xs text-[var(--color-muted)] font-medium">
//                 {count} Products
//               </span>
//             </div>

//             <div className="flex items-center gap-3">
//               {/* Grid toggle */}
//               <div className="hidden sm:flex border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-surface)]">
//                 {[
//                   { n: 2, icon: <LayoutList size={14} /> },
//                   { n: 3, icon: <Grid3X3 size={14} /> },
//                   { n: 4, icon: <LayoutGrid size={14} /> },
//                 ].map(({ n, icon }) => (
//                   <button
//                     key={n}
//                     onClick={() => setGridCols(n)}
//                     className={`border-none cursor-pointer text-xs font-semibold transition-all flex items-center justify-center ${
//                       gridCols === n
//                         ? 'bg-[var(--color-secondary)] text-[var(--color-text-inverse)]'
//                         : 'bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-text)]'
//                     }`}
//                     style={{ padding: '10px 14px' }}
//                   >
//                     {icon}
//                   </button>
//                 ))}
//               </div>

//               {/* Sort */}
//               <div className="relative">
//                 <button
//                   onClick={() => setSortOpen(!sortOpen)}
//                   className="flex items-center gap-2 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] cursor-pointer text-xs font-semibold text-[var(--color-text)] whitespace-nowrap hover:border-[var(--color-primary)] transition-colors px-4 py-2.5"
//                 >
//                   SORT BY: {activeSort}
//                   <ChevronDown size={14} />
//                 </button>
//                 {sortOpen && (
//                   <div
//                     className="absolute right-0 top-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-50 overflow-hidden mt-2"
//                     style={{ minWidth: '192px', padding: '4px 0' }}
//                   >
//                     {SORT_OPTIONS.map(opt => (
//                       <button
//                         key={opt.value}
//                         onClick={() => applySort(opt)}
//                         className={`block w-full text-left border-none cursor-pointer text-xs transition-colors px-4 py-3 ${
//                           activeSort === opt.label
//                             ? 'bg-[var(--color-primary-light)] font-bold text-[var(--color-primary-dark)]'
//                             : 'bg-[var(--color-surface)] font-normal text-[var(--color-text)] hover:bg-[var(--color-bg-alt)]'
//                         }`}
//                       >
//                         {opt.label}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Products */}
//       <div className="page-container py-6">
//         {loading ? (
//           <div className={`grid ${gridClass} gap-5`}>
//             {[...Array(6)].map((_, i) => (
//               <div key={i} className="flex flex-col gap-3">
//                 <div
//                   className="rounded-xl bg-gradient-to-r from-[var(--color-bg-alt)] via-[var(--color-border-light)] to-[var(--color-bg-alt)] bg-[length:200%_100%] animate-shimmer"
//                   style={{ aspectRatio: '3/4' }}
//                 />
//                 <div className="h-3.5 bg-[var(--color-bg-alt)] rounded w-4/5" />
//                 <div className="h-4 bg-[var(--color-bg-alt)] rounded w-1/2" />
//               </div>
//             ))}
//           </div>
//         ) : products.length === 0 ? (
//           <div className="text-center py-24 px-6">
//             <div className="w-16 h-16 rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center mx-auto mb-4">
//               <Search size={28} className="text-[var(--color-muted)]" />
//             </div>
//             <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">No products found</h3>
//             <p className="text-sm text-[var(--color-muted)] mb-6">Try adjusting your filters or search query</p>
//             <button
//               onClick={clearFilters}
//               className="bg-[var(--color-secondary)] text-[var(--color-text-inverse)] rounded-xl text-sm font-semibold cursor-pointer hover:bg-[var(--color-secondary-light)] transition-colors border-none px-8 py-3"
//             >
//               Clear Filters
//             </button>
//           </div>
//         ) : (
//           <div className={`grid ${gridClass} gap-5`}>
//             {products.map((p, i) => (
//               <ProductCard key={p.id} product={p} index={i} />
//             ))}
//           </div>
//         )}
//       </div>

//       <style>{`
//         @keyframes shimmer {
//           0% { background-position: -200% 0; }
//           100% { background-position: 200% 0; }
//         }
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//         .animate-shimmer {
//           animation: shimmer 1.5s infinite;
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.2s ease;
//         }
//       `}</style>
//     </div>
//   )
// }

// /* ─── Shared Filter Content ─── */
// function FilterContent({ categories, filters, updateFilter, applyPriceRange, extraFilters, toggleExtraFilter }) {
//   return (
//     <div className="flex flex-col gap-1">

//       {/* Category */}
//       <FilterSection title="Category">
//         <div className="flex flex-col gap-2.5">
//           <label className="flex items-center cursor-pointer gap-2.5">
//             <input
//               type="radio"
//               name="cat"
//               value=""
//               checked={filters.category === ''}
//               onChange={() => updateFilter('category', '')}
//               className="accent-[var(--color-primary)] w-4 h-4"
//             />
//             <span className="text-xs text-[var(--color-text)]">All Categories</span>
//           </label>
//           {categories.map(cat => (
//             <label key={cat.id} className="flex items-center cursor-pointer gap-2.5">
//               <input
//                 type="radio"
//                 name="cat"
//                 value={cat.slug}
//                 checked={filters.category === cat.slug}
//                 onChange={() => updateFilter('category', cat.slug)}
//                 className="accent-[var(--color-primary)] w-4 h-4"
//               />
//               <span className="text-xs text-[var(--color-text)]">{cat.name}</span>
//             </label>
//           ))}
//         </div>
//       </FilterSection>

//       {/* Price */}
//       <FilterSection title="Price Range">
//         <div className="flex flex-col gap-2.5">
//           {PRICE_RANGES.map(range => (
//             <label key={range.label} className="flex items-center cursor-pointer gap-2.5">
//               <input
//                 type="radio"
//                 name="price"
//                 checked={filters.min_price == range.min && filters.max_price == range.max}
//                 onChange={() => applyPriceRange(range)}
//                 className="accent-[var(--color-primary)] w-4 h-4"
//               />
//               <span className="text-xs text-[var(--color-text)]">{range.label}</span>
//             </label>
//           ))}
//           <div className="flex gap-2 mt-1">
//             <input
//               type="number"
//               placeholder="Min"
//               value={filters.min_price}
//               onChange={e => updateFilter('min_price', e.target.value)}
//               className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] px-3 py-2.5 placeholder:text-[var(--color-muted-light)]"
//             />
//             <input
//               type="number"
//               placeholder="Max"
//               value={filters.max_price}
//               onChange={e => updateFilter('max_price', e.target.value)}
//               className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] px-3 py-2.5 placeholder:text-[var(--color-muted-light)]"
//             />
//           </div>
//         </div>
//       </FilterSection>

//       {/* Extra Filters */}
//       {EXTRA_FILTERS.map(section => (
//         <FilterSection key={section.title} title={section.title}>
//           <div className="flex flex-col gap-2">
//             {section.options.map(option => {
//               const key = `${section.title}-${option}`
//               return (
//                 <label
//                   key={option}
//                   className="flex items-center justify-between cursor-pointer text-xs text-[var(--color-text)] py-1"
//                 >
//                   <span>{option}</span>
//                   <input
//                     type="checkbox"
//                     checked={!!extraFilters[key]}
//                     onChange={() => toggleExtraFilter(section.title, option)}
//                     className="accent-[var(--color-primary)] w-4 h-4"
//                   />
//                 </label>
//               )
//             })}
//           </div>
//         </FilterSection>
//       ))}

//       {/* Stock */}
//       <FilterSection title="Availability">
//         <label className="flex items-center cursor-pointer gap-2.5">
//           <input
//             type="checkbox"
//             checked={filters.in_stock === 'true'}
//             onChange={e => updateFilter('in_stock', e.target.checked ? 'true' : '')}
//             className="accent-[var(--color-primary)] w-4 h-4"
//           />
//           <span className="text-xs text-[var(--color-text)]">In Stock Only</span>
//         </label>
//       </FilterSection>

//     </div>
//   )
// }



import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, ChevronDown, ChevronUp, X, Grid3X3, LayoutGrid, LayoutList, Search } from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

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
    <div className="border-b border-[var(--color-border)] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center bg-transparent border-none cursor-pointer text-xs sm:text-sm font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors py-3 sm:py-4"
      >
        <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">{title}</span>
        {open ? <ChevronUp size={14} className="sm:w-4 sm:h-4 text-[var(--color-muted)]" /> : <ChevronDown size={14} className="sm:w-4 sm:h-4 text-[var(--color-muted)]" />}
      </button>
      {open && (
        <div className="animate-fadeIn pb-3 sm:pb-4">
          {children}
        </div>
      )}
    </div>
  )
}

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [gridCols, setGridCols] = useState(2)  // Default 2 cols for mobile
  const [sortOpen, setSortOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const filterRef = useRef(null)
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
  const [activeSort, setActiveSort] = useState('Latest')

  const selectedCats = filters.category ? [filters.category] : []
  const activeFilterCount = selectedCats.length +
    (filters.min_price || filters.max_price ? 1 : 0) +
    (filters.in_stock ? 1 : 0) +
    Object.values(extraFilters).filter(Boolean).length

  // Responsive grid cols based on screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setGridCols(3)
      else if (window.innerWidth >= 640) setGridCols(3)
      else setGridCols(2)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Click outside to close filter dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false)
      }
    }
    if (filterOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [filterOpen])

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
      if (filters.ordering) params.ordering = filters.ordering
      if (filters.in_stock) params.in_stock = filters.in_stock
      if (filters.search) params.search = filters.search
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

  const toggleExtraFilter = (section, option) => {
    setExtraFilters(prev => {
      const key = `${section}-${option}`
      return { ...prev, [key]: !prev[key] }
    })
  }

  const gridClass = gridCols === 2 ? 'grid-cols-2' : gridCols === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-10 sm:pb-16">

      {/* Header bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-20 shadow-sm">
        <div className="page-container py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">

              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="sm:hidden flex items-center gap-1.5 bg-[var(--color-secondary)] text-[var(--color-text-inverse)] rounded-xl text-[11px] font-semibold hover:bg-[var(--color-secondary-light)] transition-colors border-none cursor-pointer px-3 py-2"
              >
                <SlidersHorizontal size={13} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-[var(--color-primary)] text-white text-[9px] font-bold flex items-center justify-center w-4 h-4">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Desktop Filter Dropdown Button */}
              <div className="hidden sm:block relative" ref={filterRef}>
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-2 bg-[var(--color-secondary)] text-[var(--color-text-inverse)] rounded-xl text-xs font-semibold hover:bg-[var(--color-secondary-light)] transition-colors border-none cursor-pointer px-4 py-2.5"
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center w-5 h-5">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Desktop Filter Dropdown Panel */}
                {filterOpen && (
                  <div
                    className="absolute left-0 top-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl z-50 overflow-y-auto mt-2"
                    style={{ width: '320px', maxHeight: '70vh', padding: '24px' }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal size={20} className="text-[var(--color-primary)]" />
                        <h2 className="text-lg font-bold text-[var(--color-text)]">Filters</h2>
                      </div>
                      <div className="flex items-center gap-3">
                        {activeFilterCount > 0 && (
                          <button
                            onClick={clearFilters}
                            className="text-xs font-medium text-[var(--color-danger)] hover:text-[var(--color-danger)] transition-colors bg-transparent border-none cursor-pointer"
                          >
                            Clear all
                          </button>
                        )}
                        <button
                          onClick={() => setFilterOpen(false)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center hover:bg-[var(--color-border-light)] transition-colors border-none cursor-pointer"
                        >
                          <X size={18} className="text-[var(--color-text)]" />
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

              <span className="text-[10px] sm:text-xs text-[var(--color-muted)] font-medium">
                {count} Products
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Grid toggle - Desktop */}
              <div className="hidden sm:flex border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-surface)]">
                {[
                  { n: 2, icon: <LayoutList size={14} /> },
                  { n: 3, icon: <Grid3X3 size={14} /> },
                  { n: 4, icon: <LayoutGrid size={14} /> },
                ].map(({ n, icon }) => (
                  <button
                    key={n}
                    onClick={() => setGridCols(n)}
                    className={`border-none cursor-pointer text-xs font-semibold transition-all flex items-center justify-center ${
                      gridCols === n
                        ? 'bg-[var(--color-secondary)] text-[var(--color-text-inverse)]'
                        : 'bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-text)]'
                    }`}
                    style={{ padding: '10px 14px' }}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] cursor-pointer text-[11px] sm:text-xs font-semibold text-[var(--color-text)] whitespace-nowrap hover:border-[var(--color-primary)] transition-colors px-3 sm:px-4 py-2 sm:py-2.5"
                >
                  <span className="hidden sm:inline">SORT BY:</span> {activeSort}
                  <ChevronDown size={13} className="sm:w-[14px] sm:h-[14px]" />
                </button>
                {sortOpen && (
                  <div
                    className="absolute right-0 top-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-50 overflow-hidden mt-2"
                    style={{ minWidth: '180px', padding: '4px 0' }}
                  >
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => applySort(opt)}
                        className={`block w-full text-left border-none cursor-pointer text-xs transition-colors px-4 py-3 ${
                          activeSort === opt.label
                            ? 'bg-[var(--color-primary-light)] font-bold text-[var(--color-primary-dark)]'
                            : 'bg-[var(--color-surface)] font-normal text-[var(--color-text)] hover:bg-[var(--color-bg-alt)]'
                        }`}
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
      </div>

      {/* Mobile Filter Sheet (Slide from bottom) */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-surface)] rounded-t-2xl border-t border-[var(--color-border)] shadow-2xl max-h-[85vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-[var(--color-surface)] z-10 px-4 pt-4 pb-2 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-[var(--color-primary)]" />
                  <h2 className="text-base font-bold text-[var(--color-text)]">Filters</h2>
                </div>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs font-medium text-[var(--color-danger)] bg-transparent border-none cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center border-none cursor-pointer"
                  >
                    <X size={18} className="text-[var(--color-text)]" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 pb-8">
              <FilterContent
                categories={categories}
                filters={filters}
                updateFilter={updateFilter}
                applyPriceRange={applyPriceRange}
                extraFilters={extraFilters}
                toggleExtraFilter={toggleExtraFilter}
              />
            </div>
            <div className="sticky bottom-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full h-11 rounded-xl bg-[var(--color-secondary)] text-[var(--color-text-inverse)] text-sm font-bold tracking-wide uppercase border-none cursor-pointer"
              >
                Show {count} Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <div className="page-container py-4 sm:py-6">
        {loading ? (
          <div className={`grid ${gridClass} gap-3 sm:gap-5`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2 sm:gap-3">
                <div
                  className="rounded-xl bg-gradient-to-r from-[var(--color-bg-alt)] via-[var(--color-border-light)] to-[var(--color-bg-alt)] bg-[length:200%_100%] animate-shimmer"
                  style={{ aspectRatio: '3/4' }}
                />
                <div className="h-3 sm:h-3.5 bg-[var(--color-bg-alt)] rounded w-4/5" />
                <div className="h-3.5 sm:h-4 bg-[var(--color-bg-alt)] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 sm:py-24 px-4 sm:px-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="sm:w-7 sm:h-7 text-[var(--color-muted)]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--color-text)] mb-2">No products found</h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={clearFilters}
              className="bg-[var(--color-secondary)] text-[var(--color-text-inverse)] rounded-xl text-sm font-semibold cursor-pointer hover:bg-[var(--color-secondary-light)] transition-colors border-none px-6 sm:px-8 py-2.5 sm:py-3"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`grid ${gridClass} gap-3 sm:gap-5`}>
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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease;
        }
      `}</style>
    </div>
  )
}

/* ─── Shared Filter Content ─── */
function FilterContent({ categories, filters, updateFilter, applyPriceRange, extraFilters, toggleExtraFilter }) {
  return (
    <div className="flex flex-col gap-1">

      {/* Category */}
      <FilterSection title="Category">
        <div className="flex flex-col gap-2 sm:gap-2.5">
          <label className="flex items-center cursor-pointer gap-2 sm:gap-2.5">
            <input
              type="radio"
              name="cat"
              value=""
              checked={filters.category === ''}
              onChange={() => updateFilter('category', '')}
              className="accent-[var(--color-primary)] w-4 h-4"
            />
            <span className="text-xs sm:text-xs text-[var(--color-text)]">All Categories</span>
          </label>
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center cursor-pointer gap-2 sm:gap-2.5">
              <input
                type="radio"
                name="cat"
                value={cat.slug}
                checked={filters.category === cat.slug}
                onChange={() => updateFilter('category', cat.slug)}
                className="accent-[var(--color-primary)] w-4 h-4"
              />
              <span className="text-xs sm:text-xs text-[var(--color-text)]">{cat.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price Range">
        <div className="flex flex-col gap-2 sm:gap-2.5">
          {PRICE_RANGES.map(range => (
            <label key={range.label} className="flex items-center cursor-pointer gap-2 sm:gap-2.5">
              <input
                type="radio"
                name="price"
                checked={filters.min_price == range.min && filters.max_price == range.max}
                onChange={() => applyPriceRange(range)}
                className="accent-[var(--color-primary)] w-4 h-4"
              />
              <span className="text-xs sm:text-xs text-[var(--color-text)]">{range.label}</span>
            </label>
          ))}
          <div className="flex gap-2 mt-1">
            <input
              type="number"
              placeholder="Min"
              value={filters.min_price}
              onChange={e => updateFilter('min_price', e.target.value)}
              className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] px-3 py-2 sm:py-2.5 placeholder:text-[var(--color-muted-light)]"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.max_price}
              onChange={e => updateFilter('max_price', e.target.value)}
              className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] px-3 py-2 sm:py-2.5 placeholder:text-[var(--color-muted-light)]"
            />
          </div>
        </div>
      </FilterSection>

      {/* Extra Filters */}
      {EXTRA_FILTERS.map(section => (
        <FilterSection key={section.title} title={section.title}>
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {section.options.map(option => {
              const key = `${section.title}-${option}`
              return (
                <label
                  key={option}
                  className="flex items-center justify-between cursor-pointer text-xs text-[var(--color-text)] py-0.5 sm:py-1"
                >
                  <span>{option}</span>
                  <input
                    type="checkbox"
                    checked={!!extraFilters[key]}
                    onChange={() => toggleExtraFilter(section.title, option)}
                    className="accent-[var(--color-primary)] w-4 h-4"
                  />
                </label>
              )
            })}
          </div>
        </FilterSection>
      ))}

      {/* Stock */}
      <FilterSection title="Availability">
        <label className="flex items-center cursor-pointer gap-2 sm:gap-2.5">
          <input
            type="checkbox"
            checked={filters.in_stock === 'true'}
            onChange={e => updateFilter('in_stock', e.target.checked ? 'true' : '')}
            className="accent-[var(--color-primary)] w-4 h-4"
          />
          <span className="text-xs sm:text-xs text-[var(--color-text)]">In Stock Only</span>
        </label>
      </FilterSection>

    </div>
  )
}