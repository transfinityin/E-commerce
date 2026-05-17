import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  CheckCircle, ArrowRight, MapPin, Percent, Lock,
  Package, CreditCard, Truck, ShieldCheck, ChevronRight
} from 'lucide-react'
import api from '../services/api'
import useCartStore from '../store/cartStore'

const STEPS = ['Address', 'Review Order', 'Payment']

export default function Checkout() {
  const [step, setStep] = useState(0)
  const [addresses, setAddresses] = useState([])
  const [selAddr, setSelAddr] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponData, setCouponData] = useState(null)
  const [order, setOrder] = useState(null)
  const [placing, setPlacing] = useState(false)
  const [applyCouponLoading, setApplyCouponLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const { cart, fetchCart } = useCartStore()
  const navigate = useNavigate()

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchCart()
      try {
        const r = await api.get('/auth/addresses/')
        const list = r.data.results || r.data
        setAddresses(list)
        const def = list.find(a => a.is_default) || list[0]
        if (def) setSelAddr(def.id)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const applyCoupon = async () => {
    if (!couponCode) return
    setApplyCouponLoading(true)
    try {
      const { data } = await api.post('/coupons/validate/', {
        code: couponCode,
        subtotal: cart?.subtotal,
      })
      setCouponData(data)
      toast.success(data.message)
    } catch (err) {
      toast.error(err.response?.data?.code?.[0] || 'Invalid coupon')
    } finally {
      setApplyCouponLoading(false)
    }
  }

  const placeOrder = async () => {
    if (!selAddr) { toast.error('Select an address'); return }
    setPlacing(true)
    try {
      const payload = { address_id: selAddr }
      if (couponCode) payload.coupon_code = couponCode
      const { data } = await api.post('/orders/', payload)
      setOrder(data.order)
      setStep(2)
      toast.success('Order placed!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  const payNow = async () => {
    try {
      const { data } = await api.post('/payments/create/', { order_id: order.id })
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: data.name,
        description: data.description,
        order_id: data.razorpay_order_id,
        handler: async (response) => {
          try {
            await api.post('/payments/verify/', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            toast.success('Payment successful!')
            navigate(`/order-success/${order.id}`)
          } catch {
            toast.error('Payment verification failed')
          }
        },
        prefill: { name: 'Customer', email: 'customer@example.com' },
        theme: { color: 'var(--color-primary)' },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      toast.error('Payment initiation failed')
    }
  }

  const subtotal = parseFloat(cart?.subtotal || 0)
  const discount = couponData ? parseFloat(couponData.discount) : 0
  const delivery = subtotal >= 999 ? 0 : 49
  const total = subtotal - discount + delivery

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div className="h-8 bg-[var(--color-bg-alt)] rounded-lg animate-pulse w-48" />
        <div className="h-4 bg-[var(--color-bg-alt)] rounded-lg animate-pulse w-32" />
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 h-64 animate-pulse" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">

      {/* Header */}
      <div className="bg-[var(--color-secondary)]">
        <div className="max-w-3xl mx-auto px-4 py-8 lg:py-10">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">
            Secure Checkout
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text-inverse)]">
            Your Order
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Stepper */}
        <div className="flex items-start justify-between relative mb-10">
          {/* Background line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 mx-4 bg-[var(--color-border)]" />
          {/* Active line */}
          <div
            className="absolute top-5 left-0 h-0.5 mx-4 transition-all duration-500 ease-out"
            style={{
              width: `${(step / (STEPS.length - 1)) * 100}%`,
              background: 'var(--color-primary)'
            }}
          />

          {STEPS.map((stepName, i) => {
            const isDone = i <= step
            const isCurrent = i === step
            return (
              <div key={stepName} className="relative flex flex-col items-center z-10 flex-1">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300"
                  style={{
                    borderColor: isDone ? 'var(--color-primary)' : 'var(--color-border)',
                    background: isDone ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: isDone ? 'var(--color-text-inverse)' : 'var(--color-muted)',
                    boxShadow: isCurrent ? '0 0 0 4px var(--color-primary-light)' : 'none'
                  }}
                >
                  {i < step ? <CheckCircle size={18} /> : i + 1}
                </div>
                <span
                  className="text-[11px] font-semibold text-center leading-tight mt-2"
                  style={{ color: isDone ? 'var(--color-text)' : 'var(--color-muted)' }}
                >
                  {stepName}
                </span>
              </div>
            )
          })}
        </div>

        {/* ── Step 0: Address ── */}
        {step === 0 && (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                <MapPin size={18} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-text)]">
                  Delivery Address
                </h2>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">
                  Select where you want your order delivered
                </p>
              </div>
            </div>

            {addresses.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-4 py-10">
                <div className="w-14 h-14 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                  <MapPin size={26} className="text-[var(--color-primary)]" />
                </div>
                <p className="text-sm text-[var(--color-muted)]">No saved addresses yet.</p>
                <button
                  onClick={() => navigate('/addresses')}
                  className="inline-flex items-center gap-2 bg-[var(--color-btn)] hover:bg-[var(--color-btn-hover)] text-[var(--color-btn-text)] rounded-xl text-sm font-semibold transition-all duration-300 px-6 py-3"
                >
                  Add New Address <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 mb-6">
                  {addresses.map(addr => {
                    const isSelected = selAddr === addr.id
                    return (
                      <label
                        key={addr.id}
                        className="flex items-start rounded-xl cursor-pointer transition-all duration-200 p-4 gap-3"
                        style={{
                          border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          background: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)'
                        }}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={isSelected}
                          onChange={() => setSelAddr(addr.id)}
                          className="mt-1 w-4 h-4 accent-[var(--color-primary)]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2 mb-1">
                            <span className="text-sm font-bold text-[var(--color-text)]">{addr.full_name}</span>
                            {addr.is_default && (
                              <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] border border-[var(--color-primary)]">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs leading-relaxed text-[var(--color-muted)]">
                            {addr.line1}{addr.line2 && `, ${addr.line2}`}
                          </p>
                          <p className="text-xs text-[var(--color-muted)] mt-1">
                            {addr.city}, {addr.state} — {addr.pincode}
                          </p>
                          <p className="text-xs text-[var(--color-muted)] mt-1.5">
                            📞 {addr.phone}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle size={20} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                        )}
                      </label>
                    )
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('/addresses')}
                    className="inline-flex items-center justify-center gap-2 bg-[var(--color-bg-alt)] hover:bg-[var(--color-border)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-sm font-semibold transition-all duration-200 px-6 py-3"
                  >
                    <MapPin size={16} /> Manage Addresses
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    disabled={!selAddr}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--color-btn)] hover:bg-[var(--color-btn-hover)] text-[var(--color-btn-text)] rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3"
                  >
                    Continue to Review <ChevronRight size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Step 1: Review ── */}
        {step === 1 && (
          <div className="flex flex-col gap-5">

            {/* Items */}
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                  <Package size={18} className="text-[var(--color-primary)]" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-text)]">
                  Order Items
                </h2>
              </div>
              <div className="flex flex-col gap-4">
                {cart?.items?.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-[var(--color-bg-alt)]/50"
                  >
                    <div className="w-14 h-18 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--color-bg-alt)] border border-[var(--color-border)]">
                      <img
                        src={item.product.primary_image?.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-[var(--color-text)]">{item.product.name}</p>
                      <p className="text-xs text-[var(--color-muted)] mt-1">
                        Qty: <strong className="text-[var(--color-text)]">{item.quantity}</strong>
                        {item.size && <span className="ml-2">Size: <strong className="text-[var(--color-text)]">{item.size}</strong></span>}
                      </p>
                      <p className="text-xs text-[var(--color-muted-light)] mt-0.5">
                        ₹{Number(item.product.effective_price).toLocaleString('en-IN')} each
                      </p>
                    </div>
                    <span className="text-sm font-bold whitespace-nowrap text-[var(--color-text)]">
                      ₹{Number(item.line_total).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                  <Percent size={18} className="text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--color-text)]">
                    Apply Coupon
                  </h3>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">
                    Have a discount code? Apply it here
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="flex-1 rounded-xl text-sm placeholder:text-xs font-semibold tracking-wide outline-none uppercase bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all"
                />
                <button
                  onClick={applyCoupon}
                  disabled={!couponCode || applyCouponLoading}
                  className="text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-[var(--color-surface)] hover:bg-[var(--color-bg-alt)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-primary)] px-5 py-3"
                >
                  {applyCouponLoading ? '...' : 'Apply'}
                </button>
              </div>
              {couponData && (
                <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-[var(--color-success)] bg-[var(--color-success-bg)] rounded-lg px-3 py-2">
                  <CheckCircle size={16} />
                  <span>{couponData.message}</span>
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                  <CreditCard size={18} className="text-[var(--color-primary)]" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--color-text)]">
                  Price Summary
                </h3>
              </div>
              <div className="flex flex-col gap-3.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--color-muted)]">Subtotal</span>
                  <span className="font-semibold text-[var(--color-text)]">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--color-success)]">Coupon Discount</span>
                    <span className="font-semibold text-[var(--color-success)]">−₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--color-muted)]">Delivery</span>
                  <span
                    className="font-semibold text-xs rounded-full px-2.5 py-1"
                    style={{
                      background: delivery === 0 ? 'var(--color-success-bg)' : 'transparent',
                      color: delivery === 0 ? 'var(--color-success)' : 'var(--color-text)'
                    }}
                  >
                    {delivery === 0 ? 'FREE' : `₹${delivery}`}
                  </span>
                </div>
                <div className="border-t border-[var(--color-border)] my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-[var(--color-text)]">Total</span>
                  <span className="text-2xl font-extrabold text-[var(--color-text)]">₹{total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full inline-flex items-center justify-center gap-2 bg-[var(--color-btn)] hover:bg-[var(--color-btn-hover)] text-[var(--color-btn-text)] rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed mt-6 py-3.5"
              >
                {placing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Placing Order…
                  </>
                ) : (
                  <>Place Order <ArrowRight size={18} /></>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-[var(--color-muted)]">
                <span className="flex items-center gap-1"><ShieldCheck size={12} /> Secure</span>
                <span className="flex items-center gap-1"><Truck size={12} /> Free over ₹999</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Payment ── */}
        {step === 2 && order && (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm flex flex-col items-center text-center p-8 lg:p-12 gap-5">
            <div className="w-20 h-20 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center animate-bounce-subtle">
              <CheckCircle size={40} className="text-[var(--color-primary)]" />
            </div>

            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">
                Order Confirmed
              </p>
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">
                Order Placed!
              </h2>
              <p className="text-sm font-mono text-[var(--color-muted)]">
                Order #{order.id?.slice(0, 8).toUpperCase()}
              </p>
            </div>

            <div className="rounded-xl w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-5 mt-2">
              <p className="text-xs uppercase tracking-wide font-semibold text-[var(--color-muted)] mb-1">
                Amount Due
              </p>
              <p className="text-4xl font-extrabold text-[var(--color-text)]">
                ₹{Number(order.total).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="flex flex-col w-full gap-3 mt-2">
              <button
                onClick={payNow}
                className="w-full inline-flex items-center justify-center gap-2 bg-[var(--color-btn)] hover:bg-[var(--color-btn-hover)] text-[var(--color-btn-text)] rounded-xl text-sm font-bold transition-all duration-300 py-3.5 hover:shadow-lg"
              >
                <Lock size={16} /> Pay with Razorpay
              </button>
              <button
                onClick={() => navigate(`/order-success/${order.id}`)}
                className="w-full inline-flex items-center justify-center gap-2 bg-[var(--color-surface)] hover:bg-[var(--color-bg-alt)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-primary)] rounded-xl text-sm font-semibold transition-all duration-200 py-3.5"
              >
                Cash on Delivery
              </button>
              <button
                onClick={() => navigate('/products')}
                className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors py-2"
              >
                ← Continue Shopping
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--color-muted)] mt-2">
              <Lock size={14} /> Secure & Encrypted Checkout
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}