import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingBag } from 'lucide-react'
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center text-center bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '64px 32px', maxWidth: '420px', width: '100%', margin: '16px' }}>
          <div className="text-slate-200" style={{ marginBottom: '24px' }}>
            <Heart size={64} />
          </div>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-600" style={{ marginBottom: '12px' }}>
            Wishlist
          </p>
          <h1 className="text-2xl font-bold text-[#C8A96E]" style={{ marginBottom: '8px' }}>
            Your wishlist is empty
          </h1>
          <p className="text-sm text-[#fae6c0]" style={{ marginBottom: '24px' }}>
            Save your favorite products here and come back anytime.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center bg-[#C8A96E] text-white rounded-xl text-sm font-semibold hover:bg-[#C8A96E] transition-all"
            style={{ padding: '12px 28px', gap: '8px' }}
          >
            <ShoppingBag size={16} />
            Explore Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto" style={{ padding: '32px 16px' }}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between" style={{ marginBottom: '32px', gap: '16px' }}>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-amber-600" style={{ marginBottom: '8px' }}>
              Saved Favorites
            </p>
            <h1 className="text-2xl font-bold text-[#C8A96E]" style={{ marginBottom: '8px' }}>
              My Wishlist
            </h1>
            <p className="text-sm text-[#fae6c0]">
              {items.length} premium item{items.length > 1 ? 's' : ''} saved for later.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold hover:border-[#C8A96E] hover:text-[#C8A96E] transition-all"
            style={{ padding: '10px 20px', gap: '8px' }}
          >
            Continue Shopping
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: '20px' }}>
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group relative">

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(item.product.id)}
                className="absolute z-10 flex items-center justify-center rounded-full bg-white/90 text-slate-400 hover:text-red-500 hover:bg-white shadow-md transition-all border-none cursor-pointer"
                style={{ top: '12px', right: '12px', width: '32px', height: '32px' }}
              >
                <Trash2 size={14} />
              </button>

              {/* Image */}
              <Link to={`/products/${item.product.slug}`} className="block overflow-hidden bg-slate-100" style={{ aspectRatio: '3/4' }}>
                {item.product.primary_image?.image ? (
                  <img
                    src={item.product.primary_image.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-100 text-slate-300">
                    📦
                  </div>
                )}
              </Link>

              {/* Content */}
              <div style={{ padding: '16px' }}>
                <Link
                  to={`/products/${item.product.slug}`}
                  className="block text-sm font-semibold text-[#C8A96E] hover:text-amber-600 transition-colors line-clamp-2"
                  style={{ marginBottom: '6px', minHeight: '40px' }}
                >
                  {item.product.name}
                </Link>

                <p className="text-base font-bold text-[#C8A96E]" style={{ marginBottom: '12px' }}>
                  ₹{item.product.effective_price}
                </p>

                <button
                  onClick={() => handleAddToCart(item.product.id)}
                  className="w-full flex items-center justify-center bg-[#C8A96E] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#C8A96E] transition-all border-none cursor-pointer"
                  style={{ padding: '12px 0', gap: '8px' }}
                >
                  <ShoppingBag size={14} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}