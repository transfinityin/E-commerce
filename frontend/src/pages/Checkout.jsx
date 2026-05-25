import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  CheckCircle,
  ArrowRight,
  MapPin,
  Percent,
  Lock,
  Package,
  CreditCard,
  Truck,
  ShieldCheck,
  ChevronRight,
  Loader2,
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
    let mounted = true

    const init = async () => {
      setLoading(true)

      try {
        await fetchCart()

        const res = await api.get('/auth/addresses/')
        const list = res.data.results || res.data || []

        if (!mounted) return

        setAddresses(list)

        const defaultAddress = list.find((address) => address.is_default) || list[0]
        if (defaultAddress) setSelAddr(defaultAddress.id)
      } catch {
        toast.error('Failed to load checkout details')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [fetchCart])

  const applyCoupon = async () => {
    if (!couponCode) return

    setApplyCouponLoading(true)

    try {
      const subtotalValue = parseFloat(cart?.subtotal || 0)  // ✅ FIXED
      const { data } = await api.post('/coupons/validate/', {
        code: couponCode,
        subtotal: subtotalValue,
      })

      setCouponData(data)
      toast.success(data.message)
    } catch (err) {
      setCouponData(null)
      toast.error(err.response?.data?.code?.[0] || 'Invalid coupon')
    } finally {
      setApplyCouponLoading(false)
    }
  }

  const placeOrder = async () => {
    if (!selAddr) {
      toast.error('Select an address')
      return
    }

    setPlacing(true)

    try {
      const payload = { address_id: selAddr }
      if (couponCode) payload.coupon_code = couponCode

      const { data } = await api.post('/orders/', payload)

      setOrder(data.order)
      setStep(2)
      toast.success('Order placed!')
    } catch (err) {
      const responseData = err.response?.data

      const dataStr = responseData
        ? JSON.stringify(responseData).slice(0, 100)
        : 'No response from server'

      const errorInfo = {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: responseData,
        url: err.config?.url,
        method: err.config?.method,
      }

      console.error('PLACE ORDER ERROR:', errorInfo)
      localStorage.setItem('last_order_error', JSON.stringify(errorInfo))

      toast.error(
        responseData?.error ||
          responseData?.detail ||
          responseData?.address_id?.[0] ||
          responseData?.coupon_code?.[0] ||
          `Error ${err.response?.status ?? 'Network'}: ${dataStr}`
      )
    } finally {
      setPlacing(false)
    }
  }

  const payNow = async () => {
    try {
      const { data } = await api.post('/payments/create/', {
        order_id: order.id,
      })

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
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
        },
        theme: {
          color: '#D4AF37',
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch {
      toast.error('Payment initiation failed')
    }
  }

  const subtotal = parseFloat(cart?.subtotal || 0)
  const discount = couponData ? parseFloat(couponData.discount) : 0
  const delivery = subtotal >= 999 ? 0 : 49
  const total = subtotal - discount + delivery

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="mb-8">
            <div className="h-3 skeleton-dark w-36 mb-4" />
            <div className="h-8 skeleton-dark w-56" />
          </div>

          <div className="h-12 skeleton-dark mb-8" />
          <div className="bg-[#0A0A0A] border border-gold/10 p-5 sm:p-7 h-72 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
      {/* Header */}
      <section className="border-b border-gold/10 bg-[#050505]">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <p className="label-gold mb-2">Secure Checkout</p>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white tracking-[0.12em] leading-tight">
            YOUR <span className="text-gradient-gold">ORDER</span>
          </h1>

          <p className="text-xs sm:text-sm text-muted font-mono tracking-wider mt-2 leading-relaxed">
            Confirm address, review artifacts, and complete transmission.
          </p>
        </div>
      </section>

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Stepper */}
        <div className="relative mb-7 sm:mb-10">
          <div className="absolute top-5 left-0 right-0 h-px bg-gold/15" />

          <div
            className="absolute top-5 left-0 h-px bg-gold transition-all duration-500"
            style={{
              width: `${(step / (STEPS.length - 1)) * 100}%`,
            }}
          />

          <div className="relative z-10 flex items-start justify-between">
            {STEPS.map((stepName, index) => {
              const isDone = index <= step
              const isComplete = index < step

              return (
                <div key={stepName} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 flex items-center justify-center border text-xs font-mono transition-all duration-300 ${
                      isDone
                        ? 'bg-gold text-black border-gold shadow-[0_0_30px_rgba(212,175,55,0.25)]'
                        : 'bg-black text-muted border-gold/20'
                    }`}
                  >
                    {isComplete ? <CheckCircle size={17} /> : index + 1}
                  </div>

                  <span
                    className={`text-[9px] sm:text-[11px] font-mono tracking-wider uppercase text-center leading-tight mt-2 ${
                      isDone ? 'text-gold' : 'text-muted'
                    }`}
                  >
                    {stepName}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 0: Address */}
        {step === 0 && (
          <section className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6 lg:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-3 mb-5 sm:mb-7">
              <div className="w-10 h-10 border border-gold/20 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-gold" />
              </div>

              <div className="min-w-0">
                <h2 className="font-display text-base sm:text-lg text-white tracking-[0.12em]">
                  DELIVERY ADDRESS
                </h2>
                <p className="text-[10px] sm:text-xs text-muted font-mono tracking-wider mt-1 leading-relaxed">
                  Select where your order should be delivered.
                </p>
              </div>
            </div>

            {addresses.length === 0 ? (
              <div className="flex flex-col items-center text-center py-10 sm:py-12">
                <div className="w-14 h-14 border border-gold/20 flex items-center justify-center mb-5">
                  <MapPin size={24} className="text-gold/70" />
                </div>

                <p className="label-gold mb-3">No Coordinates</p>

                <p className="text-xs sm:text-sm text-muted font-mono tracking-wider max-w-sm mb-6 leading-relaxed">
                  No saved addresses found. Add a delivery coordinate to continue checkout.
                </p>

                <button
                  type="button"
                  onClick={() => navigate('/addresses')}
                  className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  ADD NEW ADDRESS
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 mb-6">
                  {addresses.map((address) => {
                    const isSelected = selAddr === address.id

                    return (
                      <button
                        type="button"
                        key={address.id}
                        onClick={() => setSelAddr(address.id)}
                        className={`w-full text-left flex items-start gap-3 sm:gap-4 p-4 sm:p-5 border transition-all duration-300 ${
                          isSelected
                            ? 'border-gold/60 bg-gold/10 shadow-[0_0_30px_rgba(212,175,55,0.08)]'
                            : 'border-gold/15 bg-black hover:border-gold/35 hover:bg-gold/5'
                        }`}
                      >
                        {/* Custom radio - avoids global input width issue */}
                        <span
                          className={`mt-1 w-4 h-4 sm:w-5 sm:h-5 border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-gold bg-gold' : 'border-gold/30 bg-black'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 bg-black block" />}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <span className="text-sm sm:text-base font-display tracking-[0.12em] text-white break-words">
                              {address.full_name}
                            </span>

                            {address.is_default && (
                              <span className="text-[9px] font-mono tracking-wider uppercase text-gold bg-gold/10 border border-gold/20 px-2 py-0.5">
                                Default
                              </span>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm text-muted font-mono leading-relaxed break-words">
                            {[address.line1, address.line2].filter(Boolean).join(', ')}
                          </p>

                          <p className="text-xs sm:text-sm text-muted font-mono leading-relaxed mt-1 break-words">
                            {[address.city, address.state].filter(Boolean).join(', ')}
                            {address.pincode ? ` — ${address.pincode}` : ''}
                          </p>

                          <p className="text-xs text-muted font-mono mt-1 break-words">
                            {address.phone}
                          </p>
                        </div>

                        {isSelected && (
                          <CheckCircle size={18} className="text-gold shrink-0 mt-0.5" />
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/addresses')}
                    className="btn-outline inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <MapPin size={14} />
                    MANAGE ADDRESSES
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={!selAddr}
                    className="btn-primary flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    CONTINUE TO REVIEW
                    <ChevronRight size={16} />
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {/* Step 1: Review */}
        {step === 1 && (
          <section className="flex flex-col gap-5">
            {/* Items */}
            <div className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 border border-gold/20 flex items-center justify-center shrink-0">
                  <Package size={18} className="text-gold" />
                </div>

                <h2 className="font-display text-base sm:text-lg text-white tracking-[0.12em]">
                  ORDER ITEMS
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                {cart?.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-black border border-gold/10"
                  >
                    <div className="w-14 h-16 sm:w-16 sm:h-20 overflow-hidden bg-[#0A0A0A] border border-gold/10 shrink-0">
                      <img
                        src={item.product.primary_image?.image || item.product.image || ''}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-display tracking-wider text-white truncate">
                        {item.product.name}
                      </p>

                      <p className="text-[10px] sm:text-xs text-muted font-mono mt-1">
                        Qty: <span className="text-white">{item.quantity}</span>
                        {item.size && (
                          <span className="ml-2">
                            Size: <span className="text-white">{item.size}</span>
                          </span>
                        )}
                      </p>

                      <p className="text-[10px] sm:text-xs text-muted font-mono mt-1">
                        ₹{Number(item.product.effective_price).toLocaleString('en-IN')} each
                      </p>
                    </div>

                    <span className="text-xs sm:text-sm font-mono text-gold whitespace-nowrap">
                      ₹{Number(item.line_total).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 border border-gold/20 flex items-center justify-center shrink-0">
                  <Percent size={18} className="text-gold" />
                </div>

                <div className="min-w-0">
                  <h3 className="font-display text-base sm:text-lg text-white tracking-[0.12em]">
                    APPLY COUPON
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted font-mono tracking-wider mt-1">
                    Enter a valid discount signal.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="flex-1 bg-black border border-gold/15 text-white placeholder:text-muted/50 text-sm font-mono tracking-wider uppercase outline-none px-4 py-3.5 focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all duration-300"
                />

                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={!couponCode || applyCouponLoading}
                  className="btn-outline inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {applyCouponLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      APPLYING
                    </>
                  ) : (
                    'APPLY'
                  )}
                </button>
              </div>

              {couponData && (
                <div className="flex items-center gap-2 mt-4 text-xs font-mono tracking-wider text-gold bg-gold/10 border border-gold/20 px-3 py-2">
                  <CheckCircle size={15} />
                  <span>{couponData.message}</span>
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 border border-gold/20 flex items-center justify-center shrink-0">
                  <CreditCard size={18} className="text-gold" />
                </div>

                <h3 className="font-display text-base sm:text-lg text-white tracking-[0.12em]">
                  PRICE SUMMARY
                </h3>
              </div>

              <div className="flex flex-col gap-3.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted font-mono">Subtotal</span>
                  <span className="text-white font-mono">₹{subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gold font-mono">Coupon Discount</span>
                    <span className="text-gold font-mono">−₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted font-mono">Delivery</span>

                  {delivery === 0 ? (
                    <span className="text-[10px] font-mono tracking-wider uppercase text-gold bg-gold/10 border border-gold/20 px-2.5 py-1">
                      FREE
                    </span>
                  ) : (
                    <span className="text-white font-mono">₹{delivery}</span>
                  )}
                </div>

                <div className="divider-gold my-2" />

                <div className="flex justify-between items-end">
                  <span className="text-base font-mono text-white uppercase tracking-wider">
                    Total
                  </span>

                  <span className="font-display text-3xl sm:text-4xl text-gradient-gold">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={placeOrder}
                disabled={placing}
                className="btn-primary w-full inline-flex items-center justify-center gap-2 mt-6 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {placing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    PLACING ORDER...
                  </>
                ) : (
                  <>
                    PLACE ORDER
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-[10px] sm:text-xs text-muted font-mono">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} /> Secure
                </span>
                <span className="flex items-center gap-1">
                  <Truck size={12} /> Free over ₹999
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Step 2: Payment */}
        {step === 2 && order && (
          <section className="bg-[#0A0A0A] border border-gold/15 p-6 sm:p-8 lg:p-12 text-center shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="w-20 h-20 border border-gold/30 flex items-center justify-center mx-auto mb-6 animate-gold-pulse">
              <CheckCircle size={38} className="text-gold" />
            </div>

            <p className="label-gold mb-3">Order Confirmed</p>

            <h2 className="font-display text-2xl sm:text-3xl text-white tracking-[0.12em] mb-2">
              ORDER <span className="text-gradient-gold">PLACED</span>
            </h2>

            <p className="text-xs sm:text-sm font-mono text-muted tracking-wider mb-6">
              Order #{order.id?.slice(0, 8).toUpperCase()}
            </p>

            <div className="bg-black border border-gold/15 p-5 mb-6">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-mono text-muted mb-2">
                Amount Due
              </p>

              <p className="font-display text-4xl sm:text-5xl text-gradient-gold">
                ₹{Number(order.total).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={payNow}
                className="btn-primary w-full inline-flex items-center justify-center gap-2"
              >
                <Lock size={15} />
                PAY WITH RAZORPAY
              </button>

              <button
                type="button"
                onClick={() => navigate(`/order-success/${order.id}`)}
                className="btn-outline w-full inline-flex items-center justify-center gap-2"
              >
                CASH ON DELIVERY
              </button>

              <button
                type="button"
                onClick={() => navigate('/products')}
                className="text-xs sm:text-sm text-muted hover:text-gold transition-colors py-2 font-mono tracking-wider"
              >
                ← Continue Shopping
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-muted mt-5 font-mono tracking-wider">
              <Lock size={13} />
              Secure & Encrypted Checkout
            </div>
          </section>
        )}
      </main>
    </div>
  )
}