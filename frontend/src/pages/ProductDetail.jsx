import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  ShoppingBag,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Truck,
  RefreshCw,
  Banknote,
  Zap,
  Star,
  Ruler,
  Sparkles,
  MapPin,
  ZoomIn,
  ZoomOut,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import api from '../services/api'
import useCartStore from '../store/cartStore'
import useWishlistStore from '../store/wishlistStore'
import useAuthStore from '../store/authStore'
import ProductCard from '../components/ProductCard'

function SaleTimer() {
  const [time, setTime] = useState({ h: 10, m: 49, s: 59 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev

        s -= 1

        if (s < 0) {
          s = 59
          m -= 1
        }

        if (m < 0) {
          m = 59
          h -= 1
        }

        if (h < 0) return { h: 23, m: 59, s: 59 }

        return { h, m, s }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const pad = (value) => String(value).padStart(2, '0')

  return (
    <div className="bg-gold/10 border border-gold/20 px-4 py-3 flex items-center justify-between gap-3">
      <span className="text-[10px] sm:text-xs font-mono tracking-wider uppercase text-gold flex items-center gap-2">
        <Sparkles size={14} />
        Sale Ends In
      </span>

      <div className="flex items-center gap-1">
        {[pad(time.h), pad(time.m), pad(time.s)].map((value, index, arr) => (
          <span key={index} className="flex items-center gap-1">
            <span className="bg-black border border-gold/20 text-gold px-2 py-1 text-xs font-mono min-w-[30px] text-center">
              {value}
            </span>
            {index < arr.length - 1 && (
              <span className="text-gold text-xs font-bold">:</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

function AccordionItem({ title, content }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gold/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full py-4 flex justify-between items-center bg-transparent border-none cursor-pointer text-left text-white hover:text-gold transition-colors"
      >
        <span className="text-xs sm:text-sm font-mono tracking-wider uppercase">
          {title}
        </span>

        {open ? (
          <ChevronUp size={15} className="text-gold" />
        ) : (
          <ChevronDown size={15} className="text-muted" />
        )}
      </button>

      {open && (
        <div className="pb-4 text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed animate-fadeIn">
          {content || 'Information will be updated soon.'}
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
          className="bg-transparent border-none cursor-pointer text-xl transition-transform hover:scale-110"
          style={{ color: star <= value ? '#D4AF37' : 'rgba(212,175,55,0.18)' }}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
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

  const [zoomOpen, setZoomOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  const { addToCart } = useCartStore()
  const { toggle, isWishlisted } = useWishlistStore()
  const { isAuthenticated, user } = useAuthStore()

  const zoomIn = () => setZoomLevel((z) => Math.min(3, +(z + 0.5).toFixed(1)))
  const zoomOut = () => setZoomLevel((z) => Math.max(1, +(z - 0.5).toFixed(1)))
  const zoomReset = () => setZoomLevel(1)

  useEffect(() => {
    let mounted = true

    setLoading(true)
    setSelImage(0)
    setSelSize(null)
    setQuantity(1)
    setZoomOpen(false)
    setZoomLevel(1)

    Promise.all([
      api.get(`/products/${slug}/`),
      api.get(`/products/${slug}/related/`).catch(() => ({ data: [] })),
    ])
      .then(([productRes, relatedRes]) => {
        if (!mounted) return

        setProduct(productRes.data)
        setRelated(relatedRes.data.results || relatedRes.data || [])
        setReviews(productRes.data.reviews || [])
      })
      .catch(() => navigate('/products'))
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [slug, navigate])

  const fetchReviews = async () => {
    if (!product?.id) return

    try {
      const { data } = await api.get(`/reviews/product/${product.id}/`)
      setReviews(data.results || data || [])
    } catch (error) {
      console.error('Failed to load reviews', error)
    }
  }

  useEffect(() => {
    if (product?.id) fetchReviews()
  }, [product?.id])

  useEffect(() => {
    if (!isAuthenticated || !product?.id) return

    api
      .get('/orders/my/')
      .then((res) => {
        const orders = res.data.results || res.data || []

        const purchased = orders.some((order) =>
          order.items?.some(
            (item) => item.product?.id === product.id || item.product_id === product.id
          )
        )

        setHasPurchased(purchased)
      })
      .catch(() => setHasPurchased(false))
  }, [isAuthenticated, product?.id])

  const images = product?.images?.length > 0 ? product.images : []
  const sizes = product?.available_sizes || []
  const hasSizes = sizes.length > 0
  const wishlisted = isWishlisted(product?.id)

  const prevImage = () => {
    if (!images.length) return
    setSelImage((index) => (index - 1 + images.length) % images.length)
  }

  const nextImage = () => {
    if (!images.length) return
    setSelImage((index) => (index + 1) % images.length)
  }

  const validateAndAdd = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in first')
      return false
    }

    if (hasSizes && !selSize) {
      toast.error('Please select a size first')
      document
        .getElementById('size-section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return false
    }

    return true
  }

  const handleAddToCart = async () => {
    if (!validateAndAdd()) return

    setAddingCart(true)

    try {
      await addToCart(product.id, quantity, selSize)
      toast.success(selSize ? `Added to cart! Size: ${selSize}` : 'Added to cart!')
    } catch {
      toast.error('Failed to add')
    } finally {
      setTimeout(() => setAddingCart(false), 900)
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
    if (!isAuthenticated) {
      toast.error('Please sign in first')
      return
    }

    await toggle(product.id)
    toast.success(isWishlisted(product.id) ? 'Removed from wishlist' : 'Saved to wishlist!')
  }

  const submitReview = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in first')
      return
    }

    if (!newRating) {
      toast.error('Please select a rating')
      return
    }

    if (!newComment.trim()) {
      toast.error('Please write a review')
      return
    }

    setSubmittingReview(true)

    try {
      await api.post(`/reviews/product/${product.id}/create/`, {
        rating: newRating,
        comment: newComment.trim(),
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
      await api.patch(`/reviews/${reviewId}/reply/`, {
        admin_reply: replyText.trim(),
      })

      toast.success('Reply posted!')
      setReplyingTo(null)
      setReplyText('')
      fetchReviews()
    } catch {
      toast.error('Failed to post reply')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[88px_1fr_420px] gap-6 animate-pulse">
            <div className="hidden lg:flex flex-col gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="w-[76px] h-[92px] skeleton-dark" />
              ))}
            </div>

            <div className="skeleton-dark aspect-[3/4]" />

            <div className="flex flex-col gap-4 pt-2">
              {[80, 45, 60, 35, 100, 50, 70].map((width, index) => (
                <div
                  key={index}
                  className="h-4 skeleton-dark"
                  style={{ width: `${width}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] pb-12 overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="border-b border-gold/10 bg-[#050505]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="text-[10px] sm:text-xs text-muted font-mono tracking-wider flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-gold transition-colors">
              Home
            </Link>
            <span>›</span>

            <Link to="/products" className="hover:text-gold transition-colors">
              Products
            </Link>
            <span>›</span>

            {product.category && (
              <>
                <Link
                  to={`/products?category_slug=${product.category.slug}`}
                  className="hover:text-gold transition-colors"
                >
                  {product.category.name}
                </Link>
                <span>›</span>
              </>
            )}

            <span className="text-white truncate max-w-[220px] sm:max-w-md">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[88px_minmax(0,1fr)_420px] gap-5 sm:gap-6 lg:gap-8 items-start">
          {/* Desktop thumbnails */}
          <aside className="hidden lg:flex flex-col gap-3 sticky top-28">
            {images.length > 0 ? (
              images.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelImage(index)}
                  className={`w-[76px] h-[92px] overflow-hidden border transition-all bg-black p-0 cursor-pointer ${
                    selImage === index
                      ? 'border-gold opacity-100 shadow-[0_0_22px_rgba(212,175,55,0.25)]'
                      : 'border-gold/15 opacity-60 hover:opacity-100 hover:border-gold/45'
                  }`}
                >
                  <img
                    src={img.image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))
            ) : (
              <div className="w-[76px] h-[92px] bg-[#0A0A0A] border border-gold/10 flex items-center justify-center text-2xl">
                🛍️
              </div>
            )}
          </aside>

          {/* Main Image */}
          <section className="lg:sticky lg:top-28">
            <div className="relative overflow-hidden bg-[#0A0A0A] border border-gold/15">
              {images.length > 0 ? (
                <img
                  key={selImage}
                  src={images[selImage].image}
                  alt={product.name}
                  onClick={() => {
                    setZoomOpen(true)
                    setZoomLevel(1)
                  }}
                  className="w-full h-[420px] sm:h-[560px] lg:h-[680px] object-cover block cursor-zoom-in"
                />
              ) : (
                <div className="w-full h-[420px] sm:h-[560px] lg:h-[680px] flex items-center justify-center text-7xl bg-[#0A0A0A]">
                  🛍️
                </div>
              )}

              {images.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setZoomOpen(true)
                    setZoomLevel(1)
                  }}
                  className="absolute top-3 right-3 w-10 h-10 bg-black/80 backdrop-blur-sm border border-gold/20 flex items-center justify-center text-gold hover:border-gold/50 hover:bg-gold/10 transition-all"
                  aria-label="Zoom image"
                >
                  <ZoomIn size={17} />
                </button>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/75 backdrop-blur-sm border border-gold/20 flex items-center justify-center text-gold hover:bg-gold/10 hover:border-gold/50 transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/75 backdrop-blur-sm border border-gold/20 flex items-center justify-center text-gold hover:bg-gold/10 hover:border-gold/50 transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelImage(index)}
                        className={`h-[2px] transition-all duration-300 ${
                          selImage === index
                            ? 'w-8 bg-gold'
                            : 'w-4 bg-gold/35 hover:bg-gold/60'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mobile thumbnails */}
            {images.length > 1 && (
              <div className="flex lg:hidden gap-2 overflow-x-auto mt-3 pb-1 scrollbar-hide">
                {images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelImage(index)}
                    className={`w-16 h-20 shrink-0 overflow-hidden border bg-black p-0 ${
                      selImage === index
                        ? 'border-gold'
                        : 'border-gold/15 opacity-65'
                    }`}
                  >
                    <img
                      src={img.image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Product Info */}
          <section className="flex flex-col gap-4">
            {product.sale_price && <SaleTimer />}

            <div className="flex items-start gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="label-gold mb-2">
                  {product.category?.name || 'Artifact'}
                </p>

                <h1 className="font-display text-xl sm:text-2xl lg:text-3xl text-white tracking-[0.12em] leading-tight">
                  {product.name}
                </h1>
              </div>

              <button
                type="button"
                onClick={handleWishlist}
                className={`w-11 h-11 shrink-0 flex items-center justify-center border transition-all duration-300 ${
                  wishlisted
                    ? 'bg-red-400/10 border-red-400/40 text-red-400'
                    : 'bg-[#0A0A0A] border-gold/15 text-muted hover:border-red-400/40 hover:text-red-400'
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="bg-[#0A0A0A] border border-gold/15 p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-display text-3xl sm:text-4xl text-gradient-gold">
                  ₹{Number(product.effective_price).toLocaleString('en-IN')}
                </span>

                {product.sale_price && (
                  <>
                    <span className="text-sm text-muted line-through font-mono">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </span>

                    <span className="text-[10px] font-mono tracking-wider uppercase text-red-400 bg-red-400/10 border border-red-400/25 px-2 py-1">
                      {product.discount_percent}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="text-[10px] sm:text-xs text-muted font-mono tracking-wider mt-2">
                Inclusive of all taxes.
              </p>
            </div>

            {product.rating_count > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-gold/10 border border-gold/20 px-2.5 py-1">
                  <Star size={13} className="text-gold fill-gold" />
                  <span className="text-xs font-mono text-gold">
                    {product.rating_avg?.toFixed(1)}
                  </span>
                </div>

                <span className="text-xs text-muted font-mono">
                  {product.rating_count} reviews
                </span>

                <span
                  className={`text-xs font-mono ${
                    product.in_stock ? 'text-gold' : 'text-red-400'
                  }`}
                >
                  {product.in_stock ? '● In Stock' : '● Out of Stock'}
                </span>
              </div>
            )}

            <div className="divider-gold" />

            {/* Size */}
            {hasSizes && (
              <div id="size-section" className="bg-[#0A0A0A] border border-gold/15 p-4">
                <div className="flex justify-between items-center gap-3 mb-3">
                  <p className="text-xs font-mono tracking-wider uppercase text-white">
                    Select Size{' '}
                    {selSize && <span className="text-gold">— {selSize}</span>}
                  </p>

                  <button
                    type="button"
                    className="text-[10px] sm:text-xs text-muted hover:text-gold bg-transparent border-none cursor-pointer flex items-center gap-1 font-mono"
                  >
                    <Ruler size={12} />
                    Size Guide
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const isSelected = selSize === size

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelSize(size)}
                        className={`min-w-[44px] h-10 px-3 text-xs font-mono tracking-wider border transition-all duration-300 ${
                          isSelected
                            ? 'bg-gold border-gold text-black'
                            : 'bg-black border-gold/15 text-white hover:border-gold/45 hover:text-gold'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>

                {!selSize && (
                  <p className="text-[10px] sm:text-xs text-muted font-mono mt-3">
                    Please select a size to continue.
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            {product.in_stock && (!hasSizes || selSize) && (
              <div className="bg-[#0A0A0A] border border-gold/15 p-4">
                <p className="text-xs font-mono tracking-wider uppercase text-white mb-3">
                  Quantity
                </p>

                <div className="flex items-center border border-gold/15 bg-black w-fit">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-muted hover:text-gold hover:bg-gold/5 transition-all"
                  >
                    −
                  </button>

                  <span className="w-11 h-10 flex items-center justify-center text-sm font-mono text-white border-x border-gold/15">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-black bg-gold hover:bg-gold-light transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.in_stock || addingCart}
                className={`btn-outline w-full inline-flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed ${
                  addingCart ? '!bg-gold !text-black !border-gold' : ''
                }`}
              >
                {addingCart ? (
                  <>
                    <CheckCircle2 size={16} />
                    ADDED
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    {product.in_stock ? 'ADD TO CART' : 'SOLD OUT'}
                  </>
                )}
              </button>

              {product.in_stock && (
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={buyingNow}
                  className="btn-primary w-full inline-flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {buyingNow ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      LOADING
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      BUY NOW
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Pincode */}
            <div className="flex gap-2 border border-gold/15 px-3 py-2.5 items-center bg-[#0A0A0A]">
              <MapPin size={15} className="text-muted shrink-0" />

              <input
                type="text"
                value={pincode}
                onChange={(event) =>
                  setPincode(event.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder="Enter Pincode"
                className="flex-1 min-w-0 border-none outline-none text-sm bg-transparent text-white placeholder:text-muted/50 font-mono tracking-wider p-0"
              />

              <button
                type="button"
                onClick={() =>
                  pincode.length === 6
                    ? toast.success('Delivery available!')
                    : toast.error('Enter valid pincode')
                }
                className="bg-transparent border-none text-gold text-xs font-mono tracking-wider cursor-pointer hover:text-gold-light transition-colors"
              >
                CHECK
              </button>
            </div>

            {/* Service badges */}
            <div className="grid grid-cols-3 gap-2 bg-[#0A0A0A] border border-gold/15 p-3">
              {[
                { icon: Banknote, label: 'Cash On Delivery' },
                { icon: Truck, label: 'Free Shipping' },
                { icon: RefreshCw, label: 'Easy Returns' },
              ].map((badge) => {
                const Icon = badge.icon

                return (
                  <div key={badge.label} className="text-center border border-gold/10 p-3">
                    <div className="text-gold mb-2 flex justify-center">
                      <Icon size={18} />
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-mono text-white tracking-wider uppercase leading-tight">
                      {badge.label}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Accordion */}
            <div className="bg-[#0A0A0A] border border-gold/15 p-4">
              <AccordionItem title="Product Description" content={product.description} />
              <AccordionItem
                title="Shipping Info"
                content="Free shipping on orders above ₹999. Standard delivery in 5–7 business days."
              />
              <AccordionItem
                title="7 Days Returns & Exchange"
                content="Easy returns within 7 days of delivery. Product must be unworn and in original condition with all tags intact."
              />
            </div>
          </section>
        </div>

        {/* Reviews */}
        <section className="mt-14 sm:mt-16 pt-8 sm:pt-10 border-t border-gold/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 border border-gold/20 bg-gold/10 flex items-center justify-center">
              <Star size={18} className="text-gold" />
            </div>

            <div>
              <p className="label-gold mb-1">Community Signal</p>
              <h2 className="font-display text-lg sm:text-xl text-white tracking-[0.12em]">
                CUSTOMER REVIEWS ({reviews.length})
              </h2>
            </div>
          </div>

          {isAuthenticated && (
            <div className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-5 mb-8">
              <p className="text-sm font-mono text-white tracking-wider mb-3">
                Write a Review
                {hasPurchased && (
                  <span className="text-[10px] text-gold ml-2">
                    ✓ Verified Purchase
                  </span>
                )}
              </p>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-muted font-mono">Your Rating:</span>
                  <StarRatingInput value={newRating} onChange={setNewRating} />
                </div>

                <textarea
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  placeholder="Share your experience with this artifact..."
                  rows={4}
                  className="w-full text-sm bg-black border border-gold/15 text-white px-4 py-3 outline-none focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all resize-none placeholder:text-muted/50 font-mono tracking-wider"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={submitReview}
                    disabled={submittingReview}
                    className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        SUBMITTING
                      </>
                    ) : (
                      'SUBMIT REVIEW'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="text-center p-8 bg-[#0A0A0A] border border-gold/15">
              <Star size={34} className="text-gold/35 mx-auto mb-3" />
              <p className="text-sm text-muted font-mono">
                No reviews yet. Be the first to review.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 bg-[#0A0A0A] border border-gold/15"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-gold text-black flex items-center justify-center font-mono text-xs">
                      {review.user?.name?.[0] || 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-white tracking-wider">
                        {review.user?.name || 'Anonymous'}
                      </p>

                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-xs ${
                              star <= review.rating ? 'text-gold' : 'text-gold/20'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    {review.is_verified && (
                      <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-1 border border-gold/20 bg-gold/10 text-gold">
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed text-muted font-mono tracking-wider">
                    {review.comment}
                  </p>

                  <p className="text-[10px] mt-2 text-muted font-mono">
                    {new Date(review.created_at).toLocaleDateString('en-IN')}
                  </p>

                  {review.admin_reply && (
                    <div className="mt-3 p-3 bg-gold/10 border border-gold/20">
                      <p className="text-[10px] font-mono uppercase tracking-wider mb-1 text-gold">
                        Admin Response
                      </p>
                      <p className="text-xs text-muted font-mono leading-relaxed">
                        {review.admin_reply}
                      </p>
                    </div>
                  )}

                  {user?.is_staff && (
                    <div className="mt-3">
                      {replyingTo === review.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={replyText}
                            onChange={(event) => setReplyText(event.target.value)}
                            placeholder="Write admin reply..."
                            rows={2}
                            className="w-full text-xs bg-black border border-gold/15 text-white px-3 py-2 outline-none focus:border-gold resize-none placeholder:text-muted/50"
                          />

                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setReplyingTo(null)}
                              className="btn-outline !px-4 !py-2 text-xs"
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={() => submitAdminReply(review.id)}
                              className="btn-primary !px-4 !py-2 text-xs"
                            >
                              Post Reply
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingTo(review.id)
                            setReplyText('')
                          }}
                          className="text-[11px] font-mono tracking-wider cursor-pointer bg-transparent border-none text-gold hover:text-gold-light transition-colors"
                        >
                          Reply as Admin
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-14 sm:mt-16 pt-8 sm:pt-10 border-t border-gold/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 border border-gold/20 bg-gold/10 flex items-center justify-center">
                <Sparkles size={18} className="text-gold" />
              </div>

              <div>
                <p className="label-gold mb-1">Similar Signals</p>
                <h2 className="font-display text-lg sm:text-xl text-white tracking-[0.12em]">
                  SIMILAR PRODUCTS
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {related.slice(0, 4).map((item, index) => (
                <ProductCard key={item.id} product={item} index={index} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Zoom Modal */}
      {zoomOpen && images.length > 0 && (
        <div
          onClick={() => {
            setZoomOpen(false)
            setZoomLevel(1)
          }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3 sm:p-5"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative bg-[#0A0A0A] border border-gold/20 shadow-[0_30px_120px_rgba(0,0,0,0.75)] flex flex-col w-full max-w-5xl max-h-[92vh]"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gold/10">
              <span className="text-xs sm:text-sm font-mono text-white tracking-wider truncate">
                {product.name}
              </span>

              <button
                type="button"
                onClick={() => {
                  setZoomOpen(false)
                  setZoomLevel(1)
                }}
                className="w-9 h-9 flex items-center justify-center hover:bg-gold/10 text-gold transition-colors bg-transparent border border-gold/15"
                aria-label="Close zoom"
              >
                <X size={17} />
              </button>
            </div>

            <div className="overflow-auto flex-1 flex items-center justify-center bg-black min-h-[320px] sm:min-h-[480px]">
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

            <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-gold/10 bg-[#0A0A0A]">
              <button
                type="button"
                onClick={zoomOut}
                disabled={zoomLevel <= 1}
                className="w-10 h-10 border border-gold/15 flex items-center justify-center bg-black hover:bg-gold/10 text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ZoomOut size={17} />
              </button>

              <span className="text-xs font-mono text-white min-w-[52px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>

              <button
                type="button"
                onClick={zoomIn}
                disabled={zoomLevel >= 3}
                className="w-10 h-10 border border-gold/15 flex items-center justify-center bg-black hover:bg-gold/10 text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ZoomIn size={17} />
              </button>

              <button
                type="button"
                onClick={zoomReset}
                className="w-10 h-10 border border-gold/15 flex items-center justify-center bg-black hover:bg-gold/10 text-gold transition-colors"
                title="Reset zoom"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.25s ease;
        }
      `}</style>
    </div>
  )
}