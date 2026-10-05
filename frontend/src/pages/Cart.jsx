import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Shield,
  Truck,
  RotateCcw,
  Tag,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import useCartStore from '../store/cartStore'

export default function Cart() {
  const { cart, fetchCart, updateItem, removeItem, clearCart, loading } = useCartStore()
  const navigate = useNavigate()

  const [removingItems, setRemovingItems] = useState(new Set())
  const [updatingItems, setUpdatingItems] = useState(new Set())
  const [coupon, setCoupon] = useState('')

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const handleUpdate = async (itemId, qty) => {
    if (qty < 1) return

    setUpdatingItems((prev) => new Set([...prev, itemId]))

    try {
      await updateItem(itemId, qty)
    } catch {
      toast.error('Failed to update')
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  const handleRemove = async (itemId) => {
    setRemovingItems((prev) => new Set([...prev, itemId]))

    try {
      await removeItem(itemId)
      toast.success('Removed from cart')
    } catch {
      toast.error('Failed to remove')
    } finally {
      setRemovingItems((prev) => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  const subtotal = parseFloat(cart?.subtotal || 0)
  const deliveryFee = subtotal >= 999 ? 0 : 49
  const finalTotal = subtotal + deliveryFee
  const freeShipPct = Math.min((subtotal / 999) * 100, 100)
  const freeShipRemaining = Math.max(999 - subtotal, 0)

  const groupedItems =
    cart?.items?.reduce((acc, item) => {
      const key = item.product.id

      if (!acc[key]) {
        acc[key] = {
          product: item.product,
          sizes: [],
          totalQty: 0,
        }
      }

      acc[key].sizes.push({
        size: item.size || 'N/A',
        qty: item.quantity,
        itemId: item.id,
      })

      acc[key].totalQty += item.quantity
      return acc
    }, {}) || {}

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F2] pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
        <div className="page-container py-6 sm:py-8 lg:py-12">
          <div className="mb-7 sm:mb-10">
            <div className="h-3 animate-pulse bg-neutral-200 w-32 mb-4" />
            <div className="h-8 animate-pulse bg-neutral-200 w-52" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-5 lg:gap-8">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-neutral-200 p-4 sm:p-5 h-36 sm:h-40 animate-pulse"
                />
              ))}
            </div>

            <div className="bg-white border border-neutral-200 h-80 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4F4F2] pt-[76px] sm:pt-[88px] lg:pt-[96px] flex items-center justify-center px-4 py-10 overflow-x-hidden">
        <div className="relative w-full max-w-xl bg-white border border-neutral-200 p-6 sm:p-10 text-center overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-16 h-px bg-neutral-950/60" />
          <div className="absolute top-0 left-0 w-px h-16 bg-neutral-950/60" />

          <div className="w-16 h-16 sm:w-20 sm:h-20 border border-neutral-300 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={30} className="text-neutral-900/70" strokeWidth={1.5} />
          </div>

          <p className="text-[10px] font-medium tracking-[0.28em] uppercase text-neutral-500 mb-3">Your Collection</p>

          <h2 className="font-sans text-2xl sm:text-3xl text-neutral-900 tracking-[0.13em] mb-3">
            CART IS <span className="text-gradient-gold">EMPTY</span>
          </h2>

          <p className="text-neutral-500 text-xs sm:text-sm font-mono tracking-wider leading-relaxed max-w-sm mx-auto mb-7">
            Explore the manifesto and lock your first artifact into the transmission queue.
          </p>

          <Link
            to="/products"
            className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            START SHOPPING
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F4F2] pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
      {/* Header */}
      <section className="border-b border-neutral-200 bg-[#F4F4F2]">
        <div className="page-container py-6 sm:py-8 lg:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <p className="text-[10px] font-medium tracking-[0.28em] uppercase text-neutral-500 mb-2">Your Selection</p>

              <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl text-neutral-900 tracking-[0.13em] leading-tight">
                SHOPPING <span className="text-gradient-gold">BAG</span>
              </h1>

              <p className="text-xs sm:text-sm text-neutral-500 font-mono tracking-wider mt-2">
                {cart.total_items} {cart.total_items === 1 ? 'artifact' : 'artifacts'} selected.
              </p>
            </div>

            <button
              type="button"
              onClick={clearCart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-red-400/25 text-red-400 hover:text-white hover:bg-red-400/10 hover:border-red-400/45 text-xs sm:text-sm font-mono tracking-wider uppercase px-4 py-3 transition-all duration-300"
            >
              <Trash2 size={14} />
              Clear Cart
            </button>
          </div>
        </div>
      </section>

      <main className="page-container py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] items-start gap-5 sm:gap-6 lg:gap-8">
          {/* Left */}
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Free Shipping */}
            <div className="bg-white border border-neutral-200 overflow-hidden">
              <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 border border-neutral-200 flex items-center justify-center shrink-0">
                    <Truck size={17} className="text-neutral-900" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-mono tracking-wider text-neutral-900 leading-relaxed">
                      {deliveryFee === 0 ? (
                        <span className="inline-flex items-center gap-1.5">
                          Free delivery unlocked
                          <Sparkles size={13} className="text-neutral-900" />
                        </span>
                      ) : (
                        `Add ₹${freeShipRemaining.toFixed(0)} more for free delivery`
                      )}
                    </p>
                    <p className="text-[10px] sm:text-xs text-neutral-500 font-mono tracking-wider mt-0.5">
                      Free delivery above ₹999
                    </p>
                  </div>
                </div>

                <span className="text-xs sm:text-sm font-mono text-neutral-900 shrink-0">
                  {Math.round(freeShipPct)}%
                </span>
              </div>

              <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                <div className="h-1.5 bg-[#F4F4F2] border border-neutral-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light transition-all duration-700"
                    style={{ width: `${freeShipPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            {Object.values(groupedItems).map((group, index) => (
              <div
                key={group.product.id}
                className="group bg-white border border-neutral-900/12 hover:border-neutral-300 transition-all duration-500 p-4 sm:p-5 lg:p-6 animate-fadeUp hover:shadow-[0_16px_60px_rgba(212,175,55,0.08)]"
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                  {/* Image */}
                  <Link
                    to={`/products/${group.product.slug}`}
                    className="block w-full sm:w-28 lg:w-32 shrink-0 aspect-[4/5] sm:aspect-square overflow-hidden bg-[#F4F4F2] border border-neutral-200"
                  >
                    <img
                      src={group.product.primary_image?.image || group.product.image || ''}
                      alt={group.product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${group.product.slug}`}
                      className="font-sans text-base sm:text-lg text-neutral-900 tracking-[0.12em] uppercase leading-snug hover:text-neutral-900 transition-colors line-clamp-2"
                    >
                      {group.product.name}
                    </Link>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {group.sizes.map(({ size, qty, itemId }) => (
                        <div
                          key={itemId}
                          className="flex items-center gap-1.5 bg-[#F4F4F2] border border-neutral-200 px-2.5 py-1"
                        >
                          <span className="text-[10px] sm:text-xs font-mono text-neutral-900">
                            {size}
                          </span>
                          <span className="text-[10px] sm:text-xs text-neutral-500 font-mono">
                            ×{qty}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center flex-wrap gap-3 mt-4">
                      <span className="price-tag">
                        ₹{Number(group.product.effective_price).toLocaleString('en-IN')}
                      </span>

                      <span className="text-[10px] font-mono tracking-wider uppercase bg-neutral-100 border border-neutral-200 text-neutral-900 px-2.5 py-1">
                        In Stock
                      </span>

                      <span className="text-[10px] sm:text-xs text-neutral-500 font-mono">
                        Total: {group.totalQty} pcs
                      </span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col gap-3 w-full sm:w-auto">
                    {group.sizes.map(({ size, qty, itemId }) => (
                      <div
                        key={itemId}
                        className="flex items-center justify-between sm:justify-end gap-3"
                      >
                        <span className="text-[10px] sm:text-xs font-mono text-neutral-500 w-7">
                          {size}
                        </span>

                        <div className="flex items-center border border-neutral-200 bg-[#F4F4F2]">
                          <button
                            type="button"
                            onClick={() => handleUpdate(itemId, qty - 1)}
                            disabled={updatingItems.has(itemId) || qty <= 1}
                            className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                          >
                            <Minus size={13} />
                          </button>

                          <span className="w-9 text-center text-xs sm:text-sm font-mono text-neutral-900">
                            {updatingItems.has(itemId) ? '…' : qty}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleUpdate(itemId, qty + 1)}
                            disabled={updatingItems.has(itemId)}
                            className="w-9 h-9 flex items-center justify-center text-white bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 transition-all duration-300"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(itemId)}
                          disabled={removingItems.has(itemId)}
                          className="w-9 h-9 border border-red-400/20 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-400/10 hover:border-red-400/40 disabled:opacity-50 transition-all duration-300"
                          aria-label="Remove item"
                        >
                          {removingItems.has(itemId) ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <Link
              to="/products"
              className="inline-flex items-center text-xs sm:text-sm font-mono tracking-wider uppercase text-neutral-500 hover:text-neutral-900 transition-colors w-fit gap-1.5 mt-1"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-28">
            <div className="bg-white border border-neutral-200 overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
              <div className="border-b border-neutral-200 px-5 sm:px-6 py-5">
                <p className="text-[10px] font-medium tracking-[0.28em] uppercase text-neutral-500 mb-2">Transmission Summary</p>
                <h3 className="font-sans text-xl sm:text-2xl text-neutral-900 tracking-[0.12em]">
                  ORDER TOTAL
                </h3>
                <p className="text-xs text-neutral-500 font-mono tracking-wider mt-1">
                  {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'} selected
                </p>
              </div>

              <div className="px-5 sm:px-6 py-5 sm:py-6">
                {/* Coupon */}
                <div className="flex items-center bg-[#F4F4F2] border border-neutral-200 gap-2 px-3 py-2.5 mb-5">
                  <Tag size={14} className="text-neutral-500 shrink-0" />

                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="ENTER COUPON CODE"
                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-500/50 font-mono tracking-wider uppercase p-0"
                  />

                  <button
                    type="button"
                    className="bg-neutral-950 text-white hover:bg-neutral-800 text-[10px] sm:text-xs font-semibold tracking-wider uppercase px-3 py-2 transition-all duration-300"
                  >
                    Apply
                  </button>
                </div>

                {/* Price Lines */}
                <div className="flex flex-col gap-3.5 mb-5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-neutral-500 font-mono">Subtotal</span>
                    <span className="text-sm sm:text-base font-mono text-neutral-900">
                      ₹{Number(subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-neutral-500 font-mono">Delivery</span>

                    {deliveryFee === 0 ? (
                      <span className="text-[10px] sm:text-xs font-mono tracking-wider uppercase text-neutral-900 bg-neutral-100 border border-neutral-200 px-2.5 py-1">
                        FREE
                      </span>
                    ) : (
                      <span className="text-sm sm:text-base font-mono text-neutral-900">
                        ₹{deliveryFee}
                      </span>
                    )}
                  </div>
                </div>

                <div className="divider-gold my-5" />

                <div className="flex justify-between items-end mb-6">
                  <span className="text-sm sm:text-base font-mono text-neutral-900 uppercase tracking-wider">
                    Total
                  </span>

                  <span className="font-sans text-3xl sm:text-4xl text-gradient-gold">
                    ₹{Number(finalTotal).toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="btn-primary w-full flex items-center justify-center gap-2 min-h-[48px] mb-3"
                >
                  PROCEED TO CHECKOUT
                  <ArrowRight size={16} />
                </button>

                <Link
                  to="/products"
                  className="block text-center text-xs sm:text-sm font-mono tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors mb-6"
                >
                  ← Continue Shopping
                </Link>

                <div className="flex flex-col gap-2.5">
                  {[
                    { icon: Shield, label: 'Secure encrypted checkout' },
                    { icon: Truck, label: 'Fast premium delivery' },
                    { icon: RotateCcw, label: 'Easy 7-day returns' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center bg-[#F4F4F2] border border-neutral-200 gap-2.5 px-3.5 py-3"
                    >
                      <item.icon size={14} className="text-neutral-900/70" />
                      <span className="text-[10px] sm:text-xs text-neutral-500 font-mono tracking-wider">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}