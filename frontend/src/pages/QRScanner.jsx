// import { useEffect, useRef, useState } from 'react'
// import { Html5Qrcode } from 'html5-qrcode'
// import { useNavigate } from 'react-router-dom'
// import { useHuntStore } from '../store/useHuntStore'
// import { huntService } from '../services/huntApi'
// import { toast } from 'react-hot-toast'

// const QRScanner = () => {
//   const scannerRef = useRef(null)
//   const html5QrCodeRef = useRef(null)

//   const [isScanning, setIsScanning] = useState(false)
//   const [scanMode, setScanMode] = useState('tshirt')
//   const [locationCoords, setLocationCoords] = useState(null)

//   const navigate = useNavigate()
//   const { setProgress, setLoading, unlockLevel } = useHuntStore()

//   const getCurrentPosition = () => {
//     return new Promise((resolve, reject) => {
//       if (!navigator.geolocation) {
//         reject(new Error('Geolocation not supported'))
//         return
//       }

//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           resolve({
//             lat: position.coords.latitude,
//             long: position.coords.longitude,
//             accuracy: position.coords.accuracy,
//           })
//         },
//         (error) => reject(error),
//         { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//       )
//     })
//   }

//   const startScanner = async () => {
//     try {
//       const html5QrCode = new Html5Qrcode('qr-reader')
//       html5QrCodeRef.current = html5QrCode

//       await html5QrCode.start(
//         { facingMode: 'environment' },
//         {
//           fps: 10,
//           qrbox: { width: 220, height: 220 },
//         },
//         onScanSuccess,
//         onScanFailure
//       )

//       setIsScanning(true)
//     } catch (err) {
//       toast.error('Camera access denied or not available')
//       console.error('Scanner error:', err)
//     }
//   }

//   const stopScanner = async () => {
//     if (html5QrCodeRef.current && isScanning) {
//       await html5QrCodeRef.current.stop()
//       setIsScanning(false)
//     }
//   }

// const onScanSuccess = async (decodedText) => {
//   await stopScanner()

//   let code = decodedText

//   try {
//     const url = new URL(decodedText)

//     const codeParam = url.searchParams.get('code')
//     const locParam = url.searchParams.get('loc')

//     if (codeParam) {
//       code = codeParam
//     } else if (locParam) {
//       code = locParam
//     }
//   } catch {
//     code = decodedText
//   }

//   code = code.trim()

//   console.log('QR CODE SENT TO BACKEND:', code)

//   setLoading(true)

//   try {
//     if (scanMode === 'tshirt') {
//       const result = await huntService.activateQR(code)
      
//       if (result.success) {
//         setProgress(result.progress)
//         toast.success('🎉 Treasure Hunt Activated! Level 1 unlocked!')
//         navigate('/hunt/dashboard')
//       }
//     }
//   } catch (error) {
//     toast.error(error.message || 'Scan failed')
//   } finally {
//     setLoading(false)
//   }
// }

//   const onScanFailure = () => {}

//   useEffect(() => {
//     return () => {
//       stopScanner()
//     }
//   }, [])

//   return (
//     <div className="min-h-screen bg-black text-[var(--color-text)] font-body overflow-x-hidden">
//       {/* Header */}
//       <header className="fixed top-0 left-0 right-0 z-[9999] bg-black/95 border-b border-gold/10 backdrop-blur-md">
//         <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
//           <div className="flex items-center gap-3">
//             <span className="text-gold text-xl">∞</span>
//             <span className="font-display text-gold text-xs sm:text-sm tracking-[0.28em]">
//               TRANSFINITY
//             </span>
//           </div>

//           <button
//             onClick={() => navigate('/hunt')}
//             className="text-muted hover:text-gold transition-colors bg-transparent border-none cursor-pointer"
//             aria-label="Close scanner"
//           >
//             <svg
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={1.5}
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>
//         </div>
//       </header>

