import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  User, Package, Heart, Map, MapPin, Ticket, Shield, Bell, LogOut, ChevronRight,
  Camera, CheckCircle, AlertCircle, Trash2, Key, Calendar, UserCircle,
  ArrowLeft, Clock, CheckCircle2, Package as PackageIcon, Truck, CreditCard
} from 'lucide-react'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import Security from './Security'
import Notifications from './Notifications'
import Addresses from './Addresses'
// Sidebar menu items
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
  
  // Get active section from URL query param
  const queryParams = new URLSearchParams(location.search)
  const [activeSection, setActiveSection] = useState(queryParams.get('tab') || 'profile')
  
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, addresses: 0 })
  const [orders, setOrders] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Update URL when section changes
  const handleSectionChange = (section) => {
    setActiveSection(section)
    navigate(`/profile?tab=${section}`, { replace: true })
  }

  // Go back to profile
  const goBackToProfile = () => {
    handleSectionChange('profile')
  }

  useEffect(() => {
    if (user) reset({ 
      name: user.name, 
      phone: user.phone,
      dob: user.dob || '',
      gender: user.gender || ''
    })
  }, [user, reset])
useEffect(() => {
  console.log('Active section:', activeSection) // DEBUG log
  
  if (activeSection === 'orders') {
    setLoading(true)
    api.get('/orders/my/')  // <-- CHANGE: /orders/ → /orders/my/
      .then(r => {
        console.log('Orders API success:', r.data) // DEBUG
        setOrders(r.data.results || r.data || [])
      })
      .catch(err => {
        console.error('Orders API error:', err.response?.status, err.response?.data)
        toast.error('Failed to load orders')
      })
      .finally(() => setLoading(false))
  }
  
  if (activeSection === 'wishlist') {
    setLoading(true)
    api.get('/wishlist/')  // Check this endpoint too
      .then(r => {
        console.log('Wishlist API success:', r.data)
        setWishlist(r.data.results || r.data || [])
      })
      .catch(err => {
        console.error('Wishlist API error:', err.response?.status)
      })
      .finally(() => setLoading(false))
  }
  
  if (activeSection === 'addresses') {
    setLoading(true)
    api.get('/auth/addresses/')
  // Check this endpoint too
      .then(r => {
        console.log('Addresses API success:', r.data)
        setAddresses(r.data.results || r.data || [])
      })
      .catch(err => {
        console.error('Addresses API error:', err.response?.status)
      })
      .finally(() => setLoading(false))
  }
}, [activeSection])
  // Load stats
  useEffect(() => {
    Promise.all([
      api.get('/orders/my/').catch(() => ({ data: { count: 0, results: [] } })),
      api.get('/wishlist/').catch(() => ({ data: { count: 0, results: [] } })),
      api.get('/auth/addresses/').catch(() => ({ data: { count: 0, results: [] } })),
    ]).then(([orders, wishlist, addresses]) => {
      setStats({
        orders: orders.data.count ?? orders.data.results?.length ?? 0,
        wishlist: wishlist.data.count ?? wishlist.data.results?.length ?? 0,
        addresses: addresses.data.count ?? addresses.data.results?.length ?? 0,
      })
    })
  }, [])

  // Load section data
  useEffect(() => {
    if (activeSection === 'orders') {
      setLoading(true)
      api.get('/orders/my/').then(r => {
        setOrders(r.data.results || r.data || [])
      }).finally(() => setLoading(false))
    }
    if (activeSection === 'wishlist') {
      setLoading(true)
      api.get('/wishlist/').then(r => {
        setWishlist(r.data.results || r.data || [])
      }).finally(() => setLoading(false))
    }
    if (activeSection === 'addresses') {
      setLoading(true)
      api.get('/auth/addresses/')
.then(r => {
        setAddresses(r.data.results || r.data || [])
      }).finally(() => setLoading(false))
    }
  }, [activeSection])

  // Profile Photo Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append('avatar', file)
    
    try {
      const { data } = await api.patch('/auth/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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

  // ─── RENDER SECTION CONTENT ───
  const renderContent = () => {
    switch (activeSection) {
      case 'orders':
        return <OrdersSection orders={orders} loading={loading} onBack={goBackToProfile} />
      case 'wishlist':
        return <WishlistSection wishlist={wishlist} loading={loading} onBack={goBackToProfile} />
      case 'addresses':
        return <Addresses addresses={addresses} loading={loading} onBack={goBackToProfile} />
      case 'coupons':
        return <CouponsSection onBack={goBackToProfile} />
      case 'security':
          return <Security onBack={goBackToProfile} />

      case 'notifications':
        return <Notifications onBack={goBackToProfile} />
      default:
        return (
          <>
            {/* Header / Stats Card */}
            <div className="rounded-2xl shadow-sm" style={{ 
              background: 'var(--color-surface)', 
              border: '1px solid var(--color-border)', 
              padding: '32px' 
            }}>
              <p className="text-xs font-bold tracking-widest uppercase" style={{ 
                color: 'var(--color-primary)', 
                marginBottom: '8px' 
              }}>
                Account Settings
              </p>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>
                My Profile
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-muted)', marginBottom: '32px' }}>
                Manage your personal details and account preferences.
              </p>

              <div className="grid grid-cols-3" style={{ gap: '16px' }}>
                {[
                  { value: stats.orders, label: 'Orders', section: 'orders' },
                  { value: stats.wishlist, label: 'Wishlist', section: 'wishlist' },
                  { value: stats.addresses, label: 'Addresses', section: 'addresses' },
                ].map((stat) => (
                  <button
                    key={stat.label}
                    onClick={() => handleSectionChange(stat.section)}
                    className="text-center rounded-xl transition-all cursor-pointer border-none"
                    style={{ 
                      padding: '16px',
                      background: 'var(--color-bg-alt)',
                      border: '1px solid var(--color-border)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                      {stat.value}
                    </div>
                    <div className="text-xs font-medium" style={{ color: 'var(--color-muted)', marginTop: '4px' }}>
                      {stat.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Card */}
            <div className="rounded-2xl shadow-sm" style={{ 
              background: 'var(--color-surface)', 
              border: '1px solid var(--color-border)', 
              padding: '32px' 
            }}>
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label className="block text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Full Name</label>
                    <input {...register('name')} className="w-full rounded-xl text-sm outline-none" style={{ padding: '12px 16px', background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label className="block text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Phone Number</label>
                    <input {...register('phone')} className="w-full rounded-xl text-sm outline-none" style={{ padding: '12px 16px', background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label className="block text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Date of Birth</label>
                    <input type="date" {...register('dob')} className="w-full rounded-xl text-sm outline-none" style={{ padding: '12px 16px', background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label className="block text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Gender</label>
                    <select {...register('gender')} className="w-full rounded-xl text-sm outline-none" style={{ padding: '12px 16px', background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="block text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Email</label>
                  <input value={user?.email || ''} disabled className="w-full rounded-xl text-sm cursor-not-allowed" style={{ padding: '12px 16px', background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }} />
                </div>
                <button type="submit" disabled={isSubmitting} className="text-white text-sm font-semibold rounded-xl" style={{ padding: '12px 32px', background: 'var(--color-primary)', opacity: isSubmitting ? 0.5 : 1 }}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-danger)', padding: '32px' }}>
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-danger)' }}>
                <Trash2 size={20} /> Danger Zone
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-muted)', margin: '16px 0 24px' }}>
                Once deleted, all data permanently removed.
              </p>
              <button onClick={() => setShowDeleteModal(true)} className="text-sm font-semibold rounded-xl cursor-pointer" style={{ padding: '12px 24px', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
                Delete Account
              </button>
            </div>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto page-box">
        <div className="flex flex-col lg:flex-row" style={{ gap: '32px' }}>

          {/* ── SIDEBAR ── */}
          <aside className="w-full lg:w-72 shrink-0" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Profile Card */}
            <div className="rounded-2xl shadow-sm text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '24px' }}>
              <div className="relative mx-auto" style={{ width: '80px', height: '80px', marginBottom: '16px' }}>
                <div className="w-full h-full rounded-full flex items-center justify-center font-bold text-white overflow-hidden" style={{ background: 'var(--color-primary)', fontSize: '24px' }}>
                  {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.[0]?.toUpperCase()}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center border-none cursor-pointer" style={{ background: 'var(--color-secondary)', color: 'var(--color-text-inverse)', border: '2px solid var(--color-surface)' }}>
                  {uploadingPhoto ? <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" /> : <Camera size={14} />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>{user?.name}</h2>
              <p className="text-sm" style={{ color: 'var(--color-muted)', marginTop: '4px' }}>{user?.email}</p>
            </div>

            {/* Navigation */}
            <div className="rounded-2xl shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '12px' }}>
              <nav className="flex flex-col" style={{ gap: '4px' }}>
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.section
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleSectionChange(item.section)}
                      className="flex items-center rounded-xl text-sm font-medium transition-all w-full text-left border-none cursor-pointer"
                      style={{ 
                        padding: '12px 16px', 
                        gap: '12px',
                        background: isActive ? 'var(--color-primary)' : 'transparent',
                        color: isActive ? 'var(--color-btn-text)' : 'var(--color-muted)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'var(--color-bg-alt)'
                          e.currentTarget.style.color = 'var(--color-primary)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = 'var(--color-muted)'
                        }
                      }}
                    >
                      <Icon size={18} />
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight size={14} style={{ color: isActive ? 'rgba(255,255,255,0.6)' : 'var(--color-muted)' }} />
                    </button>
                  )
                })}
                <button onClick={handleLogout} className="flex items-center w-full rounded-xl text-sm font-medium transition-all border-none cursor-pointer" style={{ padding: '12px 16px', gap: '12px', marginTop: '4px', color: 'var(--color-danger)', borderTop: '1px solid var(--color-border)' }}>
                  <LogOut size={18} />
                  <span className="flex-1 text-left">Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <section className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {renderContent()}
          </section>

        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl w-full max-w-md" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '32px' }}>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-danger)', marginBottom: '16px' }}>Delete Account?</h3>
            <p className="text-sm" style={{ color: 'var(--color-muted)', marginBottom: '24px' }}>This cannot be undone.</p>
            <div className="flex" style={{ gap: '12px' }}>
              <button onClick={handleDeleteAccount} className="flex-1 text-sm font-semibold rounded-xl border-none cursor-pointer" style={{ padding: '12px', background: 'var(--color-danger)', color: 'var(--color-text-inverse)' }}>Delete</button>
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 text-sm font-semibold rounded-xl cursor-pointer" style={{ padding: '12px', background: 'var(--color-bg-alt)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SUB-SECTIONS ───

function OrdersSection({ orders, loading, onBack }) {
  // Debug log
  console.log('Orders:', orders)
  console.log('Loading:', loading)
  
  return (
    <div className="rounded-2xl shadow-sm" style={{ 
      background: 'var(--color-surface)', 
      border: '1px solid var(--color-border)', 
      padding: '32px' 
    }}>
      <button onClick={onBack} className="flex items-center text-sm font-medium border-none cursor-pointer" style={{ 
        color: 'var(--color-muted)', 
        marginBottom: '24px', 
        gap: '8px', 
        background: 'transparent' 
      }}>
        <ArrowLeft size={18} /> Back to Profile
      </button>
      
      <h2 className="text-2xl font-bold" style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>
        My Orders
      </h2>
      <p className="text-sm" style={{ color: 'var(--color-muted)', marginBottom: '32px' }}>
        Track and manage your orders.
      </p>

      {/* DEBUG INFO - Remove after fix */}
      <div style={{ 
        padding: '12px', 
        background: 'var(--color-warning-bg)', 
        borderRadius: '8px', 
        marginBottom: '16px',
        fontSize: '12px',
        color: 'var(--color-warning)'
      }}>
        Debug: Orders count = {orders?.length || 0}, Loading = {String(loading)}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2,3].map(i => (
            <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--color-bg-alt)' }} />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center" style={{ padding: '48px' }}>
          <PackageIcon size={48} style={{ color: 'var(--color-muted)', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--color-muted)' }}>No orders yet</p>
          <p className="text-xs" style={{ color: 'var(--color-muted)', marginTop: '8px' }}>
            Try placing an order from the shop!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map(order => (
            <div key={order.id} className="rounded-xl" style={{ 
              background: 'var(--color-bg-alt)', 
              border: '1px solid var(--color-border)', 
              padding: '20px' 
            }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                <span className="font-mono text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                  #{order.id?.slice(0,8).toUpperCase()}
                </span>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ 
                  background: order.status === 'delivered' ? 'var(--color-success-bg)' : 
                              order.status === 'cancelled' ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)',
                  color: order.status === 'delivered' ? 'var(--color-success)' : 
                         order.status === 'cancelled' ? 'var(--color-danger)' : 'var(--color-warning)'
                }}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  {order.items?.length || 0} items
                </span>
                <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                  ₹{order.total}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-muted)', marginTop: '8px' }}>
                {new Date(order.created_at).toLocaleDateString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function WishlistSection({ wishlist, loading, onBack }) {
  return (
    <div className="rounded-2xl shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '32px' }}>
      <button onClick={onBack} className="flex items-center text-sm font-medium border-none cursor-pointer" style={{ color: 'var(--color-muted)', marginBottom: '24px', gap: '8px', background: 'transparent' }}>
        <ArrowLeft size={18} /> Back to Profile
      </button>
      
      <h2 className="text-2xl font-bold" style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>My Wishlist</h2>
      <p className="text-sm" style={{ color: 'var(--color-muted)', marginBottom: '32px' }}>Products you've saved for later.</p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: '16px' }}>
          {[1,2,3].map(i => <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: 'var(--color-bg-alt)' }} />)}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center" style={{ padding: '48px' }}>
          <Heart size={48} style={{ color: 'var(--color-muted)', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--color-muted)' }}>No items in wishlist</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: '16px' }}>
          {wishlist.map(item => (
            <div key={item.id} className="rounded-xl overflow-hidden" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)' }}>
              <div className="w-full" style={{ height: '160px', background: 'var(--color-muted-light)' }}>
                {item.product?.primary_image?.image && (
                  <img src={item.product.primary_image.image} alt={item.product_name} className="w-full h-full object-cover" />
                )}
              </div>
              <div style={{ padding: '12px' }}>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{item.product_name}</p>
                <p className="text-xs" style={{ color: 'var(--color-primary)', marginTop: '4px' }}>₹{item.product?.effective_price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AddressesSection({ addresses, loading, onBack }) {
  return (
    <div className="rounded-2xl shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '32px' }}>
      <button onClick={onBack} className="flex items-center text-sm font-medium border-none cursor-pointer" style={{ color: 'var(--color-muted)', marginBottom: '24px', gap: '8px', background: 'transparent' }}>
        <ArrowLeft size={18} /> Back to Profile
      </button>
      
      <h2 className="text-2xl font-bold" style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>Saved Addresses</h2>
      <p className="text-sm" style={{ color: 'var(--color-muted)', marginBottom: '32px' }}>Manage delivery addresses.</p>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2].map(i => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--color-bg-alt)' }} />)}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center" style={{ padding: '48px' }}>
          <MapPin size={48} style={{ color: 'var(--color-muted)', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--color-muted)' }}>No addresses saved</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {addresses.map(addr => (
            <div key={addr.id} className="rounded-xl" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', padding: '20px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{addr.full_name}</span>
                {addr.is_default && (
                  <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>Default</span>
                )}
              </div>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{addr.line1}, {addr.city}, {addr.state} - {addr.pincode}</p>
              <p className="text-sm" style={{ color: 'var(--color-muted)', marginTop: '4px' }}>📞 {addr.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CouponsSection({ onBack }) {
  return (
    <div className="rounded-2xl shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '32px' }}>
      <button onClick={onBack} className="flex items-center text-sm font-medium border-none cursor-pointer" style={{ color: 'var(--color-muted)', marginBottom: '24px', gap: '8px', background: 'transparent' }}>
        <ArrowLeft size={18} /> Back to Profile
      </button>
      <h2 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>Coupons</h2>
      <p style={{ color: 'var(--color-muted)', marginTop: '8px' }}>Available coupons will appear here.</p>
    </div>
  )
}

function SecuritySection({ onBack }) {
  return (
    <div className="rounded-2xl shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '32px' }}>
      <button onClick={onBack} className="flex items-center text-sm font-medium border-none cursor-pointer" style={{ color: 'var(--color-muted)', marginBottom: '24px', gap: '8px', background: 'transparent' }}>
        <ArrowLeft size={18} /> Back to Profile
      </button>
      <h2 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>Security</h2>
      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="rounded-xl" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', padding: '20px' }}>
          <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>Change Password</h3>
          <p className="text-xs" style={{ color: 'var(--color-muted)', margin: '8px 0 16px' }}>Update your password regularly.</p>
          <button className="text-sm font-semibold rounded-xl border-none cursor-pointer" style={{ padding: '10px 20px', background: 'var(--color-primary)', color: 'var(--color-text-inverse)' }}>
            Update Password
          </button>
        </div>
      </div>
    </div>
  )
}

function NotificationsSection({ onBack }) {
  return (
    <div className="rounded-2xl shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '32px' }}>
      <button onClick={onBack} className="flex items-center text-sm font-medium border-none cursor-pointer" style={{ color: 'var(--color-muted)', marginBottom: '24px', gap: '8px', background: 'transparent' }}>
        <ArrowLeft size={18} /> Back to Profile
      </button>
      <h2 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>Notifications</h2>
      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {['Order Updates', 'Promotional Emails', 'SMS Alerts', 'WhatsApp Updates'].map((item) => (
          <div key={item} className="flex items-center justify-between rounded-xl" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', padding: '16px 20px' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{item}</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 cursor-pointer" style={{ accentColor: 'var(--color-primary)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}