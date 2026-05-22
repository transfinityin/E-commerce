// import { useEffect, useState, useRef } from 'react'
// import { useForm } from 'react-hook-form'
// import { toast } from 'react-hot-toast'
// import { useNavigate, useLocation } from 'react-router-dom'
// import {
//   User, Package, Heart, MapPin, Ticket, Shield, Bell, LogOut, ChevronRight,
//   Camera, ArrowLeft, Package as PackageIcon, Trash2, Sparkles
// } from 'lucide-react'
// import api from '../services/api'
// import useAuthStore from '../store/authStore'
// import Security from './Security'
// import Notifications from './Notifications'
// import Addresses from './Addresses'

// const MENU_ITEMS = [
//   { icon: User, label: 'My Profile', section: 'profile' },
//   { icon: Package, label: 'My Orders', section: 'orders' },
//   { icon: Heart, label: 'Wishlist', section: 'wishlist' },
//   { icon: MapPin, label: 'Saved Addresses', section: 'addresses' },
//   { icon: Ticket, label: 'Coupons', section: 'coupons' },
//   { icon: Shield, label: 'Security', section: 'security' },
//   { icon: Bell, label: 'Notifications', section: 'notifications' },
// ]

// export default function Profile() {
//   const { user, updateUser, logout } = useAuthStore()
//   const navigate = useNavigate()
//   const location = useLocation()
//   const fileInputRef = useRef(null)

//   const queryParams = new URLSearchParams(location.search)
//   const [activeSection, setActiveSection] = useState(queryParams.get('tab') || 'profile')

//   const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
//   const [stats, setStats] = useState({ orders: 0, wishlist: 0, addresses: 0 })
//   const [orders, setOrders] = useState([])
//   const [wishlist, setWishlist] = useState([])
//   const [addresses, setAddresses] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [uploadingPhoto, setUploadingPhoto] = useState(false)
//   const [showDeleteModal, setShowDeleteModal] = useState(false)

//   const handleSectionChange = (section) => {
//     setActiveSection(section)
//     navigate(`/profile?tab=${section}`, { replace: true })
//   }

//   const goBackToProfile = () => {
//     handleSectionChange('profile')
//   }

//   useEffect(() => {
//     if (user) reset({
//       name: user.name,
//       phone: user.phone,
//       dob: user.dob || '',
//       gender: user.gender || ''
//     })
//   }, [user, reset])

//   useEffect(() => {
//     if (activeSection === 'orders') {
//       setLoading(true)
//       api.get('/orders/my/')
//         .then(r => setOrders(r.data.results || r.data || []))
//         .catch(() => toast.error('Failed to load orders'))
//         .finally(() => setLoading(false))
//     }
//     if (activeSection === 'wishlist') {
//       setLoading(true)
//       api.get('/wishlist/')
//         .then(r => setWishlist(r.data.results || r.data || []))
//         .catch(() => {})
//         .finally(() => setLoading(false))
//     }
//     if (activeSection === 'addresses') {
//       setLoading(true)
//       api.get('/auth/addresses/')
//         .then(r => setAddresses(r.data.results || r.data || []))
//         .catch(() => {})
//         .finally(() => setLoading(false))
//     }
//   }, [activeSection])

//   useEffect(() => {
//     Promise.all([
//       api.get('/orders/my/').catch(() => ({ data: { count: 0, results: [] } })),
//       api.get('/wishlist/').catch(() => ({ data: { count: 0, results: [] } })),
//       api.get('/auth/addresses/').catch(() => ({ data: { count: 0, results: [] } })),
//     ]).then(([o, w, a]) => {
//       setStats({
//         orders: o.data.count ?? o.data.results?.length ?? 0,
//         wishlist: w.data.count ?? w.data.results?.length ?? 0,
//         addresses: a.data.count ?? a.data.results?.length ?? 0,
//       })
//     })
//   }, [])

//   const handlePhotoUpload = async (e) => {
//     const file = e.target.files[0]
//     if (!file) return
//     setUploadingPhoto(true)
//     const formData = new FormData()
//     formData.append('avatar', file)
//     try {
//       const { data } = await api.patch('/auth/profile/', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       })
//       updateUser(data.user)
//       toast.success('Profile photo updated!')
//     } catch {
//       toast.error('Upload failed')
//     } finally {
//       setUploadingPhoto(false)
//     }
//   }

