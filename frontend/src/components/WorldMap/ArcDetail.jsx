import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './arcDetail.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ===== AUDIO MANAGER =====
class AudioManager {
  constructor() {
    this.isMuted = localStorage.getItem('map_muted') === 'true';
  }
  playTone(freq, duration, type = 'sine', vol = 0.06) {
    if (this.isMuted) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = vol;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.stop(ctx.currentTime + duration);
    } catch(e) {}
  }
  playEffect(name) {
    if (this.isMuted) return;
    const effects = {
      hover: () => this.playTone(520, 0.06, 'sine', 0.04),
      click: () => this.playTone(800, 0.1, 'triangle', 0.05),
      unlock: () => this.playTone(523, 0.35, 'sine', 0.05),
    };
    if (effects[name]) effects[name]();
  }
}

const audioManager = new AudioManager();

// ===== FOUNDER'S ARC DATA =====
const ARC_DATA = {
  arc_number: 1,
  name: "Founder's Arc",
  subtitle: "The Awakening",
  theme_color: "#FFD700",
  description: "Every legend begins with a single step. The Founder's Arc marks the beginning of your journey beyond limits. Here, you will discover the origins of Transfinity and awaken the power within.",
  story: [
    {
      title: "The Lighthouse Beckons",
      content: "Standing tall amidst the floating islands, the ancient lighthouse has guided wanderers for centuries. Its golden beam cuts through the cosmic clouds, calling forth those brave enough to begin the infinite path."
    },
    {
      title: "The First Spark",
      content: "As you approach the lighthouse, a warm glow envelops you. This is the Spark of Awakening — the first sign that you are ready to transcend ordinary limits and embrace the extraordinary."
    },
    {
      title: "The Oath of the Founder",
      content: "Before you stands the Founder's Stone, etched with the words: 'Your limits exist only where your mindset ends.' Place your hand upon it and take the oath to begin your transformation."
    }
  ],
  challenges: [
    {
      id: 1,
      title: "Mindset Shift",
      description: "Complete a reflection on what limits you want to break",
      xp: 100,
      status: "available",
      icon: "🧠"
    },
    {
      id: 2,
      title: "First Purchase",
      description: "Make your first Transfinity purchase to unlock potential",
      xp: 200,
      status: "locked",
      icon: "🛍️"
    },
    {
      id: 3,
      title: "Community Join",
      description: "Join the Transfinity community and share your journey",
      xp: 150,
      status: "locked",
      icon: "👥"
    },
    {
      id: 4,
      title: "Daily Ritual",
      description: "Complete 7 consecutive days of engagement",
      xp: 300,
      status: "locked",
      icon: "🔥"
    }
  ],
  rewards: [
    { name: "Founder's Badge", icon: "🏅", description: "Exclusive badge for completing Arc 01" },
    { name: "Awakening Theme", icon: "🎨", description: "Unlock golden UI theme" },
    { name: "XP Boost", icon: "⚡", description: "2x XP for next 3 days" }
  ],
  next_arc: {
    name: "Phantom Arc",
    arc_number: 2,
    description: "The Disappearance"
  }
};

