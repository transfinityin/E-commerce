import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import api from '../services/api'
import { useHuntStore } from '../store/useHuntStore'
import {
  ScanLine, Copy, Check, ShoppingBag, RotateCcw, Clock,
  AlertCircle, Sparkles, Camera, Ticket, ChevronRight,
  Zap, Unlock, Star,
} from 'lucide-react'

export default function QRScanner() {
  

  const { fetchProgress } = useHuntStore()
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [revealedData, setRevealedData] = useState(null)
  const [copied, setCopied]             = useState(false)
  const [manualCode, setManualCode]     = useState('')
  const [scanActive, setScanActive] = useState(
  !new URLSearchParams(window.location.search).get('code')
)

  const scannerRef = useRef(null)
  const navigate   = useNavigate()

  const getDeviceId = () => {
    let id = localStorage.getItem('qr_device_id')
    if (!id) {
      id = `dev_${Math.random().toString(36).slice(2, 11)}`
      localStorage.setItem('qr_device_id', id)
    }
    return id
  }

  // ── URL ?code= auto-process ──────────────────────────────
  useEffect(() => {
    const params  = new URLSearchParams(window.location.search)
    const urlCode = params.get('code')
    if (!urlCode) return

    setScanActive(false)
    setLoading(true)

    const code = urlCode.trim()
    const type = code.startsWith('myst-') ? 'mystery'
               : code.startsWith('th-')   ? 'tshirt'
               : 'digital'

    console.log('QR type:', type, '| code:', code)

    const autoScan = async () => {
      try {
        let data

        if (type === 'mystery') {
          ;({ data } = await api.post('/hunt/mystery-claim/', { code }))
          console.log('mystery-claim response:', data)
          if (!data.success) throw new Error(data.message || 'Invalid code')

          if (data.reward_type === 'arc') {
            await fetchProgress()
            setRevealedData({
              kind: 'arc',
              arc_slug: data.arc_slug,
              message: data.message,
            })
          } else {
            setRevealedData({
              kind: 'coupon',
              coupon_code: data.coupon_code,
              discount: data.discount,
              message: data.message,
              title: 'Mystery Reward',
              expires_at: null,
            })
          }

        } else if (type === 'tshirt') {
          ;({ data } = await api.post('/hunt/activate/', { code }))
          if (!data.success) throw new Error(data.message || data.error)
          await fetchProgress()
          setRevealedData({
            kind: 'tshirt',
            message: data.message,
            current_level: data.progress?.current_level || 1,
          })

        } else {
          ;({ data } = await api.post('/coupons/qr-scan/', {
            qr_code_id: code,
            device_id: getDeviceId(),
          }))
          if (!data.success) throw new Error(data.message)
          setRevealedData({
            kind: 'coupon',
            coupon_code: data.coupon_code,
            discount: data.discount,
            message: data.message,
            title: data.title,
            expires_at: data.expires_at,
          })
        }

      } catch (err) {
        console.error('autoScan error:', err.response?.data || err.message)
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Failed'
        )
      } finally {
        setLoading(false)
        window.history.replaceState({}, '', '/scan')
      }
    }

    autoScan()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Camera scanner ───────────────────────────────────────
  useEffect(() => {
    if (!revealedData && !error && scanActive) initScanner()
    return () => { scannerRef.current?.clear().catch(() => {}) }
  }, [revealedData, error, scanActive])

  const initScanner = () => {
    const el = document.getElementById('qr-reader')
    if (!el) return
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { qrbox: { width: 250, height: 250 }, fps: 5 },
      false
    )
    scanner.render(onScanSuccess, () => {})
    scannerRef.current = scanner
  }

  const onScanSuccess = async (decodedText) => {
    await scannerRef.current?.clear().catch(() => {})
    setScanActive(false)
    await handleScan(decodedText)
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!manualCode.trim()) return
    setScanActive(false)
    handleScan(manualCode.trim())
  }

  // ── Manual / camera scan handler ─────────────────────────
  // const handleScan = async (raw) => {
  //   setLoading(true)
  //   setError('')

  //   const code = raw.trim()
  //   const type = code.startsWith('myst-') ? 'mystery'
  //              : code.startsWith('th-')   ? 'tshirt'
  //              : 'digital'
  //   console.log('handleScan → type:', type, 'code:', code)
  //   try {
  //     let data

  //     if (type === 'mystery') {
  //       ;({ data } = await api.post('/hunt/mystery-claim/', { code }))
  //       if (!data.success) throw new Error(data.message || 'Invalid Mystery Card')

  //       if (data.reward_type === 'arc') {
  //         await fetchProgress()
  //         setRevealedData({
  //           kind: 'arc',
  //           arc_slug: data.arc_slug,
  //           message: data.message,
  //         })
  //       } else {
  //         setRevealedData({
  //           kind: 'coupon',
  //           coupon_code: data.coupon_code,
  //           discount: data.discount,
  //           message: data.message,
  //           title: 'Mystery Reward',
  //           expires_at: null,
  //         })
  //       }

  //     } else if (type === 'tshirt') {
  //       ;({ data } = await api.post('/hunt/activate/', { code }))
  //       if (!data.success) throw new Error(data.message || data.error || 'Activation failed')
  //       await fetchProgress()
  //       setRevealedData({
  //         kind: 'tshirt',
  //         message: data.message,
  //         current_level: data.progress?.current_level || 1,
  //       })

  //     } else {
  //       ;({ data } = await api.post('/coupons/qr-scan/', {
  //         qr_code_id: code,
  //         device_id: getDeviceId(),
  //       }))
  //       if (!data.success) throw new Error(data.message || 'Invalid QR Code')
  //       setRevealedData({
  //         kind: 'coupon',
  //         coupon_code: data.coupon_code,
  //         discount: data.discount,
  //         message: data.message,
  //         title: data.title,
  //         expires_at: data.expires_at,
  //       })
  //     }

  //   } catch (err) {
  //     setError(
  //       err.response?.data?.message ||
  //       err.response?.data?.error ||
  //       err.message ||
  //       'Network error. Please try again.'
  //     )
  //   } finally {
  //     setLoading(false)
  //   }
  // }