//   const onSubmit = async (data) => {
//     try {
//       const { data: updated } = await api.patch('/auth/profile/', data)
//       updateUser(updated.user)
//       toast.success('Profile updated!')
//     } catch {
//       toast.error('Update failed')
//     }
//   }

//   const handleDeleteAccount = async () => {
//     try {
//       await api.delete('/auth/profile/')
//       logout()
//       navigate('/')
//       toast.success('Account deleted permanently')
//     } catch {
//       toast.error('Failed to delete account')
//     }
//   }

//   const handleLogout = () => {
//     logout()
//     navigate('/')
//     toast.success('Logged out!')
//   }

//   const renderContent = () => {
//     switch (activeSection) {
//       case 'orders':
//         return <OrdersSection orders={orders} loading={loading} onBack={goBackToProfile} />
//       case 'wishlist':
//         return <WishlistSection wishlist={wishlist} loading={loading} onBack={goBackToProfile} />
//       case 'addresses':
//         return <Addresses onBack={goBackToProfile} />
//       case 'coupons':
//         return <CouponsSection onBack={goBackToProfile} />
//       case 'security':
//         return <Security onBack={goBackToProfile} />
//       case 'notifications':
//         return <Notifications onBack={goBackToProfile} />
//       default:
//         return (
//           <>
//             {/* Stats Cards */}
//             <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 lg:p-8">
//               <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">
//                 Account Overview
//               </p>
//               <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
//                 My Profile
//               </h1>
//               <p className="text-sm text-[var(--color-muted)] mb-6">
//                 Manage your personal details and account preferences.
//               </p>

//               <div className="grid grid-cols-3 gap-3">
//                 {[
//                   { value: stats.orders, label: 'Orders', section: 'orders', icon: Package },
//                   { value: stats.wishlist, label: 'Wishlist', section: 'wishlist', icon: Heart },
//                   { value: stats.addresses, label: 'Addresses', section: 'addresses', icon: MapPin },
//                 ].map((stat) => {
//                   const Icon = stat.icon
//                   return (
//                     <button
//                       key={stat.label}
//                       onClick={() => handleSectionChange(stat.section)}
//                       className="text-center rounded-xl transition-all duration-200 cursor-pointer border border-[var(--color-border)] bg-[var(--color-bg-alt)] hover:border-[var(--color-primary)] hover:shadow-md hover:-translate-y-0.5 p-4 group"
//                     >
//                       <Icon size={18} className="mx-auto mb-2 text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
//                       <div className="text-xl font-bold text-[var(--color-primary)]">{stat.value}</div>
//                       <div className="text-[11px] font-medium mt-1 text-[var(--color-muted)]">{stat.label}</div>
//                     </button>
//                   )
//                 })}
//               </div>
//             </div>

//             {/* Profile Form */}
//             <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 lg:p-8">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
//                   <User size={16} className="text-[var(--color-primary)]" />
//                 </div>
//                 <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-text)]">
//                   Personal Information
//                 </h2>
//               </div>

//               <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-semibold text-[var(--color-text)]">Full Name</label>
//                     <input {...register('name')} className="w-full rounded-xl text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all" />
//                   </div>
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-semibold text-[var(--color-text)]">Phone Number</label>
//                     <input {...register('phone')} className="w-full rounded-xl text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all" />
//                   </div>
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-semibold text-[var(--color-text)]">Date of Birth</label>
//                     <input type="date" {...register('dob')} className="w-full rounded-xl text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all" />
//                   </div>
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-semibold text-[var(--color-text)]">Gender</label>
//                     <select {...register('gender')} className="w-full rounded-xl text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all">
//                       <option value="">Select</option>
//                       <option value="male">Male</option>
//                       <option value="female">Female</option>
//                       <option value="other">Other</option>
//                     </select>
//                   </div>
//                 </div>
//                 <div className="flex flex-col gap-2">
//                   <label className="text-sm font-semibold text-[var(--color-text)]">Email</label>
//                   <input value={user?.email || ''} disabled className="w-full rounded-xl text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-muted)] px-4 py-3 cursor-not-allowed" />
//                 </div>
//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-semibold rounded-xl px-6 py-3 transition-all duration-300 disabled:opacity-50 self-start shadow-md hover:shadow-lg hover:-translate-y-0.5"
//                 >
//                   {isSubmitting ? (
//                     <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
//                   ) : (
//                     'Save Changes'
//                   )}
//                 </button>
//               </form>
//             </div>

