import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  ShoppingBag,
  Package,
  User,
  CreditCard,
  RefreshCw,
  Loader2,
  Search,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RotateCcw,
} from 'lucide-react'
import api from '../../services/api'

const STATUS_CHOICES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    className: 'bg-gold/10 text-gold border-gold/30',
  },
  processing: {
    label: 'Processing',
    icon: Package,
    className: 'bg-gold/10 text-gold border-gold/30',
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    className: 'bg-gold/10 text-gold border-gold/30',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle2,
    className: 'bg-gold/10 text-gold border-gold/40',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-red-400/10 text-red-400 border-red-400/30',
  },
  refunded: {
    label: 'Refunded',
    icon: RotateCcw,
    className: 'bg-black text-muted border-gold/20',
  },
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const load = async () => {
    setLoading(true)

    try {
      const res = await api.get('/orders/admin/')
      setOrders(res.data.results || res.data || [])
    } catch {
      toast.error('Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const updateStatus = async (id, status) => {
    setUpdatingId(id)

    try {
      await api.patch(`/orders/admin/${id}/status/`, { status })
      toast.success('Status updated!')
      load()
    } catch {
      toast.error('Failed to update')
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase()

    return (
      order.id?.toString().toLowerCase().includes(search) ||
      order.user?.name?.toLowerCase().includes(search) ||
      order.user?.email?.toLowerCase().includes(search) ||
      order.status?.toLowerCase().includes(search)
    )
  })

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-7 sm:mb-9">
          <div>
            <p className="label-gold mb-2">Order Management</p>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl text-white tracking-[0.12em] leading-tight">
              ADMIN <span className="text-gradient-gold">ORDERS</span>
            </h1>

            <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mt-3 max-w-2xl">
              Track customer orders, update delivery status, and monitor order activity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center gap-2 text-[10px] sm:text-xs font-mono tracking-wider uppercase text-gold bg-gold/10 border border-gold/20 px-3 py-2">
              <ShoppingBag size={14} />
              {orders.length} Total
            </span>

            <button
              type="button"
              onClick={load}
              className="w-10 h-10 bg-[#0A0A0A] border border-gold/15 flex items-center justify-center text-muted hover:text-gold hover:border-gold/40 transition-all"
              aria-label="Refresh orders"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </section>

        <div className="divider-gold mb-7 sm:mb-9" />

        {/* Search */}
        <section className="relative mb-6">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by order ID, customer, email, or status..."
            className="w-full bg-[#0A0A0A] border border-gold/15 text-white placeholder:text-muted/50 text-sm font-mono tracking-wider pl-11 pr-4 py-3.5 outline-none focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all"
          />
        </section>

        {/* Loading */}
        {loading ? (
          <section className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-20 skeleton-dark border border-gold/10 animate-pulse"
              />
            ))}
          </section>
        ) : filteredOrders.length === 0 ? (
          <section className="bg-[#0A0A0A] border border-gold/15 p-10 sm:p-14 text-center">
            <div className="w-16 h-16 border border-gold/20 bg-black flex items-center justify-center mx-auto mb-5">
              <ShoppingBag size={34} className="text-gold/50" />
            </div>

            <p className="label-gold mb-3">No Order Signal</p>

            <h2 className="font-display text-xl sm:text-2xl text-white tracking-[0.12em] mb-3">
              NO ORDERS <span className="text-gradient-gold">FOUND</span>
            </h2>

            <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed">
              Try changing your search query or refresh the order list.
            </p>
          </section>
        ) : (
          <>
            {/* Desktop Table */}
            <section className="hidden lg:block bg-[#0A0A0A] border border-gold/15 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gold/10 bg-black">
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Update</TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-gold/10 last:border-b-0 hover:bg-gold/5 transition-colors duration-200"
                      >
                        <td className="px-5 py-4">
                          <span className="font-mono text-white tracking-wider">
                            #{order.id?.slice(0, 8).toUpperCase()}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 border border-gold/15 bg-gold/10 flex items-center justify-center text-gold shrink-0">
                              <User size={15} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm text-white font-mono truncate">
                                {order.user?.name || '—'}
                              </p>

                              {order.user?.email && (
                                <p className="text-[10px] text-muted font-mono truncate mt-0.5">
                                  {order.user.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-muted font-mono">
                            {order.items?.length || 0} items
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-mono text-gold">
                            {formatCurrency(order.total)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={order.status} />
                        </td>

                        <td className="px-5 py-4">
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(event) =>
                                updateStatus(order.id, event.target.value)
                              }
                              disabled={updatingId === order.id}
                              className="bg-black border border-gold/15 text-white text-xs font-mono tracking-wider outline-none focus:border-gold/60 cursor-pointer px-3 py-2.5 pr-8 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {STATUS_CHOICES.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>

                            {updatingId === order.id && (
                              <Loader2
                                size={13}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gold animate-spin"
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Mobile Cards */}
            <section className="lg:hidden flex flex-col gap-3">
              {filteredOrders.map((order) => (
                <article
                  key={order.id}
                  className="bg-[#0A0A0A] border border-gold/15 p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <p className="text-xs text-muted font-mono tracking-wider uppercase mb-1">
                        Order ID
                      </p>

                      <h3 className="text-sm font-mono text-white tracking-wider break-all">
                        #{order.id?.slice(0, 8).toUpperCase()}
                      </h3>
                    </div>

                    <StatusBadge status={order.status} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <InfoBox
                      icon={User}
                      label="Customer"
                      value={order.user?.name || '—'}
                    />

                    <InfoBox
                      icon={Package}
                      label="Items"
                      value={`${order.items?.length || 0} items`}
                    />

                    <InfoBox
                      icon={CreditCard}
                      label="Total"
                      value={formatCurrency(order.total)}
                      highlight
                    />
                  </div>

                  <div>
                    <label className="label-gold text-[10px] mb-2 block">
                      Update Status
                    </label>

                    <select
                      value={order.status}
                      onChange={(event) => updateStatus(order.id, event.target.value)}
                      disabled={updatingId === order.id}
                      className="w-full bg-black border border-gold/15 text-white text-sm font-mono tracking-wider outline-none focus:border-gold/60 px-4 py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {STATUS_CHOICES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function TableHead({ children }) {
  return (
    <th className="text-left text-[10px] font-mono text-gold/70 uppercase tracking-[0.18em] px-5 py-3">
      {children}
    </th>
  )
}

function StatusBadge({ status }) {
  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 border ${config.className}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  )
}

function InfoBox({ icon: Icon, label, value, highlight = false }) {
  return (
    <div className="bg-black border border-gold/10 p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={13} className="text-gold" />
        <span className="text-[10px] text-muted font-mono tracking-wider uppercase">
          {label}
        </span>
      </div>

      <p
        className={`text-xs sm:text-sm font-mono truncate ${
          highlight ? 'text-gold' : 'text-white'
        }`}
      >
        {value}
      </p>
    </div>
  )
}