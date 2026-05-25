import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Shield, Truck, Tag, Infinity } from 'lucide-react'
import { toast } from 'react-hot-toast'
import useCartStore from '../store/cartStore'

export default function Cart() {
  const { cart, fetchCart, updateItem, removeItem, clearCart, loading } = useCartStore()
  const navigate = useNavigate()
  const [removingItems, setRemovingItems] = useState(new Set())
  const [updatingItems, setUpdatingItems] = useState(new Set())

  useEffect(() => { fetchCart() }, [])

  const handleUpdate = async (itemId, qty) => {
    if (qty < 1) return
    setUpdatingItems(new Set([...updatingItems, itemId]))
    try {
      await updateItem(itemId, qty)
    } catch {
      toast.error('Failed to update')
    } finally {
      setUpdatingItems(prev => { const n = new Set(prev); n.delete(itemId); return n })
    }
  }

  const handleRemove = async (itemId) => {
    setRemovingItems(new Set([...removingItems, itemId]))
    try {
      await removeItem(itemId)
      toast.success('Removed from cart')
    } catch {
      toast.error('Failed to remove')
    } finally {
      setRemovingItems(prev => { const n = new Set(prev); n.delete(itemId); return n })
    }
  }

  const totalPrice  = parseFloat(cart?.subtotal || 0)
  const deliveryFee = totalPrice >= 999 ? 0 : 49
  const finalTotal  = (totalPrice + deliveryFee).toFixed(2)

  /* ── Loading ─────────────────────────────────────────── */
  if (loading) return (
    <div className="bg-black min-h-screen pt-[80px] sm:pt-[96px]">
      <div className="page-container">
        <div className="h-8 sm:h-10 w-48 bg-gold/5 animate-pulse mb-8 sm:mb-12" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 sm:gap-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-[#0A0A0A] border border-gold/10 h-24 sm:h-28 animate-pulse" />
            ))}
          </div>
          <div className="bg-[#0A0A0A] border border-gold/10 h-80 animate-pulse" />
        </div>
      </div>
    </div>
  )

  /* ── Empty ───────────────────────────────────────────── */
  if (!cart || cart.items?.length === 0) return (
    <div className="bg-black min-h-[80vh] flex items-center justify-center pt-[80px] sm:pt-[96px] px-4">
      <div className="text-center animate-fadeUp max-w-md mx-auto">
        {/* Infinity icon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 border border-gold/20 flex items-center justify-center mx-auto mb-6 sm:mb-8">
          <Infinity size={36} className="sm:w-10 sm:h-10 text-gold/40" strokeWidth={1} />
        </div>

        <p className="label-gold mb-3 sm:mb-4">The Void is Empty</p>

        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white tracking-wider mb-3 sm:mb-4">
          CART IS EMPTY
        </h2>

        <p className="text-muted text-sm sm:text-base mb-8 sm:mb-10 leading-relaxed">
          Your collection awaits. Explore the archives and select your artifacts.
        </p>

        <Link to="/products"
          className="btn-primary inline-flex items-center gap-2"
        >
          EXPLORE ARTIFACTS
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )

  /* ── Cart ────────────────────────────────────────────── */
  return (
    <div className="bg-black min-h-screen">

      {/* Page header */}
      <div className="bg-[#0A0A0A] border-b border-gold/10 pt-[80px] sm:pt-[96px]">
        <div className="page-container py-8 sm:py-10 lg:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="label-gold mb-2 sm:mb-3">Your Collection</p>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white tracking-wider">
                CART
                <span className="text-muted text-base sm:text-lg font-body font-normal tracking-normal ml-3 sm:ml-4">
                  {cart.total_items} {cart.total_items === 1 ? 'artifact' : 'artifacts'}
                </span>
              </h1>
            </div>

            {cart.items?.length > 0 && (
              <button onClick={clearCart}
                className="text-[11px] sm:text-xs font-mono tracking-wider uppercase text-red-400 
                  border border-red-400/20 px-4 sm:px-5 py-2 sm:py-2.5 
                  transition-all duration-300 hover:bg-red-400/10 hover:border-red-400/40 cursor-pointer"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="page-container py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 sm:gap-8">

          {/* ── Left: Items ────────────────────────────── */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {cart.items?.map((item, index) => (
              <div
                key={item.id}
                className={`bg-[#0A0A0A] border border-gold/10 hover:border-gold/20 
                  transition-all duration-500 p-3 sm:p-4 lg:p-5 flex items-center gap-3 sm:gap-4 lg:gap-5
                  ${removingItems.has(item.id) ? 'opacity-0 -translate-x-5' : 'opacity-100 translate-x-0'}
                `}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {/* Product image */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 border border-gold/10 overflow-hidden shrink-0">
                  <img
                    src={item.product.primary_image?.image || item.product.image || ''}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name + price */}
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product.slug}`}
                    className="font-body font-semibold text-sm sm:text-[15px] text-white no-underline 
                      line-clamp-2 hover:text-gold transition-colors duration-300 block mb-1 sm:mb-2"
                  >
                    {item.product.name}
                  </Link>

                  <p className="font-mono text-sm sm:text-base text-gold tracking-wider">
                    ₹{Number(item.product.effective_price).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center border border-gold/20 shrink-0">
                  <button
                    onClick={() => handleUpdate(item.id, item.quantity - 1)}
                    disabled={updatingItems.has(item.id) || item.quantity <= 1}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-muted 
                      hover:text-white hover:bg-gold/5 transition-all duration-200 
                      disabled:opacity-30 cursor-pointer border-none bg-transparent"
                  >
                    <Minus size={14} />
                  </button>

                  <span className="w-8 sm:w-10 text-center text-sm font-mono text-white 
                    border-l border-r border-gold/20 leading-8 sm:leading-9">
                    {updatingItems.has(item.id) ? (
                      <span className="text-gold/60">…</span>
                    ) : item.quantity}
                  </span>

                  <button
                    onClick={() => handleUpdate(item.id, item.quantity + 1)}
                    disabled={updatingItems.has(item.id)}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-muted 
                      hover:text-white hover:bg-gold/5 transition-all duration-200 
                      cursor-pointer border-none bg-transparent"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Line total */}
                <div className="text-right shrink-0 hidden sm:block min-w-[70px]">
                  <p className="text-[10px] font-mono tracking-wider text-muted uppercase mb-1">Total</p>
                  <p className="font-mono text-sm lg:text-base text-white tracking-wider">
                    ₹{Number(item.line_total).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={removingItems.has(item.id)}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center 
                    text-muted border border-gold/10 hover:text-red-400 hover:border-red-400/30 
                    hover:bg-red-400/5 transition-all duration-300 cursor-pointer 
                    border-none bg-transparent shrink-0"
                >
                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            ))}

            {/* Continue shopping */}
            <Link to="/products"
              className="text-[11px] sm:text-xs font-mono tracking-wider uppercase text-muted 
                hover:text-gold transition-colors duration-300 flex items-center gap-2 mt-2 sm:mt-4 w-fit"
            >
              <ArrowRight size={12} className="rotate-180" />
              Continue Shopping
            </Link>
          </div>

          {/* ── Right: Order Summary ────────────────────── */}
          <div className="lg:sticky lg:top-[110px] h-fit">
            <div className="bg-[#0A0A0A] border border-gold/10">

              {/* Summary header */}
              <div className="bg-black border-b border-gold/10 p-5 sm:p-6">
                <h3 className="font-display text-lg sm:text-xl text-white tracking-wider">
                  ORDER SUMMARY
                </h3>
                <p className="text-[11px] font-mono tracking-wider text-muted mt-1">
                  {cart.total_items} {cart.total_items === 1 ? 'artifact' : 'artifacts'} selected
                </p>
              </div>

              {/* Summary body */}
              <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">

                {/* Free delivery banner */}
                {deliveryFee > 0 && (
                  <div className="bg-gold/5 border border-gold/20 p-3 sm:p-4 flex items-center gap-3">
                    <Tag size={14} className="text-gold shrink-0" />
                    <p className="text-[11px] sm:text-xs text-gold/80 font-mono tracking-wider">
                      Add ₹{(999 - totalPrice).toFixed(0)} more for FREE transmission!
                    </p>
                  </div>
                )}

                {/* Line items */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted">Subtotal</span>
                    <span className="text-sm sm:text-base font-mono text-white tracking-wider">
                      ₹{Number(totalPrice).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted">Transmission Fee</span>
                    {deliveryFee === 0 ? (
                      <span className="text-[11px] sm:text-xs font-mono tracking-wider text-green-400 
                        bg-green-400/10 px-2.5 sm:px-3 py-1">
                        FREE
                      </span>
                    ) : (
                      <span className="text-sm sm:text-base font-mono text-white tracking-wider">
                        ₹{deliveryFee}
                      </span>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-gold/10" />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base font-semibold text-white tracking-wider">TOTAL</span>
                  <span className="font-display text-2xl sm:text-3xl text-gold tracking-wider">
                    ₹{Number(finalTotal).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Checkout button */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 sm:py-4"
                >
                  PROCEED TO CHECKOUT
                  <ArrowRight size={16} />
                </button>

                {/* Trust badges */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 p-3 sm:p-4 bg-black border border-gold/10">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-gold/40 shrink-0" />
                    <span className="text-[10px] sm:text-[11px] text-muted font-mono tracking-wider uppercase truncate">
                      Encrypted
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-gold/40 shrink-0" />
                    <span className="text-[10px] sm:text-[11px] text-muted font-mono tracking-wider uppercase truncate">
                      Fast Transmit
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}