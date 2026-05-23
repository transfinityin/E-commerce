import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  ShoppingBag, Heart, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Truck, RefreshCw, Banknote, Zap, Star, Shield, Clock, Ruler, Sparkles, MapPin,
  ZoomIn, ZoomOut, X
} from 'lucide-react'
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
    <div className="bg-[var(--color-warning-bg)] border border-[var(--color-warning)]/20 rounded-xl px-4 py-3 flex items-center justify-between mb-4">
      <span className="text-[11px] font-bold text-[var(--color-warning)] tracking-wide flex items-center gap-1.5">
        <Sparkles size={14} /> SALE ENDS IN
      </span>
      <div className="flex gap-1 items-center">
        {[pad(time.h), pad(time.m), pad(time.s)].map((v, i, arr) => (
          <span key={i} className="flex items-center gap-1">
            <span className="bg-[var(--color-secondary)] text-white px-2 py-1 rounded text-xs font-bold font-mono min-w-[28px] text-center">
              {v}
            </span>
            {i < arr.length - 1 && <span className="text-[var(--color-warning)] font-bold text-xs">:</span>}
          </span>
        ))}
      </div>
    </div>
  )
}

function AccordionItem({ title, content }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[var(--color-border)] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-3 flex justify-between items-center bg-transparent border-none cursor-pointer text-left hover:text-[var(--color-primary)] transition-colors"
      >
        <span className="text-xs font-bold text-[var(--color-text)] tracking-wide uppercase">{title}</span>
        {open ? <ChevronUp size={14} className="text-[var(--color-muted)]" /> : <ChevronDown size={14} className="text-[var(--color-muted)]" />}
      </button>
      {open && (
        <div className="pb-3 text-xs text-[var(--color-muted)] leading-relaxed animate-fadeIn">
          {content}
        </div>
      )}
    </div>
  )
}

function StarRatingInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="bg-transparent border-none cursor-pointer text-lg transition-transform hover:scale-110"
          style={{ color: star <= value ? 'var(--color-warning)' : 'var(--color-border-light)' }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [selImage, setSelImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selSize, setSelSize] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pincode, setPincode] = useState('')
  const [addingCart, setAddingCart] = useState(false)
  const [buyingNow, setBuyingNow] = useState(false)

  const [reviews, setReviews] = useState([])
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [hasPurchased, setHasPurchased] = useState(false)

  const { addToCart } = useCartStore()
  const { toggle, isWishlisted } = useWishlistStore()
  const { isAuthenticated, user } = useAuthStore()
  const [zoomOpen, setZoomOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

const zoomIn  = () => setZoomLevel(z => Math.min(3, +(z + 0.5).toFixed(1)))
const zoomOut = () => setZoomLevel(z => Math.max(1, +(z - 0.5).toFixed(1)))
const zoomReset = () => setZoomLevel(1)
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
      setReviews(p.data.reviews || [])
    }).catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }, [slug])

  const fetchReviews = async () => {
    if (!product?.id) return
    try {
      const { data } = await api.get(`/reviews/product/${product.id}/`)
      setReviews(data.results || data || [])
    } catch (e) {
      console.error('Failed to load reviews', e)
    }
  }

  useEffect(() => {
    if (product?.id) fetchReviews()
  }, [product?.id])

  useEffect(() => {
    if (isAuthenticated && product?.id) {
      api.get('/orders/my/')
        .then(r => {
          const orders = r.data.results || r.data || []
          const purchased = orders.some(o =>
            o.items?.some(i => i.product?.id === product.id || i.product_id === product.id)
          )
          setHasPurchased(purchased)
        })
        .catch(() => setHasPurchased(false))
    }
  }, [isAuthenticated, product?.id])

  const hasSizes = product?.available_sizes?.length > 0

  const validateAndAdd = () => {
    if (!isAuthenticated) { toast.error('Please sign in first'); return false }
    if (hasSizes && !selSize) {
      toast.error('Please select a size first!')
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
      toast.success(`Added to cart! Size: ${selSize}`)
    } catch {
      toast.error('Failed to add')
    } finally {
      setTimeout(() => setAddingCart(false), 1000)
    }
  }

  const handleBuyNow = async () => {
    if (!validateAndAdd()) return
    setBuyingNow(true)
    try {
      await addToCart(product.id, quantity, selSize)
      navigate('/checkout')
    } catch {
      toast.error('Failed')
      setBuyingNow(false)
    }
  }

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please sign in first'); return }
    await toggle(product.id)
    toast.success(isWishlisted(product.id) ? 'Removed from wishlist' : 'Saved to wishlist!')
  }

  const submitReview = async () => {
    if (!isAuthenticated) { toast.error('Please sign in first'); return }
    if (!newRating) { toast.error('Please select a rating'); return }
    if (!newComment.trim()) { toast.error('Please write a review'); return }
    setSubmittingReview(true)
    try {
      await api.post(`/reviews/product/${product.id}/create/`, {
        rating: newRating,
        comment: newComment
      })
      toast.success('Review submitted!')
      setNewRating(0)
      setNewComment('')
      fetchReviews()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const submitAdminReply = async (reviewId) => {
    if (!replyText.trim()) return
    try {
      await api.patch(`/reviews/${reviewId}/reply/`, { admin_reply: replyText })
      toast.success('Reply posted!')
      setReplyingTo(null)
      setReplyText('')
      fetchReviews()
    } catch {
      toast.error('Failed to post reply')
    }
  }

  const images = product?.images?.length > 0 ? product.images : []
  const wishlisted = isWishlisted(product?.id)
  const sizes = product?.available_sizes || []

  const prevImage = () => setSelImage(i => (i - 1 + images.length) % images.length)
  const nextImage = () => setSelImage(i => (i + 1) % images.length)

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_380px] gap-6 animate-pulse">
          <div className="hidden lg:flex flex-col gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-[72px] h-[88px] bg-[var(--color-bg-alt)] rounded-lg" />
            ))}
          </div>
          <div className="bg-[var(--color-bg-alt)] aspect-[3/4] rounded-xl" />
          <div className="flex flex-col gap-4 pt-5">
            {[80, 40, 60, 30, 100, 50, 70].map((w, i) => (
              <div key={i} className="h-3.5 bg-[var(--color-bg-alt)] rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  if (!product) return null

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-12">

      {/* Breadcrumb */}
      <div className="page-container py-3 border-b border-[var(--color-border)]">
        <nav className="text-xs text-[var(--color-muted)] flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-[var(--color-text)] transition-colors">Home</Link>
          <span className="text-[var(--color-muted-light)]">›</span>
          <Link to="/products" className="hover:text-[var(--color-text)] transition-colors">Products</Link>
          <span className="text-[var(--color-muted-light)]">›</span>
          {product.category && (
            <>
              <Link
                to={`/products?category_slug=${product.category.slug}`}
                className="hover:text-[var(--color-text)] transition-colors"
              >
                {product.category.name}
              </Link>
              <span className="text-[var(--color-muted-light)]">›</span>
            </>
          )}
          <span className="text-[var(--color-text)] font-medium">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_380px] gap-6 lg:gap-8 items-start">

          {/* ── Thumbnail Column (Desktop) ── */}
          <div className="hidden lg:flex flex-col gap-2 sticky top-28">
            {images.length > 0 ? images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelImage(i)}
                className={`w-[72px] h-[88px] rounded-lg overflow-hidden border-2 transition-all bg-transparent p-0 flex-shrink-0 cursor-pointer ${
                  selImage === i
                    ? 'border-[var(--color-primary)] opacity-100 shadow-md'
                    : 'border-[var(--color-border)] opacity-60 hover:opacity-100 hover:border-[var(--color-muted)]'
                }`}
              >
                <img src={img.image} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            )) : (
              <div className="w-[72px] h-[88px] bg-[var(--color-bg-alt)] rounded-lg flex items-center justify-center text-2xl">
                🛍️
              </div>
            )}
          </div>

          {/* ── Main Image ── */}
         {/* ── Main Image ── */}
<div className="lg:sticky lg:top-28">
  <div className="rounded-xl overflow-hidden bg-[var(--color-bg-alt)] border border-[var(--color-border)] relative">

    {images.length > 0 ? (
      <img
        key={selImage}
        src={images[selImage].image}
        alt={product.name}
        onClick={() => { setZoomOpen(true); setZoomLevel(1) }}
        className="w-full h-[480px] object-cover block cursor-zoom-in"
      />
    ) : (
      <div className="w-full h-[480px] flex items-center justify-center text-7xl bg-[var(--color-bg-alt)]">
        🛍️
      </div>
    )}

    {/* Zoom icon button */}
    {images.length > 0 && (
      <button
        onClick={() => { setZoomOpen(true); setZoomLevel(1) }}
        className="absolute top-3 right-3 w-9 h-9 bg-[var(--color-surface)]/90 border border-[var(--color-border)] rounded-lg flex items-center justify-center shadow-sm hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
        title="Zoom image"
      >
        <ZoomIn size={16} className="text-[var(--color-text)]" />
      </button>
    )}

   {/* Badges, Arrows, Dots */}
{images.length > 1 && (
  <>
    {/* Left Arrow */}
    <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 ...">
      <ChevronLeft size={20} />
    </button>
    {/* Right Arrow */}
    <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 ...">
      <ChevronRight size={20} />
    </button>
    {/* Dots */}
    <div className="absolute h-0  bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
      {images.map((_, i) => (
        <button key={i} onClick={() => setSelImage(i)} 
          className={`w-2 h-2 rounded-full ${selImage === i ? 'bg-white' : 'bg-white/50'}`} />
      ))}
    </div>
  </>
)}
  
