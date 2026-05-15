import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Users, Package, TrendingUp, ArrowRight, QrCode, Image } from 'lucide-react'
import api from '../../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState({ orders: 0, products: 0, users: 0, revenue: 0 })

  useEffect(() => {
    Promise.all([
      api.get('/orders/admin/'),
      api.get('/products/admin/products/'),
      api.get('/auth/admin/users/'),
    ]).then(([orders, products, users]) => {
      const orderList = orders.data.results || orders.data
      const revenue = orderList.reduce((sum, o) => sum + parseFloat(o.total || 0), 0)
      setStats({
        orders: orders.data.count || orderList.length,
        products: products.data.count || (products.data.results || products.data).length,
        users: users.data.count || (users.data.results || users.data).length,
        revenue: revenue.toFixed(2),
      })
    }).catch(() => {})
  }, [])

  const statCards = [
    { label: 'Total Orders', value: stats.orders, icon: <ShoppingBag size={20} />, link: '/admin/orders', bg: 'var(--color-info)', iconColor: 'var(--color-text-inverse)' },
    { label: 'Total Products', value: stats.products, icon: <Package size={20} />, link: '/admin/products', bg: 'var(--color-success)', iconColor: 'var(--color-text-inverse)' },
    { label: 'Total Users', value: stats.users, icon: <Users size={20} />, link: '/admin/users', bg: 'var(--color-primary)', iconColor: 'var(--color-text-inverse)' },
    { label: 'Total Revenue', value: `₹${stats.revenue}`, icon: <TrendingUp size={20} />, link: '/admin/orders', bg: 'var(--color-primary-dark)', iconColor: 'var(--color-text-inverse)' },
  ]

  const quickLinks = [
    { label: 'Manage Products', link: '/admin/products', desc: 'Add, edit, delete products', icon: <Package size={18} /> },
    { label: 'Manage Orders', link: '/admin/orders', desc: 'View and update order status', icon: <ShoppingBag size={18} /> },
    { label: 'Manage Users', link: '/admin/users', desc: 'View and manage customers', icon: <Users size={18} /> },
    { label: 'QR Offers', link: '/admin/qr-offers', desc: 'Create & manage QR discount campaigns', icon: <QrCode size={18} /> },
    { label: 'Hero Banners', link: '/admin/hero-banners', desc: 'Upload & manage homepage banners', icon: <Image size={18} /> },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
      <div className="page-box">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <p className="text-xs font-bold tracking-widest uppercase" style={{ marginBottom: '8px', color: 'var(--color-primary)' }}>
            Overview
          </p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>Dashboard</h1>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '20px', marginBottom: '40px' }}>
          {statCards.map(c => (
            <Link
              key={c.label}
              to={c.link}
              className="rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all block"
              style={{ padding: '24px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ marginBottom: '16px', backgroundColor: c.bg, color: c.iconColor }}>
                {c.icon}
              </div>
              <p className="text-2xl font-bold" style={{ marginBottom: '4px', color: 'var(--color-primary)' }}>
                {c.value}
              </p>
              <p className="text-sm font-medium" style={{ color: 'var(--color-primary-dark)' }}>{c.label}</p>
            </Link>
          ))}
        </div>

        {/* Section Title */}
        <h2 className="text-lg font-bold" style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>
          Quick Actions
        </h2>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px' }}>
          {quickLinks.map(c => (
            <Link
              key={c.label}
              to={c.link}
              className="flex items-center rounded-2xl shadow-sm hover:shadow-md transition-all"
              style={{ padding: '20px', gap: '16px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-muted)' }}>
                {c.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ marginBottom: '2px', color: 'var(--color-primary)' }}>
                  {c.label}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>{c.desc}</p>
              </div>
              <ArrowRight size={16} className="shrink-0" style={{ color: 'var(--color-muted)' }} />
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}