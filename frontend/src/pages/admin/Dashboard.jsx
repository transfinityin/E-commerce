import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  ArrowRight,
  BarChart3,
  Activity,
  Star,
  Clock,
  Image as ImageIcon,
  QrCode,
  Loader2,
} from 'lucide-react'
import api from '../../services/api'
import HuntAdminSection from '../../components/HuntAdminSection'

const METRIC_CARDS = [
  {
    key: 'orders',
    label: 'Total Orders',
    icon: ShoppingBag,
    path: '/admin/orders',
  },
  {
    key: 'users',
    label: 'Total Users',
    icon: Users,
    path: '/admin/users',
  },
  {
    key: 'products',
    label: 'Products',
    icon: Package,
    path: '/admin/products',
  },
  {
    key: 'revenue',
    label: 'Revenue',
    icon: TrendingUp,
    path: '/admin/orders',
  },
]

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

function StatusBadge({ status }) {
  const normalized = String(status || 'pending').toLowerCase()

  const statusClass =
    normalized === 'delivered'
      ? 'border-gold/30 bg-gold/10 text-gold'
      : normalized === 'cancelled'
        ? 'border-red-400/30 bg-red-400/10 text-red-400'
        : 'border-yellow-400/30 bg-yellow-400/10 text-yellow-400'

  return (
    <span
      className={`text-[9px] sm:text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 border ${statusClass}`}
    >
      {normalized}
    </span>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    orders: 0,
    users: 0,
    products: 0,
    revenue: 0,
    recent_orders: [],
    top_products: [],
    revenue_trend: [],
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchDashboard = async () => {
      setLoading(true)

      try {
        const { data } = await api.get('/orders/admin/dashboard-stats/')

        if (!mounted) return

        setStats({
          orders: data.orders || 0,
          users: data.users || 0,
          products: data.products || 0,
          revenue: data.revenue || 0,
          recent_orders: data.recent_orders || [],
          top_products: (data.top_products || []).map((product) => ({
            id: product.id,
            name: product.name,
            sold: product.sold_count || 0,
            revenue:
              (product.sold_count || 0) *
              parseFloat(product.effective_price || product.price || 0),
            primary_image: product.primary_image,
          })),
          revenue_trend: data.revenue_trend || [],
        })
      } catch (error) {
        console.error('Dashboard API Error:', error)
        await fallbackFetchStats(mounted)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchDashboard()

    return () => {
      mounted = false
    }
  }, [])

  const fallbackFetchStats = async (mounted = true) => {
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        api.get('/orders/admin/'),
        api.get('/products/admin/products/'),
        api.get('/auth/admin/users/'),
      ])

      if (!mounted) return

      const orderList = ordersRes.data.results || ordersRes.data || []
      const productList = productsRes.data.results || productsRes.data || []
      const userList = usersRes.data.results || usersRes.data || []

      const completedOrders = orderList.filter((order) =>
        ['delivered', 'shipped'].includes(order.status)
      )

      const revenue = completedOrders.reduce(
        (sum, order) => sum + parseFloat(order.total || 0),
        0
      )

      setStats({
        orders: orderList.length,
        products: productList.length,
        users: userList.length,
        revenue,
        recent_orders: orderList.slice(0, 8),
        top_products: productList.slice(0, 5).map((product) => ({
          id: product.id,
          name: product.name,
          sold: product.sold_count || 0,
          revenue:
            parseFloat(product.effective_price || product.price || 0) *
            (product.sold_count || 0),
          primary_image: product.primary_image,
        })),
        revenue_trend: [],
      })
    } catch (error) {
      console.error('Fallback API Error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-7 sm:mb-9">
          <div>
            <p className="label-gold mb-2">Admin Overview</p>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl text-white tracking-[0.12em] leading-tight">
              DASH<span className="text-gradient-gold">BOARD</span>
            </h1>

            <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mt-3 max-w-2xl">
              Monitor orders, revenue, customers, products, hero banners, and QR offer
              operations from one command center.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              to="/admin/qr-offers"
              className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <QrCode size={16} />
              QR OFFERS
            </Link>

            <Link
              to="/admin/hero-banners"
              className="btn-outline inline-flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <ImageIcon size={16} />
              BANNERS
            </Link>
          </div>
        </section>

        <div className="divider-gold mb-7 sm:mb-9" />

        {/* Metric Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-7 sm:mb-9">
          {METRIC_CARDS.map((metric, index) => {
            const Icon = metric.icon
            const value = stats[metric.key]

            return (
              <Link
                key={metric.key}
                to={metric.path}
                className="group bg-[#0A0A0A] border border-gold/15 hover:border-gold/40 p-4 sm:p-5 lg:p-6 transition-all duration-500 animate-fadeUp hover:shadow-[0_16px_60px_rgba(212,175,55,0.08)]"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 border border-gold/20 bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black transition-all duration-300">
                    <Icon size={18} />
                  </div>

                  <span className="text-[9px] sm:text-[10px] font-mono tracking-wider uppercase border border-gold/20 bg-gold/10 text-gold px-2 py-1">
                    Live
                  </span>
                </div>

                {loading ? (
                  <div className="h-7 skeleton-dark w-20 mb-2" />
                ) : (
                  <p className="font-display text-xl sm:text-2xl lg:text-3xl text-white mb-1">
                    {metric.key === 'revenue'
                      ? formatCurrency(value)
                      : Number(value || 0).toLocaleString('en-IN')}
                  </p>
                )}

                <p className="text-[10px] sm:text-xs text-muted font-mono tracking-wider uppercase">
                  {metric.label}
                </p>
              </Link>
            )
          })}
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-7 sm:mb-9">
          {/* Revenue Chart */}
          <div className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 border border-gold/20 bg-gold/10 flex items-center justify-center">
                  <BarChart3 size={17} className="text-gold" />
                </div>

                <div>
                  <p className="label-gold mb-1">Revenue Signal</p>
                  <h3 className="font-display text-sm sm:text-base text-white tracking-[0.12em]">
                    REVENUE TREND
                  </h3>
                </div>
              </div>

              <span className="text-[10px] sm:text-xs text-muted font-mono tracking-wider uppercase">
                7D
              </span>
            </div>

            {loading ? (
              <div className="h-48 skeleton-dark border border-gold/10" />
            ) : stats.revenue_trend?.length > 0 ? (
              <div className="h-52 flex items-end gap-2 sm:gap-3 border border-gold/10 bg-black px-3 sm:px-4 py-4">
                {stats.revenue_trend.map((day, index) => {
                  const maxRevenue = Math.max(
                    ...stats.revenue_trend.map((item) => item.revenue),
                    1
                  )

                  const height =
                    maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0

                  return (
                    <div
                      key={`${day.day}-${index}`}
                      className="flex-1 flex flex-col items-center justify-end gap-2 group h-full"
                    >
                      <div className="w-full h-full flex items-end">
                        <div
                          className="w-full bg-gold/25 group-hover:bg-gold transition-colors duration-300"
                          style={{
                            height: `${Math.max(height, 4)}%`,
                            minHeight: '4px',
                          }}
                        />
                      </div>

                      <span className="text-[8px] sm:text-[9px] text-muted font-mono truncate w-full text-center">
                        {day.day}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center border border-gold/10 bg-black text-muted text-xs sm:text-sm font-mono tracking-wider">
                No revenue data
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 border border-gold/20 bg-gold/10 flex items-center justify-center">
                  <Star size={17} className="text-gold" />
                </div>

                <div>
                  <p className="label-gold mb-1">Best Signals</p>
                  <h3 className="font-display text-sm sm:text-base text-white tracking-[0.12em]">
                    TOP PRODUCTS
                  </h3>
                </div>
              </div>

              <Link
                to="/admin/products"
                className="text-[10px] sm:text-xs text-muted hover:text-gold font-mono tracking-wider uppercase transition-colors flex items-center gap-1"
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="h-14 skeleton-dark border border-gold/10" />
                ))}
              </div>
            ) : stats.top_products?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {stats.top_products.map((product, index) => (
                  <div
                    key={product.id || index}
                    className="flex items-center gap-3 p-3 bg-black border border-gold/10 hover:border-gold/30 transition-all"
                  >
                    <span className="w-7 h-7 bg-gold text-black flex items-center justify-center text-xs font-mono shrink-0">
                      {index + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-display text-white tracking-wider truncate">
                        {product.name}
                      </p>

                      <p className="text-[10px] sm:text-xs text-muted font-mono mt-1">
                        {product.sold} sold
                      </p>
                    </div>

                    <span className="text-xs sm:text-sm font-mono text-gold whitespace-nowrap">
                      {formatCurrency(product.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center border border-gold/10 bg-black text-muted text-xs sm:text-sm font-mono tracking-wider">
                No products data
              </div>
            )}
          </div>
        </section>

        {/* Hunt Admin */}
        <section className="mb-7 sm:mb-9">
          <HuntAdminSection />
        </section>

        {/* Recent Orders */}
        <section className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 border border-gold/20 bg-gold/10 flex items-center justify-center">
                <Activity size={17} className="text-gold" />
              </div>

              <div>
                <p className="label-gold mb-1">Latest Activity</p>
                <h3 className="font-display text-sm sm:text-base text-white tracking-[0.12em]">
                  RECENT ORDERS
                </h3>
              </div>
            </div>

            <Link
              to="/admin/orders"
              className="text-[10px] sm:text-xs text-muted hover:text-gold font-mono tracking-wider uppercase transition-colors flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-16 skeleton-dark border border-gold/10" />
              ))}
            </div>
          ) : stats.recent_orders?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {stats.recent_orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/admin/orders/${order.id}`}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-black border border-gold/10 hover:border-gold/35 transition-all"
                >
                  <div className="w-10 h-10 border border-gold/20 bg-gold/10 text-gold flex items-center justify-center shrink-0">
                    <ShoppingBag size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className="text-xs sm:text-sm font-mono text-white tracking-wider">
                        #{order.id?.toString().slice(0, 8).toUpperCase()}
                      </span>

                      <StatusBadge status={order.status} />
                    </div>

                    <p className="text-[10px] sm:text-xs text-muted font-mono flex items-center gap-1.5">
                      <Clock size={11} />
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>

                  <span className="text-xs sm:text-sm font-mono text-gold whitespace-nowrap">
                    {formatCurrency(order.total)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-gold/10 bg-black">
              <ShoppingBag size={34} className="text-gold/40 mx-auto mb-3" />
              <p className="text-sm text-muted font-mono">No recent orders</p>
            </div>
          )}
        </section>
      </main>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeUp {
          animation: fadeUp 0.4s ease forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}