//             {/* Danger Zone */}
//             <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-danger)]/30 shadow-sm p-6 lg:p-8">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="w-8 h-8 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center">
//                   <Trash2 size={16} className="text-[var(--color-danger)]" />
//                 </div>
//                 <h3 className="text-lg font-bold text-[var(--color-danger)]">Danger Zone</h3>
//               </div>
//               <p className="text-sm text-[var(--color-muted)] mb-6">
//                 Once deleted, all your data including orders, addresses, and wishlist will be permanently removed. This action cannot be undone.
//               </p>
//               <button
//                 onClick={() => setShowDeleteModal(true)}
//                 className="text-sm font-semibold rounded-xl cursor-pointer px-6 py-3 bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white transition-all duration-200"
//               >
//                 Delete Account
//               </button>
//             </div>
//           </>
//         )
//     }
//   }

//   return (
//     <div className="min-h-screen bg-[var(--color-bg)]">
//       <div className="page-container py-8 lg:py-10">
//         <div className="flex flex-col lg:flex-row gap-8">

//           {/* Sidebar */}
//           <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
//             {/* User Card */}
//             <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm text-center p-6">
//               <div className="relative mx-auto w-20 h-20 mb-4">
//                 <div className="w-full h-full rounded-full bg-[var(--color-primary)] flex items-center justify-center font-bold text-white overflow-hidden text-2xl">
//                   {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.[0]?.toUpperCase()}
//                 </div>
//                 <button
//                   onClick={() => fileInputRef.current?.click()}
//                   className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center border-2 border-[var(--color-surface)] cursor-pointer bg-[var(--color-secondary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-secondary-light)] transition-colors"
//                 >
//                   {uploadingPhoto ? <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" /> : <Camera size={14} />}
//                 </button>
//                 <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
//               </div>
//               <h2 className="text-lg font-bold text-[var(--color-text)]">{user?.name}</h2>
//               <p className="text-sm mt-1 text-[var(--color-muted)]">{user?.email}</p>
//             </div>

//             {/* Navigation */}
//             <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-3">
//               <nav className="flex flex-col gap-1">
//                 {MENU_ITEMS.map((item) => {
//                   const Icon = item.icon
//                   const isActive = activeSection === item.section
//                   return (
//                     <button
//                       key={item.label}
//                       onClick={() => handleSectionChange(item.section)}
//                       className={`flex items-center rounded-xl text-sm font-medium transition-all duration-200 w-full text-left border-none cursor-pointer px-4 py-3 gap-3 ${
//                         isActive
//                           ? 'bg-[var(--color-primary)] text-[var(--color-btn-text)] shadow-md'
//                           : 'bg-transparent text-[var(--color-muted)] hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-primary)]'
//                       }`}
//                     >
//                       <Icon size={18} />
//                       <span className="flex-1">{item.label}</span>
//                       <ChevronRight size={14} className={isActive ? 'text-white/60' : 'text-[var(--color-muted)]'} />
//                     </button>
//                   )
//                 })}
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center w-full rounded-xl text-sm font-medium transition-all border-none cursor-pointer px-4 py-3 gap-3 mt-1 text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] border-t border-[var(--color-border)]"
//                 >
//                   <LogOut size={18} />
//                   <span className="flex-1 text-left">Logout</span>
//                 </button>
//               </nav>
//             </div>
//           </aside>

//           {/* Main Content */}
//           <section className="flex-1 flex flex-col gap-6">
//             {renderContent()}
//           </section>

//         </div>
//       </div>

//       {/* Delete Modal */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
//           <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-2xl w-full max-w-md p-6 lg:p-8 animate-fadeUp">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="w-10 h-10 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center">
//                 <Trash2 size={20} className="text-[var(--color-danger)]" />
//               </div>
//               <h3 className="text-lg font-bold text-[var(--color-danger)]">Delete Account?</h3>
//             </div>
//             <p className="text-sm text-[var(--color-muted)] mb-6">
//               This action is permanent and cannot be undone. All your data will be permanently removed from our servers.
//             </p>
//             <div className="flex gap-3">
//               <button
//                 onClick={handleDeleteAccount}
//                 className="flex-1 text-sm font-semibold rounded-xl border-none cursor-pointer py-3 bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger)]/90 transition-colors"
//               >
//                 Delete
//               </button>
//               <button
//                 onClick={() => setShowDeleteModal(false)}
//                 className="flex-1 text-sm font-semibold rounded-xl cursor-pointer py-3 bg-[var(--color-bg-alt)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-border-light)] transition-colors"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <style>{`
//         @keyframes fadeUp {
//           from { opacity: 0; transform: translateY(16px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fadeUp {
//           animation: fadeUp 0.3s ease forwards;
//         }
//       `}</style>
//     </div>
//   )
// }