// const handleScan = async (raw) => {
//   console.log('RAW:', raw)
//   const code = raw.trim()
//   console.log('TRIMMED:', code)
//   console.log('startsWith myst-?', code.startsWith('myst-'))
//   console.log('startsWith th-?', code.startsWith('th-'))
//   setLoading(true)
//   setError('')

//   const code = raw.trim()
  
//   // ✅ CORRECT: First check prefix, then route
//   if (code.startsWith('myst-')) {
//     // Mystery card → /hunt/mystery-claim/
//     try {
//       let data
//       let response // Ippo response-a vachukalam
//       const { data } = await api.post('/hunt/mystery-claim/', { code })
//       if (!data.success) throw new Error(data.message || 'Invalid code')

//       if (data.reward_type === 'arc') {
//         await fetchProgress()
//         setRevealedData({
//           kind: 'arc',
//           arc_slug: data.arc_slug,
//           message: data.message,
//         })
//       } else {
//         setRevealedData({
//           kind: 'coupon',
//           coupon_code: data.coupon_code,
//           discount: data.discount,
//           message: data.message,
//           title: 'Mystery Reward',
//           expires_at: null,
//         })
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || err.message || 'Failed')
//     } finally {
//       setLoading(false)
//     }
//     return
//   }

//   if (code.startsWith('th-')) {
//     // T-shirt hunt → /hunt/activate/
//     try {
//       const { data } = await api.post('/hunt/activate/', { code })
//       if (!data.success) throw new Error(data.message || 'Activation failed')
//       await fetchProgress()
//       setRevealedData({
//         kind: 'tshirt',
//         message: data.message,
//         current_level: data.progress?.current_level || 1,
//       })
//     } catch (err) {
//       setError(err.response?.data?.message || err.message || 'Failed')
//     } finally {
//       setLoading(false)
//     }
//     return
//   }

