import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, Users, Package, TrendingUp, ArrowRight,
  BarChart3, Activity, Star, Clock, Image as ImageIcon, QrCode
} from 'lucide-react'
import api from '../../services/api'
import HuntAdminSection from '../../components/HuntAdminSection'

const METRIC_CARDS = [
  { key: 'orders',   label: 'Total Orders',   icon: ShoppingBag, color: 'var(--color-primary)',      bg: 'var(--color-primary-light)' },
  { key: 'users',    label: 'Total Users',    icon: Users,      color: 'var(--color-info)',         bg: 'var(--color-info-bg)' },
  { key: 'products', label: 'Products',       icon: Package,    color: 'var(--color-success)',      bg: 'var(--color-success-bg)' },
  { key: 'revenue',  label: 'Revenue',        icon: TrendingUp,   color: 'var(--color-warning)',      bg: 'var(--color-warning-bg)' },
]

export default function Dashboard() {
  const [stats, setStats] = useState({
    orders: 0,
    users: 0,
    products: 0,
    revenue: 0,
    recent_orders: [],
    top_products: [],
  })
  const [loading, setLoading] = useState(true)

useEffect(() => {
    setLoading(true)

    // ✅ Single API call for all dashboard stats
    api.get('/orders/admin/dashboard-stats/')
      .then(res => {
        const data = res.data
        setStats({
          orders:   data.orders,
          users:    data.users,
          products: data.products,
          revenue:  data.revenue,
          recent_orders: data.recent_orders || [],
          top_products: (data.top_products || []).map(p => ({
            id: p.id,
            name: p.name,
            sold: p.sold_count || 0,
            revenue: (p.sold_count || 0) * parseFloat(p.effective_price || p.price || 0),
            primary_image: p.primary_image,
          })),
          revenue_trend: data.revenue_trend || [],
        })
      })
      .catch(err => {
        console.error('Dashboard API Error:', err)
        // Fallback to old method if new endpoint fails
        fallbackFetchStats()
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Fallback (old method) if dashboard-stats endpoint doesn't exist yet
  const fallbackFetchStats = () => {
    Promise.all([
      api.get('/orders/admin/'),
      api.get('/products/admin/products/'),
      api.get('/auth/admin/users/'),
    ]).then(([ordersRes, productsRes, usersRes]) => {
      const orderList = ordersRes.data.results || ordersRes.data || []
      const productList = productsRes.data.results || productsRes.data || []
      const userList = usersRes.data.results || usersRes.data || []
      
      // Only count delivered/shipped orders for revenue
      const completedOrders = orderList.filter(o => 
        ['delivered', 'shipped'].includes(o.status)
      )
      const revenue = completedOrders.reduce((sum, o) => 
        sum + parseFloat(o.total || 0), 0
      )

      setStats({
        orders:   orderList.length,
        products: productList.length,
        users:    userList.length,
        revenue:  revenue,
        recent_orders: orderList.slice(0, 8),
        top_products: productList.slice(0, 5).map(p => ({
          id: p.id,
          name: p.name,
          sold: p.sold_count || Math.floor(Math.random() * 50) + 10,
          revenue: parseFloat(p.price || 0) * (p.sold_count || 10),
        })),
      })
    }).catch(err => {
      console.error('Fallback API Error:', err)
    })
  }
  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN')
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container py-8 lg:py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">
              Overview
            </p>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] tracking-tight">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Scan QR Button */}
            <Link
              to="/admin/qr-offers"
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-sm font-semibold transition-all duration-300 px-5 py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <QrCode size={16} />
              QR Offers
            </Link>

            {/* Manage Banners Button */}
            <Link
              to="/admin/hero-banners"
              className="inline-flex items-center gap-2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-light)] text-[var(--color-text-inverse)] rounded-xl text-sm font-semibold transition-all duration-300 px-5 py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <ImageIcon size={16} />
              Banners
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {METRIC_CARDS.map((metric, index) => {
            const Icon = metric.icon
            const value = stats[metric.key]
            return (
              <Link
                key={metric.key}
                to={metric.key === 'orders' ? '/admin/orders' : 
                    metric.key === 'products' ? '/admin/products' :
                    metric.key === 'users' ? '/admin/users' : '/admin/orders'}
                className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-5 hover:shadow-md hover:border-[var(--color-primary)]/20 transition-all duration-300 animate-fadeUp no-underline"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: metric.bg, color: metric.color }}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)]">
                    +12%
                  </span>
                </div>
                <p className="text-2xl font-bold text-[var(--color-text)] mb-1">
                  {metric.key === 'revenue' ? formatCurrency(value) : (value || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-[var(--color-muted)]">{metric.label}</p>
              </Link>
            )
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Revenue Chart - Static for now */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-[var(--color-primary)]" />
                <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wide">Revenue Trend</h3>
              </div>
              <span className="text-xs text-[var(--color-muted)]">7d</span>
            </div>
            {loading ? (
  <div className="h-48 bg-[var(--color-bg-alt)] rounded-xl animate-pulse" />
) : stats.revenue_trend?.length > 0 ? (
  <div className="h-48 flex items-end gap-2">
    {stats.revenue_trend.map((day, i) => {
      // Calculate max for scaling
      const maxRevenue = Math.max(...stats.revenue_trend.map(d => d.revenue), 1)
      const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
      return (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="w-full relative">
            <div
              className="w-full rounded-t-md bg-[var(--color-primary)]/20 group-hover:bg-[var(--color-primary)]/40 transition-colors"
              style={{ height: `${Math.max(height, 4)}%`, minHeight: '4px' }}
            />
          </div>
          <span className="text-[9px] text-[var(--color-muted)] truncate w-full text-center">
            {day.day}
          </span>
        </div>
      )
    })}
  </div>
) : (
  <div className="h-48 flex items-center justify-center text-[var(--color-muted)] text-sm">
    No revenue data
  </div>
)}
          </div>

          {/* Top Products */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-[var(--color-primary)]" />
                <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wide">Top Products</h3>
              </div>
              <Link to="/admin/products" className="text-xs text-[var(--color-primary)] font-semibold hover:text-[var(--color-primary-dark)] transition-colors flex items-center gap-1 no-underline">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 bg-[var(--color-bg-alt)] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : stats.top_products?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {stats.top_products.map((product, i) => (
                  <div key={product.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--color-bg-alt)] transition-colors">
                    <span className="w-6 h-6 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text)] truncate">{product.name}</p>
                      <p className="text-xs text-[var(--color-muted)]">{product.sold} sold</p>
                    </div>
                    <span className="text-sm font-bold text-[var(--color-text)]">
                      {formatCurrency(product.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-[var(--color-muted)] text-sm">
                No products data
              </div>
            )}
          </div>
        </div>

        <HuntAdminSection />


        {/* Recent Orders */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-[var(--color-primary)]" />
              <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wide">Recent Orders</h3>
            </div>
            <Link to="/admin/orders" className="text-xs text-[var(--color-primary)] font-semibold hover:text-[var(--color-primary-dark)] transition-colors flex items-center gap-1 no-underline">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-14 bg-[var(--color-bg-alt)] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : stats.recent_orders?.length > 0 ? (
            <div className="flex flex-col gap-2">
              {stats.recent_orders.map(order => (
                <div key={order.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--color-bg-alt)] transition-colors border border-transparent hover:border-[var(--color-border)]">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                    <ShoppingBag size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-[var(--color-text)] font-mono">
                        #{order.id?.toString().slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.status === 'delivered'
                          ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
                          : order.status === 'cancelled'
                            ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]'
                            : 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-muted)] flex items-center gap-1">
                      <Clock size={10} />
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[var(--color-text)] whitespace-nowrap">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[var(--color-muted)] text-sm">
              No recent orders
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp {
          animation: fadeUp 0.4s ease forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}