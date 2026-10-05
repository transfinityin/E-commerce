import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import { toast } from 'react-hot-toast'
import useCartStore from '../store/cartStore'
import useWishlistStore from '../store/wishlistStore'
import useAuthStore from '../store/authStore'

export default function ProductCard({ product }) {
  const [adding, setAdding] = useState(false)
  const { addToCart } = useCartStore()
  const { toggle, isWishlisted } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()
  const wishlisted = isWishlisted(product.id)

  const image =
    product.images?.[0]?.image ||
    product.primary_image?.image ||
    '/product/product-1/1.jpeg'

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please sign in first')
      return
    }
    if (!product.in_stock) return
    setAdding(true)
    try {
      await addToCart(product.id, 1, product.available_sizes?.[0] || 'M')
      toast.success('Added to cart')
    } catch {
      toast.error('Could not add to cart')
    } finally {
      setAdding(false)
    }
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please sign in first')
      return
    }
    try {
      await toggle(product.id)
      toast.success('Wishlist updated')
    } catch {
      toast.error('Wishlist update failed')
    }
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col bg-white border border-neutral-200 transition-shadow hover:shadow-sm"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#E8E8E6]">
        <img
          src={image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <button
          type="button"
          data-testid="wishlist-toggle"
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 flex size-9 items-center justify-center border border-neutral-200 bg-white/90 text-neutral-800"
          aria-label="Wishlist"
        >
          <Heart
            className="size-3.5"
            fill={wishlisted ? 'currentColor' : 'none'}
            strokeWidth={1.5}
          />
        </button>
        <button
          type="button"
          data-testid="add-to-cart"
          onClick={handleAddToCart}
          disabled={!product.in_stock || adding}
          className="absolute inset-x-3 bottom-3 z-10 flex h-10 items-center justify-center gap-2 bg-neutral-950 text-[10px] font-semibold tracking-[0.2em] text-white uppercase opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 disabled:opacity-40"
        >
          <ShoppingBag className="size-3.5" strokeWidth={1.5} />
          {adding ? 'Adding…' : product.in_stock ? 'Add to cart' : 'Sold out'}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-[10px] tracking-[0.2em] text-neutral-500 uppercase">
          {product.category?.name || 'Tee'}
        </p>
        <h3 className="font-sans text-sm font-medium tracking-wide text-neutral-900 uppercase">
          {product.name}
        </h3>
        <p className="mt-auto pt-2 text-sm font-semibold text-neutral-900">
          ₹{Number(product.effective_price ?? product.price).toLocaleString('en-IN')}
        </p>
      </div>
    </Link>
  )
}
