import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ShoppingBag, Heart, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Truck, RefreshCw, Banknote, Zap } from 'lucide-react'
import api from '../services/api'
import useCartStore from '../store/cartStore'
import useWishlistStore from '../store/wishlistStore'
import useAuthStore from '../store/authStore'
import ProductCard from '../components/ProductCard'

function SaleTimer() {
  const [time, setTime] = useState({ h: 10, m: 49, s: 59 })
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev
        s--
        if (s < 0) { s = 59; m-- }
        if (m < 0) { m = 59; h-- }
        if (h < 0) return { h: 23, m: 59, s: 59 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])
  const pad = n => String(n).padStart(2, '0')
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-md px-3 py-2 flex items-center justify-between mb-4">
      <span className="text-[11px] font-bold text-amber-800 tracking-wide">
        🔥 SALE ENDS IN
      </span>
      <div className="flex gap-1 items-center">
        {[pad(time.h), pad(time.m), pad(time.s)].map((v, i, arr) => (
          <span key={i} className="flex items-center gap-1">
            <span className="bg-slate-900 text-white px-1.5 py-0.5 rounded text-xs font-bold font-mono min-w-[26px] text-center">
              {v}
            </span>
            {i < arr.length - 1 && <span className="text-amber-800 font-bold text-xs">:</span>}
          </span>
        ))}
      </div>
    </div>
  )
}

function AccordionItem({ title, content }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full py-2.5 flex justify-between items-center bg-transparent border-none cursor-pointer text-left"
      >
        <span className="text-xs font-bold text-slate-900 tracking-wide uppercase">{title}</span>
        {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>
      {open && (
        <div className="pb-3 text-xs text-slate-500 leading-relaxed animate-[fadeIn_0.3s_ease]">
          {content}
        </div>
      )}
    </div>
  )
}

