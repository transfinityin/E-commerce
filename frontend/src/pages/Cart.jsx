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

  /* ── Group items by product for size display ── */
  const groupedItems = cart?.items?.reduce((acc, item) => {
    const key = item.product.id
    if (!acc[key]) {
      acc[key] = { product: item.product, sizes: [], totalQty: 0 }
    }
    acc[key].sizes.push({ size: item.size || 'N/A', qty: item.quantity, itemId: item.id })
    acc[key].totalQty += item.quantity
    return acc
  }, {}) || {}

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container py-12">
        <div className="h-8 bg-[var(--color-bg-alt)] rounded-lg animate-pulse w-48 mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 animate-pulse h-32" />
            ))}
          </div>
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] h-80 animate-pulse" />
        </div>
      </div>
    </div>
  )

  /* ── Empty ── */
  if (!cart || cart.items?.length === 0) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="flex flex-col items-center text-center gap-5 px-6 py-12">
        <div className="w-20 h-20 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center mb-2">
          <ShoppingBag size={36} className="text-[var(--color-primary)]" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">
            Your Collection
          </p>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
            Your cart is empty
          </h2>
          <p className="text-sm text-[var(--color-muted)] max-w-sm mb-8">
            Explore our premium collection and find something you love. Your perfect piece is waiting.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-semibold rounded-xl transition-all duration-300 px-8 py-3.5 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )

  /* ── Main Cart ── */
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">

      {/* Page header */}
      <div className="bg-[var(--color-secondary)]">
        <div className="page-container py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">
                Your Selection
              </p>
              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text-inverse)]">
                Shopping Bag
                <span className="font-normal text-[var(--color-muted-light)] ml-3 text-base">
                  {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'}
                </span>
              </h1>
            </div>
            <button
              onClick={clearCart}
              className="text-sm font-medium rounded-lg transition-all duration-200 bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger)]/20 hover:bg-[var(--color-danger)] hover:text-white px-5 py-2.5"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="page-container py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] items-start gap-6 lg:gap-8">

          {/* ── LEFT ── */}
          <div className="flex flex-col gap-4">

            {/* Free shipping bar */}
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
              <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Truck size={16} className="text-[var(--color-primary)]" />
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    {deliveryFee === 0
                      ? <span className="flex items-center gap-1.5">🎉 Free delivery unlocked! <Sparkles size={14} className="text-[var(--color-primary)]" /></span>
                      : `Add ₹${freeShipRemaining.toFixed(0)} more for free delivery`
                    }
                  </p>
                </div>
                <span className={`text-xs font-bold ${deliveryFee === 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]'}`}>
                  {Math.round(freeShipPct)}%
                </span>
              </div>
              <div className="px-5 pb-4">
                <div className="rounded-full bg-[var(--color-bg-alt)] overflow-hidden h-2">
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
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-start gap-4 p-4 lg:p-5 animate-fadeUp"
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                {/* Image */}
                <div className="w-full h-52 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-[var(--color-bg-alt)] border border-[var(--color-border)] group">
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
                    className="font-semibold text-sm text-[var(--color-text)] no-underline leading-snug hover:text-[var(--color-primary)] transition-colors line-clamp-2"
                  >
                    {group.product.name}
                  </Link>

                  {/* Size breakdown */}
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {group.sizes.map(({ size, qty }) => (
                      <div
                        key={size}
                        className="flex items-center gap-1.5 bg-[var(--color-bg-alt)] rounded-lg border border-[var(--color-border)] px-2.5 py-1"
                      >
                        <span className="text-xs font-bold text-[var(--color-text)]">{size}</span>
                        <span className="text-xs text-[var(--color-muted)]">×{qty}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center flex-wrap gap-3 mt-2.5">
                    <span className="text-base font-bold text-[var(--color-text)]">
                      ₹{Number(group.product.effective_price).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] font-bold bg-[var(--color-success-bg)] text-[var(--color-success)] rounded-full px-2.5 py-0.5">
                      In Stock
                    </span>
                    <span className="text-xs text-[var(--color-muted)]">
                      Total: {group.totalQty} pcs
                    </span>
                  </div>
                </div>

                {/* Controls for each size */}
                <div className="flex flex-col gap-2.5 w-full sm:w-auto">
                  {group.sizes.map(({ size, qty, itemId }) => (
                    <div key={itemId} className="flex items-center gap-3 justify-between sm:justify-end">
                      <span className="text-xs font-bold text-[var(--color-muted)] w-6">{size}</span>

                      {/* Stepper */}
                      <div className="flex items-center bg-[var(--color-bg-alt)] rounded-full border border-[var(--color-border)] p-0.5">
                        <button
                          onClick={() => handleUpdate(itemId, qty - 1)}
                          disabled={updatingItems.has(itemId) || qty <= 1}
                          className="rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--color-secondary)] hover:text-[var(--color-text-inverse)] hover:border-[var(--color-secondary)] w-7 h-7"
                        >
                          <Minus size={12} />
                        </button>

                        <span className="text-sm font-bold text-[var(--color-text)] text-center w-8">
                          {updatingItems.has(itemId) ? '…' : qty}
                        </span>

                        <button
                          onClick={() => handleUpdate(itemId, qty + 1)}
                          disabled={updatingItems.has(itemId)}
                          className="rounded-full bg-[var(--color-secondary)] border-none flex items-center justify-center text-[var(--color-text-inverse)] transition-all duration-200 cursor-pointer hover:bg-[var(--color-secondary-light)] w-7 h-7"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemove(itemId)}
                        disabled={removingItems.has(itemId)}
                        className="rounded-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] transition-all duration-200 cursor-pointer hover:bg-[var(--color-danger-bg)] hover:border-[var(--color-danger)]/30 hover:text-[var(--color-danger)] w-8 h-8"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Link
              to="/products"
              className="inline-flex items-center text-sm font-semibold text-[var(--color-muted)] no-underline hover:text-[var(--color-text)] transition-colors w-fit gap-1.5 mt-1"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* ── RIGHT: Summary ── */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-lg">
              {/* Header */}
              <div className="bg-[var(--color-secondary)] px-7 py-6">
                <h3 className="text-xl font-bold text-[var(--color-text-inverse)]">Order Summary</h3>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'} selected
                </p>
              </div>

              <div className="px-7 py-6">

                {/* Coupon */}
                <div className="flex items-center bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl gap-2 px-3 py-2 mb-5">
                  <Tag size={14} className="text-[var(--color-muted)] shrink-0" />
                  <input
                    type="text"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted-light)]"
                  />
                  <button className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-light)] text-[var(--color-text-inverse)] border-none rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 flex-shrink-0 px-4 py-2">
                    Apply
                  </button>
                </div>

                {/* Prices */}
                <div className="flex flex-col gap-3.5 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--color-muted)]">Subtotal</span>
                    <span className="text-base font-semibold text-[var(--color-text)]">
                      ₹{Number(subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--color-muted)]">Delivery</span>
                    {deliveryFee === 0 ? (
                      <span className="text-xs font-bold text-[var(--color-success)] bg-[var(--color-success-bg)] rounded-full px-2.5 py-1">
                        FREE
                      </span>
                    ) : (
                      <span className="text-base font-semibold text-[var(--color-text)]">
                        ₹{deliveryFee}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-[var(--color-border)] my-5" />

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-base font-bold text-[var(--color-text)]">Total</span>
                  <span className="text-3xl font-bold text-[var(--color-text)]">
                    ₹{Number(finalTotal).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Checkout btn */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white border-none rounded-xl text-base font-bold cursor-pointer flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 py-3.5 gap-2.5 mb-3"
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>

                <Link
                  to="/products"
                  className="block text-center text-sm font-semibold text-[var(--color-muted)] no-underline hover:text-[var(--color-text)] transition-colors mb-6"
                >
                  ← Continue Shopping
                </Link>

                {/* Trust */}
                <div className="flex flex-col gap-2.5">
                  {[
                    { icon: <Shield size={14} />, label: 'Secure encrypted checkout' },
                    { icon: <Truck size={14} />, label: 'Fast premium delivery' },
                    { icon: <RotateCcw size={14} />, label: 'Easy 7-day returns' },
                  ].map(b => (
                    <div
                      key={b.label}
                      className="flex items-center bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg gap-2.5 px-3.5 py-2.5"
                    >
                      <span className="text-[var(--color-muted)]">{b.icon}</span>
                      <span className="text-xs text-[var(--color-muted)] font-medium">{b.label}</span>
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