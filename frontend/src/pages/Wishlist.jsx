import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import useWishlistStore from '../store/wishlistStore'
import useCartStore from '../store/cartStore'

export default function Wishlist() {
  const { items, fetchWishlist, toggle } = useWishlistStore()
  const { addToCart } = useCartStore()

  useEffect(() => { fetchWishlist() }, [])

  const handleRemove = async (productId) => {
    await toggle(productId)
    toast.success('Artifact removed from collection')
  }

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1)
      toast.success('Artifact added to cargo hold')
    } catch {
      toast.error('Transfer failed. Signal interrupted.')
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-body flex items-center justify-center px-4 py-8">
        <div className="flex flex-col items-center text-center card-dark py-12 sm:py-16 px-6 sm:px-8 max-w-sm sm:max-w-md w-full animate-fadeUp">
          <div className="w-16 h-16 border border-[var(--color-border)] flex items-center justify-center mb-6 animate-gold-pulse">
            <Heart size={24} className="text-gold" />
          </div>
          <p className="label-gold mb-3">
            COLLECTION
          </p>
          <h1 className="heading-card text-xl sm:text-2xl mb-3">
            YOUR COLLECTION IS EMPTY
          </h1>
          <p className="text-muted text-sm mb-8 max-w-xs leading-relaxed">
            Curate your artifacts here and return when the signal calls. 
            Your perfect relics are waiting.
          </p>
          <Link
            to="/products"
            className="btn-primary inline-flex items-center gap-2"
          >
            <ShoppingBag size={14} />
            EXPLORE ARTIFACTS
          </Link>
        </div>
      </div>
    )
  }

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
            <a href="/shop" className="nav-link">SHOP</a>
            <a href="/founder" className="nav-link">FOUNDER</a>
          </nav>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      <div className="page-container py-6 sm:py-8 lg:py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 animate-fadeUp">
          <div>
            <p className="label-gold mb-2">
              SAVED ARTIFACTS
            </p>
            <h1 className="heading-section text-xl sm:text-2xl lg:text-3xl mb-2">
              MY COLLECTION
            </h1>
            <p className="text-muted text-sm">
              {items.length} premium artifact{items.length > 1 ? 's' : ''} preserved for acquisition.
            </p>
          </div>

          <Link
            to="/products"
            className="btn-outline inline-flex items-center gap-2 self-start sm:self-auto"
          >
            CONTINUE ACQUISITION <ArrowRight size={13} />
          </Link>
        </div>

        {/* Grid - Mobile: 2 cols, Tablet: 2 cols, Desktop: 3-4 cols */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="product-card group relative overflow-hidden animate-fadeUp"
              style={{ animationDelay: `${index * 0.05}s` }}
            >

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(item.product.id)}
                className="absolute z-10 top-3 right-3 w-8 h-8 flex items-center justify-center bg-[var(--color-bg)]/80 border border-[var(--color-border)] text-muted hover:text-[var(--color-danger)] hover:border-[var(--color-danger)] transition-all duration-200 cursor-pointer"
                title="Remove from collection"
              >
                <Trash2 size={12} />
              </button>

              {/* Image */}
              <Link to={`/products/${item.product.slug}`} className="block overflow-hidden" style={{ aspectRatio: '3/4' }}>
                {item.product.primary_image?.image ? (
                  <img
                    src={item.product.primary_image.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover card-image"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl bg-[var(--color-surface)] text-muted">
                    ∞
                  </div>
                )}
              </Link>

              {/* Content */}
              <div className="p-3 sm:p-4 relative z-10">
                <Link
                  to={`/products/${item.product.slug}`}
                  className="block text-xs sm:text-sm font-semibold text-white hover:text-gold transition-colors line-clamp-2 mb-1 sm:mb-1.5 min-h-[32px] sm:min-h-[40px] tracking-wide"
                >
                  {item.product.name}
                </Link>

                <p className="price-tag text-sm sm:text-base mb-2 sm:mb-3">
                  ₹{Number(item.product.effective_price).toLocaleString('en-IN')}
                </p>

                <button
                  onClick={() => handleAddToCart(item.product.id)}
                  className="w-full btn-primary text-[10px] sm:text-xs py-2.5 sm:py-3 flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={12} />
                  ADD TO CARGO
                </button>
              </div>
            </div>
          ))}
        </div>
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