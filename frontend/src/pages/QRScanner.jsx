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
  const autoScannedRef = useRef(null)
  const { qrCodeId } = useParams()

  const [isScanning, setIsScanning] = useState(false)
  const [scanMode, setScanMode] = useState('tshirt')

  const navigate = useNavigate()
  const { setProgress, setLoading, unlockLevel } = useHuntStore()

  useEffect(() => {
    if (!qrCodeId || autoScannedRef.current === qrCodeId) return
    autoScannedRef.current = qrCodeId
    handleCouponScan(qrCodeId)
  }, [qrCodeId])

  const handleMysteryScan = async (code) => {
    setLoading(true)
    try {
      const { data } = await api.post('/hunt/mystery-claim/', { code })

      if (data.success) {
        if (data.reward_type === 'arc') {
          toast.success(data.message, { duration: 5000, icon: '🌌' })
          navigate('/arcs')
        } else if (data.reward_type === 'coupon') {
          toast.success(data.message, { duration: 5000, icon: '🎉' })
          const savedCoupons = JSON.parse(localStorage.getItem('qr_coupons') || '[]')
          savedCoupons.push({
            code: data.coupon_code,
            discount: data.discount,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          })
          localStorage.setItem('qr_coupons', JSON.stringify(savedCoupons))
          navigate('/products')
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or Expired Mystery Card')
    } finally {
      setLoading(false)
    }
  }

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader')
      html5QrCodeRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        onScanSuccess,
        onScanFailure,
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

  const handleCouponScan = async (codeId) => {
    setLoading(true)
    try {
      const { data } = await api.post('/coupons/qr-scan/', {
        qr_code_id: codeId,
        device_id: localStorage.getItem('tf_device_id') || undefined,
      })

      if (data.success) {
        toast.success(
          data.message || `🎉 You won ${data.discount}% OFF! Code: ${data.coupon_code}`,
          { duration: 5000 },
        )

        const savedCoupons = JSON.parse(localStorage.getItem('qr_coupons') || '[]')
        savedCoupons.push({
          code: data.coupon_code,
          discount: data.discount,
          expires_at: data.expires_at,
          title: data.title,
        })
        localStorage.setItem('qr_coupons', JSON.stringify(savedCoupons))

        navigate('/products')
      } else {
        toast.error(data.message || 'Scan failed')
        navigate('/scan')
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data?.detail ||
          'Invalid or Expired Offer',
      )
      navigate('/scan')
    } finally {
      setLoading(false)
    }
  }

  const onScanSuccess = async (decodedText) => {
    await stopScanner()
    let code = decodedText

    try {
      const url = new URL(decodedText)
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

    if (code.startsWith('th-')) {
      handleHuntScan(code)
    } else if (code.startsWith('loc-')) {
      handleHuntScan(code, true)
    } else if (code.startsWith('myst-')) {
      handleMysteryScan(code)
    } else {
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
    } catch (error) {
      toast.error(error.message || 'Scan failed')
    } finally {
      setLoading(false)
    }
  }

  const onScanFailure = () => {}

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#EFEFEF] pb-16 text-neutral-900">
      <main className="mx-auto w-full max-w-[640px] px-4 pt-4 sm:px-6 sm:pt-5 md:px-8 md:pt-6">
        <nav className="mb-6 flex flex-wrap items-center justify-between gap-3 text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-400 sm:mb-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-transparent p-0 transition-colors hover:text-neutral-700"
            >
              Home
            </button>
            <span className="opacity-40">/</span>
            <span className="text-neutral-700">Scan</span>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full bg-white px-3 py-1.5 text-[9px] font-semibold tracking-[0.18em] text-neutral-600 uppercase shadow-[0_6px_18px_rgba(17,17,17,0.05)] ring-1 ring-black/6 transition hover:text-neutral-950"
            aria-label="Close scanner"
          >
            Close
          </button>
        </nav>

        <section className="mb-7 text-center sm:mb-8">
          <p className="text-[9px] font-medium tracking-[0.32em] text-neutral-500 uppercase">
            Scanner protocol
          </p>
          <h1 className="mt-2 font-sans text-[clamp(1.45rem,3vw,1.95rem)] font-semibold tracking-[0.08em] text-neutral-950 uppercase">
            QR Scanner
          </h1>
          <p className="mt-2 text-[12.5px] text-neutral-500">
            Artifact, beacon, or offer codes
          </p>
        </section>

        <section className="tf-scan-tabs mb-5 sm:mb-6">
          <button
            type="button"
            onClick={() => {
              stopScanner()
              setScanMode('tshirt')
            }}
            className={`tf-scan-tab ${scanMode === 'tshirt' ? 'tf-scan-tab--on' : ''}`}
          >
            Artifact QR
          </button>
          <button
            type="button"
            onClick={() => {
              stopScanner()
              setScanMode('location')
            }}
            className={`tf-scan-tab ${scanMode === 'location' ? 'tf-scan-tab--on' : ''}`}
          >
            Beacon QR
          </button>
        </section>

        <section className="tf-scan-stage relative mb-6 overflow-hidden">
          <div
            id="qr-reader"
            className="h-[280px] w-full bg-[#E8E8E6] sm:h-[340px] md:h-[360px]"
            ref={scannerRef}
          />

          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#EFEFEF]/88 backdrop-blur-[2px]">
              <div className="px-4 text-center">
                <div className="tf-scan-lens mx-auto mb-5 grid size-16 place-items-center sm:size-[4.5rem]">
                  <svg
                    className="size-7 text-neutral-900 sm:size-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.25}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.25}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={startScanner}
                  className="tf-join !h-10 !min-w-[10rem]"
                >
                  <span>Initiate scanner</span>
                </button>
              </div>
            </div>
          )}

          {isScanning && (
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
              <div className="absolute top-1/2 left-1/2 size-52 -translate-x-1/2 -translate-y-1/2 sm:size-60">
                <div className="absolute -top-1 -left-1 size-7 rounded-tl-md border-t-2 border-l-2 border-white/90" />
                <div className="absolute -top-1 -right-1 size-7 rounded-tr-md border-t-2 border-r-2 border-white/90" />
                <div className="absolute -bottom-1 -left-1 size-7 rounded-bl-md border-b-2 border-l-2 border-white/90" />
                <div className="absolute -right-1 -bottom-1 size-7 rounded-br-md border-r-2 border-b-2 border-white/90" />
                <div className="tf-scan-line absolute inset-x-3 top-2 h-0.5 rounded-full" />
              </div>
              <div className="absolute inset-x-0 bottom-5 text-center">
                <p className="text-[9px] font-semibold tracking-[0.24em] text-white uppercase drop-shadow">
                  {scanMode === 'tshirt'
                    ? 'Scan artifact or offer'
                    : 'Scan beacon code'}
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="mb-2">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-300/70" />
            <span className="text-[9px] font-medium tracking-[0.24em] text-neutral-400 uppercase">
              Or enter manually
            </span>
            <div className="h-px flex-1 bg-neutral-300/70" />
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
        if (scanCode.startsWith('th-')) {
          const result = await huntService.activateQR(scanCode)
          if (result.success) {
            setProgress(result.progress)
            toast.success('🎉 Hunt activated!')
            navigate('/hunt/dashboard')
          }
        } else {
          const { data } = await api.post('/coupons/qr-scan/', { qr_code_id: scanCode })
          if (data.success) {
            toast.success(`🎉 You won ${data.discount}% OFF! Code: ${data.coupon_code}`, {
              duration: 5000,
            })
            const savedCoupons = JSON.parse(localStorage.getItem('qr_coupons') || '[]')
            savedCoupons.push({
              code: data.coupon_code,
              discount: data.discount,
              expires_at: data.expires_at,
            })
            localStorage.setItem('qr_coupons', JSON.stringify(savedCoupons))
            navigate('/products')
          }
        }
      } else {
        const coords = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) =>
              resolve({ lat: pos.coords.latitude, long: pos.coords.longitude }),
            reject,
            { enableHighAccuracy: true },
          )
        })

        const result = await huntService.verifyLocation(
          scanCode,
          coords.lat,
          coords.long,
        )

        if (result.success) {
          unlockLevel(result.progress.current_level, result.reward)
          setProgress(result.progress)
          toast.success('🎊 Level completed!')
          navigate('/hunt/dashboard', {
            state: { showReward: true, reward: result.reward },
          })
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Scan failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={
          mode === 'tshirt'
            ? 'Enter artifact or offer code'
            : 'Enter beacon code (loc-xxx)'
        }
        className="tf-shop-pill tf-shop-pill--input !pl-4 sm:flex-1"
      />
      <button type="submit" className="tf-join !h-11 !min-w-[7.5rem] sm:!w-auto">
        <span>Submit</span>
      </button>
    </form>
  )
}

export default QRScanner
