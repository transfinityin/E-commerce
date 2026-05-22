// import { useEffect, useState, useRef, useCallback } from 'react'
// import { Link } from 'react-router-dom'
// import { toast } from 'react-hot-toast'
// import {
//   Plus, Pencil, Trash2, X, Upload, Eye, EyeOff, ArrowUp, ArrowDown,
//   Image as ImageIcon, Crosshair, Sparkles, ArrowLeft
// } from 'lucide-react'
// import api from '../../services/api'

// export default function AdminHeroBanners() {
//   const [banners, setBanners] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [showForm, setShowForm] = useState(false)
//   const [editing, setEditing] = useState(null)
//   const [form, setForm] = useState({
//     title: '',
//     subtitle: '',
//     image_url: '',
//     cta_text: 'Shop Now',
//     cta_link: '/products',
//     is_active: true,
//     display_order: 0,
//   })
//   const fileInputRef = useRef(null)

//   const fetchBanners = useCallback(async () => {
//     setLoading(true)
//     try {
//       const { data } = await api.get('/core/hero-banners/')
//       setBanners(data || [])
//     } catch {
//       toast.error('Failed to load banners')
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   useEffect(() => { fetchBanners() }, [fetchBanners])

//  // handleSubmit la — form data prepare panum
// const handleSubmit = async (e) => {
//   e.preventDefault()
//   try {
//     const payload = {
//       title:         form.title,
//       subtitle:      form.subtitle,
//       image_url_direct: form.image_url,  // ← field name match
//       cta_text:      form.cta_text,
//       cta_link:      form.cta_link,
//       is_active:     form.is_active,
//       display_order: form.display_order,
//     }

//     if (editing) {
//       await api.patch(`/core/hero-banners/${editing}/`, payload)
//       toast.success('Banner updated!')
//     } else {
//       await api.post('/core/hero-banners/', payload)
//       toast.success('Banner created!')
//     }
//     // ... rest same
//   } catch {
//     toast.error('Failed to save banner')
//   }
// }

//   const handleDelete = async (id) => {
//     if (!confirm('Delete this banner?')) return
//     try {
//       await api.delete(`/core/hero-banners/${id}/`)
//       toast.success('Deleted')
//       fetchBanners()
//     } catch {
//       toast.error('Failed to delete')
//     }
//   }

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0]
//     if (!file) return
//     const formData = new FormData()
//     formData.append('image', file)
//     try {
//       const { data } = await api.post('/core/upload-image/', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       })
//       setForm(p => ({ ...p, image_url: data.url }))
//       toast.success('Image uploaded!')
//     } catch {
//       toast.error('Upload failed')
//     }
//   }

//   const handleReorder = async (id, direction) => {
//     const idx = banners.findIndex(b => b.id === id)
//     if (direction === 'up' && idx === 0) return
//     if (direction === 'down' && idx === banners.length - 1) return
//     const newOrder = [...banners]
//     const swapIdx = direction === 'up' ? idx - 1 : idx + 1
//     ;[newOrder[idx].display_order, newOrder[swapIdx].display_order] =
//       [newOrder[swapIdx].display_order, newOrder[idx].display_order]
//     setBanners(newOrder)
//     try {
//       await api.patch(`/core/hero-banners/${id}/`, { display_order: newOrder[idx].display_order })
//       await api.patch(`/core/hero-banners/${newOrder[swapIdx].id}/`, { display_order: newOrder[swapIdx].display_order })
//     } catch {
//       toast.error('Reorder failed')
//       fetchBanners()
//     }
//   }

//   const startEdit = (banner) => {
//     setEditing(banner.id)
//     setForm({
//       title: banner.title || '',
//       subtitle: banner.subtitle || '',
//       image_url: banner.image_url || '',
//       cta_text: banner.cta_text || 'Shop Now',
//       cta_link: banner.cta_link || '/products',
//       is_active: banner.is_active ?? true,
//       display_order: banner.display_order || 0,
//     })
//     setShowForm(true)
//   }

//   return (
//     <div className="min-h-screen bg-[var(--color-bg)]">
//       <div className="page-container py-8 lg:py-10">

