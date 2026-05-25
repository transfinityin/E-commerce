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
      <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
        <div className="page-container py-6 sm:py-8 lg:py-12">
          <div className="mb-7 sm:mb-10">
            <div className="h-3 skeleton-dark w-32 mb-4" />
            <div className="h-8 skeleton-dark w-52" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-5 lg:gap-8">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-[#0A0A0A] border border-gold/10 p-4 sm:p-5 h-36 sm:h-40 animate-pulse"
                />
              ))}
            </div>

            <div className="bg-[#0A0A0A] border border-gold/10 h-80 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] flex items-center justify-center px-4 py-10 overflow-x-hidden">
        <div className="relative w-full max-w-xl bg-[#0A0A0A] border border-gold/15 p-6 sm:p-10 text-center overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 w-16 h-px bg-gold/60" />
          <div className="absolute top-0 left-0 w-px h-16 bg-gold/60" />

          <div className="w-16 h-16 sm:w-20 sm:h-20 border border-gold/25 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={30} className="text-gold/70" strokeWidth={1.5} />
          </div>

          <p className="label-gold mb-3">Your Collection</p>

          <h2 className="font-display text-2xl sm:text-3xl text-white tracking-[0.13em] mb-3">
            CART IS <span className="text-gradient-gold">EMPTY</span>
          </h2>

          <p className="text-muted text-xs sm:text-sm font-mono tracking-wider leading-relaxed max-w-sm mx-auto mb-7">
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
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
      {/* Header */}
      <section className="border-b border-gold/10 bg-[#050505]">
        <div className="page-container py-6 sm:py-8 lg:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <p className="label-gold mb-2">Your Selection</p>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white tracking-[0.13em] leading-tight">
                SHOPPING <span className="text-gradient-gold">BAG</span>
              </h1>

              <p className="text-xs sm:text-sm text-muted font-mono tracking-wider mt-2">
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
            <div className="bg-[#0A0A0A] border border-gold/15 overflow-hidden">
              <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 border border-gold/20 flex items-center justify-center shrink-0">
                    <Truck size={17} className="text-gold" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-mono tracking-wider text-white leading-relaxed">
                      {deliveryFee === 0 ? (
                        <span className="inline-flex items-center gap-1.5">
                          Free delivery unlocked
                          <Sparkles size={13} className="text-gold" />
                        </span>
                      ) : (
                        `Add ₹${freeShipRemaining.toFixed(0)} more for free delivery`
                      )}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted font-mono tracking-wider mt-0.5">
                      Free delivery above ₹999
                    </p>
                  </div>
                </div>

                <span className="text-xs sm:text-sm font-mono text-gold shrink-0">
                  {Math.round(freeShipPct)}%
                </span>
              </div>

              <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                <div className="h-1.5 bg-black border border-gold/10 overflow-hidden">
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
                className="group bg-[#0A0A0A] border border-gold/12 hover:border-gold/35 transition-all duration-500 p-4 sm:p-5 lg:p-6 animate-fadeUp hover:shadow-[0_16px_60px_rgba(212,175,55,0.08)]"
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                  {/* Image */}
                  <Link
                    to={`/products/${group.product.slug}`}
                    className="block w-full sm:w-28 lg:w-32 shrink-0 aspect-[4/5] sm:aspect-square overflow-hidden bg-black border border-gold/15"
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
                      className="font-display text-base sm:text-lg text-white tracking-[0.12em] uppercase leading-snug hover:text-gold transition-colors line-clamp-2"
                    >
                      {group.product.name}
                    </Link>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {group.sizes.map(({ size, qty, itemId }) => (
                        <div
                          key={itemId}
                          className="flex items-center gap-1.5 bg-black border border-gold/15 px-2.5 py-1"
                        >
                          <span className="text-[10px] sm:text-xs font-mono text-gold">
                            {size}
                          </span>
                          <span className="text-[10px] sm:text-xs text-muted font-mono">
                            ×{qty}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center flex-wrap gap-3 mt-4">
                      <span className="price-tag">
                        ₹{Number(group.product.effective_price).toLocaleString('en-IN')}
                      </span>

                      <span className="text-[10px] font-mono tracking-wider uppercase bg-gold/10 border border-gold/20 text-gold px-2.5 py-1">
                        In Stock
                      </span>

                      <span className="text-[10px] sm:text-xs text-muted font-mono">
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
                        <span className="text-[10px] sm:text-xs font-mono text-muted w-7">
                          {size}
                        </span>

                        <div className="flex items-center border border-gold/15 bg-black">
                          <button
                            type="button"
                            onClick={() => handleUpdate(itemId, qty - 1)}
                            disabled={updatingItems.has(itemId) || qty <= 1}
                            className="w-9 h-9 flex items-center justify-center text-muted hover:text-gold hover:bg-gold/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                          >
                            <Minus size={13} />
                          </button>

                          <span className="w-9 text-center text-xs sm:text-sm font-mono text-white">
                            {updatingItems.has(itemId) ? '…' : qty}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleUpdate(itemId, qty + 1)}
                            disabled={updatingItems.has(itemId)}
                            className="w-9 h-9 flex items-center justify-center text-black bg-gold hover:bg-gold-light disabled:opacity-50 transition-all duration-300"
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
              className="inline-flex items-center text-xs sm:text-sm font-mono tracking-wider uppercase text-muted hover:text-gold transition-colors w-fit gap-1.5 mt-1"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-28">
            <div className="bg-[#0A0A0A] border border-gold/15 overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
              <div className="border-b border-gold/10 px-5 sm:px-6 py-5">
                <p className="label-gold mb-2">Transmission Summary</p>
                <h3 className="font-display text-xl sm:text-2xl text-white tracking-[0.12em]">
                  ORDER TOTAL
                </h3>
                <p className="text-xs text-muted font-mono tracking-wider mt-1">
                  {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'} selected
                </p>
              </div>

              <div className="px-5 sm:px-6 py-5 sm:py-6">
                {/* Coupon */}
                <div className="flex items-center bg-black border border-gold/15 gap-2 px-3 py-2.5 mb-5">
                  <Tag size={14} className="text-muted shrink-0" />

                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="ENTER COUPON CODE"
                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder:text-muted/50 font-mono tracking-wider uppercase p-0"
                  />

                  <button
                    type="button"
                    className="bg-gold text-black hover:bg-gold-light text-[10px] sm:text-xs font-semibold tracking-wider uppercase px-3 py-2 transition-all duration-300"
                  >
                    Apply
                  </button>
                </div>

                {/* Price Lines */}
                <div className="flex flex-col gap-3.5 mb-5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted font-mono">Subtotal</span>
                    <span className="text-sm sm:text-base font-mono text-white">
                      ₹{Number(subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted font-mono">Delivery</span>

                    {deliveryFee === 0 ? (
                      <span className="text-[10px] sm:text-xs font-mono tracking-wider uppercase text-gold bg-gold/10 border border-gold/20 px-2.5 py-1">
                        FREE
                      </span>
                    ) : (
                      <span className="text-sm sm:text-base font-mono text-white">
                        ₹{deliveryFee}
                      </span>
                    )}
                  </div>
                </div>

                <div className="divider-gold my-5" />

                <div className="flex justify-between items-end mb-6">
                  <span className="text-sm sm:text-base font-mono text-white uppercase tracking-wider">
                    Total
                  </span>

                  <span className="font-display text-3xl sm:text-4xl text-gradient-gold">
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
                  className="block text-center text-xs sm:text-sm font-mono tracking-wider text-muted hover:text-gold transition-colors mb-6"
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
                      className="flex items-center bg-black border border-gold/10 gap-2.5 px-3.5 py-3"
                    >
                      <item.icon size={14} className="text-gold/70" />
                      <span className="text-[10px] sm:text-xs text-muted font-mono tracking-wider">
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