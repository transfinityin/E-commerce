import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  ScanLine, Copy, Check, ShoppingBag, RotateCcw, Clock,
  AlertCircle, Sparkles, Camera, Ticket, ChevronRight, Zap
} from 'lucide-react';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [revealedData, setRevealedData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanActive, setScanActive] = useState(true);
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
    if (!revealedData && !error && scanActive) {
      initScanner();
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [revealedData, error, scanActive]);

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
    setScanActive(false);
    const qrCodeId = decodedText.split('/').pop();
    await handleScan(qrCodeId);
  };

  const onScanError = () => { };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      setScanActive(false);
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
    setScanActive(true);
  };

  const savedCoupons = JSON.parse(localStorage.getItem('qr_coupons') || '[]');

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4 py-8 lg:py-12">
      <div className="max-w-lg w-full">

        {/* Header */}
        <div className="text-center mb-8 lg:mb-10">
          <div className="inline-flex items-center gap-2 bg-[var(--color-primary-light)] rounded-full px-4 py-1.5 mb-4">
            <Zap size={14} className="text-[var(--color-primary)]" />
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)]">
              Exclusive Offers
            </p>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-3 tracking-tight">
            Scan & Reveal
          </h1>
          <p className="text-sm text-[var(--color-muted)] max-w-xs mx-auto">
            Point your camera at a QR code to unlock secret discounts
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-md)] overflow-hidden mb-6 transition-all duration-300">

          {/* Scanner View */}
          {!revealedData && !error && !loading && (
            <div className="p-6 lg:p-8">
              {/* Scanner Frame */}
              <div className="relative rounded-xl overflow-hidden bg-[var(--color-secondary)] min-h-[300px] lg:min-h-[340px] shadow-inner">
                {/* Corner Brackets - Premium Gold */}
                <div className="absolute w-8 h-8 border-l-[3px] border-t-[3px] border-[var(--color-primary)] rounded-tl-lg top-6 left-6 z-20" />
                <div className="absolute w-8 h-8 border-r-[3px] border-t-[3px] border-[var(--color-primary)] rounded-tr-lg top-6 right-6 z-20" />
                <div className="absolute w-8 h-8 border-l-[3px] border-b-[3px] border-[var(--color-primary)] rounded-bl-lg bottom-6 left-6 z-20" />
                <div className="absolute w-8 h-8 border-r-[3px] border-b-[3px] border-[var(--color-primary)] rounded-br-lg bottom-6 right-6 z-20" />

                {/* Animated Scan Line */}
                <div className="absolute left-4 right-4 h-[2px] bg-[var(--color-primary)] z-20 animate-scan shadow-[0_0_20px_rgba(200,169,110,0.8)]" style={{ top: '30%' }} />

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 opacity-10 z-10" style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
                }} />

                <div id="qr-reader" className="min-h-[300px] lg:min-h-[340px]" />
              </div>

              {/* Helper Text */}
              <div className="flex items-center justify-center text-[var(--color-muted)] text-xs mt-5 gap-2">
                <Camera size={16} className="text-[var(--color-primary)]" />
                <span>Position QR code within the golden frame</span>
              </div>

              {/* Manual Entry */}
              <form onSubmit={handleManualSubmit} className="flex mt-6 gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Or enter code manually..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all duration-200 pl-4 pr-4 py-3.5 placeholder:text-[var(--color-muted-light)]"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[var(--color-secondary)] text-[var(--color-text-inverse)] rounded-xl text-sm font-semibold hover:bg-[var(--color-secondary-light)] transition-all duration-200 border-none cursor-pointer shrink-0 px-5 py-3.5 shadow-[var(--shadow-sm)]"
                >
                  <ScanLine size={16} />
                  <span className="hidden sm:inline">Scan</span>
                </button>
              </form>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center text-center py-16 lg:py-20 px-6">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-[var(--color-bg-alt)] border-t-[var(--color-primary)] animate-spin" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[var(--color-primary)] animate-spin opacity-30" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <p className="text-sm font-medium text-[var(--color-text)] mb-1">Revealing your exclusive offer...</p>
              <p className="text-xs text-[var(--color-muted)]">Please wait a moment</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center text-center py-12 lg:py-16 px-6">
              <div className="w-16 h-16 rounded-full bg-[var(--color-danger-bg)] text-[var(--color-danger)] flex items-center justify-center mb-5 animate-bounce">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Oops!</h3>
              <p className="text-sm text-[var(--color-muted)] mb-2 max-w-xs">{error}</p>
              <p className="text-xs text-[var(--color-muted-light)] mb-8">Try scanning again or enter the code manually</p>
              <button
                className="flex items-center gap-2 bg-[var(--color-secondary)] text-[var(--color-text-inverse)] rounded-xl text-sm font-semibold hover:bg-[var(--color-secondary-light)] transition-all duration-200 border-none cursor-pointer px-6 py-3.5 shadow-[var(--shadow-sm)]"
                onClick={handleRescan}
              >
                <RotateCcw size={16} />
                Try Again
              </button>
            </div>
          )}

          {/* Success - Revealed Discount */}
          {revealedData && (
            <div className="text-center py-10 lg:py-12 px-6 lg:px-8">
              {/* Success Icon */}
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-[var(--color-primary-light)] flex items-center justify-center mb-4 animate-bounce">
                  <Sparkles size={40} className="text-[var(--color-primary)]" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] mb-2">Congratulations!</h2>
                <p className="text-sm text-[var(--color-muted)]">{revealedData.message}</p>
              </div>

              {/* Coupon Card */}
              <div className="bg-[var(--color-secondary)] rounded-2xl text-white relative overflow-hidden py-8 px-6 lg:px-8 mb-6 shadow-[var(--shadow-lg)]">
                {/* Decorative Elements */}
                <div className="absolute w-[140px] h-[140px] rounded-full bg-[var(--color-primary)]/10 -top-12 -right-12" />
                <div className="absolute w-[100px] h-[100px] rounded-full bg-[var(--color-primary)]/10 -bottom-8 -left-8" />
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[var(--color-primary)]/40 animate-pulse" />
                <div className="absolute bottom-8 left-8 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]/30 animate-pulse" style={{ animationDelay: '0.5s' }} />

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-3">You Won</p>
                <div className="text-6xl lg:text-7xl font-bold text-[var(--color-primary)] mb-2 tracking-tight">
                  {revealedData.discount}<span className="text-3xl lg:text-4xl">%</span>
                </div>
                <p className="text-base font-medium text-white/80 mb-6">{revealedData.title}</p>

                {/* Code Box */}
                <div className="flex items-center bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm py-3 px-4 gap-3">
                  <span className="flex-1 font-mono text-lg font-bold tracking-wider text-white">{revealedData.coupon_code}</span>
                  <button
                    onClick={handleCopyCode}
                    className={`flex items-center rounded-lg text-xs font-bold border-none cursor-pointer transition-all duration-200 px-4 py-2.5 gap-1.5 ${
                      copied
                        ? 'bg-[var(--color-success)] text-white'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                {/* Expiry */}
                <div className="flex items-center justify-center text-white/40 text-xs mt-4 gap-1.5">
                  <Clock size={14} />
                  <span>Valid until {new Date(revealedData.expires_at).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-all duration-300 border-none cursor-pointer py-4 shadow-[var(--shadow-gold)] hover:shadow-lg hover:-translate-y-0.5"
                  onClick={() => navigate('/products')}
                >
                  <ShoppingBag size={18} />
                  Start Shopping
                  <ChevronRight size={16} />
                </button>
                <button
                  className="w-full flex items-center justify-center gap-2 bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-sm font-semibold hover:bg-[var(--color-bg-alt)] transition-all duration-200 cursor-pointer py-3"
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
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center">
                <Ticket size={16} className="text-[var(--color-primary)]" />
              </div>
              <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">
                Your Saved Offers
              </h3>
              <span className="ml-auto text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] rounded-full px-2.5 py-0.5">
                {savedCoupons.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {savedCoupons.slice(-3).reverse().map((coupon, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-[var(--color-bg-alt)] rounded-xl border border-[var(--color-border)] py-3.5 px-4 hover:border-[var(--color-primary)]/30 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] flex items-center justify-center text-sm font-bold shadow-sm">
                      {coupon.discount}%
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">{coupon.title}</span>
                      <span className="text-xs text-[var(--color-muted)]">
                        Expires {new Date(coupon.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-1.5">
                      {coupon.code}
                    </span>
                    <ChevronRight size={14} className="text-[var(--color-muted)]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scan Animation Styles */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 15%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          50% { top: 85%; }
        }
        .animate-scan {
          animation: scan 2.5s ease-in-out infinite;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;