//         {/* Header with Back Button */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
//           <div className="flex items-center gap-4">
//             {/* Back Button */}
//             <Link
//               to="/admin"
//               className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)]/30 transition-all duration-200 shrink-0"
//             >
//               <ArrowLeft size={18} />
//             </Link>
//             <div>
//               <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-1">
//                 Content Management
//               </p>
//               <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
//                 Hero Banners
//               </h1>
//             </div>
//           </div>
//           <button
//             onClick={() => {
//               setShowForm(true)
//               setEditing(null)
//               setForm({
//                 title: '', subtitle: '', image_url: '',
//                 cta_text: 'Shop Now', cta_link: '/products',
//                 is_active: true, display_order: 0,
//               })
//             }}
//             className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-sm font-semibold transition-all duration-300 px-5 py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5"
//           >
//             <Plus size={16} />
//             Add Banner
//           </button>
//         </div>

//         {/* Form */}
//         {showForm && (
//           <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-md p-6 lg:p-8 mb-6 animate-fadeIn">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-lg font-bold text-[var(--color-text)]">
//                 {editing ? 'Edit Banner' : 'Create Banner'}
//               </h2>
//               <button
//                 onClick={() => setShowForm(false)}
//                 className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center hover:bg-[var(--color-border-light)] transition-colors border-none cursor-pointer"
//               >
//                 <X size={18} className="text-[var(--color-text)]" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="flex flex-col gap-2">
//                   <label className="text-sm font-semibold text-[var(--color-text)]">Title</label>
//                   <input
//                     value={form.title}
//                     onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
//                     required
//                     className="w-full rounded-xl text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
//                     placeholder="e.g., Summer Collection"
//                   />
//                 </div>
//                 <div className="flex flex-col gap-2">
//                   <label className="text-sm font-semibold text-[var(--color-text)]">Subtitle</label>
//                   <input
//                     value={form.subtitle}
//                     onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))}
//                     className="w-full rounded-xl text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
//                     placeholder="e.g., Exclusive Collection"
//                   />
//                 </div>
//                 <div className="flex flex-col gap-2">
//                   <label className="text-sm font-semibold text-[var(--color-text)]">CTA Text</label>
//                   <input
//                     value={form.cta_text}
//                     onChange={e => setForm(p => ({ ...p, cta_text: e.target.value }))}
//                     className="w-full rounded-xl text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
//                     placeholder="Shop Now"
//                   />
//                 </div>
//                 <div className="flex flex-col gap-2">
//                   <label className="text-sm font-semibold text-[var(--color-text)]">CTA Link</label>
//                   <input
//                     value={form.cta_link}
//                     onChange={e => setForm(p => ({ ...p, cta_link: e.target.value }))}
//                     className="w-full rounded-xl text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
//                     placeholder="/products"
//                   />
//                 </div>
//               </div>

//               <div className="flex flex-col gap-2">
//                 <label className="text-sm font-semibold text-[var(--color-text)]">Image</label>
//                 <div className="flex gap-3">
//                   <input
//                     value={form.image_url}
//                     onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
//                     className="flex-1 rounded-xl text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
//                     placeholder="https://..."
//                   />
//                   <button
//                     type="button"
//                     onClick={() => fileInputRef.current?.click()}
//                     className="flex items-center gap-2 bg-[var(--color-bg-alt)] hover:bg-[var(--color-border-light)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-sm font-semibold transition-all px-4 py-3 cursor-pointer"
//                   >
//                     <Upload size={16} />
//                     Upload
//                   </button>
//                   <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
//                 </div>
//                 {form.image_url && (
//                   <img src={form.image_url} alt="Preview" className="w-32 h-20 object-cover rounded-lg border border-[var(--color-border)] mt-1" />
//                 )}
//               </div>

//               <div className="flex items-center gap-4">
//                 <label className="flex items-center gap-2 text-sm text-[var(--color-text)] cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={form.is_active}
//                     onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
//                     className="accent-[var(--color-primary)] w-4 h-4"
//                   />
//                   Active
//                 </label>
//                 <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
//                   <span>Order:</span>
//                   <input
//                     type="number"
//                     value={form.display_order}
//                     onChange={e => setForm(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))}
//                     className="w-20 rounded-lg text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-3 py-2 outline-none focus:border-[var(--color-primary)]"
//                   />
//                 </label>
//               </div>

//               <div className="flex gap-3 mt-2">
//                 <button
//                   type="submit"
//                   className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-sm font-semibold transition-all px-6 py-3 shadow-md hover:shadow-lg"
//                 >
//                   {editing ? 'Update Banner' : 'Create Banner'}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setShowForm(false)}
//                   className="inline-flex items-center gap-2 bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-sm font-semibold hover:bg-[var(--color-bg-alt)] transition-all px-6 py-3"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}

//         {/* Loading */}
//         {loading ? (
//           <div className="flex flex-col gap-4">
//             {[1, 2, 3].map(i => (
//               <div key={i} className="h-24 bg-[var(--color-bg-alt)] rounded-xl animate-pulse" />
//             ))}
//           </div>
//         ) : banners.length === 0 ? (
//           <div className="text-center py-16 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
//             <ImageIcon size={48} className="text-[var(--color-muted-light)] mx-auto mb-4" />
//             <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">No banners yet</h3>
//             <p className="text-sm text-[var(--color-muted)] mb-6">Create your first hero banner to get started.</p>
//             <button
//               onClick={() => setShowForm(true)}
//               className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-sm font-semibold transition-all px-6 py-3 shadow-md hover:shadow-lg"
//             >
//               <Plus size={16} />
//               Add Banner
//             </button>
//           </div>
//         ) : (
//           <div className="flex flex-col gap-4">
//             {banners.map((banner, index) => (
//               <div
//                 key={banner.id}
//                 className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 animate-fadeUp"
//                 style={{ animationDelay: `${index * 0.05}s` }}
//               >
//                 <div className="flex flex-col sm:flex-row">
//                   {/* Image */}
//                   <div className="w-full sm:w-48 h-32 sm:h-auto shrink-0 bg-[var(--color-bg-alt)] relative overflow-hidden">
//                     {banner.image_url ? (
//                       <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)]">
//                         <ImageIcon size={32} />
//                       </div>
//                     )}
//                     <div className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 ${
//                       banner.is_active
//                         ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
//                         : 'bg-[var(--color-muted-light)] text-[var(--color-muted)]'
//                     }`}>
//                       {banner.is_active ? 'Active' : 'Inactive'}
//                     </div>
//                   </div>

//                   {/* Content */}
//                   <div className="flex-1 p-5">
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="flex-1 min-w-0">
//                         <h3 className="text-sm font-bold text-[var(--color-text)] mb-1 truncate">{banner.title}</h3>
//                         <p className="text-xs text-[var(--color-muted)] mb-2">{banner.subtitle}</p>
//                         <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
//                           <span className="bg-[var(--color-bg-alt)] rounded-lg px-2 py-1 border border-[var(--color-border)]">
//                             CTA: {banner.cta_text}
//                           </span>
//                           <span className="bg-[var(--color-bg-alt)] rounded-lg px-2 py-1 border border-[var(--color-border)]">
//                             Order: {banner.display_order}
//                           </span>
//                         </div>
//                       </div>

//                       {/* Actions */}
//                       <div className="flex items-center gap-1.5 shrink-0">
//                         <button
//                           onClick={() => handleReorder(banner.id, 'up')}
//                           disabled={index === 0}
//                           className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center hover:bg-[var(--color-border-light)] transition-colors border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
//                         >
//                           <ArrowUp size={14} className="text-[var(--color-text)]" />
//                         </button>
//                         <button
//                           onClick={() => handleReorder(banner.id, 'down')}
//                           disabled={index === banners.length - 1}
//                           className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center hover:bg-[var(--color-border-light)] transition-colors border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
//                         >
//                           <ArrowDown size={14} className="text-[var(--color-text)]" />
//                         </button>
//                         <button
//                           onClick={() => startEdit(banner)}
//                           className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center hover:bg-[var(--color-border-light)] hover:text-[var(--color-primary)] transition-colors border-none cursor-pointer"
//                         >
//                           <Pencil size={14} className="text-[var(--color-muted)]" />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(banner.id)}
//                           className="w-8 h-8 rounded-lg bg-[var(--color-danger-bg)] flex items-center justify-center hover:bg-[var(--color-danger)] hover:text-white transition-colors border-none cursor-pointer"
//                         >
//                           <Trash2 size={14} className="text-[var(--color-danger)]" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(-8px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes fadeUp {
//           from { opacity: 0; transform: translateY(12px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease forwards;
//         }
//         .animate-fadeUp {
//           animation: fadeUp 0.4s ease forwards;
//           opacity: 0;
//         }
//       `}</style>
//     </div>
//   )
// }



