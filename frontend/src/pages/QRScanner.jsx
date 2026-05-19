import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { useHuntStore } from '../store/useHuntStore';
import { huntService } from '../services/huntApi';
import { toast } from 'react-hot-toast';

const QRScanner = () => {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState('tshirt');
  const [locationCoords, setLocationCoords] = useState(null);

  const navigate = useNavigate();
  const { setProgress, setLoading, unlockLevel } = useHuntStore();

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            long: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        onScanFailure
      );
      setIsScanning(true);
    } catch (err) {
      toast.error('Camera access denied or not available');
      console.error('Scanner error:', err);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      await html5QrCodeRef.current.stop();
      setIsScanning(false);
    }
  };

  const onScanSuccess = async (decodedText) => {
    await stopScanner();

    let code = decodedText;
    if (decodedText.includes('code=')) {
      code = new URL(decodedText).searchParams.get('code');
    }
    if (decodedText.includes('loc=')) {
      code = new URL(decodedText).searchParams.get('loc');
    }

    setLoading(true);

    try {
      if (scanMode === 'tshirt') {
        const result = await huntService.activateQR(code);
        if (result.success) {
          setProgress(result.progress);
          toast.success('🎉 Treasure Hunt Activated! Level 1 unlocked!');
          navigate('/hunt/dashboard');
        }
      } else {
        toast.loading('Verifying location...');
        const coords = await getCurrentPosition();
        setLocationCoords(coords);

        const result = await huntService.verifyLocation(code, coords.lat, coords.long);
        toast.dismiss();

        if (result.success) {
          unlockLevel(result.progress.current_level, result.reward);
          setProgress(result.progress);
          toast.success(`🎊 Level ${result.reward.level} Complete!`, { duration: 5000 });
          navigate('/hunt/dashboard', { state: { showReward: true, reward: result.reward }});
        }
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const onScanFailure = (error) => {};

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm">
        <div className="page-container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[var(--color-primary)]">📷 QR Scanner</h1>
              <p className="text-[var(--color-muted)] text-xs">Scan your T-shirt or Location QR</p>
            </div>
            <button
              onClick={() => navigate('/hunt')}
              className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="page-container py-6 max-w-md mx-auto">
        {/* Mode Toggle */}
        <div className="flex bg-[var(--color-bg-alt)] rounded-xl p-1.5 mb-6 border border-[var(--color-border)]">
          <button
            onClick={() => { stopScanner(); setScanMode('tshirt'); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              scanMode === 'tshirt'
                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            🎽 T-Shirt QR
          </button>
          <button
            onClick={() => { stopScanner(); setScanMode('location'); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              scanMode === 'location'
                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            📍 Location QR
          </button>
        </div>

        {/* Scanner Container */}
        <div className="relative bg-[var(--color-secondary)] rounded-2xl overflow-hidden border-2 border-[var(--color-border)] shadow-lg">
          <div id="qr-reader" className="w-full aspect-square" ref={scannerRef} />

          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-secondary)]/90">
              <button
                onClick={startScanner}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-[var(--shadow-gold)] transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Start Camera
              </button>
            </div>
          )}

          {/* Scan Frame Overlay */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-2 border-[var(--color-primary)]/40 rounded-2xl">
                <div className="absolute top-0 left-0 w-5 h-5 border-t-3 border-l-3 border-[var(--color-primary)]" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-3 border-r-3 border-[var(--color-primary)]" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-3 border-l-3 border-[var(--color-primary)]" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-3 border-r-3 border-[var(--color-primary)]" />
              </div>
              <p className="absolute bottom-6 left-0 right-0 text-center text-[var(--color-primary)] text-sm font-medium animate-pulse">
                {scanMode === 'tshirt' ? 'Scan T-Shirt QR Code' : 'Scan Location QR Sticker'}
              </p>
            </div>
          )}
        </div>

        {/* Manual Entry */}
        <div className="mt-6">
          <p className="text-[var(--color-muted)] text-xs text-center mb-3 uppercase tracking-wider font-semibold">Or Enter Manually</p>
          <ManualEntryForm mode={scanMode} />
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)] shadow-sm">
          <h3 className="font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
            <span className="text-[var(--color-primary)]">ℹ️</span>
            {scanMode === 'tshirt' ? 'T-Shirt QR Instructions' : 'Location QR Instructions'}
          </h3>
          <ul className="text-[var(--color-muted)] text-sm space-y-2">
            {scanMode === 'tshirt' ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary)]">•</span>
                  Find the QR sticker inside your T-shirt box
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary)]">•</span>
                  Scan to activate your treasure hunt
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary)]">•</span>
                  One QR = One user only (anti-sharing)
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary)]">•</span>
                  Go to the location shown in your clue
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary)]">•</span>
                  Find the QR sticker at the location
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary)]">•</span>
                  Must be within 100 meters (GPS check)
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

const ManualEntryForm = ({ mode }) => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const { setProgress, setLoading, unlockLevel } = useHuntStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      if (mode === 'tshirt') {
        const result = await huntService.activateQR(code.trim());
        if (result.success) {
          setProgress(result.progress);
          toast.success('🎉 Hunt activated!');
          navigate('/hunt/dashboard');
        }
      } else {
        const coords = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, long: pos.coords.longitude }),
            reject,
            { enableHighAccuracy: true }
          );
        });

        const result = await huntService.verifyLocation(code.trim(), coords.lat, coords.long);
        if (result.success) {
          unlockLevel(result.progress.current_level, result.reward);
          setProgress(result.progress);
          toast.success('🎊 Level completed!');
          navigate('/hunt/dashboard', { state: { showReward: true, reward: result.reward }});
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={mode === 'tshirt' ? 'Enter T-shirt code (th-xxx)' : 'Enter location code (loc-xxx)'}
        className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-muted-light)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
      />
      <button
        type="submit"
        className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm"
      >
        Submit
      </button>
    </form>
  );
};

export default QRScanner;