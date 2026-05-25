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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
            {/* Account Overview */}
            <section className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6 lg:p-8">
              <p className="label-gold mb-3">Account Overview</p>

              <h1 className="font-display text-xl sm:text-2xl lg:text-3xl text-white tracking-[0.12em] mb-2">
                MY <span className="text-gradient-gold">PROFILE</span>
              </h1>

              <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mb-5 sm:mb-6">
                Manage your personal details, orders, wishlist, and account preferences.
              </p>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
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
                      className="text-center transition-all duration-300 cursor-pointer border border-gold/10 bg-black hover:border-gold/35 hover:bg-gold/5 p-3 sm:p-4 group"
                    >
                      <Icon
                        size={17}
                        className="mx-auto mb-2 text-gold group-hover:scale-110 transition-transform"
                      />

                      <div className="text-lg sm:text-xl font-display text-gold">
                        {stat.value}
                      </div>

                      <div className="text-[9px] sm:text-[11px] font-mono tracking-wider mt-1 text-muted uppercase">
                        {stat.label}
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Profile Form */}
            <section className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="w-9 h-9 border border-gold/20 bg-gold/10 flex items-center justify-center">
                  <User size={16} className="text-gold" />
                </div>

                <h2 className="font-display text-sm sm:text-base text-white tracking-[0.12em]">
                  PERSONAL INFORMATION
                </h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="label-gold text-[10px] sm:text-[11px] mb-2 block">
                      Full Name
                    </label>
                    <input
                      {...register('name')}
                      className="w-full bg-black border border-gold/15 text-white text-sm font-mono tracking-wider px-4 py-3.5 outline-none focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all"
                    />
                  </div>

                  <div>
                    <label className="label-gold text-[10px] sm:text-[11px] mb-2 block">
                      Signal
                    </label>
                    <input
                      {...register('phone')}
                      className="w-full bg-black border border-gold/15 text-white text-sm font-mono tracking-wider px-4 py-3.5 outline-none focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all"
                    />
                  </div>

                  <div>
                    <label className="label-gold text-[10px] sm:text-[11px] mb-2 block">
                      Date of Origin
                    </label>
                    <input
                      type="date"
                      {...register('dob')}
                      className="w-full bg-black border border-gold/15 text-white text-sm font-mono tracking-wider px-4 py-3.5 outline-none focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all"
                    />
                  </div>

                  <div>
                    <label className="label-gold text-[10px] sm:text-[11px] mb-2 block">
                      Identity
                    </label>
                    <select
                      {...register('gender')}
                      className="w-full bg-black border border-gold/15 text-white text-sm font-mono tracking-wider px-4 py-3.5 outline-none focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label-gold text-[10px] sm:text-[11px] mb-2 block">
                    Email
                  </label>
                  <input
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-black/60 border border-gold/10 text-muted text-sm font-mono tracking-wider px-4 py-3.5 outline-none cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full sm:w-auto self-start inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      SAVING...
                    </>
                  ) : (
                    'SAVE CHANGES'
                  )}
                </button>
              </form>
            </section>

            {/* Danger Zone */}
            <section className="bg-[#0A0A0A] border border-red-400/25 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 border border-red-400/25 bg-red-400/10 flex items-center justify-center">
                  <Trash2 size={16} className="text-red-400" />
                </div>

                <h3 className="font-display text-base sm:text-lg text-red-400 tracking-[0.12em]">
                  DANGER ZONE
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mb-5 sm:mb-6">
                Once deleted, all your data including orders, addresses, and wishlist will be
                permanently removed. This action cannot be undone.
              </p>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center justify-center gap-2 border border-red-400/35 bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white text-xs sm:text-sm font-mono tracking-wider uppercase px-5 py-3 transition-all duration-300"
              >
                <Trash2 size={15} />
                Delete Account
              </button>
            </section>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-7 lg:gap-8">
          {/* Mobile Header */}
          <section className="lg:hidden bg-[#0A0A0A] border border-gold/15 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <AvatarBlock
                  user={user}
                  uploadingPhoto={uploadingPhoto}
                  onUploadClick={() => fileInputRef.current?.click()}
                  compact
                />

                <div className="min-w-0">
                  <h2 className="font-display text-sm sm:text-base text-white tracking-wider truncate">
                    {user?.name || 'Wanderer'}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-muted font-mono truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-10 h-10 bg-black border border-gold/15 flex items-center justify-center text-gold"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>

            {mobileMenuOpen && (
              <nav className="mt-4 pt-4 border-t border-gold/10 flex flex-col gap-1 animate-fadeIn">
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.section

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSectionChange(item.section)}
                      className={`flex items-center w-full text-left px-3 py-3 gap-3 transition-all ${
                        isActive
                          ? 'bg-gold text-black'
                          : 'bg-transparent text-muted hover:bg-gold/5 hover:text-gold'
                      }`}
                    >
                      <Icon size={17} />
                      <span className="flex-1 text-xs sm:text-sm font-mono tracking-wider uppercase">
                        {item.label}
                      </span>
                      <ChevronRight size={14} />
                    </button>
                  )
                })}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-3 py-3 gap-3 text-red-400 hover:bg-red-400/10 transition-all border-t border-gold/10 mt-2"
                >
                  <LogOut size={17} />
                  <span className="flex-1 text-xs sm:text-sm font-mono tracking-wider uppercase">
                    Logout
                  </span>
                </button>
              </nav>
            )}
          </section>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex w-72 shrink-0 flex-col gap-5 sticky top-28 self-start">
            <section className="bg-[#0A0A0A] border border-gold/15 text-center p-6">
              <AvatarBlock
                user={user}
                uploadingPhoto={uploadingPhoto}
                onUploadClick={() => fileInputRef.current?.click()}
              />

              <h2 className="font-display text-lg text-white tracking-wider mt-4">
                {user?.name || 'Wanderer'}
              </h2>

              <p className="text-xs text-muted font-mono tracking-wider mt-1 break-words">
                {user?.email}
              </p>
            </section>

            <section className="bg-[#0A0A0A] border border-gold/15 p-3">
              <nav className="flex flex-col gap-1">
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.section

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSectionChange(item.section)}
                      className={`flex items-center w-full text-left px-4 py-3 gap-3 transition-all ${
                        isActive
                          ? 'bg-gold text-black'
                          : 'bg-transparent text-muted hover:bg-gold/5 hover:text-gold'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="flex-1 text-sm font-mono tracking-wider uppercase">
                        {item.label}
                      </span>
                      <ChevronRight size={14} />
                    </button>
                  )
                })}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-3 gap-3 mt-2 text-red-400 hover:bg-red-400/10 transition-all border-t border-gold/10"
                >
                  <LogOut size={18} />
                  <span className="flex-1 text-sm font-mono tracking-wider uppercase">
                    Logout
                  </span>
                </button>
              </nav>
            </section>
          </aside>

          {/* Main Content */}
          <section className="flex-1 flex flex-col gap-5 sm:gap-6">
            {renderContent()}
          </section>
        </div>
      </main>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
          <div className="bg-[#0A0A0A] border border-red-400/30 w-full max-w-md p-5 sm:p-8 animate-fadeUp shadow-[0_30px_120px_rgba(0,0,0,0.75)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 border border-red-400/25 bg-red-400/10 flex items-center justify-center">
                <Trash2 size={19} className="text-red-400" />
              </div>

              <h3 className="font-display text-lg text-red-400 tracking-[0.12em]">
                DELETE ACCOUNT?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mb-6">
              This action is permanent and cannot be undone. All your data will be
              permanently removed from our servers.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="bg-red-400 text-white hover:bg-red-500 text-xs sm:text-sm font-mono tracking-wider uppercase py-3 transition-all"
              >
                Delete
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn-outline !py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.25s ease;
        }
      `}</style>
    </div>
  )
}

