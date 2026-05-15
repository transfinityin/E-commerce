import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  ScanLine,
  Copy,
  Check,
  ShoppingBag,
  RotateCcw,
  Clock,
  AlertCircle,
  Sparkles,
  Camera,
} from 'lucide-react';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [revealedData, setRevealedData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  const getDeviceId = () => {
    let deviceId = localStorage.getItem('qr_device_id');
    if (!deviceId) {
      deviceId = 'dev_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('qr_device_id', deviceId);
    }
    return deviceId;
  };

  useEffect(() => {
    if (!revealedData && !error) {
      initScanner();
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [revealedData, error]);

  const initScanner = () => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });
    scanner.render(onScanSuccess, onScanError);
    scannerRef.current = scanner;
  };

  const onScanSuccess = async (decodedText) => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    const qrCodeId = decodedText.split('/').pop();
    await handleScan(qrCodeId);
  };

  const onScanError = () => { };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScan(manualCode.trim());
    }
  };

  const handleScan = async (qrCodeId) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/coupons/qr-scan/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_code_id: qrCodeId,
          device_id: getDeviceId(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRevealedData(data);
        const coupons = JSON.parse(localStorage.getItem('qr_coupons') || '[]');
        coupons.push({
          code: data.coupon_code,
          discount: data.discount,
          expires_at: data.expires_at,
          title: data.title,
        });
        localStorage.setItem('qr_coupons', JSON.stringify(coupons));
      } else {
        setError(data.message || 'Invalid QR Code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (revealedData?.coupon_code) {
      navigator.clipboard.writeText(revealedData.coupon_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRescan = () => {
    setScanResult(null);
    setRevealedData(null);
    setError('');
    setManualCode('');
  };

  const savedCoupons = JSON.parse(localStorage.getItem('qr_coupons') || '[]');

  return (
    <div className="min-h-screen  place-items-center bg-slate-50">
      <div className="max-w-lg mx-auto" style={{ padding: '32px 16px' }}>

        {/* Header */}
        <div className="text-center" style={{ marginBottom: '32px' }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-600" style={{ marginBottom: '8px' }}>
            Exclusive Offers
          </p>
          <h1 className="text-3xl font-bold text-slate-900" style={{ marginBottom: '8px' }}>
            Scan & Reveal
          </h1>
          <p className="text-sm text-slate-500">
            Point your camera at a QR code to unlock secret discounts
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" style={{ marginBottom: '24px' }}>

          {/* Scanner */}
          {!revealedData && !error && !loading && (
            <div style={{ padding: '24px' }}>
              <div className="relative rounded-xl overflow-hidden bg-slate-900" style={{ minHeight: '300px' }}>
                {/* Corner brackets */}
                <div className="absolute w-6 h-6 border-l-2 border-t-2 border-amber-400 rounded-tl-sm" style={{ top: '20px', left: '20px' }} />
                <div className="absolute w-6 h-6 border-r-2 border-t-2 border-amber-400 rounded-tr-sm" style={{ top: '20px', right: '20px' }} />
                <div className="absolute w-6 h-6 border-l-2 border-b-2 border-amber-400 rounded-bl-sm" style={{ bottom: '20px', left: '20px' }} />
                <div className="absolute w-6 h-6 border-r-2 border-b-2 border-amber-400 rounded-br-sm" style={{ bottom: '20px', right: '20px' }} />
                {/* Scan line */}
                <div className="absolute left-0 right-0 h-0.5 bg-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-[scan_2s_ease-in-out_infinite]" style={{ top: '40%' }} />
                <div id="qr-reader" style={{ minHeight: '300px' }} />
              </div>

              <div className="flex items-center justify-center text-slate-500 text-xs" style={{ marginTop: '16px', gap: '6px' }}>
                <Camera size={16} />
                <span>Position QR code within the frame</span>
              </div>

              {/* Manual Entry */}
              <form onSubmit={handleManualSubmit} className="flex" style={{ marginTop: '20px', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Or enter code manually..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  style={{ padding: '12px 16px' }}
                />
                <button
                  type="submit"
                  className="flex items-center bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all border-none cursor-pointer shrink-0"
                  style={{ padding: '12px 20px', gap: '8px' }}
                >
                  <ScanLine size={16} />
                  Scan
                </button>
              </form>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center text-center" style={{ padding: '64px 24px' }}>
              <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-amber-500 animate-spin" style={{ marginBottom: '20px' }} />
              <p className="text-sm font-medium text-slate-600">Revealing your exclusive offer...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex flex-col items-center text-center" style={{ padding: '48px 24px' }}>
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center" style={{ marginBottom: '16px' }}>
                <AlertCircle size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900" style={{ marginBottom: '8px' }}>Oops!</h3>
              <p className="text-sm text-slate-500" style={{ marginBottom: '24px' }}>{error}</p>
              <button
                className="flex items-center bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all border-none cursor-pointer"
                style={{ padding: '12px 24px', gap: '8px' }}
                onClick={handleRescan}
              >
                <RotateCcw size={16} />
                Try Again
              </button>
            </div>
          )}

          {/* Revealed Discount */}
          {revealedData && (
            <div className="text-center" style={{ padding: '40px 24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center" style={{ marginBottom: '16px' }}>
                  <Sparkles size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900" style={{ marginBottom: '8px' }}>Congratulations!</h2>
                <p className="text-sm text-slate-500">{revealedData.message}</p>
              </div>

              <div className="bg-slate-900 rounded-2xl text-white relative overflow-hidden" style={{ padding: '32px 24px', marginBottom: '24px' }}>
                {/* Decorative circles */}
                <div className="absolute rounded-full bg-white/5" style={{ width: '120px', height: '120px', top: '-40px', right: '-40px' }} />
                <div className="absolute rounded-full bg-white/5" style={{ width: '80px', height: '80px', bottom: '-20px', left: '-20px' }} />

                <p className="text-xs font-bold uppercase tracking-widest text-white/60" style={{ marginBottom: '8px' }}>You Won</p>
                <div className="text-5xl font-bold text-amber-400" style={{ marginBottom: '8px' }}>
                  {revealedData.discount}<span className="text-2xl">%</span>
                </div>
                <p className="text-sm font-medium text-white/80" style={{ marginBottom: '20px' }}>{revealedData.title}</p>

                <div className="flex items-center bg-white/10 rounded-xl border border-white/10" style={{ padding: '12px 16px', gap: '12px' }}>
                  <span className="flex-1 font-mono text-sm font-bold tracking-wider">{revealedData.coupon_code}</span>
                  <button
                    onClick={handleCopyCode}
                    className={`flex items-center rounded-lg text-xs font-bold border-none cursor-pointer transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                    style={{ padding: '8px 14px', gap: '6px' }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="flex items-center justify-center text-white/50 text-xs" style={{ marginTop: '16px', gap: '6px' }}>
                  <Clock size={14} />
                  <span>Valid until {new Date(revealedData.expires_at).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="flex flex-col" style={{ gap: '12px' }}>
                <button
                  className="w-full flex items-center justify-center bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-all border-none cursor-pointer"
                  style={{ padding: '14px 24px', gap: '8px' }}
                  onClick={() => navigate('/products')}
                >
                  <ShoppingBag size={18} />
                  Start Shopping
                </button>
                <button
                  className="w-full flex items-center justify-center bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                  style={{ padding: '12px 24px', gap: '8px' }}
                  onClick={handleRescan}
                >
                  <RotateCcw size={16} />
                  Scan Another Code
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Saved Coupons History */}
        {savedCoupons.length > 0 && !revealedData && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '24px' }}>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider" style={{ marginBottom: '16px' }}>
              Your Saved Offers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {savedCoupons.slice(-3).reverse().map((coupon, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-50 rounded-xl border border-slate-100"
                  style={{ padding: '14px 16px' }}
                >
                  <div className="flex items-center" style={{ gap: '12px' }}>
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                      {coupon.discount}%
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="text-sm font-semibold text-slate-900">{coupon.title}</span>
                      <span className="text-xs text-slate-500">
                        Expires {new Date(coupon.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg" style={{ padding: '6px 12px' }}>
                    {coupon.code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scan line animation */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 20%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          50% { top: 80%; }
        }
      `}</style>
    </div>
  );
};

export default QRScanner;