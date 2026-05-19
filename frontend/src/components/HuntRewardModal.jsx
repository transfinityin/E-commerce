import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HuntRewardModal = ({ isOpen, onClose, reward }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !reward) return null;

  const handleCopy = () => {
    if (reward.coupon_code) {
      navigator.clipboard.writeText(reward.coupon_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] max-w-md w-full p-8 relative shadow-xl animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--color-primary-light)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-1">
            Level {reward.level} Unlocked!
          </h2>
          <p className="text-[var(--color-muted)] mb-6">
            Amazing! You found the treasure chest!
          </p>

          {/* Reward Card */}
          <div className="bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)]/5 rounded-2xl p-5 border border-[var(--color-primary)]/20 mb-6">
            <p className="text-[var(--color-muted)] text-xs uppercase tracking-wider mb-3 font-semibold">
              Your Reward
            </p>

            {reward.coupon_code ? (
              <>
                <div className="bg-[var(--color-surface)] rounded-xl p-3 flex items-center justify-between mb-3 border border-[var(--color-border)] shadow-sm">
                  <code className="text-[var(--color-primary)] font-mono text-lg font-bold tracking-wider">
                    {reward.coupon_code}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {copied ? (
                      <svg className="w-5 h-5 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-[var(--color-primary)] font-bold text-lg">
                  {reward.discount_type === 'percentage' 
                    ? `${reward.discount}% OFF` 
                    : `₹${reward.discount} OFF`}
                </p>
                <p className="text-[var(--color-muted)] text-xs mt-1">Valid for 7 days</p>
              </>
            ) : (
              <p className="text-[var(--color-primary)] font-medium text-lg">Special Badge Unlocked!</p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => {
                onClose();
                navigate('/cart');
              }}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white py-3.5 rounded-xl font-bold transition-all shadow-[var(--shadow-gold)]"
            >
              Use Coupon Now
            </button>
            <button
              onClick={onClose}
              className="w-full bg-[var(--color-bg-alt)] hover:bg-[var(--color-border-light)] text-[var(--color-text)] py-3.5 rounded-xl font-semibold border border-[var(--color-border)] transition-all"
            >
              Continue Hunting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HuntRewardModal;