// function OrdersSection({ orders, loading, onBack }) {
//   return (
//     <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 lg:p-8">
//       <button onClick={onBack} className="flex items-center text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors border-none cursor-pointer mb-6 gap-2 bg-transparent">
//         <ArrowLeft size={18} /> Back to Profile
//       </button>
//       <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">Order History</p>
//       <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">My Orders</h2>
//       <p className="text-sm text-[var(--color-muted)] mb-8">Track and manage your orders.</p>

//       {loading ? (
//         <div className="flex flex-col gap-3">
//           {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-[var(--color-bg-alt)] animate-pulse" />)}
//         </div>
//       ) : !orders || orders.length === 0 ? (
//         <div className="text-center py-12">
//           <PackageIcon size={48} className="mx-auto mb-4 text-[var(--color-muted)]" />
//           <p className="text-[var(--color-muted)]">No orders yet</p>
//           <p className="text-xs mt-2 text-[var(--color-muted)]">Try placing an order from the shop!</p>
//         </div>
//       ) : (
//         <div className="flex flex-col gap-4">
//           {orders.map(order => (
//             <div key={order.id} className="rounded-xl p-5 bg-[var(--color-bg-alt)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-colors">
//               <div className="flex items-center justify-between mb-3">
//                 <span className="font-mono text-sm font-bold text-[var(--color-text)]">#{order.id?.slice(0, 8).toUpperCase()}</span>
//                 <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)]">
//                   {order.status}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-[var(--color-muted)]">{order.items?.length || 0} items</span>
//                 <span className="font-bold text-[var(--color-primary)]">₹{order.total}</span>
//               </div>
//               <p className="text-xs mt-2 text-[var(--color-muted)]">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// function WishlistSection({ wishlist, loading, onBack }) {
//   return (
//     <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 lg:p-8">
//       <button onClick={onBack} className="flex items-center text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors border-none cursor-pointer mb-6 gap-2 bg-transparent">
//         <ArrowLeft size={18} /> Back to Profile
//       </button>
//       <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">Saved Items</p>
//       <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">My Wishlist</h2>
//       <p className="text-sm text-[var(--color-muted)] mb-8">Products you've saved for later.</p>

//       {loading ? (
//         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//           {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-xl bg-[var(--color-bg-alt)] animate-pulse" />)}
//         </div>
//       ) : wishlist.length === 0 ? (
//         <div className="text-center py-12">
//           <Heart size={48} className="mx-auto mb-4 text-[var(--color-muted)]" />
//           <p className="text-[var(--color-muted)]">No items in wishlist</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//           {wishlist.map(item => (
//             <div key={item.id} className="rounded-xl overflow-hidden bg-[var(--color-bg-alt)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-all hover:shadow-md group">
//               <div className="w-full h-40 bg-[var(--color-muted-light)] relative overflow-hidden">
//                 {item.product?.primary_image?.image && (
//                   <img src={item.product.primary_image.image} alt={item.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
//                 )}
//               </div>
//               <div className="p-3">
//                 <p className="text-sm font-semibold truncate text-[var(--color-text)]">{item.product_name}</p>
//                 <p className="text-xs mt-1 text-[var(--color-primary)] font-bold">₹{item.product?.effective_price}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// function CouponsSection({ onBack }) {
//   return (
//     <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 lg:p-8">
//       <button onClick={onBack} className="flex items-center text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors border-none cursor-pointer mb-6 gap-2 bg-transparent">
//         <ArrowLeft size={18} /> Back to Profile
//       </button>
//       <div className="flex items-center gap-3 mb-2">
//         <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
//           <Ticket size={16} className="text-[var(--color-primary)]" />
//         </div>
//         <h2 className="text-2xl font-bold text-[var(--color-text)]">Coupons</h2>
//       </div>
//       <p className="text-sm text-[var(--color-muted)] mt-2">Available coupons will appear here.</p>

