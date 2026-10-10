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
    className: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    className: 'bg-sky-50 text-sky-800 ring-sky-200',
  },
  processing: {
    label: 'Processing',
    icon: Package,
    className: 'bg-violet-50 text-violet-800 ring-violet-200',
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    className: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 ring-red-200',
  },
  refunded: {
    label: 'Refunded',
    icon: RotateCcw,
    className: 'bg-[#F4F4F2] text-neutral-600 ring-black/10',
  },
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending
}

function orderIdLabel(id) {
  return `#${String(id || '').slice(0, 8).toUpperCase()}`
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
    <div className="space-y-6 sm:space-y-7">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-neutral-500 uppercase">
            Fulfillment
          </p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl">
            Orders
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500">
            Track customer orders and update delivery status from one list.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[10px] font-semibold tracking-[0.14em] text-neutral-600 uppercase ring-1 ring-black/6">
            <ShoppingBag size={13} />
            {orders.length} total
          </span>
          <button
            type="button"
            onClick={load}
            className="flex size-10 items-center justify-center rounded-full bg-white text-neutral-600 ring-1 ring-black/6 transition hover:text-neutral-950"
            aria-label="Refresh orders"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </section>

      <section className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by order ID, customer, email, or status..."
          className="w-full !rounded-full !border-0 bg-white !py-3.5 !pr-4 !pl-11 text-sm text-neutral-900 shadow-[0_8px_24px_rgba(17,17,17,0.04)] ring-1 ring-black/6 outline-none placeholder:text-neutral-400 focus:ring-neutral-900/20"
        />
      </section>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl bg-white py-20 ring-1 ring-black/5">
          <Loader2 size={22} className="animate-spin text-neutral-400" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl bg-white py-16 text-center ring-1 ring-black/5">
          <ShoppingBag size={28} className="mx-auto mb-3 text-neutral-400" />
          <p className="text-sm text-neutral-500">No orders found</p>
        </div>
      ) : (
        <>
          <section className="hidden overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-[#F4F4F2]/60">
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
                      className="border-b border-neutral-100 last:border-b-0 hover:bg-[#F4F4F2]/50"
                    >
                      <td className="px-5 py-4">
                        <span className="font-semibold tracking-wider text-neutral-950">
                          {orderIdLabel(order.id)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F4F4F2] text-neutral-700">
                            <User size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-neutral-900">
                              {order.user?.name || '—'}
                            </p>
                            {order.user?.email && (
                              <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                                {order.user.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-neutral-600">
                        {order.items?.length || 0} items
                      </td>
                      <td className="px-5 py-4 font-semibold text-neutral-950">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="relative inline-flex">
                          <select
                            value={order.status}
                            onChange={(event) =>
                              updateStatus(order.id, event.target.value)
                            }
                            disabled={updatingId === order.id}
                            className="cursor-pointer rounded-full border-0 bg-[#F4F4F2] py-2 pr-8 pl-3 text-xs font-semibold tracking-wider text-neutral-800 outline-none ring-1 ring-black/5 disabled:cursor-not-allowed disabled:opacity-50"
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
                              className="absolute top-1/2 right-2 -translate-y-1/2 animate-spin text-neutral-500"
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

          <section className="flex flex-col gap-3 lg:hidden">
            {filteredOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mb-1 text-[10px] font-semibold tracking-[0.16em] text-neutral-400 uppercase">
                      Order ID
                    </p>
                    <h3 className="break-all text-sm font-semibold tracking-wider text-neutral-950">
                      {orderIdLabel(order.id)}
                    </h3>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <InfoBox icon={User} label="Customer" value={order.user?.name || '—'} />
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

                <label className="mb-2 block text-[10px] font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                  Update status
                </label>
                <select
                  value={order.status}
                  onChange={(event) => updateStatus(order.id, event.target.value)}
                  disabled={updatingId === order.id}
                  className="w-full rounded-full border-0 bg-[#F4F4F2] px-4 py-3 text-sm font-medium text-neutral-800 outline-none ring-1 ring-black/5 disabled:opacity-50"
                >
                  {STATUS_CHOICES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  )
}

function TableHead({ children }) {
  return (
    <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-[0.16em] text-neutral-400 uppercase">
      {children}
    </th>
  )
}

function StatusBadge({ status }) {
  const config = getStatusConfig(status)
  const Icon = config.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase ring-1 ${config.className}`}
    >
      <Icon size={11} />
      {config.label}
    </span>
  )
}

function InfoBox({ icon: Icon, label, value, highlight = false }) {
  return (
    <div className="rounded-xl bg-[#F4F4F2]/80 p-3">
      <div className="mb-1.5 flex items-center gap-2">
        <Icon size={12} className="text-neutral-500" />
        <span className="text-[10px] font-semibold tracking-[0.14em] text-neutral-500 uppercase">
          {label}
        </span>
      </div>
      <p
        className={`truncate text-sm ${
          highlight ? 'font-semibold text-neutral-950' : 'text-neutral-800'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
