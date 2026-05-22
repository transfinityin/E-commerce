import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Shield, Truck, RotateCcw, Tag, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import useCartStore from '../store/cartStore'

export default function Cart() {
  const { cart, fetchCart, updateItem, removeItem, clearCart, loading } = useCartStore()
  const navigate = useNavigate()
  const [removingItems, setRemovingItems] = useState(new Set())
  const [updatingItems, setUpdatingItems] = useState(new Set())
  const [coupon, setCoupon] = useState('')

  useEffect(() => { fetchCart() }, [])

  const handleUpdate = async (itemId, qty) => {
    if (qty < 1) return
    setUpdatingItems(prev => new Set([...prev, itemId]))
    try {
      await updateItem(itemId, qty)
    } catch {
      toast.error('Failed to update')
    } finally {
      setUpdatingItems(prev => { const n = new Set(prev); n.delete(itemId); return n })
    }
  }

  const handleRemove = async (itemId) => {
    setRemovingItems(prev => new Set([...prev, itemId]))
    try {
      await removeItem(itemId)
      toast.success('Removed from cart')
    } catch {
      toast.error('Failed to remove')
    } finally {
      setRemovingItems(prev => { const n = new Set(prev); n.delete(itemId); return n })
    }
  }

  const subtotal = parseFloat(cart?.subtotal || 0)
  const deliveryFee = subtotal >= 999 ? 0 : 49
  const finalTotal = (subtotal + deliveryFee).toFixed(2)
  const freeShipPct = Math.min((subtotal / 999) * 100, 100)
  const freeShipRemaining = Math.max(999 - subtotal, 0)

  const groupedItems = cart?.items?.reduce((acc, item) => {
    const key = item.product.id
    if (!acc[key]) {
      acc[key] = { product: item.product, sizes: [], totalQty: 0 }
    }
    acc[key].sizes.push({ size: item.size || 'N/A', qty: item.quantity, itemId: item.id })
    acc[key].totalQty += item.quantity
    return acc
  }, {}) || {}

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container py-6 sm:py-8 lg:py-12">
        <div className="h-6 sm:h-8 bg-[var(--color-bg-alt)] rounded-lg animate-pulse w-32 sm:w-48 mb-6 sm:mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] p-3 sm:p-4 animate-pulse h-28 sm:h-32" />
            ))}
          </div>
          <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] h-72 sm:h-80 animate-pulse" />
        </div>
      </div>
    </div>
  )

  if (!cart || cart.items?.length === 0) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center text-center gap-4 sm:gap-5 px-4 sm:px-6 py-10 sm:py-12">
        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center mb-1 sm:mb-2">
          <ShoppingBag size={24} className="sm:w-9 sm:h-9 text-[var(--color-primary)]" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-1.5 sm:mb-2">
            Your Collection
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mb-1.5 sm:mb-2">
            Your cart is empty
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-muted)] max-w-sm mb-6 sm:mb-8">
            Explore our premium collection and find something you love. Your perfect piece is waiting.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 sm:gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 px-6 sm:px-8 py-3 sm:py-3.5 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          Start Shopping <ArrowRight size={14} className="sm:w-4 sm:h-4" />
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">

      {/* Page header */}
      <div className="bg-[var(--color-secondary)]">
        <div className="page-container py-5 sm:py-8">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-1.5 sm:mb-2">
                Your Selection
              </p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text-inverse)]">
                Shopping Bag
                <span className="font-normal text-[var(--color-muted-light)] ml-2 sm:ml-3 text-sm sm:text-base">
                  {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'}
                </span>
              </h1>
            </div>
            <button
              onClick={clearCart}
              className="text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger)]/20 hover:bg-[var(--color-danger)] hover:text-white px-3 sm:px-5 py-2 sm:py-2.5 cursor-pointer"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="page-container py-5 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] items-start gap-4 sm:gap-6 lg:gap-8">

          {/* LEFT */}
          <div className="flex flex-col gap-3 sm:gap-4">

            {/* Free shipping bar */}
            <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
              <div className="px-3 sm:px-5 pt-3 sm:pt-4 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <Truck size={14} className="sm:w-4 sm:h-4 text-[var(--color-primary)]" />
                  <p className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">
                    {deliveryFee === 0
                      ? <span className="flex items-center gap-1 sm:gap-1.5">🎉 Free delivery unlocked! <Sparkles size={12} className="sm:w-3.5 sm:h-3.5 text-[var(--color-primary)]" /></span>
                      : `Add ₹${freeShipRemaining.toFixed(0)} more for free delivery`
                    }
                  </p>
                </div>
                <span className={`text-[10px] sm:text-xs font-bold ${deliveryFee === 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]'}`}>
                  {Math.round(freeShipPct)}%
                </span>
              </div>
              <div className="px-3 sm:px-5 pb-3 sm:pb-4">
                <div className="rounded-full bg-[var(--color-bg-alt)] overflow-hidden h-1.5 sm:h-2">
                  <div
                    className="rounded-full transition-all duration-700 ease-out h-full"
                    style={{
                      width: `${freeShipPct}%`,
                      background: deliveryFee === 0
                        ? 'var(--color-success)'
                        : 'linear-gradient(90deg, var(--color-primary), var(--color-primary-dark))'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            {Object.values(groupedItems).map((group, index) => (
              <div
                key={group.product.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 animate-fadeUp"
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                {/* Image */}
                <div className="w-full h-44 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden bg-[var(--color-bg-alt)] border border-[var(--color-border)] group">
                  <img
                    src={group.product.primary_image?.image || group.product.image || ''}
                    alt={group.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Name + Size breakdown */}
                <div className="flex-1 min-w-0 w-full">
                  <Link
                    to={`/products/${group.product.slug}`}
                    className="font-semibold text-xs sm:text-sm text-[var(--color-text)] no-underline leading-snug hover:text-[var(--color-primary)] transition-colors line-clamp-2"
                  >
                    {group.product.name}
                  </Link>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-2.5">
                    {group.sizes.map(({ size, qty }) => (
                      <div
                        key={size}
                        className="flex items-center gap-1 sm:gap-1.5 bg-[var(--color-bg-alt)] rounded-md sm:rounded-lg border border-[var(--color-border)] px-2 sm:px-2.5 py-0.5 sm:py-1"
                      >
                        <span className="text-[10px] sm:text-xs font-bold text-[var(--color-text)]">{size}</span>
                        <span className="text-[10px] sm:text-xs text-[var(--color-muted)]">×{qty}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-2.5">
                    <span className="text-sm sm:text-base font-bold text-[var(--color-text)]">
                      ₹{Number(group.product.effective_price).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold bg-[var(--color-success-bg)] text-[var(--color-success)] rounded-full px-2 sm:px-2.5 py-0.5">
                      In Stock
                    </span>
                    <span className="text-[10px] sm:text-xs text-[var(--color-muted)]">
                      Total: {group.totalQty} pcs
                    </span>
                  </div>
                </div>

                {/* Controls for each size */}
                <div className="flex flex-col gap-2 sm:gap-2.5 w-full sm:w-auto mt-1 sm:mt-0">
                  {group.sizes.map(({ size, qty, itemId }) => (
                    <div key={itemId} className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-end">
                      <span className="text-[10px] sm:text-xs font-bold text-[var(--color-muted)] w-5 sm:w-6">{size}</span>

                      <div className="flex items-center bg-[var(--color-bg-alt)] rounded-full border border-[var(--color-border)] p-0.5">
                        <button
                          onClick={() => handleUpdate(itemId, qty - 1)}
                          disabled={updatingItems.has(itemId) || qty <= 1}
                          className="rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--color-secondary)] hover:text-[var(--color-text-inverse)] hover:border-[var(--color-secondary)] w-8 h-8 sm:w-7 sm:h-7"
                        >
                          <Minus size={12} className="sm:w-3 sm:h-3" />
                        </button>

                        <span className="text-xs sm:text-sm font-bold text-[var(--color-text)] text-center w-8 sm:w-8">
                          {updatingItems.has(itemId) ? '…' : qty}
                        </span>

                        <button
                          onClick={() => handleUpdate(itemId, qty + 1)}
                          disabled={updatingItems.has(itemId)}
                          className="rounded-full bg-[var(--color-secondary)] border-none flex items-center justify-center text-[var(--color-text-inverse)] transition-all duration-200 cursor-pointer hover:bg-[var(--color-secondary-light)] w-8 h-8 sm:w-7 sm:h-7"
                        >
                          <Plus size={12} className="sm:w-3 sm:h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(itemId)}
                        disabled={removingItems.has(itemId)}
                        className="rounded-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] transition-all duration-200 cursor-pointer hover:bg-[var(--color-danger-bg)] hover:border-[var(--color-danger)]/30 hover:text-[var(--color-danger)] w-8 h-8 sm:w-8 sm:h-8"
                      >
                        <Trash2 size={14} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Link
              to="/products"
              className="inline-flex items-center text-xs sm:text-sm font-semibold text-[var(--color-muted)] no-underline hover:text-[var(--color-text)] transition-colors w-fit gap-1 sm:gap-1.5 mt-0.5 sm:mt-1"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* RIGHT: Summary */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-[var(--color-secondary)] px-4 sm:px-7 py-4 sm:py-6">
                <h3 className="text-base sm:text-xl font-bold text-[var(--color-text-inverse)]">Order Summary</h3>
                <p className="text-[10px] sm:text-xs text-[var(--color-muted)] mt-1">
                  {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'} selected
                </p>
              </div>

              <div className="px-4 sm:px-7 py-4 sm:py-6">

                <div className="flex items-center bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 mb-4 sm:mb-5">
                  <Tag size={12} className="sm:w-3.5 sm:h-3.5 text-[var(--color-muted)] shrink-0" />
                  <input
                    type="text"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted-light)]"
                  />
                  <button className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-light)] text-[var(--color-text-inverse)] border-none rounded-lg text-[10px] sm:text-xs font-semibold cursor-pointer transition-all duration-200 flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2">
                    Apply
                  </button>
                </div>

                <div className="flex flex-col gap-2.5 sm:gap-3.5 mb-3 sm:mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-[var(--color-muted)]">Subtotal</span>
                    <span className="text-sm sm:text-base font-semibold text-[var(--color-text)]">
                      ₹{Number(subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-[var(--color-muted)]">Delivery</span>
                    {deliveryFee === 0 ? (
                      <span className="text-[10px] sm:text-xs font-bold text-[var(--color-success)] bg-[var(--color-success-bg)] rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1">
                        FREE
                      </span>
                    ) : (
                      <span className="text-sm sm:text-base font-semibold text-[var(--color-text)]">
                        ₹{deliveryFee}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-[var(--color-border)] my-4 sm:my-5" />

                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <span className="text-sm sm:text-base font-bold text-[var(--color-text)]">Total</span>
                  <span className="text-xl sm:text-3xl font-bold text-[var(--color-text)]">
                    ₹{Number(finalTotal).toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white border-none rounded-xl text-sm sm:text-base font-bold cursor-pointer flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 py-3 sm:py-3.5 gap-2 sm:gap-2.5 mb-2 sm:mb-3"
                >
                  Proceed to Checkout <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>

                <Link
                  to="/products"
                  className="block text-center text-xs sm:text-sm font-semibold text-[var(--color-muted)] no-underline hover:text-[var(--color-text)] transition-colors mb-4 sm:mb-6"
                >
                  ← Continue Shopping
                </Link>

                <div className="flex flex-col gap-2 sm:gap-2.5">
                  {[
                    { icon: <Shield size={12} className="sm:w-3.5 sm:h-3.5" />, label: 'Secure encrypted checkout' },
                    { icon: <Truck size={12} className="sm:w-3.5 sm:h-3.5" />, label: 'Fast premium delivery' },
                    { icon: <RotateCcw size={12} className="sm:w-3.5 sm:h-3.5" />, label: 'Easy 7-day returns' },
                  ].map(b => (
                    <div
                      key={b.label}
                      className="flex items-center bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5"
                    >
                      <span className="text-[var(--color-muted)]">{b.icon}</span>
                      <span className="text-[10px] sm:text-xs text-[var(--color-muted)] font-medium">{b.label}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp {
          animation: fadeUp 0.5s ease forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}