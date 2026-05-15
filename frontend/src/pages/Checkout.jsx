import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { CheckCircle, ArrowRight, MapPin, Percent, Lock } from 'lucide-react'
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
  const { cart, fetchCart } = useCartStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
    api.get('/auth/addresses/').then(r => {
      const list = r.data.results || r.data
      setAddresses(list)
      const def = list.find(a => a.is_default) || list[0]
      if (def) setSelAddr(def.id)
    })
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
        key: data.key, amount: data.amount, currency: data.currency,
        name: data.name, description: data.description,
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
          } catch { toast.error('Payment verification failed') }
        },
        prefill: { name: 'Customer', email: 'customer@example.com' },
        theme: { color: 'var(--color-primary)' },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch { toast.error('Payment initiation failed') }
  }

  const subtotal = parseFloat(cart?.subtotal || 0)
  const discount = couponData ? parseFloat(couponData.discount) : 0
  const delivery = subtotal >= 999 ? 0 : 49
  const total = subtotal - discount + delivery

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>

      {/* Header */}
      <div style={{ background: 'var(--color-secondary)' }}>
        <div className="mx-auto" style={{ maxWidth: '800px', padding: '32px 24px' }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ marginBottom: '8px', color: 'var(--color-primary)' }}>Secure Checkout</p>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-inverse)' }}>Your Order</h1>
        </div>
      </div>

      <div className="mx-auto" style={{ maxWidth: '800px', padding: '24px' }}>

        {/* Stepper */}
        <div className="flex items-start justify-between relative" style={{ marginBottom: '32px' }}>
          {/* Background line */}
          <div className="absolute top-4 left-0 right-0" style={{ height: '2px', margin: '0 16px', background: 'var(--color-border)' }} />
          {/* Active line */}
          <div className="absolute top-4 left-0 transition-all duration-500" style={{ height: '2px', margin: '0 16px', width: `${(step / (STEPS.length - 1)) * 100}%`, background: 'var(--color-primary)' }} />
          
          {STEPS.map((stepName, i) => {
            const isDone = i <= step
            const isCurrent = i === step
            return (
              <div key={stepName} className="relative flex flex-col items-center z-10 flex-1">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300"
                  style={{ 
                    borderColor: isDone ? 'var(--color-primary)' : 'var(--color-border)',
                    background: isDone ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: isDone ? 'var(--color-text-inverse)' : 'var(--color-muted)',
                    boxShadow: isCurrent ? '0 0 0 3px var(--color-primary-light)' : 'none'
                  }}
                >
                  {i < step ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span 
                  className="text-[10px] font-semibold text-center leading-tight"
                  style={{ marginTop: '8px', color: isDone ? 'var(--color-text)' : 'var(--color-muted)' }}
                >
                  {stepName}
                </span>
              </div>
            )
          })}
        </div>

        {/* ── Step 0: Address ── */}
        {step === 0 && (
          <div className="rounded-xl" style={{ padding: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center" style={{ gap: '10px', marginBottom: '20px' }}>
              <MapPin size={20} style={{ color: 'var(--color-primary)' }} />
              <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--color-text)' }}>Delivery Address</h2>
            </div>

            {addresses.length === 0 ? (
              <div className="flex flex-col items-center text-center" style={{ gap: '16px', padding: '32px 0' }}>
                <div className="rounded-full flex items-center justify-center" style={{ width: '56px', height: '56px', background: 'var(--color-primary-light)' }}>
                  <MapPin size={28} style={{ color: 'var(--color-primary)' }} />
                </div>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No saved addresses yet.</p>
                <button 
                  onClick={() => navigate('/addresses')} 
                  className="inline-flex items-center text-sm font-semibold rounded-lg transition-colors"
                  style={{ padding: '12px 20px', gap: '8px', background: 'var(--color-btn)', color: 'var(--color-btn-text)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-btn-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--color-btn)'}
                >
                  Add New Address <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col" style={{ gap: '12px', marginBottom: '24px' }}>
                  {addresses.map(addr => {
                    const isSelected = selAddr === addr.id
                    return (
                      <label
                        key={addr.id}
                        className="flex items-start rounded-lg cursor-pointer transition-all"
                        style={{ 
                          gap: '12px', 
                          padding: '16px',
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
                          className="mt-1"
                          style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap" style={{ gap: '8px', marginBottom: '4px' }}>
                            <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{addr.full_name}</span>
                            {addr.is_default && (
                              <span className="text-[10px] font-bold uppercase tracking-wide rounded-full" style={{ padding: '2px 8px', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                            {addr.line1}{addr.line2 && `, ${addr.line2}`}
                          </p>
                          <p className="text-xs" style={{ marginTop: '2px', color: 'var(--color-muted)' }}>
                            {addr.city}, {addr.state} — {addr.pincode}
                          </p>
                          <p className="text-xs" style={{ marginTop: '4px', color: 'var(--color-muted)' }}>📞 {addr.phone}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
                <button 
                  onClick={() => setStep(1)} 
                  disabled={!selAddr} 
                  className="w-full inline-flex items-center justify-center text-sm font-bold rounded-lg transition-colors disabled:cursor-not-allowed"
                  style={{ 
                    padding: '14px 20px', 
                    gap: '8px',
                    background: !selAddr ? 'var(--color-bg-alt)' : 'var(--color-btn)',
                    color: !selAddr ? 'var(--color-muted)' : 'var(--color-btn-text)'
                  }}
                  onMouseEnter={e => { if(selAddr) e.currentTarget.style.background = 'var(--color-btn-hover)' }}
                  onMouseLeave={e => { if(selAddr) e.currentTarget.style.background = 'var(--color-btn)' }}
                >
                  Continue to Review <ArrowRight size={18} />
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Step 1: Review ── */}
        {step === 1 && (
          <div className="flex flex-col" style={{ gap: '20px' }}>

            {/* Items */}
            <div className="rounded-xl" style={{ padding: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <h2 className="text-sm font-bold uppercase tracking-wide" style={{ marginBottom: '16px', color: 'var(--color-text)' }}>Order Items</h2>
              <div className="flex flex-col" style={{ gap: '16px' }}>
                {cart?.items?.map(item => (
                  <div key={item.id} className="flex items-center" style={{ gap: '16px' }}>
                    <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)' }}>
                      <img
                        src={item.product.primary_image?.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{item.product.name}</p>
                      <p className="text-xs" style={{ marginTop: '4px', color: 'var(--color-muted)' }}>
                        Qty: <strong>{item.quantity}</strong>
                      </p>
                      <p className="text-xs" style={{ marginTop: '2px', color: 'var(--color-muted-light)' }}>
                        ₹{Number(item.product.effective_price).toLocaleString('en-IN')} each
                      </p>
                    </div>
                    <span className="text-sm font-bold whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                      ₹{Number(item.line_total).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="rounded-xl" style={{ padding: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center" style={{ gap: '10px', marginBottom: '16px' }}>
                <Percent size={18} style={{ color: 'var(--color-primary)' }} />
                <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--color-text)' }}>Apply Coupon</h3>
              </div>
              <div className="flex items-center" style={{ gap: '10px' }}>
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="flex-1 rounded-lg text-sm placeholder:text-xs font-semibold tracking-wide outline-none uppercase"
                  style={{ 
                    padding: '12px 16px',
                    background: 'var(--color-bg-alt)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
                <button
                  onClick={applyCoupon}
                  disabled={!couponCode || applyCouponLoading}
                  className="text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    padding: '12px 20px',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)'
                  }}
                  onMouseEnter={e => { if(couponCode && !applyCouponLoading) { e.currentTarget.style.background = 'var(--color-bg-alt)'; e.currentTarget.style.borderColor = 'var(--color-primary)' }}}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
                >
                  {applyCouponLoading ? '...' : 'Apply'}
                </button>
              </div>
              {couponData && (
                <div className="flex items-center text-xs font-semibold" style={{ gap: '6px', marginTop: '12px', color: 'var(--color-success)' }}>
                  <CheckCircle size={16} />
                  <span>{couponData.message}</span>
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="rounded-xl" style={{ padding: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <h3 className="text-sm font-bold uppercase tracking-wide" style={{ marginBottom: '16px', color: 'var(--color-text)' }}>Price Summary</h3>
              <div className="flex flex-col" style={{ gap: '14px' }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-muted)' }}>Subtotal</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text)' }}>₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--color-success)' }}>Coupon Discount</span>
                    <span className="font-semibold" style={{ color: 'var(--color-success)' }}>−₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm items-center">
                  <span style={{ color: 'var(--color-muted)' }}>Delivery</span>
                  <span className="font-semibold text-xs rounded-full" style={{ 
                    padding: delivery === 0 ? '3px 10px' : '0',
                    background: delivery === 0 ? 'var(--color-success-bg)' : 'transparent',
                    color: delivery === 0 ? 'var(--color-success)' : 'var(--color-text)'
                  }}>
                    {delivery === 0 ? 'FREE' : `₹${delivery}`}
                  </span>
                </div>
                <div style={{ margin: '4px 0', borderTop: '1px solid var(--color-border)' }} />
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold" style={{ color: 'var(--color-text)' }}>Total</span>
                  <span className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <button 
                onClick={placeOrder} 
                disabled={placing} 
                className="w-full inline-flex items-center justify-center text-sm font-bold rounded-lg transition-colors disabled:cursor-not-allowed"
                style={{ 
                  padding: '14px 20px', 
                  gap: '8px', 
                  marginTop: '20px',
                  background: placing ? 'var(--color-bg-alt)' : 'var(--color-btn)',
                  color: placing ? 'var(--color-muted)' : 'var(--color-btn-text)'
                }}
                onMouseEnter={e => { if(!placing) e.currentTarget.style.background = 'var(--color-btn-hover)' }}
                onMouseLeave={e => { if(!placing) e.currentTarget.style.background = 'var(--color-btn)' }}
              >
                {placing ? <>Placing Order…</> : <>Place Order <ArrowRight size={18} /></>}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Payment ── */}
        {step === 2 && order && (
          <div className="rounded-xl flex flex-col items-center text-center" style={{ padding: '40px 24px', gap: '16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="rounded-full flex items-center justify-center" style={{ width: '72px', height: '72px', background: 'var(--color-primary-light)' }}>
              <CheckCircle size={40} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Order Placed!</h2>
            <p className="text-sm font-mono" style={{ color: 'var(--color-muted)' }}>Order #{order.id?.slice(0, 8).toUpperCase()}</p>

            <div className="rounded-xl w-full" style={{ padding: '20px', marginTop: '8px', background: 'var(--color-bg-alt)' }}>
              <p className="text-xs uppercase tracking-wide font-semibold" style={{ marginBottom: '4px', color: 'var(--color-muted)' }}>Amount Due</p>
              <p className="text-3xl font-extrabold" style={{ color: 'var(--color-text)' }}>₹{Number(order.total).toLocaleString('en-IN')}</p>
            </div>

            <div className="flex flex-col w-full" style={{ gap: '12px', marginTop: '8px' }}>
              <button 
                onClick={payNow} 
                className="w-full inline-flex items-center justify-center text-sm font-bold rounded-lg transition-colors"
                style={{ padding: '14px 20px', gap: '8px', background: 'var(--color-btn)', color: 'var(--color-btn-text)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-btn-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-btn)'}
              >
                <Lock size={16} /> Pay with Razorpay
              </button>
              <button 
                onClick={() => navigate(`/order-success/${order.id}`)} 
                className="w-full inline-flex items-center justify-center text-sm font-semibold rounded-lg transition-colors"
                style={{ 
                  padding: '14px 20px',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-alt)'; e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
              >
                Cash on Delivery
              </button>
              <button 
                onClick={() => navigate('/products')} 
                className="bg-transparent border-none cursor-pointer"
                style={{ padding: '8px', color: 'var(--color-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted)'}
              >
                ← Continue Shopping
              </button>
            </div>

            <div className="flex items-center text-xs" style={{ gap: '6px', marginTop: '8px', color: 'var(--color-muted)' }}>
              <Lock size={14} /> Secure & Encrypted Checkout
            </div>
          </div>
        )}

      </div>
    </div>
  )
}