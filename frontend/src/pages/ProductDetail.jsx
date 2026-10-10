import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  Heart,
  ChevronDown,
  ChevronUp,
  Truck,
  Banknote,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  X,
  Loader2,
} from 'lucide-react'
import api from '../services/api'
import useCartStore from '../store/cartStore'
import useWishlistStore from '../store/wishlistStore'
import useAuthStore from '../store/authStore'
import ProductCard from '../components/ProductCard'

const GALLERY_AUTO_MS = 4200
const SWIPE_THRESHOLD = 56

function AccordionItem({ title, content, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-neutral-300/70">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full py-5 flex justify-between items-center text-left bg-transparent"
      >
        <span className="text-[11px] font-medium tracking-[0.22em] uppercase text-neutral-800">
          {title}
        </span>
        {open ? (
          <ChevronUp size={16} strokeWidth={1.4} className="text-neutral-500" />
        ) : (
          <ChevronDown size={16} strokeWidth={1.4} className="text-neutral-400" />
        )}
      </button>
      {open && (
        <p className="pb-5 text-[13px] leading-[1.75] text-neutral-600 max-w-xl">
          {content || 'Information will be updated soon.'}
        </p>
      )}
    </div>
  )
}

function StarRatingInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="bg-transparent px-0.5 text-[1.65rem] leading-none transition-transform hover:scale-110 sm:text-[1.85rem]"
            style={{
              color: active ? '#C9A227' : 'rgba(201, 162, 39, 0.28)',
              textShadow: active ? '0 0 12px rgba(201, 162, 39, 0.35)' : 'none',
            }}
            aria-label={`Rate ${star}`}
          >
            ★
          </button>
        )
      })}
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
  const [galleryPaused, setGalleryPaused] = useState(false)
  const [slideDir, setSlideDir] = useState(1)
  const reduceMotion = useReducedMotion()

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
        const data = productRes.data
        setProduct(data)
        setRelated(relatedRes.data.results || relatedRes.data || [])
        setReviews(data.reviews || [])
        const available = Array.isArray(data.available_sizes) ? data.available_sizes : []
        // Prefer S so Buy Now / Add to Cart never fail on missing size
        const preferred =
          available.find((s) => String(s).toUpperCase() === 'S') || available[0] || null
        setSelSize(preferred)
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
            (item) => item.product?.id === product.id || item.product_id === product.id,
          ),
        )
        setHasPurchased(purchased)
      })
      .catch(() => setHasPurchased(false))
  }, [isAuthenticated, product?.id])

  const images = product?.images?.length > 0 ? product.images : []
  const sizes = product?.available_sizes || []
  const hasSizes = sizes.length > 0
  const wishlisted = isWishlisted(product?.id)

  const goToImage = (next, dir = 1) => {
    if (!images.length) return
    const len = images.length
    const index = ((next % len) + len) % len
    setSlideDir(dir)
    setSelImage(index)
  }

  const prevImage = () => goToImage(selImage - 1, -1)
  const nextImage = () => goToImage(selImage + 1, 1)

  // Auto-advance gallery
  useEffect(() => {
    if (images.length < 2 || galleryPaused || zoomOpen || reduceMotion) return
    const id = window.setInterval(() => {
      setSlideDir(1)
      setSelImage((i) => (i + 1) % images.length)
    }, GALLERY_AUTO_MS)
    return () => window.clearInterval(id)
  }, [images.length, galleryPaused, zoomOpen, reduceMotion, selImage])

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
      toast.success(selSize ? `Added to cart · ${selSize}` : 'Added to cart')
    } catch {
      toast.error('Failed to add')
    } finally {
      setTimeout(() => setAddingCart(false), 700)
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
    toast.success(isWishlisted(product.id) ? 'Removed from wishlist' : 'Saved')
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
      toast.success('Review submitted')
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
      toast.success('Reply posted')
      setReplyingTo(null)
      setReplyText('')
      fetchReviews()
    } catch {
      toast.error('Failed to post reply')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EFEFEF] pt-[64px] sm:pt-[76px] lg:pt-[88px]">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-8 px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="aspect-[4/3] animate-pulse bg-neutral-200/70" />
          <div className="flex flex-col gap-5 pt-4">
            {[40, 70, 30, 55, 45].map((w, i) => (
              <div key={i} className="h-3 animate-pulse bg-neutral-200/70" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="min-h-screen bg-[#EFEFEF] pt-[64px] sm:pt-[76px] lg:pt-[88px] pb-14 text-neutral-900">
      <main className="mx-auto max-w-[1180px] px-4 pt-2 sm:px-6 sm:pt-3 md:px-8 md:pt-4">
        <nav className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-400 sm:mb-4">
          <Link to="/" className="hover:text-neutral-700 transition-colors">
            Home
          </Link>
          <span className="opacity-40">/</span>
          <Link to="/products" className="hover:text-neutral-700 transition-colors">
            Shop
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-neutral-700 truncate max-w-[240px]">{product.name}</span>
        </nav>

        {/* Compact 2-col: image + buy panel close together */}
        <div className="grid grid-cols-1 items-start gap-5 md:gap-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-9">
          {/* Gallery — auto slider + drag/swipe, no arrows */}
          <section className="w-full">
            <div
              className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-[0_14px_40px_rgba(17,17,17,0.12)] touch-pan-y sm:aspect-[5/6]"
              onMouseEnter={() => setGalleryPaused(true)}
              onMouseLeave={() => setGalleryPaused(false)}
            >
              {images.length > 0 ? (
                <AnimatePresence initial={false} custom={slideDir} mode="popLayout">
                  <motion.img
                    key={selImage}
                    src={images[selImage].image}
                    alt={`${product.name} ${selImage + 1}`}
                    custom={slideDir}
                    variants={{
                      enter: (dir) => ({ x: dir > 0 ? '28%' : '-28%', opacity: 0 }),
                      center: { x: 0, opacity: 1 },
                      exit: (dir) => ({ x: dir > 0 ? '-28%' : '28%', opacity: 0 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                    drag={images.length > 1 ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.18}
                    onDragStart={() => setGalleryPaused(true)}
                    onDragEnd={(_, info) => {
                      const offset = info.offset.x
                      const velocity = info.velocity.x
                      if (offset < -SWIPE_THRESHOLD || velocity < -500) nextImage()
                      else if (offset > SWIPE_THRESHOLD || velocity > 500) prevImage()
                      window.setTimeout(() => setGalleryPaused(false), 2200)
                    }}
                    onDoubleClick={() => {
                      setZoomOpen(true)
                      setZoomLevel(1)
                    }}
                    className="absolute inset-0 h-full w-full rounded-2xl object-cover object-center cursor-grab active:cursor-grabbing select-none"
                    draggable={false}
                  />
                </AnimatePresence>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-neutral-200/50 text-neutral-400 text-sm tracking-[0.3em] uppercase">
                  No image
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleWishlist()
                }}
                className={`absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                  wishlisted
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'bg-transparent text-neutral-900 hover:bg-white hover:text-neutral-900 hover:shadow-sm'
                }`}
                aria-label="Wishlist"
              >
                <Heart
                  size={18}
                  strokeWidth={1.5}
                  fill={wishlisted ? 'currentColor' : 'none'}
                />
              </button>

              {images.length > 1 && (
                <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === selImage ? 'w-5 bg-white' : 'w-1.5 bg-white/45'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex items-center gap-2.5 overflow-x-auto pb-1">
                {images.map((img, i) => {
                  const active = i === selImage
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goToImage(i, i > selImage ? 1 : -1)}
                      className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white transition-all sm:h-16 sm:w-16 ${
                        active
                          ? 'ring-2 ring-neutral-900 shadow-sm'
                          : 'ring-1 ring-black/5 opacity-80 hover:opacity-100'
                      }`}
                      aria-label={`Thumbnail ${i + 1}`}
                    >
                      <img
                        src={img.image}
                        alt=""
                        className="h-full w-full object-cover object-center"
                        draggable={false}
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Buy panel — tighter stack, decision path first */}
          <section className="relative lg:sticky lg:top-28 lg:pt-1">
            <div className="min-w-0">
              <p className="text-[10px] font-medium tracking-[0.28em] text-neutral-500 uppercase">
                {product.category?.name || 'Tee'}
              </p>
              <h1 className="mt-2 font-sans text-[clamp(1.55rem,2.8vw,2.25rem)] font-semibold tracking-[0.03em] text-neutral-900 uppercase leading-[1.15]">
                {product.name}
              </h1>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <p className="font-sans text-[1.65rem] font-semibold tracking-wide text-neutral-900 sm:text-[1.85rem]">
                ₹ {Number(product.effective_price).toLocaleString('en-IN')}
              </p>
              {product.sale_price && (
                <span className="text-sm text-neutral-400 line-through">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="mt-1 text-[10px] tracking-[0.14em] text-neutral-400 uppercase">
              Inclusive of taxes
              {product.in_stock ? ' · In stock' : ' · Sold out'}
            </p>

            {hasSizes && (
              <div id="size-section" className="mt-6">
                <div className="mb-2.5 flex items-end justify-between gap-3">
                  <p className="text-[9px] font-medium tracking-[0.24em] text-neutral-400 uppercase">
                    Size{selSize ? ` · ${selSize}` : ''}
                  </p>
                  <button
                    type="button"
                    className="text-[10px] tracking-[0.16em] uppercase text-neutral-400 hover:text-neutral-700"
                  >
                    Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const active = selSize === size
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelSize(size)}
                        className={`min-w-[2.75rem] rounded-full px-3.5 py-2 text-[11px] font-medium tracking-[0.16em] uppercase transition-all ${
                          active
                            ? 'bg-neutral-950 text-white shadow-sm'
                            : 'bg-white text-neutral-600 ring-1 ring-black/8 hover:text-neutral-900'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
                {!selSize && (
                  <p className="mt-2 text-[11px] text-neutral-400">Select a size to continue</p>
                )}
              </div>
            )}

            {product.in_stock && (!hasSizes || selSize) && (
              <div className="mt-5 flex items-center gap-4">
                <span className="text-[9px] font-medium tracking-[0.24em] text-neutral-400 uppercase">
                  Qty
                </span>
                <div className="inline-flex items-center gap-1 rounded-full bg-white px-1 py-1 ring-1 ring-black/8">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="min-w-[1.75rem] text-center text-sm tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
              {product.in_stock && (
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={buyingNow}
                  className="tf-buy-now"
                >
                  <span>
                    {buyingNow ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Loading
                      </>
                    ) : (
                      <>
                        Buy Now
                        <ArrowRight className="size-3.5" strokeWidth={1.75} />
                      </>
                    )}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.in_stock || addingCart}
                className={`inline-flex h-12 w-full items-center justify-center rounded-full px-7 text-[11px] font-semibold tracking-[0.2em] uppercase transition disabled:opacity-45 ${
                  product.in_stock
                    ? 'bg-white text-neutral-900 ring-1 ring-neutral-900/12 hover:bg-neutral-50'
                    : 'bg-neutral-300 text-neutral-600'
                }`}
              >
                {addingCart ? 'Added' : product.in_stock ? 'Add To Cart' : 'Sold Out'}
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[10px] tracking-[0.16em] uppercase text-neutral-500">
              {[
                { icon: Banknote, label: 'COD' },
                { icon: Truck, label: 'Free shipping' },
                { icon: ShieldCheck, label: '100% safe delivery' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  <Icon size={13} strokeWidth={1.4} className="text-neutral-700" />
                  {label}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Details accordion — no card shell */}
        <section className="mt-12 max-w-2xl border-t border-neutral-300/80 md:mt-16">
          <AccordionItem title="Product details" content={product.description} defaultOpen />
          <AccordionItem
            title="Shipping"
            content="Free shipping on orders above ₹999. Standard delivery in 5–7 business days. Every order is packed securely for 100% safe delivery."
          />
          <AccordionItem
            title="Care"
            content="Machine wash cold inside out. Use mild detergent. Do not bleach. Tumble dry low or hang dry. Warm iron inside out if needed."
          />
        </section>

        {/* Reviews */}
        <section className="mt-16 border-t border-neutral-300/80 pt-12 md:mt-20">
          <p className="text-[10px] font-medium tracking-[0.35em] text-neutral-500 uppercase">
            Reviews
          </p>
          <h2 className="mt-3 font-sans text-[clamp(1.4rem,2.4vw,2rem)] font-semibold tracking-[0.06em] uppercase">
            What people say
            <span className="ml-3 text-neutral-400 font-medium">({reviews.length})</span>
          </h2>

          {isAuthenticated && (
            <div className="mt-8 max-w-xl space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-500">
                  Your rating
                  {hasPurchased ? ' · Verified' : ''}
                </span>
                <StarRatingInput value={newRating} onChange={setNewRating} />
              </div>

              <div className="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_14px_40px_rgba(17,17,17,0.08)] ring-1 ring-black/[0.05]">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience…"
                  rows={4}
                  className="w-full resize-none border-0 bg-transparent px-4 pt-4 text-sm leading-relaxed text-neutral-800 outline-none placeholder:text-neutral-400 sm:px-5 sm:pt-5"
                />
                <div className="flex justify-end px-3 pb-3 pt-1 sm:px-4 sm:pb-4">
                  <button
                    type="button"
                    onClick={submitReview}
                    disabled={submittingReview}
                    className="tf-review-submit disabled:opacity-45"
                  >
                    <span>
                      {submittingReview ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Sending
                        </>
                      ) : (
                        <>
                          Submit
                          <ArrowRight className="size-3.5" strokeWidth={1.75} />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 space-y-8 max-w-2xl">
            {reviews.length === 0 ? (
              <p className="text-sm text-neutral-500">No reviews yet. Be the first.</p>
            ) : (
              reviews.map((review) => (
                <article key={review.id} className="border-b border-neutral-200/80 pb-8 last:border-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[12px] font-medium tracking-[0.16em] uppercase text-neutral-800">
                      {review.user?.name || 'Anonymous'}
                    </p>
                    <span className="text-[11px] tracking-[0.1em] text-neutral-400">
                      {'★'.repeat(review.rating)}
                      <span className="text-neutral-300">{'★'.repeat(5 - review.rating)}</span>
                    </span>
                  </div>
                  <p className="mt-3 text-[13px] leading-[1.7] text-neutral-600">{review.comment}</p>
                  <p className="mt-2 text-[10px] tracking-[0.14em] uppercase text-neutral-400">
                    {new Date(review.created_at).toLocaleDateString('en-IN')}
                    {review.is_verified ? ' · Verified' : ''}
                  </p>
                  {review.admin_reply && (
                    <p className="mt-4 text-[12px] leading-relaxed text-neutral-500 pl-4 border-l border-neutral-300">
                      <span className="block text-[9px] tracking-[0.2em] uppercase text-neutral-400 mb-1">
                        Transfinity
                      </span>
                      {review.admin_reply}
                    </p>
                  )}
                  {user?.is_superuser && (
                    <div className="mt-3">
                      {replyingTo === review.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={2}
                            className="w-full resize-none border-b border-neutral-300 bg-transparent py-2 text-sm outline-none focus:border-neutral-900"
                            placeholder="Write reply…"
                          />
                          <div className="flex gap-4 text-[10px] tracking-[0.2em] uppercase">
                            <button type="button" onClick={() => setReplyingTo(null)} className="text-neutral-400">
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => submitAdminReply(review.id)}
                              className="text-neutral-900 underline underline-offset-4"
                            >
                              Post
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
                          className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-800"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-neutral-300/80 pt-12 md:mt-20">
            <p className="text-[10px] font-medium tracking-[0.35em] text-neutral-500 uppercase">
              More from the drop
            </p>
            <h2 className="mt-3 mb-8 font-sans text-[clamp(1.4rem,2.4vw,2rem)] font-semibold tracking-[0.06em] uppercase">
              Similar pieces
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {related.slice(0, 4).map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Zoom — light, minimal chrome */}
      {zoomOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#EFEFEF]/92 backdrop-blur-[2px] p-4"
          onClick={() => {
            setZoomOpen(false)
            setZoomLevel(1)
          }}
        >
          <div
            className="relative flex w-full max-w-5xl max-h-[90vh] flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] tracking-[0.28em] uppercase text-neutral-500">
                {product.name}
              </p>
              <button
                type="button"
                onClick={() => {
                  setZoomOpen(false)
                  setZoomLevel(1)
                }}
                className="p-1 text-neutral-600 hover:text-neutral-950"
                aria-label="Close"
              >
                <X size={18} strokeWidth={1.4} />
              </button>
            </div>
            <div className="flex flex-1 items-center justify-center overflow-auto">
              <img
                src={images[selImage].image}
                alt={product.name}
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: 'transform 0.2s ease',
                  maxHeight: '70vh',
                  maxWidth: '100%',
                }}
              />
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 text-neutral-700">
              <button type="button" onClick={zoomOut} disabled={zoomLevel <= 1} className="disabled:opacity-30">
                <ZoomOut size={18} strokeWidth={1.4} />
              </button>
              <span className="text-[11px] tracking-[0.2em] tabular-nums">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button type="button" onClick={zoomIn} disabled={zoomLevel >= 3} className="disabled:opacity-30">
                <ZoomIn size={18} strokeWidth={1.4} />
              </button>
              <button type="button" onClick={zoomReset} className="text-[10px] tracking-[0.2em] uppercase">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
