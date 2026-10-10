import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  User,
  Package,
  Heart,
  MapPin,
  Ticket,
  Shield,
  Bell,
  LogOut,
  ChevronRight,
  Camera,
  ArrowLeft,
  Package as PackageIcon,
  Trash2,
  Sparkles,
  Menu,
  X,
  Loader2,
} from 'lucide-react'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import Security from './Security'
import Notifications from './Notifications'
import Addresses from './Addresses'

const MENU_ITEMS = [
  { icon: User, label: 'My Profile', section: 'profile' },
  { icon: Package, label: 'My Orders', section: 'orders' },
  { icon: Heart, label: 'Wishlist', section: 'wishlist' },
  { icon: MapPin, label: 'Saved Addresses', section: 'addresses' },
  { icon: Ticket, label: 'Coupons', section: 'coupons' },
  { icon: Shield, label: 'Security', section: 'security' },
  { icon: Bell, label: 'Notifications', section: 'notifications' },
]

const FIELD =
  'w-full !rounded-full !border-0 bg-[#F4F4F2] px-4 py-3.5 text-sm text-neutral-900 outline-none ring-1 ring-black/6 transition focus:bg-white focus:ring-2 focus:ring-neutral-950/15'

const LABEL =
  'mb-2 block text-[10px] font-semibold tracking-[0.2em] text-neutral-500 uppercase'