//       {/* Main */}
//       <main className="mx-auto w-full max-w-[760px] px-4 sm:px-6 pt-24 sm:pt-28 pb-12">
//         {/* Title */}
//         <section className="text-center mb-6 sm:mb-8 animate-fadeUp">
//           <p className="label-gold mb-2 text-[10px] sm:text-xs">
//             SCANNER PROTOCOL
//           </p>

//           <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-[0.18em] text-white mb-2">
//             QR SCANNER
//           </h1>

//           <p className="text-muted text-xs sm:text-sm">
//             Scan your artifact or location beacon
//           </p>
//         </section>

//         {/* Mode Toggle */}
//         <section className="flex bg-[#080808] border border-gold/15 p-1 mb-5 sm:mb-6">
//           <button
//             onClick={() => {
//               stopScanner()
//               setScanMode('tshirt')
//             }}
//             className={`flex-1 py-3 text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-300 border-none cursor-pointer ${
//               scanMode === 'tshirt'
//                 ? 'bg-gold text-black'
//                 : 'bg-transparent text-muted hover:text-gold'
//             }`}
//           >
//             ARTIFACT QR
//           </button>

//           <button
//             onClick={() => {
//               stopScanner()
//               setScanMode('location')
//             }}
//             className={`flex-1 py-3 text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-300 border-none cursor-pointer ${
//               scanMode === 'location'
//                 ? 'bg-gold text-black'
//                 : 'bg-transparent text-muted hover:text-gold'
//             }`}
//           >
//             BEACON QR
//           </button>
//         </section>

//         {/* Scanner Container */}
//         <section className="relative overflow-hidden border border-gold/15 bg-[#050505] mb-6 animate-fadeUp shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
//           <div
//             id="qr-reader"
//             className="w-full h-[280px] sm:h-[340px] md:h-[380px] bg-black"
//             ref={scannerRef}
//           />

//           {!isScanning && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black/92 backdrop-blur-sm">
//               <div className="text-center px-4">
//                 <div className="w-16 h-16 sm:w-20 sm:h-20 border border-gold/20 flex items-center justify-center mx-auto mb-5 animate-gold-pulse">
//                   <svg
//                     className="w-7 h-7 sm:w-8 sm:h-8 text-gold"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={1}
//                       d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
//                     />
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={1}
//                       d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
//                     />
//                   </svg>
//                 </div>

//                 <button onClick={startScanner} className="btn-primary">
//                   INITIATE SCANNER
//                 </button>
//               </div>
//             </div>
//           )}

//           {isScanning && (
//             <div className="absolute inset-0 pointer-events-none">
//               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />

//               <div className="absolute top-1/2 left-1/2 w-52 h-52 sm:w-60 sm:h-60 -translate-x-1/2 -translate-y-1/2">
//                 <div className="absolute -top-1 -left-1 w-8 h-8 border-t border-l border-gold" />
//                 <div className="absolute -top-1 -right-1 w-8 h-8 border-t border-r border-gold" />
//                 <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b border-l border-gold" />
//                 <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b border-r border-gold" />

//                 <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2">
//                   <div className="absolute top-1/2 left-0 right-0 h-px bg-gold/50" />
//                   <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gold/50" />
//                 </div>
//               </div>

//               <div className="absolute bottom-6 left-0 right-0 text-center">
//                 <p className="label-gold animate-pulse text-[10px]">
//                   {scanMode === 'tshirt'
//                     ? 'SCAN ARTIFACT CODE'
//                     : 'SCAN BEACON CODE'}
//                 </p>
//               </div>
//             </div>
//           )}
//         </section>

//         {/* Manual Entry */}
//         <section className="mb-6 animate-fadeUp">
//           <div className="flex items-center gap-4 mb-4">
//             <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
//             <span className="label-gold text-[9px] sm:text-[10px]">
//               OR ENTER MANUALLY
//             </span>
//             <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
//           </div>

//           <ManualEntryForm mode={scanMode} />
//         </section>

//         {/* Instructions */}
//         <section className="border border-gold/15 bg-[#050505] p-4 sm:p-5 animate-fadeUp">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="w-8 h-8 border border-gold/20 flex items-center justify-center">
//               <span className="text-gold text-xs">∞</span>
//             </div>

