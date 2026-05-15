import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Shield, Truck, RotateCcw, Tag } from 'lucide-react'
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
    try { await updateItem(itemId, qty) }
    catch { toast.error('Failed to update') }
    finally { setUpdatingItems(prev => { const n = new Set(prev); n.delete(itemId); return n }) }
  }

  const handleRemove = async (itemId) => {
    setRemovingItems(prev => new Set([...prev, itemId]))
    try { await removeItem(itemId); toast.success('Removed from cart') }
    catch { toast.error('Failed to remove') }
    finally { setRemovingItems(prev => { const n = new Set(prev); n.delete(itemId); return n }) }
  }

  const subtotal    = parseFloat(cart?.subtotal || 0)
  const deliveryFee = subtotal >= 999 ? 0 : 49
  const finalTotal  = (subtotal + deliveryFee).toFixed(2)
  const freeShipPct = Math.min((subtotal / 999) * 100, 100)

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto" style={{ maxWidth: '1200px' }}>
        <div className="bg-slate-200 rounded animate-pulse" style={{ height: '40px', width: '220px', marginBottom: '48px' }} />
        <div className="flex flex-col" style={{ gap: '16px' }}>
          {[1,2,3].map(i => (
            <div key={i} className="bg-slate-200 rounded-xl animate-pulse" style={{ height: '120px' }} />
          ))}
        </div>
      </div>
    </div>
  )

  /* ── Empty ── */
  if (!cart || cart.items?.length === 0) return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-10">
      <div className="flex flex-col items-center text-center" style={{ gap: '16px', padding: '24px' }}>
        <div className="bg-slate-100 rounded-full flex items-center justify-center text-slate-900" style={{ width: '64px', height: '64px' }}>
          <ShoppingBag size={44} strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-sm text-slate-500">
          Explore our premium collection and find something you love.
        </p>
        <Link to="/products" className="inline-flex items-center bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors" style={{ padding: '14px 32px', gap: '8px' }}>
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )

  /* ── Main Cart ── */
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>

      {/* Page header */}
      <div style={{ background: 'var(--color-secondary)' }}>
        <div className="mx-auto flex flex-wrap items-center justify-between" style={{ maxWidth: '1200px', padding: '24px', gap: '16px' }}>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase" style={{ marginBottom: '8px' }}>Your Selection</p>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-inverse)' }}>
              Shopping Bag
              <span className="font-normal font-sans text-slate-500" style={{ marginLeft: '14px', fontSize: '16px' }}>
                {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'}
              </span>
            </h1>
          </div>
          <button onClick={clearCart} className="text-sm font-medium cursor-pointer rounded-lg transition-colors bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20" style={{ padding: '9px 20px' }}>
            Clear Cart
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto py-10" style={{ maxWidth: '1200px', padding: '0 24px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] items-start" style={{ gap: '28px' }}>

          {/* ── LEFT ── */}
          <div className="flex flex-col" style={{ gap: '14px' }}>

            {/* Free shipping bar */}
           <div className="rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <Truck size={15} style={{ color: 'var(--color-text)' }} />
                  <p className="text-sm font-semibold text-slate-900">
                    {deliveryFee === 0 ? '🎉 Free delivery unlocked!' : `Add ₹${(999 - subtotal).toFixed(0)} more for free delivery`}
                  </p>
                </div>
                <span className={`text-xs font-bold ${deliveryFee === 0 ? 'text-green-600' : 'text-slate-800'}`}>
                  {Math.round(freeShipPct)}%
                </span>
              </div>
              <div className="rounded-full bg-slate-100 overflow-hidden" style={{ height: '6px' }}>
                <div className="rounded-full transition-all duration-500" style={{
                  height: '100%',
                  width: `${freeShipPct}%`,
                  background: deliveryFee === 0 ? 'var(--color-success)' : 'linear-gradient(90deg, var(--color-secondary), var(--color-muted))'
                }} />
              </div>
            </div>

            {/* Items */}
            {cart.items?.map((item, index) => (
              <div
                key={item.id}
                className="bg-white border border-slate-100 rounded-xl flex flex-col sm:flex-row items-center"
                style={{
                  padding: '18px',
                  gap: '18px',
                  transition: 'opacity 0.3s, transform 0.3s',
                  opacity: removingItems.has(item.id) ? 0 : 1,
                  transform: removingItems.has(item.id) ? 'translateX(-16px)' : 'none',
                  animation: `fadeUp 0.4s ease ${index * 0.07}s both`,
                }}
              >
                {/* Image */}
                <div className="w-full h-[200px] sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
                  <img
                    src={item.product.primary_image?.image || item.product.image || ''}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name + price */}
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product.slug}`} className="font-semibold text-sm text-slate-900 no-underline leading-snug hover:text-slate-700 transition-colors line-clamp-2">
                    {item.product.name}
                  </Link>
                  <div className="flex items-center flex-wrap" style={{ gap: '8px', marginTop: '6px' }}>
                    <span className="font-serif text-base font-bold text-slate-800">₹{Number(item.product.effective_price).toLocaleString('en-IN')}</span>
                    <span className="text-xs font-semibold bg-green-100 text-green-700 rounded-full" style={{ padding: '2px 8px' }}>In Stock</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center flex-shrink-0 w-full sm:w-auto justify-between sm:justify-start" style={{ gap: '14px' }}>

                  {/* Stepper */}
                  <div className="flex items-center bg-slate-50 rounded-full border border-slate-100" style={{ padding: '3px' }}>
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity - 1)}
                      disabled={updatingItems.has(item.id) || item.quantity <= 1}
                      className="rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-900 hover:text-white"
                      style={{ width: '32px', height: '32px' }}
                    ><Minus size={13} /></button>

                    <span className="text-sm font-bold text-slate-900 text-center" style={{ width: '32px' }}>
                      {updatingItems.has(item.id) ? '…' : item.quantity}
                    </span>

                    <button
                      onClick={() => handleUpdate(item.id, item.quantity + 1)}
                      disabled={updatingItems.has(item.id)}
                      className="rounded-full bg-slate-900 border-none flex items-center justify-center text-white transition-all cursor-pointer hover:bg-slate-700"
                      style={{ width: '32px', height: '32px' }}
                    ><Plus size={13} /></button>
                  </div>

                  {/* Line total */}
                  <div className="text-right" style={{ minWidth: '70px' }}>
                    <p className="text-xs text-slate-400" style={{ marginBottom: '3px' }}>Total</p>
                    <p className="font-serif text-lg font-bold text-slate-900">₹{Number(item.line_total).toLocaleString('en-IN')}</p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={removingItems.has(item.id)}
                    className="rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 transition-all cursor-pointer hover:bg-red-50 hover:border-red-200 hover:text-red-500 flex-shrink-0"
                    style={{ width: '36px', height: '36px' }}
                  ><Trash2 size={15} /></button>
                </div>
              </div>
            ))}

            <Link to="/products" className="inline-flex items-center text-sm font-semibold text-slate-400 no-underline hover:text-slate-900 transition-colors w-fit" style={{ gap: '6px', marginTop: '4px' }}>
              ← Continue Shopping
            </Link>
          </div>

          {/* ── RIGHT: Summary ── */}
          <div className="lg:sticky lg:top-[100px]">
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-lg">
              {/* Header */}
              <div className="bg-slate-900" style={{ padding: '24px 28px' }}>
                <h3 className="font-serif text-2xl font-bold text-white">Order Summary</h3>
                <p className="text-xs text-slate-500" style={{ marginTop: '4px' }}>
                  {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'} selected
                </p>
              </div>

              <div style={{ padding: '24px 28px' }}>

                {/* Coupon */}
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg" style={{ gap: '8px', padding: '6px 6px 6px 12px', marginBottom: '22px' }}>
                  <Tag size={14} style={{ color: 'var(--color-muted)' }} />
                  <input
                    type="text" value={coupon} onChange={e => setCoupon(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400"
                  />
                  <button className="bg-slate-900 text-white border-none rounded text-xs font-semibold cursor-pointer hover:bg-slate-700 transition-colors flex-shrink-0" style={{ padding: '8px 14px' }}>
                    Apply
                  </button>
                </div>

                {/* Prices */}
                <div className="flex flex-col" style={{ gap: '14px', marginBottom: '18px' }}>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Subtotal</span>
                    <span className="text-base font-semibold text-slate-900">₹{Number(subtotal).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Delivery</span>
                    {deliveryFee === 0 ? (
                      <span className="text-xs font-bold text-green-600 bg-green-100 rounded-full" style={{ padding: '3px 10px' }}>FREE</span>
                    ) : (
                      <span className="text-base font-semibold text-slate-900">₹{deliveryFee}</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100" style={{ margin: '18px 0' }} />

                {/* Total */}
                <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
                  <span className="text-base font-bold text-slate-900">Total</span>
                  <span className="font-serif text-3xl font-bold text-slate-900">₹{Number(finalTotal).toLocaleString('en-IN')}</span>
                </div>

                {/* Checkout btn */}
                <button onClick={() => navigate('/checkout')} className="w-full bg-slate-900 text-white border-none rounded-lg text-base font-bold cursor-pointer flex items-center justify-center transition-all hover:bg-slate-700 hover:-translate-y-0.5 hover:shadow-md" style={{ height: '52px', gap: '10px', marginBottom: '12px' }}>
                  Proceed to Checkout <ArrowRight size={18} />
                </button>

                <Link to="/products" className="block text-center text-sm font-semibold text-slate-400 no-underline hover:text-slate-900 transition-colors" style={{ marginBottom: '20px' }}>
                  ← Continue Shopping
                </Link>

                {/* Trust */}
                <div className="flex flex-col" style={{ gap: '8px' }}>
                  {[
                    { icon: <Shield size={13} />, label: 'Secure encrypted checkout' },
                    { icon: <Truck size={13} />,  label: 'Fast premium delivery' },
                    { icon: <RotateCcw size={13} />, label: 'Easy 7-day returns' },
                  ].map(b => (
                    <div key={b.label} className="flex items-center bg-slate-50 border border-slate-100 rounded-lg" style={{ gap: '10px', padding: '10px 14px' }}>
                      <span style={{ color: 'var(--color-muted)' }}>{b.icon}</span>
                      <span className="text-xs text-slate-400 font-medium">{b.label}</span>
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
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}