export default function Profile() {
  const { user, updateUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const fileInputRef = useRef(null)

  const queryParams = new URLSearchParams(location.search)
  const [activeSection, setActiveSection] = useState(queryParams.get('tab') || 'profile')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm()

  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    addresses: 0,
  })

  const [orders, setOrders] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleSectionChange = (section) => {
    setActiveSection(section)
    setMobileMenuOpen(false)
    navigate(`/profile?tab=${section}`, { replace: true })
  }

  const goBackToProfile = () => {
    handleSectionChange('profile')
  }

  useEffect(() => {
    if (!user) return
    reset({
      name: user.name || '',
      phone: user.phone || '',
      dob: user.dob || '',
      gender: user.gender || '',
    })
  }, [user, reset])

  useEffect(() => {
    let mounted = true

    if (activeSection === 'orders') {
      setLoading(true)
      api
        .get('/orders/my/')
        .then((res) => {
          if (mounted) setOrders(res.data.results || res.data || [])
        })
        .catch(() => toast.error('Failed to load orders'))
        .finally(() => {
          if (mounted) setLoading(false)
        })
    }

    if (activeSection === 'wishlist') {
      setLoading(true)
      api
        .get('/wishlist/')
        .then((res) => {
          if (mounted) setWishlist(res.data.results || res.data || [])
        })
        .catch(() => {})
        .finally(() => {
          if (mounted) setLoading(false)
        })
    }

    return () => {
      mounted = false
    }
  }, [activeSection])

  useEffect(() => {
    let mounted = true
    Promise.all([
      api.get('/orders/my/').catch(() => ({ data: { count: 0, results: [] } })),
      api.get('/wishlist/').catch(() => ({ data: { count: 0, results: [] } })),
      api.get('/auth/addresses/').catch(() => ({ data: { count: 0, results: [] } })),
    ]).then(([ordersRes, wishlistRes, addressRes]) => {
      if (!mounted) return
      setStats({
        orders: ordersRes.data.count ?? ordersRes.data.results?.length ?? 0,
        wishlist: wishlistRes.data.count ?? wishlistRes.data.results?.length ?? 0,
        addresses: addressRes.data.count ?? addressRes.data.results?.length ?? 0,
      })
    })
    return () => {
      mounted = false
    }
  }, [])

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append('avatar', file)
    try {
      const { data } = await api.patch('/auth/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      updateUser(data.user)
      toast.success('Profile photo updated!')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      const { data: updated } = await api.patch('/auth/profile/', data)
      updateUser(updated.user)
      toast.success('Profile updated!')
    } catch {
      toast.error('Update failed')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/profile/')
      logout()
      navigate('/')
      toast.success('Account deleted permanently')
    } catch {
      toast.error('Failed to delete account')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Logged out!')
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'orders':
        return <OrdersSection orders={orders} loading={loading} onBack={goBackToProfile} />
      case 'wishlist':
        return <WishlistSection wishlist={wishlist} loading={loading} onBack={goBackToProfile} />
      case 'addresses':
        return <Addresses onBack={goBackToProfile} />
      case 'coupons':
        return <CouponsSection onBack={goBackToProfile} />
      case 'security':
        return <Security onBack={goBackToProfile} />
      case 'notifications':
        return <Notifications onBack={goBackToProfile} />
      default:
        return (
          <>
            <section className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 sm:p-6 lg:p-8">
              <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-neutral-500 uppercase">
                Account
              </p>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl">
                My profile
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500">
                Manage your details, orders, wishlist, and preferences.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { value: stats.orders, label: 'Orders', section: 'orders', icon: Package },
                  { value: stats.wishlist, label: 'Wishlist', section: 'wishlist', icon: Heart },
                  { value: stats.addresses, label: 'Addresses', section: 'addresses', icon: MapPin },
                ].map((stat) => {
                  const Icon = stat.icon
                  return (
                    <button
                      key={stat.label}
                      type="button"
                      onClick={() => handleSectionChange(stat.section)}
                      className="group rounded-2xl bg-[#F4F4F2] p-3 text-center transition hover:bg-neutral-950 hover:text-white sm:p-4"
                    >
                      <Icon
                        size={16}
                        className="mx-auto mb-2 text-neutral-700 transition group-hover:text-white"
                      />
                      <div className="text-lg font-semibold tracking-[-0.03em] sm:text-xl">
                        {stat.value}
                      </div>
                      <div className="mt-1 text-[9px] font-semibold tracking-[0.14em] text-neutral-500 uppercase group-hover:text-white/70 sm:text-[10px]">
                        {stat.label}
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 sm:p-6 lg:p-8">
              <div className="mb-5 flex items-center gap-3 sm:mb-6">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#F4F4F2] text-neutral-800">
                  <User size={15} />
                </div>
                <h2 className="text-sm font-semibold tracking-[0.14em] text-neutral-950 uppercase">
                  Personal information
                </h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                  <div>
                    <label className={LABEL}>Full name</label>
                    <input {...register('name')} className={FIELD} />
                  </div>
                  <div>
                    <label className={LABEL}>Phone</label>
                    <input {...register('phone')} className={FIELD} />
                  </div>
                  <div>
                    <label className={LABEL}>Date of birth</label>
                    <input type="date" {...register('dob')} className={FIELD} />
                  </div>
                  <div>
                    <label className={LABEL}>Gender</label>
                    <select {...register('gender')} className={FIELD}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={LABEL}>Email</label>
                  <input
                    value={user?.email || ''}
                    disabled
                    className={`${FIELD} cursor-not-allowed opacity-60`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="tf-buy-now inline-flex w-full items-center justify-center gap-2 self-start disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <span>Save changes</span>
                  )}
                </button>
              </form>
            </section>

            <section className="rounded-2xl bg-white p-5 ring-1 ring-red-200 sm:p-6 lg:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <Trash2 size={15} />
                </div>
                <h3 className="text-sm font-semibold tracking-[0.14em] text-red-600 uppercase">
                  Danger zone
                </h3>
              </div>
              <p className="mb-5 max-w-xl text-sm leading-relaxed text-neutral-500">
                Deleting your account permanently removes orders, addresses, and wishlist data.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-red-50 px-4 text-[10px] font-semibold tracking-[0.16em] text-red-700 uppercase ring-1 ring-red-200 transition hover:bg-red-100"
              >
                <Trash2 size={13} />
                Delete account
              </button>
            </section>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#EFEFEF] pb-16 text-neutral-900 md:pb-20">
      <main className="mx-auto max-w-[1180px] px-4 pt-4 sm:px-6 sm:pt-5 md:px-8 md:pt-6">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-400 sm:mb-8">
          <Link to="/" className="transition-colors hover:text-neutral-700">
            Home
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-neutral-700">Profile</span>
        </nav>

        <div className="flex flex-col gap-5 lg:flex-row lg:gap-7">
          {/* Mobile header */}
          <section className="rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <AvatarBlock
                  user={user}
                  uploadingPhoto={uploadingPhoto}
                  onUploadClick={() => fileInputRef.current?.click()}
                  compact
                />
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-neutral-950">
                    {user?.name || 'Member'}
                  </h2>
                  <p className="truncate text-[11px] text-neutral-500">{user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex size-10 items-center justify-center rounded-full bg-[#F4F4F2] text-neutral-800 ring-1 ring-black/5"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            </div>

            {mobileMenuOpen && (
              <nav className="mt-4 flex flex-col gap-1 border-t border-neutral-100 pt-4">
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.section
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSectionChange(item.section)}
                      className={`flex w-full items-center gap-3 rounded-full px-3.5 py-3 text-left transition ${
                        isActive
                          ? 'bg-neutral-950 text-white'
                          : 'text-neutral-500 hover:bg-[#F4F4F2] hover:text-neutral-900'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="flex-1 text-[11px] font-semibold tracking-[0.14em] uppercase">
                        {item.label}
                      </span>
                      <ChevronRight size={13} />
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center gap-3 rounded-full px-3.5 py-3 text-left text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={16} />
                  <span className="flex-1 text-[11px] font-semibold tracking-[0.14em] uppercase">
                    Sign out
                  </span>
                </button>
              </nav>
            )}
          </section>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {/* Desktop sidebar */}
          <aside className="sticky top-24 hidden w-72 shrink-0 flex-col gap-4 self-start lg:flex">
            <section className="rounded-2xl bg-white p-6 text-center shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5">
              <AvatarBlock
                user={user}
                uploadingPhoto={uploadingPhoto}
                onUploadClick={() => fileInputRef.current?.click()}
              />
              <h2 className="mt-4 text-base font-semibold text-neutral-950">
                {user?.name || 'Member'}
              </h2>
              <p className="mt-1 break-words text-[12px] text-neutral-500">{user?.email}</p>
            </section>

            <section className="rounded-2xl bg-white p-3 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5">
              <nav className="flex flex-col gap-1">
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.section
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSectionChange(item.section)}
                      className={`flex w-full items-center gap-3 rounded-full px-4 py-3 text-left transition ${
                        isActive
                          ? 'bg-neutral-950 text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)]'
                          : 'text-neutral-500 hover:bg-[#F4F4F2] hover:text-neutral-900'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="flex-1 text-[11px] font-semibold tracking-[0.14em] uppercase">
                        {item.label}
                      </span>
                      <ChevronRight size={13} />
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={16} />
                  <span className="flex-1 text-[11px] font-semibold tracking-[0.14em] uppercase">
                    Sign out
                  </span>
                </button>
              </nav>
            </section>
          </aside>

          <section className="flex flex-1 flex-col gap-5 sm:gap-6">{renderContent()}</section>
        </div>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#EFEFEF]/90 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_24px_60px_rgba(17,17,17,0.12)] ring-1 ring-red-200 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Trash2 size={18} />
              </div>
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-red-600">
                Delete account?
              </h3>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-neutral-500">
              This is permanent. All of your data will be removed from our servers.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="inline-flex h-11 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold tracking-[0.16em] text-white uppercase transition hover:bg-red-700"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="inline-flex h-11 items-center justify-center rounded-full bg-white text-[10px] font-semibold tracking-[0.16em] text-neutral-700 uppercase ring-1 ring-black/8 transition hover:text-neutral-950"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AvatarBlock({ user, uploadingPhoto, onUploadClick, compact = false }) {
  return (
    <div className={`relative mx-auto ${compact ? 'size-11' : 'size-20'}`}>
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-neutral-950 text-xl font-semibold text-white">
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          user?.name?.[0]?.toUpperCase() || 'M'
        )}
      </div>
      {!compact && (
        <button
          type="button"
          onClick={onUploadClick}
          className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full bg-white text-neutral-900 ring-2 ring-[#EFEFEF] transition hover:bg-neutral-950 hover:text-white"
          aria-label="Upload photo"
        >
          {uploadingPhoto ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Camera size={13} />
          )}
        </button>
      )}
    </div>
  )
}

function BackButton({ onBack }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase transition hover:text-neutral-950"
    >
      <ArrowLeft size={14} />
      Back to profile
    </button>
  )
}

function OrdersSection({ orders, loading, onBack }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 sm:p-6 lg:p-8">
      <BackButton onBack={onBack} />
      <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-neutral-500 uppercase">
        Order history
      </p>
      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950">My orders</h2>
      <p className="mt-2 mb-6 text-sm text-neutral-500">Track and manage your purchases.</p>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-2xl bg-[#F4F4F2]" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="rounded-2xl bg-[#F4F4F2]/80 py-12 text-center">
          <PackageIcon size={36} className="mx-auto mb-3 text-neutral-400" />
          <p className="text-sm text-neutral-500">No orders yet.</p>
          <Link to="/products" className="tf-buy-now mt-5 inline-flex items-center gap-2">
            <span>Shop the drop</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block rounded-2xl bg-[#F4F4F2]/80 p-4 transition hover:bg-[#ECECE8]"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold tracking-wider text-neutral-950">
                    #{order.id?.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold tracking-[0.14em] text-neutral-700 uppercase ring-1 ring-black/6">
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  {order.items?.length || 0} items
                </span>
                <span className="text-sm font-semibold text-neutral-950">
                  ₹{Number(order.total).toLocaleString('en-IN')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function WishlistSection({ wishlist, loading, onBack }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 sm:p-6 lg:p-8">
      <BackButton onBack={onBack} />
      <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-neutral-500 uppercase">
        Saved items
      </p>
      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950">Wishlist</h2>
      <p className="mt-2 mb-6 text-sm text-neutral-500">Pieces you’ve saved for later.</p>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="aspect-[4/5] animate-pulse rounded-2xl bg-[#F4F4F2]" />
          ))}
        </div>
      ) : !wishlist || wishlist.length === 0 ? (
        <div className="rounded-2xl bg-[#F4F4F2]/80 py-12 text-center">
          <Heart size={36} className="mx-auto mb-3 text-neutral-400" />
          <p className="text-sm text-neutral-500">No items in wishlist.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 sm:gap-4">
          {wishlist.map((item) => (
            <Link
              key={item.id}
              to={`/products/${item.product?.slug}`}
              className="group overflow-hidden rounded-2xl bg-[#F4F4F2] ring-1 ring-black/5 transition hover:ring-black/10"
            >
              <div className="aspect-[4/5] overflow-hidden bg-white">
                {item.product?.primary_image?.image && (
                  <img
                    src={item.product.primary_image.image}
                    alt={item.product_name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-semibold tracking-[0.04em] text-neutral-950 uppercase sm:text-sm">
                  {item.product_name}
                </p>
                <p className="mt-1 text-xs font-semibold text-neutral-700">
                  ₹{Number(item.product?.effective_price || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function CouponsSection({ onBack }) {
  const [coupons, setCoupons] = useState([])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('qr_coupons') || '[]')
      setCoupons(Array.isArray(saved) ? saved : [])
    } catch {
      setCoupons([])
    }
  }, [])

  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 sm:p-6 lg:p-8">
      <BackButton onBack={onBack} />
      <div className="mb-2 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-[#F4F4F2] text-neutral-800">
          <Ticket size={15} />
        </div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950">Coupons</h2>
      </div>
      <p className="mb-6 text-sm text-neutral-500">
        Codes from QR scans and campaigns you’ve unlocked.
      </p>

      {coupons.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-[#F4F4F2]/80 py-12 text-center">
          <Sparkles size={36} className="mb-3 text-neutral-400" />
          <p className="text-sm text-neutral-500">No active coupons yet.</p>
          <p className="mt-1 text-xs text-neutral-400">Scan an offer QR to unlock one.</p>
          <Link
            to="/scan"
            className="mt-5 inline-flex h-10 items-center rounded-full bg-neutral-950 px-4 text-[10px] font-semibold tracking-[0.16em] text-white uppercase"
          >
            Open scanner
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {coupons.map((c) => (
            <div
              key={c.code}
              className="flex items-center justify-between gap-3 rounded-2xl bg-[#F4F4F2]/80 px-4 py-3.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-wider text-neutral-950">
                  {c.code}
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  {c.title || 'QR offer'}
                  {c.expires_at
                    ? ` · expires ${new Date(c.expires_at).toLocaleDateString('en-IN')}`
                    : ''}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-neutral-950 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-white uppercase">
                {c.discount}% off
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