//             <h3 className="heading-card text-sm">
//               {scanMode === 'tshirt' ? 'ARTIFACT PROTOCOL' : 'BEACON PROTOCOL'}
//             </h3>
//           </div>

//           <ul className="space-y-3">
//             {scanMode === 'tshirt' ? (
//               <>
//                 <Instruction text="Locate the QR sigil inside your artifact packaging" />
//                 <Instruction text="Scan to activate your treasure hunt sequence" />
//                 <Instruction text="One sigil = One wanderer anti-replication protocol" />
//               </>
//             ) : (
//               <>
//                 <Instruction text="Navigate to the coordinates revealed in your clue" />
//                 <Instruction text="Locate the beacon QR at the destination" />
//                 <Instruction text="Must be within 100 meters with GPS verification" />
//               </>
//             )}
//           </ul>
//         </section>
//       </main>
//     </div>
//   )
// }

// function Instruction({ text }) {
//   return (
//     <li className="flex items-start gap-3 text-muted text-xs sm:text-sm">
//       <span className="text-gold mt-1 text-xs">◆</span>
//       <span>{text}</span>
//     </li>
//   )
// }

// const ManualEntryForm = ({ mode }) => {
//   const navigate = useNavigate()
//   const [code, setCode] = useState('')
//   const { setProgress, setLoading, unlockLevel } = useHuntStore()

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!code.trim()) return

//     setLoading(true)

//     try {
//       if (mode === 'tshirt') {
//         const result = await huntService.activateQR(code.trim())

//         if (result.success) {
//           setProgress(result.progress)
//           toast.success('🎉 Hunt activated!')
//           navigate('/hunt/dashboard')
//         }
//       } else {
//         const coords = await new Promise((resolve, reject) => {
//           navigator.geolocation.getCurrentPosition(
//             (pos) =>
//               resolve({
//                 lat: pos.coords.latitude,
//                 long: pos.coords.longitude,
//               }),
//             reject,
//             { enableHighAccuracy: true }
//           )
//         })

//         const result = await huntService.verifyLocation(
//           code.trim(),
//           coords.lat,
//           coords.long
//         )

//         if (result.success) {
//           unlockLevel(result.progress.current_level, result.reward)
//           setProgress(result.progress)
//           toast.success('🎊 Level completed!')
//           navigate('/hunt/dashboard', {
//             state: { showReward: true, reward: result.reward },
//           })
//         }
//       }
//     } catch (error) {
//       toast.error(error.message || 'Scan failed')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
//       <input
//         type="text"
//         value={code}
//         onChange={(e) => setCode(e.target.value)}
//         placeholder={
//           mode === 'tshirt'
//             ? 'Enter artifact code (th-xxx)'
//             : 'Enter beacon code (loc-xxx)'
//         }
//         className="input-gold flex-1 px-4 py-3 text-sm"
//       />

//       <button type="submit" className="btn-primary btn-mobile-full">
//         Submit
//       </button>
//     </form>
//   )
// }

// export default QRScanner




import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useNavigate, useParams } from 'react-router-dom'
import { useHuntStore } from '../store/useHuntStore'
import { huntService } from '../services/huntApi'
import api from '../services/api'
import { toast } from 'react-hot-toast'