//   // Everything else → /coupons/qr-scan/
//   try {
//     const { data } = await api.post('/coupons/qr-scan/', {
//       qr_code_id: code,
//       device_id: getDeviceId(),
//     })
//     if (!data.success) throw new Error(data.message || 'Invalid QR Code')
//     setRevealedData({
//       kind: 'coupon',
//       coupon_code: data.coupon_code,
//       discount: data.discount,
//       message: data.message,
//       title: data.title,
//       expires_at: data.expires_at,
//     })
//   } catch (err) {
//     setError(err.response?.data?.message || err.message || 'Network error')
//   } finally {
//     setLoading(false)
//   }
// }

// ── Main scan handler update ─────────────────────────────
  const handleScan = async (raw) => {
    setLoading(true)
    setError('')

    const { type, code } = detectQRType(raw)

    try {
      let data
      let response // Ippo response-a vachukalam

      // 1. MYSTERY CARD (Arc or Coupon)
      if (type === 'mystery') {
        console.log("Calling Mystery Claim API with:", code)
        // Correct path: /api/hunt/mystery-claim/
        const res = await api.post('/hunt/mystery-claim/', { code }) 
        data = res.data

        if (!data.success) throw new Error(data.message || 'Invalid Mystery Card')

        if (data.reward_type === 'arc') {
          setRevealedData({ kind: 'arc', arc_slug: data.arc_slug, message: data.message })
        } else {
          setRevealedData({ 
            kind: 'coupon', coupon_code: data.coupon_code, discount: data.discount, 
            message: data.message, title: 'Mystery Reward', expires_at: null 
          })
          saveToLocalStorage({ code: data.coupon_code, discount: data.discount, title: 'Mystery Reward', expires_at: null })
        }

      // 2. T-SHIRT HUNT
      } else if (type === 'tshirt') {
        const res = await api.post('/hunt/activate/', { code })
        data = res.data
        setRevealedData({ kind: 'tshirt', message: data.message, current_level: data.progress?.current_level || 1 })

      // 3. DIGITAL OFFER (Existing)
      } else {
        const res = await api.post('/coupons/qr-scan/', { qr_code_id: code, device_id: getDeviceId() })
        data = res.data
        setRevealedData({ 
            kind: 'coupon', coupon_code: data.coupon_code, discount: data.discount, 
            message: data.message, title: data.title, expires_at: data.expires_at 
        })
        saveToLocalStorage({ code: data.coupon_code, discount: data.discount, title: data.title, expires_at: data.expires_at })
      }

    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Invalid or already used QR Code')
    } finally {
      setLoading(false)
    }
  }
  const handleCopyCode = async () => {
    if (!revealedData?.coupon_code) return
    try {
      await navigator.clipboard.writeText(revealedData.coupon_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { setCopied(false) }
  }

  const handleRescan = () => {
    setRevealedData(null)
    setError('')
    setManualCode('')
    setCopied(false)
    setScanActive(true)
  }

  const savedCoupons = JSON.parse(localStorage.getItem('qr_coupons') || '[]')
  const inputClass = 'input-gold flex-1 px-4 py-3 sm:px-5 sm:py-4 text-sm text-white placeholder:text-muted/50'

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
      <main className="w-full max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">

        {/* Header */}
        <section className="text-center mb-7 sm:mb-9 animate-fadeUp">
          <div className="w-14 h-14 border border-gold/25 bg-gold/10 flex items-center justify-center mx-auto mb-5 animate-gold-pulse">
            <Zap size={22} className="text-gold" />
          </div>
          <p className="label-gold mb-3">Exclusive Offers</p>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white tracking-[0.12em] leading-tight mb-3">
            SCAN & <span className="text-gradient-gold">REVEAL</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed max-w-sm mx-auto">
            Point your camera at a Transfinity QR code to unlock secret discounts or story arcs.
          </p>
        </section>

        {/* Main Card */}
        <section className="card-dark overflow-hidden mb-6 border border-gold/20 shadow-[0_0_40px_rgba(212,175,55,0.08)]">

          {/* Scanner View */}
          {!revealedData && !error && !loading && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="relative overflow-hidden bg-black min-h-[300px] sm:min-h-[340px] border border-gold/15 shadow-inner scanner-frame">
                <div className="absolute w-8 h-8 border-l-2 border-t-2 border-gold top-5 left-5 z-20" />
                <div className="absolute w-8 h-8 border-r-2 border-t-2 border-gold top-5 right-5 z-20" />
                <div className="absolute w-8 h-8 border-l-2 border-b-2 border-gold bottom-5 left-5 z-20" />
                <div className="absolute w-8 h-8 border-r-2 border-b-2 border-gold bottom-5 right-5 z-20" />
                <div className="absolute left-5 right-5 h-[2px] bg-gold/80 z-20 animate-scanLine shadow-[0_0_22px_rgba(212,175,55,0.8)]" />
                <div className="absolute inset-0 opacity-10 z-10 grid-bg pointer-events-none" />
                <div id="qr-reader" className="relative z-0 min-h-[300px] sm:min-h-[340px]" />
              </div>
              <div className="flex items-center justify-center text-muted text-xs mt-5 gap-2 font-mono tracking-wider">
                <Camera size={16} className="text-gold" />
                <span>Position QR code within the golden frame</span>
              </div>
              <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row mt-6 gap-3">
                <input
                  type="text"
                  placeholder="Or enter code manually..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className={inputClass}
                />
                <button type="submit" className="btn-primary btn-mobile-full min-h-[52px] inline-flex items-center justify-center gap-2">
                  <ScanLine size={16} /> SCAN
                </button>
              </form>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center text-center py-16 lg:py-20 px-6">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-2 border-gold/15 border-t-gold rounded-full animate-spin" />
                <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-gold/40 rounded-full animate-spin reverse-spin" />
              </div>
              <p className="text-sm font-mono tracking-wider text-white mb-1">Revealing your exclusive offer...</p>
              <p className="text-xs text-muted font-mono tracking-wider">Please wait a moment.</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex flex-col items-center text-center py-12 lg:py-16 px-6">
              <div className="w-16 h-16 border border-red-400/25 bg-red-400/10 text-red-400 flex items-center justify-center mb-5">
                <AlertCircle size={32} />
              </div>
              <p className="label-gold mb-3">Scan Failed</p>
              <h3 className="font-display text-xl sm:text-2xl text-white tracking-[0.12em] mb-2">
                ACCESS <span className="text-gradient-gold">DENIED</span>
              </h3>
              <p className="text-sm text-muted font-mono tracking-wider leading-relaxed mb-2 max-w-xs">{error}</p>
              <p className="text-xs text-muted font-mono tracking-wider mb-8">Try scanning again or enter the code manually.</p>
              <button type="button" className="btn-primary inline-flex items-center justify-center gap-2" onClick={handleRescan}>
                <RotateCcw size={16} /> TRY AGAIN
              </button>
            </div>
          )}

          {/* Success: Arc Unlock */}
          {revealedData?.kind === 'arc' && (
            <div className="text-center py-10 lg:py-12 px-5 sm:px-6 lg:px-8">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto border border-gold/30 bg-gold/10 flex items-center justify-center mb-5 animate-gold-pulse">
                  <Unlock size={40} className="text-gold" />
                </div>
                <p className="label-gold mb-3">Arc Unlocked</p>
                <h2 className="font-display text-2xl lg:text-3xl text-white tracking-[0.12em] mb-2">
                  SECRET <span className="text-gradient-gold">REVEALED</span>
                </h2>
                <p className="text-sm text-muted font-mono tracking-wider leading-relaxed">{revealedData.message}</p>
              </div>
              <div className="bg-black border border-gold/20 relative overflow-hidden py-8 px-5 mb-6">
                <div className="absolute w-[140px] h-[140px] rounded-full bg-gold/10 -top-12 -right-12" />
                <div className="absolute w-[100px] h-[100px] rounded-full bg-gold/10 -bottom-8 -left-8" />
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gold/50 animate-pulse" />
                <p className="relative z-10 text-xs font-mono uppercase tracking-[0.2em] text-muted mb-3">New Story Arc</p>
                <div className="relative z-10 font-display text-4xl text-gradient-gold mb-2 tracking-wider uppercase">
                  {revealedData.arc_slug?.replace(/-/g, ' ')}
                </div>
                <p className="relative z-10 text-xs text-muted font-mono mt-2">
                  Visit the Arcs page to explore your new story chapter.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button type="button" className="btn-primary w-full min-h-[52px] inline-flex items-center justify-center gap-2" onClick={() => navigate('/arcs')}>
                  <Star size={18} /> EXPLORE YOUR ARC <ChevronRight size={16} />
                </button>
                <button type="button" className="btn-outline w-full min-h-[48px] inline-flex items-center justify-center gap-2" onClick={handleRescan}>
                  <RotateCcw size={16} /> SCAN ANOTHER CODE
                </button>
              </div>
            </div>
          )}

          {/* Success: T-Shirt */}
          {revealedData?.kind === 'tshirt' && (
            <div className="text-center py-10 lg:py-12 px-5 sm:px-6 lg:px-8">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto border border-gold/30 bg-gold/10 flex items-center justify-center mb-5 animate-gold-pulse">
                  <Sparkles size={40} className="text-gold" />
                </div>
                <p className="label-gold mb-3">Hunt Activated</p>
                <h2 className="font-display text-2xl lg:text-3xl text-white tracking-[0.12em] mb-2">
                  LEVEL <span className="text-gradient-gold">{revealedData.current_level}</span> UNLOCKED
                </h2>
                <p className="text-sm text-muted font-mono tracking-wider leading-relaxed">{revealedData.message}</p>
              </div>
              <div className="bg-black border border-gold/20 py-6 px-5 mb-6">
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted mb-2">Your Hunt Begins</p>
                <p className="text-sm text-white font-mono">Find all 5 locations to complete the Treasure Hunt and win exclusive rewards!</p>
              </div>
              <div className="flex flex-col gap-3">
                <button type="button" className="btn-primary w-full min-h-[52px] inline-flex items-center justify-center gap-2" onClick={() => navigate('/hunt')}>
                  <Zap size={18} /> START HUNT <ChevronRight size={16} />
                </button>
                <button type="button" className="btn-outline w-full min-h-[48px] inline-flex items-center justify-center gap-2" onClick={handleRescan}>
                  <RotateCcw size={16} /> SCAN ANOTHER CODE
                </button>
              </div>
            </div>
          )}

          {/* Success: Coupon */}
          {revealedData?.kind === 'coupon' && (
            <div className="text-center py-10 lg:py-12 px-5 sm:px-6 lg:px-8">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto border border-gold/30 bg-gold/10 flex items-center justify-center mb-5 animate-gold-pulse">
                  <Sparkles size={40} className="text-gold" />
                </div>
                <p className="label-gold mb-3">Offer Unlocked</p>
                <h2 className="font-display text-2xl lg:text-3xl text-white tracking-[0.12em] mb-2">CONGRATULATIONS</h2>
                <p className="text-sm text-muted font-mono tracking-wider leading-relaxed">{revealedData.message}</p>
              </div>
              <div className="bg-black border border-gold/20 relative overflow-hidden py-8 px-5 sm:px-6 lg:px-8 mb-6 shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
                <div className="absolute w-[140px] h-[140px] rounded-full bg-gold/10 -top-12 -right-12" />
                <div className="absolute w-[100px] h-[100px] rounded-full bg-gold/10 -bottom-8 -left-8" />
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gold/50 animate-pulse" />
                <div className="absolute bottom-8 left-8 w-1.5 h-1.5 rounded-full bg-gold/40 animate-pulse" />
                <p className="relative z-10 text-xs font-mono uppercase tracking-[0.2em] text-muted mb-3">You Won</p>
                <div className="relative z-10 font-display text-6xl lg:text-7xl text-gradient-gold mb-2 tracking-tight">
                  {revealedData.discount}<span className="text-3xl lg:text-4xl">%</span>
                </div>
                <p className="relative z-10 text-sm sm:text-base font-mono tracking-wider text-white mb-6">{revealedData.title}</p>
                <div className="relative z-10 flex items-center bg-[#0A0A0A] border border-gold/20 py-3 px-3 sm:px-4 gap-3">
                  <span className="flex-1 font-mono text-base sm:text-lg text-white tracking-wider truncate">{revealedData.coupon_code}</span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className={`flex items-center text-xs font-mono tracking-wider uppercase transition-all px-3 sm:px-4 py-2.5 gap-1.5 ${copied ? 'bg-gold text-black' : 'bg-gold/10 text-gold border border-gold/20 hover:bg-gold hover:text-black'}`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="relative z-10 flex items-center justify-center text-muted text-xs mt-4 gap-1.5 font-mono">
                  <Clock size={14} />
                  <span>Valid until {revealedData.expires_at ? new Date(revealedData.expires_at).toLocaleTimeString() : 'limited time'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button type="button" className="btn-primary w-full min-h-[52px] inline-flex items-center justify-center gap-2" onClick={() => navigate('/products')}>
                  <ShoppingBag size={18} /> START SHOPPING <ChevronRight size={16} />
                </button>
                <button type="button" className="btn-outline w-full min-h-[48px] inline-flex items-center justify-center gap-2" onClick={handleRescan}>
                  <RotateCcw size={16} /> SCAN ANOTHER CODE
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Saved Coupons */}
        {savedCoupons.length > 0 && !revealedData && (
          <section className="card-dark p-5 sm:p-6 lg:p-8 animate-fadeUp">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 border border-gold/20 bg-gold/10 flex items-center justify-center">
                <Ticket size={16} className="text-gold" />
              </div>
              <h3 className="font-display text-sm sm:text-base text-white tracking-[0.12em]">SAVED OFFERS</h3>
              <span className="ml-auto text-xs font-mono text-gold bg-gold/10 border border-gold/20 px-2.5 py-1">{savedCoupons.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {savedCoupons.slice(-3).reverse().map((coupon, index) => (
                <div key={`${coupon.code}-${index}`} className="flex items-center justify-between gap-3 bg-black border border-gold/10 py-3.5 px-4 hover:border-gold/35 transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 bg-gold text-black flex items-center justify-center text-sm font-display shrink-0">{coupon.discount}%</div>
                    <div className="min-w-0">
                      <span className="text-sm font-mono text-white group-hover:text-gold transition-colors truncate block">{coupon.title}</span>
                      <span className="text-xs text-muted font-mono">Expires {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'soon'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs text-gold bg-[#0A0A0A] border border-gold/15 px-3 py-1.5">{coupon.code}</span>
                    <ChevronRight size={14} className="text-muted hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <style>{`
        @keyframes scanLine {
          0% { top: 10%; opacity: 0.2; }
          10% { opacity: 1; }
          50% { top: 85%; opacity: 1; }
          90% { opacity: 1; }
          100% { top: 10%; opacity: 0.2; }
        }
        .animate-scanLine { animation: scanLine 2.5s linear infinite; }
        @keyframes scannerPulse {
          0%, 100% { box-shadow: 0 0 0 rgba(212,175,55,0); }
          50% { box-shadow: 0 0 35px rgba(212,175,55,0.14); }
        }
        .scanner-frame { animation: scannerPulse 2.2s ease-in-out infinite; }
        .reverse-spin { animation-direction: reverse; animation-duration: 1.5s; }
        #qr-reader { color: #ffffff; font-family: monospace; }
        #qr-reader video { object-fit: cover !important; min-height: 300px; }
        #qr-reader__dashboard_section { background: #050505 !important; border-top: 1px solid rgba(212,175,55,0.15) !important; padding: 12px !important; }
        #qr-reader button { background: #D4AF37 !important; color: #000 !important; border: none !important; padding: 8px 14px !important; font-size: 12px !important; font-family: monospace !important; text-transform: uppercase !important; letter-spacing: 0.12em !important; }
        #qr-reader select { background: #000 !important; color: #fff !important; border: 1px solid rgba(212,175,55,0.2) !important; padding: 8px !important; font-size: 12px !important; }
      `}</style>
    </div>
  )
}