//       <div className="mt-8 flex flex-col items-center text-center py-12">
//         <Sparkles size={48} className="text-[var(--color-muted-light)] mb-4" />
//         <p className="text-sm text-[var(--color-muted)]">No active coupons at the moment</p>
//         <p className="text-xs text-[var(--color-muted-light)] mt-1">Check back later for exclusive offers</p>
//       </div>
//     </div>
//   )
// }


import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  User, Package, Heart, MapPin, Ticket, Shield, Bell, LogOut, ChevronRight,
  Camera, ArrowLeft, Package as PackageIcon, Trash2, Sparkles, Menu, X
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

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, addresses: 0 })
  const [orders, setOrders] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [addresses, setAddresses] = useState([])
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
    if (user) reset({
      name: user.name,
      phone: user.phone,
      dob: user.dob || '',
      gender: user.gender || ''
    })
  }, [user, reset])

  useEffect(() => {
    if (activeSection === 'orders') {
      setLoading(true)
      api.get('/orders/my/')
        .then(r => setOrders(r.data.results || r.data || []))
        .catch(() => toast.error('Failed to load orders'))
        .finally(() => setLoading(false))
    }
    if (activeSection === 'wishlist') {
      setLoading(true)
      api.get('/wishlist/')
        .then(r => setWishlist(r.data.results || r.data || []))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
    if (activeSection === 'addresses') {
      setLoading(true)
      api.get('/auth/addresses/')
        .then(r => setAddresses(r.data.results || r.data || []))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [activeSection])

  useEffect(() => {
    Promise.all([
      api.get('/orders/my/').catch(() => ({ data: { count: 0, results: [] } })),
      api.get('/wishlist/').catch(() => ({ data: { count: 0, results: [] } })),
      api.get('/auth/addresses/').catch(() => ({ data: { count: 0, results: [] } })),
    ]).then(([o, w, a]) => {
      setStats({
        orders: o.data.count ?? o.data.results?.length ?? 0,
        wishlist: w.data.count ?? w.data.results?.length ?? 0,
        addresses: a.data.count ?? a.data.results?.length ?? 0,
      })
    })
  }, [])

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
            {/* Stats Cards */}
            <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-sm p-4 sm:p-6 lg:p-8">
              <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">
                Account Overview
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mb-2">
                My Profile
              </h1>
              <p className="text-xs sm:text-sm text-[var(--color-muted)] mb-4 sm:mb-6">
                Manage your personal details and account preferences.
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
                      onClick={() => handleSectionChange(stat.section)}
                      className="text-center rounded-xl transition-all duration-200 cursor-pointer border border-[var(--color-border)] bg-[var(--color-bg-alt)] hover:border-[var(--color-primary)] hover:shadow-md hover:-translate-y-0.5 p-3 sm:p-4 group"
                    >
                      <Icon size={16} className="sm:w-[18px] sm:h-[18px] mx-auto mb-1.5 sm:mb-2 text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
                      <div className="text-lg sm:text-xl font-bold text-[var(--color-primary)]">{stat.value}</div>
                      <div className="text-[9px] sm:text-[11px] font-medium mt-0.5 sm:mt-1 text-[var(--color-muted)]">{stat.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-sm p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                  <User size={14} className="sm:w-4 sm:h-4 text-[var(--color-primary)]" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-[var(--color-text)]">
                  Personal Information
                </h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">Full Name</label>
                    <input {...register('name')} className="w-full rounded-xl text-xs sm:text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-3 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">Phone Number</label>
                    <input {...register('phone')} className="w-full rounded-xl text-xs sm:text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-3 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">Date of Birth</label>
                    <input type="date" {...register('dob')} className="w-full rounded-xl text-xs sm:text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-3 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">Gender</label>
                    <select {...register('gender')} className="w-full rounded-xl text-xs sm:text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-3 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <label className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">Email</label>
                  <input value={user?.email || ''} disabled className="w-full rounded-xl text-xs sm:text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-muted)] px-3 sm:px-4 py-2.5 sm:py-3 cursor-not-allowed" />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs sm:text-sm font-semibold rounded-xl px-5 sm:px-6 py-2.5 sm:py-3 transition-all duration-300 disabled:opacity-50 self-start shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  {isSubmitting ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-danger)]/30 shadow-sm p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center">
                  <Trash2 size={14} className="sm:w-4 sm:h-4 text-[var(--color-danger)]" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--color-danger)]">Danger Zone</h3>
              </div>
              <p className="text-xs sm:text-sm text-[var(--color-muted)] mb-4 sm:mb-6">
                Once deleted, all your data including orders, addresses, and wishlist will be permanently removed. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-xs sm:text-sm font-semibold rounded-xl cursor-pointer px-5 sm:px-6 py-2.5 sm:py-3 bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white transition-all duration-200"
              >
                Delete Account
              </button>
            </div>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container py-4 sm:py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">

          {/* Mobile Header with Menu */}
          <div className="lg:hidden flex items-center justify-between bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                <div className="w-full h-full rounded-full bg-[var(--color-primary)] flex items-center justify-center font-bold text-white overflow-hidden text-lg sm:text-xl">
                  {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.[0]?.toUpperCase()}
                </div>
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[var(--color-text)]">{user?.name}</h2>
                <p className="text-[10px] sm:text-xs text-[var(--color-muted)]">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center border-none cursor-pointer"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* Mobile Menu Sheet */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm p-3 animate-fadeIn">
              <nav className="flex flex-col gap-1">
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.section
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleSectionChange(item.section)}
                      className={`flex items-center rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 w-full text-left border-none cursor-pointer px-3 sm:px-4 py-2.5 sm:py-3 gap-2 sm:gap-3 ${
                        isActive
                          ? 'bg-[var(--color-primary)] text-[var(--color-btn-text)] shadow-md'
                          : 'bg-transparent text-[var(--color-muted)] hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-primary)]'
                      }`}
                    >
                      <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight size={14} className={isActive ? 'text-white/60' : 'text-[var(--color-muted)]'} />
                    </button>
                  )
                })}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full rounded-xl text-xs sm:text-sm font-medium transition-all border-none cursor-pointer px-3 sm:px-4 py-2.5 sm:py-3 gap-2 sm:gap-3 mt-1 text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] border-t border-[var(--color-border)]"
                >
                  <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="flex-1 text-left">Logout</span>
                </button>
              </nav>
            </div>
          )}

          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex w-72 shrink-0 flex-col gap-6">
            {/* User Card */}
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm text-center p-6">
              <div className="relative mx-auto w-20 h-20 mb-4">
                <div className="w-full h-full rounded-full bg-[var(--color-primary)] flex items-center justify-center font-bold text-white overflow-hidden text-2xl">
                  {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.[0]?.toUpperCase()}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center border-2 border-[var(--color-surface)] cursor-pointer bg-[var(--color-secondary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-secondary-light)] transition-colors"
                >
                  {uploadingPhoto ? <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" /> : <Camera size={14} />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </div>
              <h2 className="text-lg font-bold text-[var(--color-text)]">{user?.name}</h2>
              <p className="text-sm mt-1 text-[var(--color-muted)]">{user?.email}</p>
            </div>

            {/* Navigation */}
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-3">
              <nav className="flex flex-col gap-1">
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.section
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleSectionChange(item.section)}
                      className={`flex items-center rounded-xl text-sm font-medium transition-all duration-200 w-full text-left border-none cursor-pointer px-4 py-3 gap-3 ${
                        isActive
                          ? 'bg-[var(--color-primary)] text-[var(--color-btn-text)] shadow-md'
                          : 'bg-transparent text-[var(--color-muted)] hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-primary)]'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight size={14} className={isActive ? 'text-white/60' : 'text-[var(--color-muted)]'} />
                    </button>
                  )
                })}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full rounded-xl text-sm font-medium transition-all border-none cursor-pointer px-4 py-3 gap-3 mt-1 text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] border-t border-[var(--color-border)]"
                >
                  <LogOut size={18} />
                  <span className="flex-1 text-left">Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <section className="flex-1 flex flex-col gap-4 sm:gap-6">
            {renderContent()}
          </section>

        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-2xl w-full max-w-sm sm:max-w-md p-5 sm:p-8 animate-fadeUp">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center">
                <Trash2 size={18} className="sm:w-5 sm:h-5 text-[var(--color-danger)]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--color-danger)]">Delete Account?</h3>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] mb-5 sm:mb-6">
              This action is permanent and cannot be undone. All your data will be permanently removed from our servers.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 text-xs sm:text-sm font-semibold rounded-xl border-none cursor-pointer py-2.5 sm:py-3 bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger)]/90 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer py-2.5 sm:py-3 bg-[var(--color-bg-alt)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-border-light)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeUp {
          animation: fadeUp 0.3s ease forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease;
        }
      `}</style>
    </div>
  )
}