const QRScanner = () => {
  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)
  const { qrCodeId } = useParams() // Get ID from URL if user scans from phone camera

  const [isScanning, setIsScanning] = useState(false)
  const [scanMode, setScanMode] = useState('tshirt')
  const [locationCoords, setLocationCoords] = useState(null)

  const navigate = useNavigate()
  const { setProgress, setLoading, unlockLevel } = useHuntStore()

  // NEW: Handle direct URL scans (e.g., from Phone Camera)
  useEffect(() => {
    if (qrCodeId) {
      handleCouponScan(qrCodeId)
    }
  }, [qrCodeId])

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, long: position.coords.longitude, accuracy: position.coords.accuracy }),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    })
  }

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader')
      html5QrCodeRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        onScanSuccess,
        onScanFailure
      )
      setIsScanning(true)
    } catch (err) {
      toast.error('Camera access denied or not available')
      console.error('Scanner error:', err)
    }
  }

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      await html5QrCodeRef.current.stop()
      setIsScanning(false)
    }
  }

  // NEW: Logic for claiming a QR Coupon
  const handleCouponScan = async (codeId) => {
    setLoading(true)
    try {
      const { data } = await api.post('/coupons/qr-scan/', { qr_code_id: codeId })
      
      if (data.success) {
        toast.success(`🎉 You won ${data.discount}% OFF! Code: ${data.coupon_code}`, { duration: 5000 })
        
        // Save to localStorage so Checkout page can auto-apply it
        const savedCoupons = JSON.parse(localStorage.getItem('qr_coupons') || '[]')
        savedCoupons.push({ code: data.coupon_code, discount: data.discount, expires_at: data.expires_at })
        localStorage.setItem('qr_coupons', JSON.stringify(savedCoupons))
        
        // Redirect to products so they can shop
        navigate('/products') 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or Expired Offer')
      navigate('/scan') // Clear the URL parameter
    } finally {
      setLoading(false)
    }
  }

  const onScanSuccess = async (decodedText) => {
    await stopScanner()
    let code = decodedText

    try {
      const url = new URL(decodedText)
      // Check if it's our direct scan URL format
      if (url.pathname.startsWith('/scan/')) {
        code = url.pathname.split('/').pop()
      } else {
        const codeParam = url.searchParams.get('code')
        const locParam = url.searchParams.get('loc')
        if (codeParam) code = codeParam
        else if (locParam) code = locParam
      }
    } catch {
      code = decodedText
    }
    code = code.trim()
    console.log('QR CODE SCANNED:', code)

    // SMART ROUTING: Check code type and send to right backend API
    if (code.startsWith('th-')) {
      handleHuntScan(code)
    } else if (code.startsWith('loc-')) {
      // Logic for location hunt (you can move your manual logic here)
      handleHuntScan(code, true) 
    } else {
      // If it doesn't have th- or loc- prefix, assume it's a Coupon QR Offer
      handleCouponScan(code)
    }
  }

  const handleHuntScan = async (code, isLocation = false) => {
    setLoading(true)
    try {
      if (!isLocation) {
        const result = await huntService.activateQR(code)
        if (result.success) {
          setProgress(result.progress)
          toast.success('🎉 Treasure Hunt Activated! Level 1 unlocked!')
          navigate('/hunt/dashboard')
        }
      }
      // Add location scan logic here if needed
    } catch (error) {
      toast.error(error.message || 'Scan failed')
    } finally {
      setLoading(false)
    }
  }

  const onScanFailure = () => {}

  useEffect(() => {
    return () => stopScanner()
  }, [])

  return (
    <div className="min-h-screen bg-black text-[var(--color-text)] font-body overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[9999] bg-black/95 border-b border-gold/10 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex items-center gap-3">
            <span className="text-gold text-xl">∞</span>
            <span className="font-display text-gold text-xs sm:text-sm tracking-[0.28em]">
              TRANSFINITY
            </span>
          </div>

          <button
            onClick={() => navigate('/hunt')}
            className="text-muted hover:text-gold transition-colors bg-transparent border-none cursor-pointer"
            aria-label="Close scanner"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-[760px] px-4 sm:px-6 pt-24 sm:pt-28 pb-12">
        {/* Title */}
        <section className="text-center mb-6 sm:mb-8 animate-fadeUp">
          <p className="label-gold mb-2 text-[10px] sm:text-xs">SCANNER PROTOCOL</p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-[0.18em] text-white mb-2">
            QR SCANNER
          </h1>
          <p className="text-muted text-xs sm:text-sm">Scan artifact, location beacon, or offer codes</p>
        </section>

        {/* Mode Toggle */}
        <section className="flex bg-[#080808] border border-gold/15 p-1 mb-5 sm:mb-6">
          <button
            onClick={() => { stopScanner(); setScanMode('tshirt') }}
            className={`flex-1 py-3 text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-300 border-none cursor-pointer ${scanMode === 'tshirt' ? 'bg-gold text-black' : 'bg-transparent text-muted hover:text-gold'}`}
          >
            ARTIFACT QR
          </button>
          <button
            onClick={() => { stopScanner(); setScanMode('location') }}
            className={`flex-1 py-3 text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-300 border-none cursor-pointer ${scanMode === 'location' ? 'bg-gold text-black' : 'bg-transparent text-muted hover:text-gold'}`}
          >
            BEACON QR
          </button>
        </section>

        {/* Scanner Container */}
        <section className="relative overflow-hidden border border-gold/15 bg-[#050505] mb-6 animate-fadeUp shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <div id="qr-reader" className="w-full h-[280px] sm:h-[340px] md:h-[380px] bg-black" ref={scannerRef} />

          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/92 backdrop-blur-sm">
              <div className="text-center px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 border border-gold/20 flex items-center justify-center mx-auto mb-5 animate-gold-pulse">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <button onClick={startScanner} className="btn-primary">INITIATE SCANNER</button>
              </div>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
              <div className="absolute top-1/2 left-1/2 w-52 h-52 sm:w-60 sm:h-60 -translate-x-1/2 -translate-y-1/2">
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t border-l border-gold" />
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t border-r border-gold" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b border-l border-gold" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b border-r border-gold" />
                <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2">
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-gold/50" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gold/50" />
                </div>
              </div>
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <p className="label-gold animate-pulse text-[10px]">
                  {scanMode === 'tshirt' ? 'SCAN ARTIFACT OR OFFER CODE' : 'SCAN BEACON CODE'}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Manual Entry */}
        <section className="mb-6 animate-fadeUp">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
            <span className="label-gold text-[9px] sm:text-[10px]">OR ENTER MANUALLY</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
          </div>
          <ManualEntryForm mode={scanMode} />
        </section>

      </main>
    </div>
  )
}