// ===== CHALLENGE CARD =====
const ChallengeCard = ({ challenge, onComplete }) => {
  const isLocked = challenge.status === 'locked';
  const isCompleted = challenge.status === 'completed';

  return (
    <motion.div
      className={`challenge-card ${challenge.status}`}
      whileHover={!isLocked ? { scale: 1.02, y: -3 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      onClick={() => !isLocked && onComplete(challenge)}
    >
      <div className="challenge-icon">{challenge.icon}</div>
      <div className="challenge-info">
        <h4>{challenge.title}</h4>
        <p>{challenge.description}</p>
        <span className="challenge-xp">+{challenge.xp} XP</span>
      </div>
      <div className="challenge-status">
        {isCompleted && <span className="status-completed">✓</span>}
        {isLocked && <span className="status-locked">🔒</span>}
        {!isLocked && !isCompleted && <span className="status-available">▶</span>}
      </div>
    </motion.div>
  );
};

// ===== REWARD CARD =====
const RewardCard = ({ reward }) => (
  <motion.div
    className="reward-card"
    whileHover={{ scale: 1.05 }}
  >
    <div className="reward-icon">{reward.icon}</div>
    <h4>{reward.name}</h4>
    <p>{reward.description}</p>
  </motion.div>
);

// ===== STORY SECTION =====
const StorySection = ({ story, activeIndex }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={activeIndex}
      className="story-content"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
    >
      <h3>{story[activeIndex].title}</h3>
      <p>{story[activeIndex].content}</p>
    </motion.div>
  </AnimatePresence>
);

// ===== MAIN ARC DETAIL PAGE =====
const ArcDetail = () => {
  const navigate = useNavigate();
  const { arcKey } = useParams();
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [challenges, setChallenges] = useState(ARC_DATA.challenges);
  const [progress, setProgress] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  // Calculate progress
  useEffect(() => {
    const completed = challenges.filter(c => c.status === 'completed').length;
    setProgress((completed / challenges.length) * 100);
  }, [challenges]);

  const handleCompleteChallenge = (challenge) => {
    audioManager.playEffect('unlock');
    setChallenges(prev => prev.map(c => 
      c.id === challenge.id ? { ...c, status: 'completed' } : c
    ));

    // Unlock next challenge
    const nextChallenge = challenges.find(c => c.id === challenge.id + 1);
    if (nextChallenge) {
      setTimeout(() => {
        setChallenges(prev => prev.map(c => 
          c.id === nextChallenge.id ? { ...c, status: 'available' } : c
        ));
      }, 500);
    }

    // Check if all completed
    const updated = challenges.map(c => c.id === challenge.id ? { ...c, status: 'completed' } : c);
    if (updated.every(c => c.status === 'completed')) {
      setTimeout(() => setShowCompletion(true), 1000);
    }
  };

  const handleNextStory = () => {
    if (activeStoryIndex < ARC_DATA.story.length - 1) {
      setActiveStoryIndex(prev => prev + 1);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(prev => prev - 1);
    }
  };

  return (
    <div className="arc-detail-page">
      {/* Background */}
      <div className="arc-bg">
        <div className="arc-bg-gradient" />
        <div className="arc-particles" />
      </div>

      {/* Header */}
      <motion.div 
        className="arc-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <button className="back-btn" onClick={() => navigate('/map')}>
          ← Back to Map
        </button>
        <div className="arc-title">
          <span className="arc-number">ARC {String(ARC_DATA.arc_number).padStart(2, '0')}</span>
          <h1>{ARC_DATA.name}</h1>
          <p className="arc-subtitle">{ARC_DATA.subtitle}</p>
        </div>
        <div className="arc-progress">
          <div className="progress-bar">
            <motion.div 
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="arc-content">
        {/* Story Section */}
        <motion.section 
          className="story-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2>📖 The Story</h2>
          <div className="story-container">
            <StorySection story={ARC_DATA.story} activeIndex={activeStoryIndex} />
            <div className="story-nav">
              <button 
                onClick={handlePrevStory} 
                disabled={activeStoryIndex === 0}
                className="story-btn"
              >
                ← Previous
              </button>
              <div className="story-dots">
                {ARC_DATA.story.map((_, i) => (
                  <span 
                    key={i} 
                    className={`dot ${i === activeStoryIndex ? 'active' : ''}`}
                    onClick={() => setActiveStoryIndex(i)}
                  />
                ))}
              </div>
              <button 
                onClick={handleNextStory} 
                disabled={activeStoryIndex === ARC_DATA.story.length - 1}
                className="story-btn"
              >
                Next →
              </button>
            </div>
          </div>
        </motion.section>

        {/* Description */}
        <motion.section 
          className="description-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="arc-description">{ARC_DATA.description}</p>
        </motion.section>

        {/* Challenges Section */}
        <motion.section 
          className="challenges-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2>⚔️ Challenges</h2>
          <div className="challenges-grid">
            {challenges.map((challenge) => (
              <ChallengeCard 
                key={challenge.id} 
                challenge={challenge} 
                onComplete={handleCompleteChallenge}
              />
            ))}
          </div>
        </motion.section>

        {/* Rewards Section */}
        <motion.section 
          className="rewards-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h2>🎁 Rewards</h2>
          <div className="rewards-grid">
            {ARC_DATA.rewards.map((reward, i) => (
              <RewardCard key={i} reward={reward} />
            ))}
          </div>
        </motion.section>

        {/* Next Arc Preview */}
        <motion.section 
          className="next-arc-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <div className="next-arc-card">
            <span className="next-label">Coming Next</span>
            <h3>Arc {String(ARC_DATA.next_arc.arc_number).padStart(2, '0')}: {ARC_DATA.next_arc.name}</h3>
            <p>{ARC_DATA.next_arc.description}</p>
            <span className="locked-hint">🔒 Complete all challenges to unlock</span>
          </div>
        </motion.section>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div 
            className="completion-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="completion-content"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
            >
              <div className="completion-icon">🎉</div>
              <h2>Arc Complete!</h2>
              <p>You have completed Founder's Arc and awakened your potential!</p>
              <div className="completion-rewards">
                {ARC_DATA.rewards.map((reward, i) => (
                  <div key={i} className="completion-reward">
                    <span>{reward.icon}</span>
                    <span>{reward.name}</span>
                  </div>
                ))}
              </div>
              <button 
                className="continue-btn"
                onClick={() => {
                  setShowCompletion(false);
                  navigate('/map');
                }}
              >
                Continue to Map
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArcDetail;