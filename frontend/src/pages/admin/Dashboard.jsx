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
  QrCode,
  Loader2,
} from 'lucide-react'
import api from '../../services/api'

const METRIC_CARDS = [
  { key: 'orders', label: 'Total Orders', icon: ShoppingBag, path: '/admin/orders' },
  { key: 'users', label: 'Total Users', icon: Users, path: '/admin/users' },
  { key: 'products', label: 'Products', icon: Package, path: '/admin/products' },
  { key: 'revenue', label: 'Revenue', icon: TrendingUp, path: '/admin/orders' },
]

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

function StatusBadge({ status }) {
  const normalized = String(status || 'pending').toLowerCase()
  const statusClass =
    normalized === 'delivered'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      : normalized === 'cancelled'
        ? 'bg-red-50 text-red-700 ring-red-200'
        : 'bg-amber-50 text-amber-800 ring-amber-200'

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.14em] uppercase ring-1 ${statusClass}`}
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

    const fallbackFetchStats = async () => {
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
          ['delivered', 'shipped'].includes(order.status),
        )
        const revenue = completedOrders.reduce(
          (sum, order) => sum + parseFloat(order.total || 0),
          0,
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
        await fallbackFetchStats()
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchDashboard()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-7 sm:space-y-8">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-neutral-500 uppercase">
            Overview
          </p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500">
            Orders, revenue, customers, products, and QR offers — without the old banner tooling.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/products"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-neutral-950 px-4 text-[10px] font-semibold tracking-[0.16em] text-white uppercase shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
          >
            <Package size={14} />
            Products
          </Link>
          <Link
            to="/admin/qr-offers"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[10px] font-semibold tracking-[0.16em] text-neutral-700 uppercase ring-1 ring-black/8"
          >
            <QrCode size={14} />
            QR Offers
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {METRIC_CARDS.map((metric) => {
          const Icon = metric.icon
          const value = stats[metric.key]
          return (
            <Link
              key={metric.key}
              to={metric.path}
              className="rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 transition hover:ring-black/10 sm:p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#F4F4F2] text-neutral-800">
                  <Icon size={16} />
                </div>
                <span className="rounded-full bg-[#F4F4F2] px-2 py-1 text-[9px] font-semibold tracking-[0.14em] text-neutral-500 uppercase">
                  Live
                </span>
              </div>
              {loading ? (
                <div className="mb-2 flex h-7 items-center text-neutral-400">
                  <Loader2 size={16} className="animate-spin" />
                </div>
              ) : (
                <p className="mb-1 text-xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-2xl">
                  {metric.key === 'revenue'
                    ? formatCurrency(value)
                    : Number(value || 0).toLocaleString('en-IN')}
                </p>
              )}
              <p className="text-[10px] font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                {metric.label}
              </p>
            </Link>
          )
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        <div className="rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-[#F4F4F2]">
                <BarChart3 size={16} className="text-neutral-800" />
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                  7 day
                </p>
                <h3 className="text-sm font-semibold tracking-[-0.02em] text-neutral-950">
                  Revenue trend
                </h3>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center rounded-xl bg-[#F4F4F2] text-neutral-400">
              <Loader2 size={18} className="animate-spin" />
            </div>
          ) : stats.revenue_trend?.length > 0 ? (
            <div className="flex h-52 items-end gap-2 rounded-xl bg-[#F4F4F2] px-3 py-4 sm:gap-3 sm:px-4">
              {stats.revenue_trend.map((day, index) => {
                const maxRevenue = Math.max(
                  ...stats.revenue_trend.map((item) => item.revenue),
                  1,
                )
                const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
                return (
                  <div
                    key={`${day.day}-${index}`}
                    className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div className="flex h-full w-full items-end">
                      <div
                        className="w-full rounded-t-md bg-neutral-900/80 transition group-hover:bg-neutral-950"
                        style={{ height: `${Math.max(height, 4)}%`, minHeight: '4px' }}
                      />
                    </div>
                    <span className="w-full truncate text-center text-[8px] font-medium tracking-wider text-neutral-500 uppercase">
                      {day.day}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl bg-[#F4F4F2] text-xs tracking-[0.14em] text-neutral-500 uppercase">
              No revenue data
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-[#F4F4F2]">
                <Star size={16} className="text-neutral-800" />
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                  Bestsellers
                </p>
                <h3 className="text-sm font-semibold tracking-[-0.02em] text-neutral-950">
                  Top products
                </h3>
              </div>
            </div>
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.14em] text-neutral-500 uppercase transition hover:text-neutral-950"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center text-neutral-400">
              <Loader2 size={18} className="animate-spin" />
            </div>
          ) : stats.top_products?.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {stats.top_products.map((product, index) => (
                <div
                  key={product.id || index}
                  className="flex items-center gap-3 rounded-xl bg-[#F4F4F2]/80 px-3 py-3"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-[11px] font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      {product.sold} sold
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-sm font-semibold text-neutral-900">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl bg-[#F4F4F2] text-xs tracking-[0.14em] text-neutral-500 uppercase">
              No products data
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#F4F4F2]">
              <Activity size={16} className="text-neutral-800" />
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                Latest
              </p>
              <h3 className="text-sm font-semibold tracking-[-0.02em] text-neutral-950">
                Recent orders
              </h3>
            </div>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.14em] text-neutral-500 uppercase transition hover:text-neutral-950"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center text-neutral-400">
            <Loader2 size={18} className="animate-spin" />
          </div>
        ) : stats.recent_orders?.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {stats.recent_orders.map((order) => (
              <Link
                key={order.id}
                to="/admin/orders"
                className="flex items-center gap-3 rounded-xl bg-[#F4F4F2]/80 px-3 py-3 transition hover:bg-[#ECECE8] sm:gap-4 sm:px-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-neutral-800 ring-1 ring-black/5">
                  <ShoppingBag size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold tracking-wider text-neutral-900">
                      #{order.id?.toString().slice(0, 8).toUpperCase()}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="flex items-center gap-1.5 text-[11px] text-neutral-500">
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
                <span className="whitespace-nowrap text-sm font-semibold text-neutral-900">
                  {formatCurrency(order.total)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-[#F4F4F2] py-12 text-center">
            <ShoppingBag size={28} className="mx-auto mb-3 text-neutral-400" />
            <p className="text-sm text-neutral-500">No recent orders</p>
          </div>
        )}
      </section>
    </div>
  )
}