import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Plus, Pencil, Trash2, X, Upload, Eye, EyeOff, ArrowUp, ArrowDown,
  Image as ImageIcon, Crosshair, Sparkles, ArrowLeft
} from 'lucide-react'
import api from '../../services/api'

export default function AdminHeroBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [uploading, setUploading] = useState(false)  // FIX: upload loading state
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    cta_text: 'Shop Now',
    cta_link: '/products',
    is_active: true,
    display_order: 0,
  })
  const fileInputRef = useRef(null)

  const fetchBanners = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/core/hero-banners/')
      setBanners(data || [])
    } catch {
      toast.error('Failed to load banners')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBanners() }, [fetchBanners])

  // FIX 1: handleSubmit — fetchBanners() + setShowForm(false) + setEditing(null) added
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        title:            form.title,
        subtitle:         form.subtitle,
        image_url_direct: form.image_url,  // field name matches backend
        cta_text:         form.cta_text,
        cta_link:         form.cta_link,
        is_active:        form.is_active,
        display_order:    form.display_order,
      }

      if (editing) {
        await api.patch(`/core/hero-banners/${editing}/`, payload)
        toast.success('Banner updated!')
      } else {
        await api.post('/core/hero-banners/', payload)
        toast.success('Banner created!')
      }

      // FIX: close form + reload list
      setShowForm(false)
      setEditing(null)
      setForm({
        title: '', subtitle: '', image_url: '',
        cta_text: 'Shop Now', cta_link: '/products',
        is_active: true, display_order: 0,
      })
      fetchBanners()  // ← reload list after save

    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to save banner'
      toast.error(msg)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return
    try {
      await api.delete(`/core/hero-banners/${id}/`)
      toast.success('Deleted')
      fetchBanners()
    } catch {
      toast.error('Failed to delete')
    }
  }

  // FIX 2: handleImageUpload — uploading state + better error message
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, WEBP allowed')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB')
      return
    }

    const formData = new FormData()
    formData.append('image', file)
    setUploading(true)
    try {
      const { data } = await api.post('/core/upload-image/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setForm(p => ({ ...p, image_url: data.url }))
      toast.success('Image uploaded!')
    } catch (err) {
      // FIX: show actual error from backend
      const msg = err.response?.data?.error || err.response?.status === 401
        ? 'Unauthorized — please login again'
        : err.response?.status === 403
          ? 'Permission denied'
          : 'Upload failed — check Cloudinary settings'
      toast.error(msg)
    } finally {
      setUploading(false)
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleReorder = async (id, direction) => {
    const idx = banners.findIndex(b => b.id === id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === banners.length - 1) return
    const newOrder = [...banners]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newOrder[idx].display_order, newOrder[swapIdx].display_order] =
      [newOrder[swapIdx].display_order, newOrder[idx].display_order]
    setBanners([...newOrder])
    try {
      await api.patch(`/core/hero-banners/${id}/`, { display_order: newOrder[idx].display_order })
      await api.patch(`/core/hero-banners/${newOrder[swapIdx].id}/`, { display_order: newOrder[swapIdx].display_order })
    } catch {
      toast.error('Reorder failed')
      fetchBanners()
    }
  }

  const startEdit = (banner) => {
    setEditing(banner.id)
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image_url: banner.image_url || '',  // comes from serializer's get_image_url
      cta_text: banner.cta_text || 'Shop Now',
      cta_link: banner.cta_link || '/products',
      is_active: banner.is_active ?? true,
      display_order: banner.display_order || 0,
    })
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container py-8 lg:py-10">

        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)]/30 transition-all duration-200 shrink-0"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-1">
                Content Management
              </p>
              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
                Hero Banners
              </h1>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditing(null)
              setForm({
                title: '', subtitle: '', image_url: '',
                cta_text: 'Shop Now', cta_link: '/products',
                is_active: true, display_order: 0,
              })
            }}
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-sm font-semibold transition-all duration-300 px-5 py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Plus size={16} />
            Add Banner
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-md p-6 lg:p-8 mb-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                {editing ? 'Edit Banner' : 'Create Banner'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center hover:bg-[var(--color-border-light)] transition-colors border-none cursor-pointer"
              >
                <X size={18} className="text-[var(--color-text)]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Title</label>
                  <input
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    required
                    className="w-full rounded-xl text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
                    placeholder="e.g., Summer Collection"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Subtitle</label>
                  <input
                    value={form.subtitle}
                    onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))}
                    className="w-full rounded-xl text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
                    placeholder="e.g., Exclusive Collection"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[var(--color-text)]">CTA Text</label>
                  <input
                    value={form.cta_text}
                    onChange={e => setForm(p => ({ ...p, cta_text: e.target.value }))}
                    className="w-full rounded-xl text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
                    placeholder="Shop Now"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[var(--color-text)]">CTA Link</label>
                  <input
                    value={form.cta_link}
                    onChange={e => setForm(p => ({ ...p, cta_link: e.target.value }))}
                    className="w-full rounded-xl text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
                    placeholder="/products"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[var(--color-text)]">Image</label>
                <div className="flex gap-3">
                  <input
                    value={form.image_url}
                    onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                    className="flex-1 rounded-xl text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
                    placeholder="https://... or upload below"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 bg-[var(--color-bg-alt)] hover:bg-[var(--color-border-light)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-sm font-semibold transition-all px-4 py-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload size={16} />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="w-32 h-20 object-cover rounded-lg border border-[var(--color-border)] mt-1"
                  />
                )}
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-[var(--color-text)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                    className="accent-[var(--color-primary)] w-4 h-4"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                  <span>Order:</span>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={e => setForm(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))}
                    className="w-20 rounded-lg text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                  />
                </label>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-sm font-semibold transition-all px-6 py-3 shadow-md hover:shadow-lg"
                >
                  {editing ? 'Update Banner' : 'Create Banner'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="inline-flex items-center gap-2 bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-sm font-semibold hover:bg-[var(--color-bg-alt)] transition-all px-6 py-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-[var(--color-bg-alt)] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-16 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
            <ImageIcon size={48} className="text-[var(--color-muted-light)] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">No banners yet</h3>
            <p className="text-sm text-[var(--color-muted)] mb-6">Create your first hero banner to get started.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-sm font-semibold transition-all px-6 py-3 shadow-md hover:shadow-lg"
            >
              <Plus size={16} />
              Add Banner
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 animate-fadeUp"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="w-full sm:w-48 h-32 sm:h-auto shrink-0 bg-[var(--color-bg-alt)] relative overflow-hidden">
                    {banner.image_url ? (
                      <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)]">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    <div className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 ${
                      banner.is_active
                        ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
                        : 'bg-[var(--color-muted-light)] text-[var(--color-muted)]'
                    }`}>
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-[var(--color-text)] mb-1 truncate">{banner.title}</h3>
                        <p className="text-xs text-[var(--color-muted)] mb-2">{banner.subtitle}</p>
                        <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
                          <span className="bg-[var(--color-bg-alt)] rounded-lg px-2 py-1 border border-[var(--color-border)]">
                            CTA: {banner.cta_text}
                          </span>
                          <span className="bg-[var(--color-bg-alt)] rounded-lg px-2 py-1 border border-[var(--color-border)]">
                            Order: {banner.display_order}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleReorder(banner.id, 'up')}
                          disabled={index === 0}
                          className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center hover:bg-[var(--color-border-light)] transition-colors border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp size={14} className="text-[var(--color-text)]" />
                        </button>
                        <button
                          onClick={() => handleReorder(banner.id, 'down')}
                          disabled={index === banners.length - 1}
                          className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center hover:bg-[var(--color-border-light)] transition-colors border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown size={14} className="text-[var(--color-text)]" />
                        </button>
                        <button
                          onClick={() => startEdit(banner)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center hover:bg-[var(--color-border-light)] hover:text-[var(--color-primary)] transition-colors border-none cursor-pointer"
                        >
                          <Pencil size={14} className="text-[var(--color-muted)]" />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-danger-bg)] flex items-center justify-center hover:bg-[var(--color-danger)] hover:text-white transition-colors border-none cursor-pointer"
                        >
                          <Trash2 size={14} className="text-[var(--color-danger)]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
        .animate-fadeUp { animation: fadeUp 0.4s ease forwards; opacity: 0; }
      `}</style>
    </div>
  )
}