const ManualEntryForm = ({ mode }) => {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const { setProgress, setLoading, unlockLevel } = useHuntStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    const scanCode = code.trim()

    try {
      if (mode === 'tshirt') {
        // SMART CHECK FOR MANUAL ENTRY
        if(scanCode.startsWith('th-')) {
            const result = await huntService.activateQR(scanCode)
            if (result.success) {
                setProgress(result.progress)
                toast.success('🎉 Hunt activated!')
                navigate('/hunt/dashboard')
            }
        } else {
             // Treat as a normal offer code if entered here
             const { data } = await api.post('/coupons/qr-scan/', { qr_code_id: scanCode })
             if (data.success) {
               toast.success(`🎉 You won ${data.discount}% OFF! Code: ${data.coupon_code}`, { duration: 5000 })
               const savedCoupons = JSON.parse(localStorage.getItem('qr_coupons') || '[]')
               savedCoupons.push({ code: data.coupon_code, discount: data.discount, expires_at: data.expires_at })
               localStorage.setItem('qr_coupons', JSON.stringify(savedCoupons))
               navigate('/products') 
             }
        }

      } else {
        const coords = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, long: pos.coords.longitude }),
            reject,
            { enableHighAccuracy: true }
          )
        })

        const result = await huntService.verifyLocation(scanCode, coords.lat, coords.long)

        if (result.success) {
          unlockLevel(result.progress.current_level, result.reward)
          setProgress(result.progress)
          toast.success('🎊 Level completed!')
          navigate('/hunt/dashboard', { state: { showReward: true, reward: result.reward } })
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Scan failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={mode === 'tshirt' ? 'Enter artifact or offer code' : 'Enter beacon code (loc-xxx)'}
        className="input-gold flex-1 px-4 py-3 text-sm"
      />
      <button type="submit" className="btn-primary btn-mobile-full">Submit</button>
    </form>
  )
}

export default QRScanner