{/* Mobile thumbnails */}

</div>
  {/* Mobile thumbnails — same as before */}
  <div className="flex lg:hidden gap-2 overflow-x-auto mt-3 pb-1 scrollbar-hide">
  {images.map((img, i) => (
    <button key={i} onClick={() => setSelImage(i)} 
      className={`w-16 h-20 shrink-0 rounded-lg overflow-hidden border-2 ${selImage === i ? 'border-primary' : 'border-border'}`}>
      <img src={img.image} className="w-full h-full object-cover" />
    </button>
  ))}
  </div>
</div>

{/* ── ZOOM MODAL ── */}
{zoomOpen && (
  <div
    onClick={() => { setZoomOpen(false); setZoomLevel(1) }}
    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
  >
    <div
      onClick={e => e.stopPropagation()}
      className="relative bg-[var(--color-surface)] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-w-3xl w-full max-h-[90vh]"
    >
      {/* Modal Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <span className="text-xs font-bold text-[var(--color-text)] truncate">{product.name}</span>
        <button
          onClick={() => { setZoomOpen(false); setZoomLevel(1) }}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer border-none bg-transparent"
        >
          <X size={16} className="text-[var(--color-text)]" />
        </button>
      </div>

      {/* Zoomed Image */}
      <div className="overflow-auto flex-1 flex items-center justify-center bg-[var(--color-bg-alt)]" style={{ minHeight: 360 ,minWidth: 600}}>
        <img
          src={images[selImage].image}
          alt={product.name}
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease',
            maxWidth: '100%',
            display: 'block',
          }}
        />
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <button
          onClick={zoomOut}
          disabled={zoomLevel <= 1}
          className="w-9 h-9 rounded-lg border border-[var(--color-border)] flex items-center justify-center bg-[var(--color-bg-alt)] hover:bg-[var(--color-border-light)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ZoomOut size={16} className="text-[var(--color-text)]" />
        </button>

        <span className="text-xs font-bold text-[var(--color-text)] min-w-[48px] text-center">
          {Math.round(zoomLevel * 100)}%
        </span>

        <button
          onClick={zoomIn}
          disabled={zoomLevel >= 3}
          className="w-9 h-9 rounded-lg border border-[var(--color-border)] flex items-center justify-center bg-[var(--color-bg-alt)] hover:bg-[var(--color-border-light)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ZoomIn size={16} className="text-[var(--color-text)]" />
        </button>

        <button
          onClick={zoomReset}
          className="w-9 h-9 rounded-lg border border-[var(--color-border)] flex items-center justify-center bg-[var(--color-bg-alt)] hover:bg-[var(--color-border-light)] transition-colors cursor-pointer ml-1"
          title="Reset zoom"
        >
          <RefreshCw size={14} className="text-[var(--color-text)]" />
        </button>
      </div>
    </div>
  </div>
)}

          {/* ── RIGHT SIDE — Product Info ── */}
          <div className="flex flex-col gap-4">

            {/* Sale Timer */}
            {product.sale_price && <SaleTimer />}

            {/* Price Row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-2xl font-extrabold text-[var(--color-text)] leading-none">
                ₹{Number(product.effective_price).toLocaleString('en-IN')}
              </span>
              {product.sale_price && (
                <>
                  <span className="text-sm text-[var(--color-muted)] line-through leading-none">
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-bold text-white bg-[var(--color-danger)] px-2 py-0.5 rounded leading-none">
                    {product.discount_percent}% OFF
                  </span>
                </>
              )}

              {/* Wishlist Button */}
              <button
                onClick={handleWishlist}
                className={`ml-auto w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-all duration-200 border cursor-pointer ${
                  wishlisted
                    ? 'bg-[var(--color-danger-bg)] border-[var(--color-danger)] text-[var(--color-danger)]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]'
                }`}
              >
                <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} strokeWidth={2} />
              </button>
            </div>

            <p className="text-[11px] text-[var(--color-muted)]">Inclusive of all taxes</p>

            {/* Title */}
            <h1 className="text-base font-bold text-[var(--color-text)] leading-snug">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating_count > 0 && (
              <div className="flex items-center gap-2 -mt-1">
                <div className="flex items-center gap-1 bg-[var(--color-bg-alt)] rounded-lg px-2 py-0.5 border border-[var(--color-border)]">
                  <Star size={12} className="text-[var(--color-warning)] fill-[var(--color-warning)]" />
                  <span className="text-xs font-bold text-[var(--color-text)]">
                    {product.rating_avg?.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-[var(--color-muted)]">{product.rating_count} reviews</span>
                <span className={`text-[11px] font-semibold ${product.in_stock ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                  {product.in_stock ? '● In Stock' : '● Out of Stock'}
                </span>
              </div>
            )}

            <hr className="border-[var(--color-border)]" />

            {/* Size Selector */}
            {hasSizes && (
              <div id="size-section">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[11px] font-bold text-[var(--color-text)] tracking-wide uppercase">
                    Select Size {selSize && <span className="text-[var(--color-muted)] font-normal normal-case">— {selSize}</span>}
                  </p>
                  <button className="text-[11px] text-[var(--color-muted)] underline bg-transparent border-none cursor-pointer hover:text-[var(--color-text)] transition-colors flex items-center gap-1">
                    <Ruler size={12} /> Size Guide
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
                            ? 'bg-[var(--color-secondary)] border-[var(--color-secondary)] text-[var(--color-text-inverse)]'
                            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)]'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>

                {hasSizes && !selSize && (
                  <p className="text-[11px] text-[var(--color-muted)] mt-2">
                    Please select a size to continue
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            {product.in_stock && (!hasSizes || selSize) && (
              <div>
                <p className="text-[11px] font-bold text-[var(--color-text)] mb-1.5 tracking-wide uppercase">
                  Quantity
                </p>
                <div className="flex items-center border border-[var(--color-border)] rounded-lg overflow-hidden w-fit bg-[var(--color-surface)]">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 bg-[var(--color-bg-alt)] hover:bg-[var(--color-border-light)] transition-colors text-base flex items-center justify-center text-[var(--color-text)] font-medium cursor-pointer border-none"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-[var(--color-text)] border-x border-[var(--color-border)] h-9 flex items-center justify-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-9 h-9 bg-[var(--color-bg-alt)] hover:bg-[var(--color-border-light)] transition-colors text-base flex items-center justify-center text-[var(--color-text)] font-medium cursor-pointer border-none"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={!product.in_stock || addingCart}
                className={`flex-1 h-11 px-3 rounded-lg text-[11px] font-bold tracking-wide uppercase flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                  addingCart
                    ? 'bg-[var(--color-success)] text-white'
                    : product.in_stock
                      ? 'bg-[var(--color-secondary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-secondary-light)]'
                      : 'bg-[var(--color-bg-alt)] text-[var(--color-muted)] cursor-not-allowed'
                }`}
              >
                <ShoppingBag size={15} />
                {addingCart ? 'Added!' : product.in_stock ? 'Add to Cart' : 'Sold Out'}
              </button>

              {product.in_stock && (
                <button
                  onClick={handleBuyNow}
                  disabled={buyingNow}
                  className="flex-1 h-11 px-3 rounded-lg text-[11px] font-bold tracking-wide uppercase bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg"
                >
                  <Zap size={15} />
                  {buyingNow ? 'Loading...' : 'Buy Now'}
                </button>
              )}
            </div>

            {/* Pincode Checker */}
            <div>
              <div className="flex gap-2 border border-[var(--color-border)] rounded-lg px-3 py-2 items-center bg-[var(--color-surface)]">
                <MapPin size={14} className="text-[var(--color-muted)]" />
                <input
                  type="text"
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter Pincode"
                  className="flex-1 border-none outline-none text-xs bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-muted-light)]"
                />
                <button
                  onClick={() => pincode.length === 6 && toast.success('Delivery available!')}
                  className="bg-transparent border-none text-[var(--color-text)] font-bold text-[11px] cursor-pointer hover:text-[var(--color-primary)] transition-colors"
                >
                  CHECK
                </button>
              </div>
            </div>

            {/* Service Badges */}
            <div className="grid grid-cols-3 gap-2 bg-[var(--color-bg-alt)] rounded-xl p-3 border border-[var(--color-border)]">
              {[
                { icon: <Banknote size={18} />, label: 'CASH ON\nDELIVERY' },
                { icon: <Truck size={18} />, label: 'FREE\nSHIPPING' },
                { icon: <RefreshCw size={18} />, label: 'EASY\nRETURNS' },
              ].map(b => (
                <div key={b.label} className="text-center">
                  <div className="text-[var(--color-text)] mb-1.5 flex justify-center">
                    {b.icon}
                  </div>
                  <p className="text-[9px] font-bold text-[var(--color-text)] tracking-wider leading-tight whitespace-pre-line">
                    {b.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Accordion */}
            <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
              <AccordionItem title="PRODUCT DESCRIPTION" content={product.description} />
              <AccordionItem title="SHIPPING INFO" content="Free shipping on orders above ₹999. Standard delivery in 5–7 business days." />
              <AccordionItem title="7 DAYS RETURNS & EXCHANGE" content="Easy returns within 7 days of delivery. Product must be unworn and in original condition with all tags intact." />
            </div>
          </div>
        </div>

        {/* ── REVIEWS SECTION ── */}
        <div className="mt-16 pt-10 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
              <Star size={16} className="text-[var(--color-primary)]" />
            </div>
            <h2 className="text-base font-extrabold tracking-wide text-[var(--color-text)]">
              CUSTOMER REVIEWS ({reviews.length})
            </h2>
          </div>

          {/* Review Input Form */}
          {isAuthenticated && (
            <div className="rounded-2xl p-5 mb-8 bg-[var(--color-bg-alt)] border border-[var(--color-border)]">
              <p className="text-sm font-bold mb-3 text-[var(--color-text)]">
                Write a Review {hasPurchased && <span className="text-[10px] font-normal text-[var(--color-success)] ml-2">✓ Verified Purchase</span>}
              </p>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-muted)]">Your Rating:</span>
                  <StarRatingInput value={newRating} onChange={setNewRating} />
                </div>

                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={3}
                  className="w-full rounded-xl text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all resize-none placeholder:text-[var(--color-muted-light)]"
                />

                <div className="flex justify-end">
                  <button
                    onClick={submitReview}
                    disabled={submittingReview}
                    className="text-sm font-semibold rounded-xl text-white transition-all duration-300 px-6 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 cursor-pointer"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center p-8 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
              <Star size={32} className="text-[var(--color-muted-light)] mx-auto mb-3" />
              <p className="text-sm text-[var(--color-muted)]">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map(r => (
                <div key={r.id} className="rounded-xl p-4 bg-[var(--color-bg-alt)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xs">
                      {r.user?.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[var(--color-text)]">{r.user?.name || 'Anonymous'}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <span key={s} className={`text-xs ${s <= r.rating ? 'text-[var(--color-warning)]' : 'text-[var(--color-border-light)]'}`}>★</span>
                        ))}
                      </div>
                    </div>
                    {r.is_verified && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)]">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-[var(--color-muted)]">{r.comment}</p>
                  <p className="text-[10px] mt-2 text-[var(--color-muted-light)]">
                    {new Date(r.created_at).toLocaleDateString('en-IN')}
                  </p>

                  {/* Admin Reply Display */}
                  {r.admin_reply && (
                    <div className="mt-3 rounded-lg p-3 bg-[var(--color-primary-light)] border border-[var(--color-primary)]">
                      <p className="text-[10px] font-bold uppercase tracking-wide mb-1 text-[var(--color-primary-dark)]">Admin Response</p>
                      <p className="text-xs text-[var(--color-text)]">{r.admin_reply}</p>
                    </div>
                  )}

                  {/* Admin Reply Input */}
                  {user?.is_staff && (
                    <div className="mt-3">
                      {replyingTo === r.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder="Write admin reply..."
                            rows={2}
                            className="w-full rounded-lg text-xs bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] px-3 py-2 outline-none focus:border-[var(--color-primary)] resize-none placeholder:text-[var(--color-muted-light)]"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setReplyingTo(null)}
                              className="text-xs font-semibold rounded-lg cursor-pointer px-3 py-1.5 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-bg-alt)] transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => submitAdminReply(r.id)}
                              className="text-xs font-semibold rounded-lg text-white cursor-pointer px-3 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition-colors"
                            >
                              Post Reply
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setReplyingTo(r.id); setReplyText('') }}
                          className="text-[11px] font-bold cursor-pointer bg-transparent border-none text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
                        >
                          💬 Reply as Admin
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                <Sparkles size={16} className="text-[var(--color-primary)]" />
              </div>
              <h2 className="text-base font-extrabold tracking-wide text-[var(--color-text)]">
                SIMILAR PRODUCTS
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.slice(0, 4).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}