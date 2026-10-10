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
      const preferred =
        product.available_sizes?.find((s) => String(s).toUpperCase() === 'S') ||
        product.available_sizes?.[0] ||
        'M'
      await addToCart(product.id, 1, preferred)
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

  const price = Number(product.effective_price ?? product.price).toLocaleString('en-IN')

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col no-underline"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#E4E4E2] shadow-[0_14px_40px_rgba(17,17,17,0.08)] sm:aspect-[5/6]">
        <img
          src={image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          draggable={false}
        />

        <button
          type="button"
          data-testid="wishlist-toggle"
          onClick={handleWishlist}
          className={`absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
            wishlisted
              ? 'bg-white text-neutral-950 shadow-sm'
              : 'bg-transparent text-neutral-900 hover:bg-white hover:shadow-sm'
          }`}
          aria-label="Wishlist"
        >
          <Heart
            size={18}
            strokeWidth={1.5}
            fill={wishlisted ? 'currentColor' : 'none'}
          />
        </button>

        <button
          type="button"
          data-testid="add-to-cart"
          onClick={handleAddToCart}
          disabled={!product.in_stock || adding}
          className="absolute inset-x-3 bottom-3 z-10 flex h-10 items-center justify-center gap-2 rounded-full bg-neutral-950/92 text-[10px] font-semibold tracking-[0.18em] text-white uppercase opacity-100 shadow-md backdrop-blur-[2px] transition-all duration-300 hover:bg-neutral-950 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 disabled:opacity-40"
        >
          <ShoppingBag className="size-3.5" strokeWidth={1.5} />
          {adding ? 'Adding…' : product.in_stock ? 'Add to cart' : 'Sold out'}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-0.5 pt-4">
        <p className="text-[10px] font-medium tracking-[0.28em] text-neutral-500 uppercase">
          {product.category?.name || 'Tee'}
        </p>
        <h3 className="font-sans text-sm font-semibold tracking-[0.04em] text-neutral-900 uppercase leading-snug sm:text-[15px]">
          {product.name}
        </h3>
        <p className="mt-1 font-sans text-[15px] font-semibold tracking-wide text-neutral-900">
          ₹ {price}
        </p>
        {!product.in_stock && (
          <p className="text-[10px] tracking-[0.14em] text-neutral-400 uppercase">
            Sold out
          </p>
        )}
      </div>
    </Link>
  )
}