function AvatarBlock({ user, uploadingPhoto, onUploadClick, compact = false }) {
  return (
    <div className={`relative mx-auto ${compact ? 'w-11 h-11' : 'w-20 h-20'}`}>
      <div className="w-full h-full bg-gold flex items-center justify-center font-display text-black overflow-hidden text-xl">
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          user?.name?.[0]?.toUpperCase() || 'W'
        )}
      </div>

      {!compact && (
        <button
          type="button"
          onClick={onUploadClick}
          className="absolute bottom-0 right-0 w-8 h-8 flex items-center justify-center border-2 border-[#0A0A0A] cursor-pointer bg-black text-gold hover:bg-gold hover:text-black transition-colors"
        >
          {uploadingPhoto ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Camera size={14} />
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
      className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono tracking-wider uppercase text-muted hover:text-gold transition-colors bg-transparent border-none cursor-pointer mb-5"
    >
      <ArrowLeft size={16} />
      Back to Profile
    </button>
  )
}

function OrdersSection({ orders, loading, onBack }) {
  return (
    <section className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6 lg:p-8">
      <BackButton onBack={onBack} />

      <p className="label-gold mb-3">Order History</p>

      <h2 className="font-display text-xl sm:text-2xl text-white tracking-[0.12em] mb-2">
        MY <span className="text-gradient-gold">ORDERS</span>
      </h2>

      <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mb-6">
        Track and manage your artifact transmissions.
      </p>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-20 skeleton-dark border border-gold/10" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-10 sm:py-12">
          <PackageIcon size={42} className="mx-auto mb-4 text-gold/45" />
          <p className="text-sm text-muted font-mono">No orders yet.</p>
          <Link
            to="/products"
            className="btn-primary inline-flex items-center justify-center gap-2 mt-5"
          >
            SHOP NOW
            <ChevronRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-black border border-gold/10 hover:border-gold/35 p-4 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-mono text-xs sm:text-sm text-white tracking-wider">
                    #{order.id?.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-[10px] sm:text-xs mt-1 text-muted font-mono">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider px-2.5 py-1 border border-gold/20 bg-gold/10 text-gold">
                  {order.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted font-mono">
                  {order.items?.length || 0} items
                </span>

                <span className="price-tag text-sm">
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
    <section className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6 lg:p-8">
      <BackButton onBack={onBack} />

      <p className="label-gold mb-3">Saved Items</p>

      <h2 className="font-display text-xl sm:text-2xl text-white tracking-[0.12em] mb-2">
        MY <span className="text-gradient-gold">WISHLIST</span>
      </h2>

      <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mb-6">
        Products you have saved for later.
      </p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-52 skeleton-dark border border-gold/10" />
          ))}
        </div>
      ) : !wishlist || wishlist.length === 0 ? (
        <div className="text-center py-10 sm:py-12">
          <Heart size={42} className="mx-auto mb-4 text-gold/45" />
          <p className="text-sm text-muted font-mono">No items in wishlist.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {wishlist.map((item) => (
            <Link
              key={item.id}
              to={`/products/${item.product?.slug}`}
              className="bg-black border border-gold/10 hover:border-gold/35 overflow-hidden transition-all group"
            >
              <div className="w-full aspect-[4/5] bg-[#0A0A0A] overflow-hidden">
                {item.product?.primary_image?.image && (
                  <img
                    src={item.product.primary_image.image}
                    alt={item.product_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>

              <div className="p-3">
                <p className="text-xs sm:text-sm font-display text-white tracking-wider truncate">
                  {item.product_name}
                </p>

                <p className="text-xs mt-1 text-gold font-mono">
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
  return (
    <section className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6 lg:p-8">
      <BackButton onBack={onBack} />

      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 border border-gold/20 bg-gold/10 flex items-center justify-center">
          <Ticket size={16} className="text-gold" />
        </div>

        <h2 className="font-display text-xl sm:text-2xl text-white tracking-[0.12em]">
          COUPONS
        </h2>
      </div>

      <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed">
        Available coupons will appear here.
      </p>

      <div className="mt-8 flex flex-col items-center text-center py-10 sm:py-12 border border-gold/10 bg-black">
        <Sparkles size={44} className="text-gold/45 mb-4" />

        <p className="text-sm text-muted font-mono">
          No active coupons at the moment.
        </p>

        <p className="text-xs text-muted font-mono mt-2">
          Check back later for exclusive drops.
        </p>
      </div>
    </section>
  )
}