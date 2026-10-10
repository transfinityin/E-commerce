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
  Loader2,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion, useReducedMotion } from 'framer-motion'
import useCartStore from '../store/cartStore'

function formatInr(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

export default function Cart() {
  const { cart, fetchCart, updateItem, removeItem, clearCart, loading } = useCartStore()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()

  const [removingItems, setRemovingItems] = useState(new Set())
  const [updatingItems, setUpdatingItems] = useState(new Set())
  const [coupon, setCoupon] = useState('')
  const [savedCoupons, setSavedCoupons] = useState([])

  useEffect(() => {
    fetchCart()
    try {
      const saved = JSON.parse(localStorage.getItem('qr_coupons') || '[]')
      setSavedCoupons(Array.isArray(saved) ? saved : [])
    } catch {
      setSavedCoupons([])
    }
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
      toast.success('Removed from bag')
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

  const handleClear = async () => {
    if (!window.confirm('Clear your entire bag?')) return
    try {
      await clearCart()
      toast.success('Bag cleared')
    } catch {
      toast.error('Failed to clear bag')
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
      <div className="min-h-screen bg-[#EFEFEF] pb-16 text-neutral-900">
        <div className="mx-auto max-w-[1180px] px-4 pt-4 sm:px-6 sm:pt-5 md:px-8 md:pt-6">
          <div className="mb-8 h-3 w-28 animate-pulse rounded-full bg-neutral-200/80" />
          <div className="mb-8 h-8 w-48 animate-pulse rounded-full bg-neutral-200/80" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px]">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-2xl bg-white ring-1 ring-black/5"
                />
              ))}
            </div>
            <div className="h-80 animate-pulse rounded-2xl bg-white ring-1 ring-black/5" />
          </div>
        </div>
      </div>
    )
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="min-h-screen bg-[#EFEFEF] pb-16 text-neutral-900">
        <div className="mx-auto flex max-w-[1180px] flex-col px-4 pt-4 sm:px-6 sm:pt-5 md:px-8 md:pt-6">
          <nav className="mb-10 flex flex-wrap items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-400">
            <Link to="/" className="transition-colors hover:text-neutral-700">
              Home
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-neutral-700">Bag</span>
          </nav>

          <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl bg-white px-6 py-14 text-center shadow-[0_16px_40px_rgba(17,17,17,0.05)] ring-1 ring-black/5 sm:px-10">
            <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-[#F4F4F2] text-neutral-800">
              <ShoppingBag size={26} strokeWidth={1.5} />
            </div>
            <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-neutral-500 uppercase">
              Bag
            </p>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl">
              Your bag is empty
            </h1>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-500">
              Browse the drop and add a tee when you find the one.
            </p>
            <Link
              to="/products"
              className="tf-buy-now mt-8 inline-flex min-w-[10rem] items-center justify-center gap-2"
            >
              <span>Shop the drop</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#EFEFEF] pb-16 text-neutral-900 md:pb-20">
      <div className="mx-auto max-w-[1180px] px-4 pt-4 sm:px-6 sm:pt-5 md:px-8 md:pt-6">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-400 sm:mb-8">
          <Link to="/" className="transition-colors hover:text-neutral-700">
            Home
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-neutral-700">Bag</span>
        </nav>

        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-[10px] font-medium tracking-[0.28em] text-neutral-500 uppercase">
              Checkout prep
            </p>
            <h1 className="mt-2 font-sans text-[clamp(1.55rem,2.8vw,2.25rem)] font-semibold tracking-[0.03em] text-neutral-900 uppercase leading-[1.15]">
              Your bag
            </h1>
            <p className="mt-2 text-[13px] text-neutral-500">
              {cart.total_items} {cart.total_items === 1 ? 'piece' : 'pieces'}
              <span className="mx-1.5 text-neutral-300">·</span>
              Ready when you are
            </p>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-full bg-white px-4 text-[10px] font-semibold tracking-[0.16em] text-red-600 uppercase ring-1 ring-red-200 transition hover:bg-red-50 sm:self-auto"
          >
            <Trash2 size={13} />
            Clear bag
          </button>
        </motion.header>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_360px] lg:gap-7 xl:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-3.5 sm:gap-4">
            {/* Free shipping meter */}
            <div className="rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F4F4F2] text-neutral-800">
                    <Truck size={16} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900">
                      {deliveryFee === 0
                        ? 'Free delivery unlocked'
                        : `Add ${formatInr(freeShipRemaining)} more for free delivery`}
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      Free above ₹999
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#F4F4F2] px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-neutral-600 uppercase">
                  {Math.round(freeShipPct)}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#F4F4F2]">
                <div
                  className="h-full rounded-full bg-neutral-950 transition-all duration-700"
                  style={{ width: `${freeShipPct}%` }}
                />
              </div>
            </div>

            {Object.values(groupedItems).map((group, index) => (
              <motion.article
                key={group.product.id}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
                  <Link
                    to={`/products/${group.product.slug}`}
                    className="block aspect-[4/5] w-full shrink-0 overflow-hidden rounded-xl bg-[#F4F4F2] sm:aspect-square sm:w-28 lg:w-32"
                  >
                    <img
                      src={
                        group.product.primary_image?.image ||
                        group.product.image ||
                        ''
                      }
                      alt={group.product.name}
                      className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/products/${group.product.slug}`}
                      className="line-clamp-2 text-base font-semibold tracking-[0.04em] text-neutral-950 uppercase transition hover:text-neutral-700"
                    >
                      {group.product.name}
                    </Link>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {group.sizes.map(({ size, qty, itemId }) => (
                        <span
                          key={itemId}
                          className="inline-flex items-center gap-1 rounded-full bg-[#F4F4F2] px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-neutral-600 uppercase"
                        >
                          {size}
                          <span className="text-neutral-400">×{qty}</span>
                        </span>
                      ))}
                    </div>

                    <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                      <span className="text-base font-semibold tracking-[-0.02em] text-neutral-950">
                        {formatInr(group.product.effective_price)}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold tracking-[0.14em] text-emerald-700 uppercase ring-1 ring-emerald-200">
                        In stock
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {group.totalQty} pcs
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 sm:min-w-[148px]">
                    {group.sizes.map(({ size, qty, itemId }) => (
                      <div
                        key={itemId}
                        className="flex items-center justify-between gap-2 sm:justify-end"
                      >
                        <span className="w-7 text-[10px] font-semibold tracking-[0.14em] text-neutral-400 uppercase sm:text-right">
                          {size}
                        </span>

                        <div className="inline-flex items-center rounded-full bg-[#F4F4F2] p-0.5 ring-1 ring-black/5">
                          <button
                            type="button"
                            onClick={() => handleUpdate(itemId, qty - 1)}
                            disabled={updatingItems.has(itemId) || qty <= 1}
                            className="flex size-8 items-center justify-center rounded-full text-neutral-600 transition hover:bg-white hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`Decrease ${size}`}
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-neutral-900">
                            {updatingItems.has(itemId) ? '…' : qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdate(itemId, qty + 1)}
                            disabled={updatingItems.has(itemId)}
                            className="flex size-8 items-center justify-center rounded-full bg-neutral-950 text-white transition hover:bg-neutral-800 disabled:opacity-50"
                            aria-label={`Increase ${size}`}
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(itemId)}
                          disabled={removingItems.has(itemId)}
                          className="flex size-8 items-center justify-center rounded-full text-red-500 ring-1 ring-red-200 transition hover:bg-red-50 disabled:opacity-50"
                          aria-label="Remove item"
                        >
                          {removingItems.has(itemId) ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}

            <Link
              to="/products"
              className="mt-1 inline-flex w-fit items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase transition hover:text-neutral-950"
            >
              ← Continue shopping
            </Link>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_rgba(17,17,17,0.06)] ring-1 ring-black/5">
              <div className="border-b border-neutral-100 px-5 py-5 sm:px-6">
                <p className="mb-1 text-[10px] font-semibold tracking-[0.22em] text-neutral-500 uppercase">
                  Summary
                </p>
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                  Order total
                </h2>
                <p className="mt-1 text-[12px] text-neutral-500">
                  {cart.total_items}{' '}
                  {cart.total_items === 1 ? 'item' : 'items'} in bag
                </p>
              </div>

              <div className="px-5 py-5 sm:px-6 sm:py-6">
                <div className="mb-4 flex items-center gap-2 rounded-full bg-[#F4F4F2] py-1.5 pr-1.5 pl-3.5 ring-1 ring-black/5">
                  <Tag size={13} className="shrink-0 text-neutral-400" />
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 text-xs font-medium tracking-[0.12em] text-neutral-900 uppercase outline-none placeholder:text-neutral-400 placeholder:normal-case placeholder:tracking-normal"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!coupon.trim()) {
                        toast.error('Enter a coupon code')
                        return
                      }
                      toast.success('Coupon will apply at checkout')
                      navigate('/checkout', { state: { couponCode: coupon.trim() } })
                    }}
                    className="shrink-0 rounded-full bg-neutral-950 px-3.5 py-2 text-[10px] font-semibold tracking-[0.14em] text-white uppercase transition hover:bg-neutral-800"
                  >
                    Apply
                  </button>
                </div>

                {savedCoupons.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-1.5">
                    {savedCoupons.slice(0, 3).map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setCoupon(c.code)}
                        className="rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold tracking-[0.12em] text-neutral-600 uppercase ring-1 ring-black/8 transition hover:text-neutral-950"
                      >
                        {c.code} · {c.discount}%
                      </button>
                    ))}
                  </div>
                )}

                <div className="mb-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">Subtotal</span>
                    <span className="text-sm font-semibold text-neutral-900">
                      {formatInr(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">Delivery</span>
                    {deliveryFee === 0 ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold tracking-[0.14em] text-emerald-700 uppercase ring-1 ring-emerald-200">
                        Free
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-neutral-900">
                        {formatInr(deliveryFee)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-6 flex items-end justify-between border-t border-neutral-100 pt-4">
                  <span className="text-sm font-semibold tracking-[0.14em] text-neutral-900 uppercase">
                    Total
                  </span>
                  <span className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl">
                    {formatInr(finalTotal)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="tf-buy-now mb-3 flex w-full items-center justify-center gap-2"
                >
                  <span>Proceed to checkout</span>
                  <ArrowRight size={15} />
                </button>

                <Link
                  to="/products"
                  className="mb-6 block text-center text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase transition hover:text-neutral-950"
                >
                  ← Continue shopping
                </Link>

                <div className="flex flex-col gap-2">
                  {[
                    { icon: Shield, label: 'Secure encrypted checkout' },
                    { icon: Truck, label: 'Fast delivery across India' },
                    { icon: RotateCcw, label: 'Easy 7-day returns' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2.5 rounded-xl bg-[#F4F4F2]/80 px-3.5 py-3"
                    >
                      <item.icon size={14} className="text-neutral-500" strokeWidth={1.75} />
                      <span className="text-[11px] text-neutral-600">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
