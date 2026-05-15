import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import api from '../services/api'

export default function OrderSuccess() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    api.get(`/orders/${id}/`).then(r => setOrder(r.data)).catch(() => {})
  }, [id])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--color-bg)'}}>
      <div 
        className="w-full flex flex-col items-center text-center"
        style={{ maxWidth: '480px', padding: '24px', gap: '20px' }}
      >
        {/* Icon */}
        <div 
          className="rounded-full flex items-center justify-center"
          style={{ width: '72px', height: '72px', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}
        >
          <CheckCircle size={36} strokeWidth={2} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold" style={{color: 'var(--color-text)'}}>Order Confirmed</h1>
        <p className="text-sm" style={{color: 'var(--color-muted)'}}>
          Thank you for your purchase. We'll get it to you soon.
        </p>

        {/* Order Card */}
        {order && (
          <div 
            className="w-full rounded-xl"
            style={{ 
              padding: '20px', 
              marginTop: '8px', 
              backgroundColor: 'var(--color-bg-alt)', 
              border: '1px solid var(--color-border)' 
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between"
              style={{ 
                marginBottom: '16px', 
                paddingBottom: '12px', 
                borderBottom: '1px solid var(--color-border)' 
              }}
            >
              <span className="text-xs font-medium uppercase tracking-wide" style={{color: 'var(--color-muted)'}}>Order ID</span>
              <span className="text-sm font-bold font-mono" style={{color: 'var(--color-text)'}}>
                #{order.id?.slice(0, 8).toUpperCase()}
              </span>
            </div>

            {/* Items */}
            <div className="flex flex-col" style={{ gap: '12px' }}>
              {order.items?.map(item => (
                <div key={item.id} className="flex items-start justify-between">
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium leading-snug" style={{color: 'var(--color-text)'}}>
                      {item.product_name}
                    </p>
                    <p className="text-xs" style={{ marginTop: '2px', color: 'var(--color-muted)' }}>
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap" style={{ marginLeft: '12px', color: 'var(--color-text)' }}>
                    ₹{Number(item.line_total).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ margin: '16px 0', borderTop: '1px solid var(--color-border)' }} />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold" style={{color: 'var(--color-text)'}}>Total Paid</span>
              <span className="text-lg font-extrabold" style={{color: 'var(--color-text)'}}>
                ₹{Number(order.total).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="w-full flex flex-col" style={{ gap: '12px', marginTop: '8px' }}>
          <Link 
            to="/orders" 
            className="w-full inline-flex items-center justify-center text-sm font-semibold rounded-lg transition-colors"
            style={{ padding: '12px 20px', gap: '8px', backgroundColor: 'var(--color-secondary)', color: 'var(--color-text-inverse)' }}
          >
            View My Orders <ArrowRight size={16} />
          </Link>
          <Link 
            to="/products" 
            className="w-full inline-flex items-center justify-center text-sm font-semibold rounded-lg transition-colors"
            style={{ 
              padding: '12px 20px',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)'
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}