function OrdersSection({ orders, loading, onBack }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-sm p-4 sm:p-6 lg:p-8">
      <button onClick={onBack} className="flex items-center text-xs sm:text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors border-none cursor-pointer mb-4 sm:mb-6 gap-2 bg-transparent">
        <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" /> Back to Profile
      </button>
      <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">Order History</p>
      <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mb-2">My Orders</h2>
      <p className="text-xs sm:text-sm text-[var(--color-muted)] mb-6 sm:mb-8">Track and manage your orders.</p>

      {loading ? (
        <div className="flex flex-col gap-2 sm:gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 sm:h-20 rounded-xl bg-[var(--color-bg-alt)] animate-pulse" />)}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-10 sm:py-12">
          <PackageIcon size={40} className="sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-[var(--color-muted)]" />
          <p className="text-sm text-[var(--color-muted)]">No orders yet</p>
          <p className="text-[10px] sm:text-xs mt-1.5 sm:mt-2 text-[var(--color-muted)]">Try placing an order from the shop!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {orders.map(order => (
            <div key={order.id} className="rounded-xl p-3 sm:p-5 bg-[var(--color-bg-alt)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-colors">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="font-mono text-xs sm:text-sm font-bold text-[var(--color-text)]">#{order.id?.slice(0, 8).toUpperCase()}</span>
                <span className="text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)]">
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-[var(--color-muted)]">{order.items?.length || 0} items</span>
                <span className="text-sm sm:text-base font-bold text-[var(--color-primary)]">₹{order.total}</span>
              </div>
              <p className="text-[10px] sm:text-xs mt-1.5 sm:mt-2 text-[var(--color-muted)]">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function WishlistSection({ wishlist, loading, onBack }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-sm p-4 sm:p-6 lg:p-8">
      <button onClick={onBack} className="flex items-center text-xs sm:text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors border-none cursor-pointer mb-4 sm:mb-6 gap-2 bg-transparent">
        <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" /> Back to Profile
      </button>
      <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">Saved Items</p>
      <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mb-2">My Wishlist</h2>
      <p className="text-xs sm:text-sm text-[var(--color-muted)] mb-6 sm:mb-8">Products you've saved for later.</p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-36 sm:h-48 rounded-xl bg-[var(--color-bg-alt)] animate-pulse" />)}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-10 sm:py-12">
          <Heart size={40} className="sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-[var(--color-muted)]" />
          <p className="text-sm text-[var(--color-muted)]">No items in wishlist</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {wishlist.map(item => (
            <div key={item.id} className="rounded-xl overflow-hidden bg-[var(--color-bg-alt)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-all hover:shadow-md group">
              <div className="w-full h-28 sm:h-40 bg-[var(--color-muted-light)] relative overflow-hidden">
                {item.product?.primary_image?.image && (
                  <img src={item.product.primary_image.image} alt={item.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
              </div>
              <div className="p-2.5 sm:p-3">
                <p className="text-xs sm:text-sm font-semibold truncate text-[var(--color-text)]">{item.product_name}</p>
                <p className="text-[10px] sm:text-xs mt-1 text-[var(--color-primary)] font-bold">₹{item.product?.effective_price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CouponsSection({ onBack }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-sm p-4 sm:p-6 lg:p-8">
      <button onClick={onBack} className="flex items-center text-xs sm:text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors border-none cursor-pointer mb-4 sm:mb-6 gap-2 bg-transparent">
        <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" /> Back to Profile
      </button>
      <div className="flex items-center gap-2 sm:gap-3 mb-2">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
          <Ticket size={14} className="sm:w-4 sm:h-4 text-[var(--color-primary)]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">Coupons</h2>
      </div>
      <p className="text-xs sm:text-sm text-[var(--color-muted)] mt-2">Available coupons will appear here.</p>

      <div className="mt-6 sm:mt-8 flex flex-col items-center text-center py-10 sm:py-12">
        <Sparkles size={40} className="sm:w-12 sm:h-12 text-[var(--color-muted-light)] mb-3 sm:mb-4" />
        <p className="text-xs sm:text-sm text-[var(--color-muted)]">No active coupons at the moment</p>
        <p className="text-[10px] sm:text-xs text-[var(--color-muted-light)] mt-1">Check back later for exclusive offers</p>
      </div>
    </div>
  )
}