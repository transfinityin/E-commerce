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
    toast.success('Removed from wishlist')
  }

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1)
      toast.success('Added to cart!')
    } catch {
      toast.error('Failed to add')
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4 py-8">
        <div className="flex flex-col items-center text-center bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-sm py-10 sm:py-16 px-6 sm:px-8 max-w-sm sm:max-w-md w-full">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center mb-4 sm:mb-5">
            <Heart size={24} className="sm:w-8 sm:h-8 text-[var(--color-primary)]" />
          </div>
          <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">
            Wishlist
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mb-2">
            Your wishlist is empty
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-muted)] mb-6 sm:mb-8 max-w-xs">
            Save your favorite products here and come back anytime. Your perfect picks are waiting.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 px-5 sm:px-7 py-2.5 sm:py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <ShoppingBag size={14} className="sm:w-4 sm:h-4" />
            Explore Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container py-6 sm:py-8 lg:py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-1.5 sm:mb-2">
              Saved Favorites
            </p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)] mb-1.5 sm:mb-2">
              My Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-muted)]">
              {items.length} premium item{items.length > 1 ? 's' : ''} saved for later.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-xs sm:text-sm font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all duration-200 px-4 sm:px-5 py-2 sm:py-2.5 self-start sm:self-auto"
          >
            Continue Shopping <ArrowRight size={13} className="sm:w-[14px] sm:h-[14px]" />
          </Link>
        </div>

        {/* Grid - Mobile: 2 cols, Tablet: 2 cols, Desktop: 3-4 cols */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden group relative hover:shadow-md hover:border-[var(--color-primary)]/20 transition-all duration-300 animate-fadeUp"
              style={{ animationDelay: `${index * 0.05}s` }}
            >

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(item.product.id)}
                className="absolute z-10 top-2 sm:top-3 right-2 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-[var(--color-surface)]/90 text-[var(--color-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] shadow-sm transition-all duration-200 border-none cursor-pointer"
                title="Remove from wishlist"
              >
                <Trash2 size={12} className="sm:w-[14px] sm:h-[14px]" />
              </button>

              {/* Image */}
              <Link to={`/products/${item.product.slug}`} className="block overflow-hidden bg-[var(--color-bg-alt)]" style={{ aspectRatio: '3/4' }}>
                {item.product.primary_image?.image ? (
                  <img
                    src={item.product.primary_image.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl bg-[var(--color-bg-alt)] text-[var(--color-muted-light)]">
                    📦
                  </div>
                )}
              </Link>

              {/* Content */}
              <div className="p-2.5 sm:p-4">
                <Link
                  to={`/products/${item.product.slug}`}
                  className="block text-[11px] sm:text-sm font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors line-clamp-2 mb-1 sm:mb-1.5 min-h-[32px] sm:min-h-[40px]"
                >
                  {item.product.name}
                </Link>

                <p className="text-sm sm:text-base font-bold text-[var(--color-text)] mb-2 sm:mb-3">
                  ₹{Number(item.product.effective_price).toLocaleString('en-IN')}
                </p>

                <button
                  onClick={() => handleAddToCart(item.product.id)}
                  className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-light)] text-[var(--color-text-inverse)] rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 py-2.5 sm:py-3 border-none cursor-pointer hover:shadow-md"
                >
                  <ShoppingBag size={12} className="sm:w-[14px] sm:h-[14px]" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp {
          animation: fadeUp 0.4s ease forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}