export default function ProductDetail() {
  const { slug }   = useParams()
  const navigate   = useNavigate()
  const [product,  setProduct]  = useState(null)
  const [related,  setRelated]  = useState([])
  const [selImage, setSelImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selSize,  setSelSize]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [pincode,  setPincode]  = useState('')
  const [addingCart, setAddingCart] = useState(false)
  const [buyingNow,  setBuyingNow]  = useState(false)

  const { addToCart }    = useCartStore()
  const { toggle, isWishlisted } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    setLoading(true)
    setSelImage(0)
    setSelSize(null)
    Promise.all([
      api.get(`/products/${slug}/`),
      api.get(`/products/${slug}/related/`).catch(() => ({ data: [] })),
    ]).then(([p, r]) => {
      setProduct(p.data)
      setRelated(r.data.results || r.data || [])
    }).catch(() => navigate('/products'))
    .finally(() => setLoading(false))
  }, [slug])

  const hasSizes = product?.available_sizes?.length > 0

  const validateAndAdd = () => {
    if (!isAuthenticated) { toast.error('Please sign in first'); return false }
    if (hasSizes && !selSize) {
      toast.error('Please select a size!')
      document.getElementById('size-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return false
    }
    return true
  }

  const handleAddToCart = async () => {
    if (!validateAndAdd()) return
    setAddingCart(true)
    try {
      await addToCart(product.id, quantity, selSize)
      toast.success(`Added to cart! ${selSize ? `Size: ${selSize}` : ''}`)
    } catch { toast.error('Failed to add') }
    finally { setTimeout(() => setAddingCart(false), 1000) }
  }

  const handleBuyNow = async () => {
    if (!validateAndAdd()) return
    setBuyingNow(true)
    try {
      await addToCart(product.id, quantity, selSize)
      navigate('/checkout')
    } catch { toast.error('Failed'); setBuyingNow(false) }
  }

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please sign in first'); return }
    await toggle(product.id)
    toast.success(isWishlisted(product.id) ? 'Removed from wishlist' : 'Saved to wishlist!')
  }

  const images = product?.images?.length > 0 ? product.images : []
  const wishlisted = isWishlisted(product?.id)
  const sizes = product?.available_sizes || []

  const prevImage = () => setSelImage(i => (i - 1 + images.length) % images.length)
  const nextImage = () => setSelImage(i => (i + 1) % images.length)

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_380px] gap-6 animate-pulse">
        <div className="hidden lg:flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-[72px] h-[88px] bg-slate-200 rounded-lg" />
          ))}
        </div>
        <div className="bg-slate-200 aspect-[3/4] rounded-xl" />
        <div className="flex flex-col gap-4 pt-5">
          {[80, 40, 60, 30, 100, 50, 70].map((w, i) => (
            <div key={i} className="h-3.5 bg-slate-200 rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  )

  if (!product) return null

  return (
    <div className="bg-white min-h-screen pb-12">

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 border-b border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
        <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <span>›</span>
        <Link to="/products" className="hover:text-slate-900 transition-colors">Products</Link>
        <span>›</span>
        {product.category && (
          <>
            <Link 
              to={`/products?category_slug=${product.category.slug}`}
              className="hover:text-slate-900 transition-colors"
            >
              {product.category.name}
            </Link>
            <span>›</span>
          </>
        )}
        <span className="text-slate-900 font-medium">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_380px] gap-6 lg:gap-8 items-start">

          {/* Thumbnail column */}
          <div className="hidden lg:flex flex-col gap-2 sticky top-28">
            {images.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setSelImage(i)}
                className={`w-[72px] h-[88px] rounded-lg overflow-hidden border-2 transition-colors bg-transparent p-0 flex-shrink-0 ${
                  selImage === i ? 'border-slate-900' : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <img src={img.image} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            {images.length === 0 && (
               <div className="w-[72px] h-[88px] bg-slate-100 rounded-lg flex items-center justify-center text-2xl">
                🛍️
              </div>
            )}
          </div>

          {/* Main image */}
          <div className="lg:sticky lg:top-28">
            <div className="rounded-lg overflow-hidden bg-slate-50 relative">
              {images[selImage]?.image ? (
  <img
    src={images[selImage].image}
    alt={product.name}
    className="w-full h-[480px] object-cover block"
  />
) : (
  <div className="w-full h-[480px] flex items-center justify-center text-7xl bg-slate-100">
    🛍️
  </div>
)}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.discount_percent > 0 && (
                  <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                    {product.discount_percent}% OFF
                  </span>
                )}
                {product.is_featured && (
                  <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                    BEST SELLER
                  </span>
                )}
              </div>

              {/* Image nav arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelImage(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer p-0 border-none ${
                        i === selImage ? 'w-5 bg-slate-900' : 'w-1.5 bg-black/25 hover:bg-black/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Mobile thumbnail strip */}
            <div className="flex lg:hidden gap-2 mt-3 overflow-x-auto pb-2 px-1">
              {images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setSelImage(i)}
                  className={`shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selImage === i ? 'border-slate-900' : 'border-slate-200'
                  }`}
                >
                  <img src={img.image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ═══════════════════════════════════════
              RIGHT SIDE — ULTRA COMPACT (Myntra Style)
              ═══════════════════════════════════════ */}
          <div className="flex flex-col gap-4">

            {/* Sale timer */}
            {product.sale_price && <SaleTimer />}

            {/* Price Row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-2xl font-extrabold text-slate-900 font-sans leading-none">
                ₹{Number(product.effective_price).toLocaleString('en-IN')}
              </span>
              {product.sale_price && (
                <>
                  <span className="text-sm text-slate-400 line-through leading-none">
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded leading-none">
                    {product.discount_percent}% OFF
                  </span>
                </>
              )}
              
              {/* Wishlist — Tiny */}
              <button
                onClick={handleWishlist}
                className={`ml-auto w-9 h-9 shrink-0 rounded-md flex items-center justify-center transition-all duration-200 border ${
                  wishlisted 
                    ? 'bg-red-50 border-red-400 text-red-500' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-red-400'
                }`}
              >
                <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} strokeWidth={2} />
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400">Inclusive of all taxes</p>

            {/* Title */}
            <h1 className="text-base font-bold text-slate-900 leading-snug font-sans">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating_count > 0 && (
              <div className="flex items-center gap-2 -mt-1">
                <div className="flex items-center gap-1 bg-slate-100 rounded px-2 py-0.5">
                  <span className="text-amber-500 text-xs">★</span>
                  <span className="text-xs font-bold text-slate-900">
                    {product.rating_avg?.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{product.rating_count} reviews</span>
                <span className={`text-[11px] font-semibold ${
                  product.in_stock ? 'text-green-600' : 'text-red-500'
                }`}>
                  {product.in_stock ? `● In Stock` : '● Out of Stock'}
                </span>
              </div>
            )}

            <hr className="border-slate-100" />

            {/* SIZE SELECTOR */}
            {hasSizes && (
              <div id="size-section">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[11px] font-bold text-slate-900 tracking-wide uppercase">
                    Select Size {selSize && <span className="text-slate-500 font-normal normal-case">— {selSize}</span>}
                  </p>
                  <button className="text-[11px] text-slate-400 underline bg-transparent border-none cursor-pointer hover:text-slate-600">
                    Size Guide
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => {
                    const isSelected = selSize === size
                    return (
                      <button
                        key={size}
                        onClick={() => setSelSize(size)}
                        className={`min-w-[40px] h-9 px-2.5 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 border cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>

                {hasSizes && !selSize && (
                  <p className="text-[11px] text-slate-400 mt-2">
                    Please select a size to continue
                  </p>
                )}
              </div>
            )}

            {/* Quantity — Tiny */}
            {product.in_stock && (
              <div>
                <p className="text-[11px] font-bold text-slate-900 mb-1.5 tracking-wide uppercase">
                  Quantity
                </p>
                <div className="flex items-center border border-slate-200 rounded-md overflow-hidden w-fit">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 bg-slate-50 hover:bg-slate-100 transition-colors text-base flex items-center justify-center text-slate-900 font-medium cursor-pointer border-none"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-bold font-sans border-x border-slate-100 h-9 flex items-center justify-center">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-9 h-9 bg-slate-50 hover:bg-slate-100 transition-colors text-base flex items-center justify-center text-slate-900 font-medium cursor-pointer border-none"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* CTA BUTTONS — Ultra Compact */}
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={!product.in_stock || addingCart}
                className={`flex-1 h-10 px-3 rounded-md text-[11px] font-bold tracking-wide uppercase flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                  addingCart
                    ? 'bg-green-600 text-white'
                    : product.in_stock
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ShoppingBag size={15} />
                {addingCart ? 'Added!' : product.in_stock ? 'Add to Cart' : 'Sold Out'}
              </button>

              {product.in_stock && (
                <button
                  onClick={handleBuyNow}
                  disabled={buyingNow}
                  className="flex-1 h-10 px-3 rounded-md text-[11px] font-bold tracking-wide uppercase bg-violet-600 text-white hover:bg-violet-700 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap size={15} />
                  {buyingNow ? 'Loading...' : 'Buy Now'}
                </button>
              )}
            </div>

            {/* Pincode — Compact */}
            <div>
              <div className="flex gap-2 border border-slate-200 rounded-md px-3 py-2 items-center">
                <span className="text-sm">📍</span>
                <input
                  type="text" 
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter Pincode"
                  className="flex-1 border-none outline-none text-xs bg-transparent text-slate-900 placeholder:text-slate-400"
                />
                <button
                  onClick={() => pincode.length === 6 && toast.success('Delivery available!')}
                  className="bg-transparent border-none text-slate-900 font-bold text-[11px] cursor-pointer hover:text-amber-600 transition-colors"
                >
                  CHECK
                </button>
              </div>
            </div>

            {/* Service badges — Compact */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-md p-3">
              {[
                { icon: <Banknote size={18} />, label: 'CASH ON\nDELIVERY' },
                { icon: <Truck size={18} />,    label: 'FREE\nSHIPPING' },
                { icon: <RefreshCw size={18} />, label: 'EASY\nRETURNS' },
              ].map(b => (
                <div key={b.label} className="text-center">
                  <div className="text-slate-900 mb-1.5 flex justify-center">
                    {b.icon}
                  </div>
                  <p className="text-[9px] font-bold text-slate-700 tracking-wider leading-tight whitespace-pre-line">
                    {b.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Accordion — Compact */}
            <div className='p-2.5'>
              <AccordionItem title="PRODUCT DESCRIPTION" content={product.description} />
              <AccordionItem title="SHIPPING INFO" content="Free shipping on orders above ₹999. Standard delivery in 5–7 business days." />
              <AccordionItem title="7 DAYS RETURNS & EXCHANGE" content="Easy returns within 7 days of delivery. Product must be unworn and in original condition with all tags intact." />
            </div>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews?.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-100">
            <h2 className="text-base font-extrabold tracking-wide mb-6 text-slate-900">
              CUSTOMER REVIEWS ({product.rating_count})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.reviews.map(r => (
                <div key={r.id} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {r.user?.name?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-900">{r.user?.name}</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`text-xs ${s <= r.rating ? 'text-amber-500' : 'text-slate-200'}`}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {r.is_verified && (
                      <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-100">
            <h2 className="text-base font-extrabold tracking-wide mb-6 text-slate-900">
              SIMILAR PRODUCTS
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.slice(0, 4).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}