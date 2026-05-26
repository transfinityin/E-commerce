import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHuntStore } from '../store/useHuntStore';
import { huntService } from '../services/huntApi';
import { toast } from 'react-hot-toast';
// import HuntRewardModal from '../components/HuntRewardModal';

const TreasureHunt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [currentReward, setCurrentReward] = useState(null);

  const {
    progress,
    locations,
    isLoading,
    setProgress,
    setLocations,
    setLoading,
    isHuntActive,
    isCompleted
  } = useHuntStore();

  useEffect(() => {
    if (location.state?.showReward && location.state?.reward) {
      setCurrentReward(location.state.reward);
      setShowRewardModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!isHuntActive()) return;
      setLoading(true);
      try {
        const data = await huntService.getDashboard();
        setProgress(data.progress);
        setLocations(data.locations);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (!isHuntActive() && !isCompleted()) return <HuntStarter />;
  if (isCompleted()) return <HuntCompleted />;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-20">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm">
        <div className="page-container">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-2">
                <span className="text-3xl">🏴‍☠️</span> Treasure Hunt
              </h1>
              <p className="text-[var(--color-muted)] text-sm mt-1">
                Level {progress?.current_level || 1} of 5
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[var(--color-primary)]">
                {progress?.current_level || 0}<span className="text-lg text-[var(--color-muted)]">/5</span>
              </div>
              <div className="text-xs text-[var(--color-muted)]">Chests Opened</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-[var(--color-muted)] mb-1">
              <span>Progress</span>
              <span>{Math.round(((progress?.current_level || 0) / 5) * 100)}%</span>
            </div>
            <div className="bg-[var(--color-bg-alt)] rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] h-full transition-all duration-1000 rounded-full"
                style={{ width: `${((progress?.current_level || 0) / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        {/* Level Chests */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {[1, 2, 3, 4, 5].map((level) => {
            const isUnlocked = level <= (progress?.current_level || 0);
            const isNext = level === (progress?.current_level || 0) + 1;
            const isLocked = level > (progress?.current_level || 0) + 1;

            return (
              <div 
                key={level}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 shadow-sm ${
                  isUnlocked 
                    ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-[var(--shadow-gold)]' 
                    : isNext
                    ? 'bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-primary)] animate-pulse'
                    : 'bg-[var(--color-bg-alt)] border border-[var(--color-border)] opacity-50'
                }`}
              >
                <span className="text-2xl mb-1">
                  {isUnlocked ? '💎' : isNext ? '🔐' : '🔒'}
                </span>
                <span className={`text-xs font-bold ${
                  isUnlocked ? 'text-white' : 'text-[var(--color-muted)]'
                }`}>
                  L{level}
                </span>
                {isUnlocked && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--color-success)] rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current Clue Card */}
        {progress?.next_location && (
          <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-md mb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-[var(--color-primary-light)] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">🗺️</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[var(--color-primary)] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    LEVEL {progress.next_location.level}
                  </span>
                  <h2 className="text-lg font-bold text-[var(--color-text)]">
                    {progress.next_location.name}
                  </h2>
                </div>

                <div className="bg-[var(--color-bg-alt)] rounded-xl p-4 mb-4 border border-[var(--color-border-light)]">
                  <p className="text-[var(--color-muted)] text-xs uppercase tracking-wider mb-2 font-semibold">
                    🗝️ Your Clue
                  </p>
                  <p className="text-[var(--color-text)] text-base font-medium italic">
                    "{progress.next_location.clue_english}"
                  </p>
                  <p className="text-[var(--color-muted)] text-sm mt-2 border-t border-[var(--color-border-light)] pt-2">
                    {progress.next_location.clue_tamil}
                  </p>
                </div>

                {progress.next_location.hint_image && (
                  <img 
                    src={progress.next_location.hint_image} 
                    alt="Location hint"
                    className="w-full h-56 object-cover rounded-xl mb-4 border border-[var(--color-border)]"
                  />
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/hunt/map')}
                    className="flex-1 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-light)] text-[var(--color-btn-text)] py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.447-.894L15 7m0 13V7" />
                    </svg>
                    View Map
                  </button>
                  <button
                    onClick={() => navigate('/scan')}
                    className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[var(--shadow-gold)] hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Scan QR
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rewards History */}
        {progress?.rewards_claimed?.length > 0 && (
          <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
            <h3 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2 text-lg">
              <span className="text-xl">🎁</span> Rewards Claimed
            </h3>
            <div className="space-y-3">
              {progress.rewards_claimed.map((reward, idx) => (
                <div 
                  key={idx}
                  className="bg-[var(--color-bg-alt)] rounded-xl p-4 flex items-center justify-between border border-[var(--color-border-light)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--color-primary-light)] rounded-lg flex items-center justify-center">
                      <span className="text-lg">🏆</span>
                    </div>
                    <div>
                      <span className="text-[var(--color-primary)] font-bold">Level {reward.level}</span>
                      <p className="text-[var(--color-muted)] text-xs">
                        Claimed {new Date(reward.claimed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {reward.coupon_code && (
                    <div className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-full text-sm font-mono font-bold shadow-sm">
                      {reward.coupon_code}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <HuntRewardModal 
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        reward={currentReward}
      />
    </div>
  );
};

const HuntStarter = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-[var(--color-surface)] rounded-3xl p-8 border border-[var(--color-border)] shadow-lg text-center">
          <div className="w-20 h-20 bg-[var(--color-primary-light)] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🏴‍☠️</span>
          </div>

          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Treasure Hunt</h1>
          <p className="text-[var(--color-muted)] mb-8">
            Scan the QR code inside your T-shirt box to start your adventure!
          </p>

          <div className="space-y-4 mb-8">
            {[
              { step: 1, text: 'Scan T-shirt QR to activate', icon: '🎽' },
              { step: 2, text: 'Follow clues to 5 locations', icon: '🗺️' },
              { step: 3, text: 'Scan location QR at each spot', icon: '📍' },
              { step: 4, text: 'Win exclusive coupons & rewards!', icon: '🎁' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-4 bg-[var(--color-bg-alt)] rounded-xl p-4 border border-[var(--color-border-light)]">
                <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {item.step}
                </div>
                <p className="text-[var(--color-text)] text-sm font-medium text-left">{item.text}</p>
                <span className="text-xl ml-auto">{item.icon}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/scan')}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-[var(--shadow-gold)] hover:shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Scan QR to Start
          </button>
        </div>
      </div>
    </div>
  );
};

const HuntCompleted = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-[var(--color-surface)] rounded-3xl p-8 border border-[var(--color-border)] shadow-lg text-center">
          <div className="w-20 h-20 bg-[var(--color-primary-light)] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">👑</span>
          </div>

          <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">Hunt Complete!</h1>
          <p className="text-[var(--color-muted)] mb-6">
            Congratulations! You are a certified Treasure Hunter!
          </p>

          <div className="bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)]/10 rounded-2xl p-6 border border-[var(--color-primary)]/20 mb-6">
            <div className="text-5xl font-bold text-[var(--color-primary)] mb-2">5/5</div>
            <p className="text-[var(--color-muted)]">All chests unlocked!</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/hunt/leaderboard')}
              className="flex-1 bg-[var(--color-bg-alt)] hover:bg-[var(--color-border-light)] text-[var(--color-text)] py-3 rounded-xl font-semibold border border-[var(--color-border)] transition-all"
            >
              View Leaderboard
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white py-3 rounded-xl font-bold transition-all shadow-[var(--shadow-gold)]"
            >
              Shop More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreasureHunt;
