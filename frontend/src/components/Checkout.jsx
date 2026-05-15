import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { CheckCircle, ArrowRight, MapPin, Percent, Lock, Tag, Sparkles } from 'lucide-react'  // Added Tag, Sparkles
import api from '../services/api'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'

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
  const [qrCoupon, setQrCoupon] = useState(null)  // ← NEW: QR coupon state
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
    
    // ← NEW: Load QR coupon from localStorage
    loadQRCoupon()
  }, [])

  // ← NEW: Load QR coupon from localStorage
  const loadQRCoupon = () => {
    try {
      const savedCoupons = JSON.parse(localStorage.getItem('qr_coupons') || '[]')
      // Find valid (not expired) coupon
      const validCoupon = savedCoupons.find(c => new Date(c.expires_at) > new Date())
      if (validCoupon) {
        setQrCoupon(validCoupon)
        // Auto-set the coupon code
        setCouponCode(validCoupon.code)
      }
    } catch (err) {
      console.error('Error loading QR coupon:', err)
    }
  }

  // ← NEW: Apply QR coupon automatically
  const applyQRCoupon = async () => {
    if (!qrCoupon || !cart?.subtotal) return
    
    setApplyCouponLoading(true)
    try {
      const { data } = await api.post('/coupons/validate/', {
        code: qrCoupon.code,
        subtotal: cart?.subtotal,
      })
      setCouponData(data)
      toast.success(`QR Discount applied! You save ₹${data.discount}`)
    } catch (err) {
      console.error('QR coupon apply failed:', err)
      // Don't show error - coupon might be invalid
      setQrCoupon(null)
    } finally {
      setApplyCouponLoading(false)
    }
  }

  // ← NEW: Auto-apply QR coupon when cart loads
  useEffect(() => {
    if (qrCoupon && cart?.subtotal && step === 1) {
      applyQRCoupon()
    }
  }, [cart?.subtotal, qrCoupon, step])

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

  // ... rest of existing functions (placeOrder, payNow) ...

  const subtotal = parseFloat(cart?.subtotal || 0)
  const discount = couponData ? parseFloat(couponData.discount) : 0
  const delivery = subtotal >= 999 ? 0 : 49
  const total = subtotal - discount + delivery

  return (
    <div className="min-h-screen bg-gradient-pastel-1">
      {/* Header */}
      <div className="bg-gradient-pastel-2 text-primary-foreground py-6 sm:py-8 animate-fade-in">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* ... existing step indicator ... */}

        {/* Step 1: Review Order */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            {/* Order Items */}
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Order Review</h2>
              {/* ... existing items ... */}
            </div>

            {/* ← NEW: QR Coupon Banner (if available) */}
            {qrCoupon && !couponData && (
              <div className="bg-card rounded-2xl border-2 border-accent p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles size={20} className="text-accent" />
                  <h3 className="font-bold text-foreground text-lg">QR Offer Available!</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      You have a saved QR discount: <span className="font-bold text-accent">{qrCoupon.discount}% off</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Code: <span className="font-mono font-bold">{qrCoupon.code}</span>
                    </p>
                  </div>
                  <button 
                    onClick={applyQRCoupon}
                    disabled={applyCouponLoading}
                    className="px-6 py-3 bg-accent text-accent-foreground rounded-xl font-bold hover:shadow-md transition-all-smooth disabled:opacity-50 whitespace-nowrap"
                  >
                    {applyCouponLoading ? 'Applying...' : 'Apply Now'}
                  </button>
                </div>
              </div>
            )}

            {/* Coupon Section */}
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Percent size={20} className="text-primary" />
                <h3 className="font-bold text-foreground text-lg">Apply Coupon</h3>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 px-4 py-3 border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors text-sm sm:text-base"
                />
                <button onClick={applyCoupon}
                        disabled={!couponCode || applyCouponLoading}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-md transition-all-smooth disabled:opacity-50 whitespace-nowrap">
                  {applyCouponLoading ? 'Validating...' : 'Apply'}
                </button>
              </div>

              {couponData && (
                <div className="mt-4 p-3 bg-accent/20 border-2 border-accent rounded-xl flex items-center justify-between">
                  <p className="text-sm font-medium text-accent-foreground">
                    ✓ {couponData.message}
                  </p>
                  <button 
                    onClick={() => {
                      setCouponData(null)
                      setCouponCode('')
                      setQrCoupon(null)
                    }}
                    className="text-xs text-accent-foreground/70 hover:text-accent-foreground underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              <h3 className="font-bold text-lg text-foreground mb-6">Price Summary</h3>

              <div className="space-y-4 mb-6">
                {/* Subtotal */}
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">₹{subtotal.toFixed(2)}</span>
                </div>

                {/* Discount */}
                {discount > 0 && (
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <span className="text-muted-foreground">Coupon Discount</span>
                    <span className="text-accent font-semibold">-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                {/* Delivery */}
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className={`font-semibold ${delivery === 0 ? 'text-accent' : 'text-foreground'}`}>
                    {delivery === 0 ? <span className="text-sm">FREE</span> : `₹${delivery}`}
                  </span>
                </div>

                {/* Total */}
                <div className="bg-gradient-pastel-2 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary-foreground">Total Amount</span>
                    <span className="text-2xl font-bold text-primary-foreground">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button onClick={placeOrder}
                      disabled={placing}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-pastel-2 text-primary-foreground py-3 sm:py-4 px-4 rounded-xl font-bold hover:shadow-lg transition-all-smooth hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                {placing ? 'Placing Order...' : 'Place Order'}
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* ... rest of steps ... */}
      </div>
    </div>
  )
}