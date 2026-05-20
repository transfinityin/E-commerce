import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import useAuthStore from '../../store/authStore';
import IslandNode from './IslandNode';
import ParticleField from '../Effects/ParticleField';
const ARCS = [
  // 🔥 WANDERER FIRST - Starting Point (y=18, higher up)
  { id: 'wanderer',  x: 50, y: 18, color: '#555555', label: 'WANDERER',  subtitle: 'The Frame • Starting Point' },
  
  // 🔥 FOUNDER - LOCKED until Wanderer complete (y=32)
  { id: 'founder',   x: 72, y: 32, color: '#FFD700', label: 'FOUNDER',   subtitle: 'Rank I • Awakening ' },
  
  { id: 'ascendant', x: 85, y: 50, color: '#9D4EDD', label: 'ASCENDANT', subtitle: 'Rank II • Evolution ' },
  { id: 'phantom',   x: 75, y: 68, color: '#808080', label: 'PHANTOM',   subtitle: 'Phantom • Mystery ' },
  { id: 'eclipse',   x: 50, y: 82, color: '#FF0040', label: 'ECLIPSE',   subtitle: 'Rank III • Darkness ' },
  { id: 'eternal',   x: 25, y: 68, color: '#FFD700', label: 'ETERNAL',   subtitle: 'Rank IV • Legacy ' },
];

export default function AscensionMap() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [hoveredArc, setHoveredArc] = useState(null);
  const [selectedArc, setSelectedArc] = useState(null);
  const svgRef = useRef(null);

  const userRank = user?.rank || 'wanderer';
  const unlockedArcs = user?.unlocked_arcs || ['wanderer'];

const getArcStatus = (arcId) => {
  const rankOrder = ['wanderer', 'founder', 'ascendant', 'phantom', 'eclipse', 'eternal'];
  const userIdx = rankOrder.indexOf(userRank);
  const arcIdx = rankOrder.indexOf(arcId);
  
  // Current rank = unlocked (can buy)
  if (arcIdx === userIdx) return 'unlocked';
  return 'locked';
  // Below current = unlocked (already passed)
  if (arcIdx < userIdx) return 'unlocked';
  
  // Next rank = preview (teaser, can see lore but not buy)
  if (arcIdx === userIdx + 1) return 'preview';
  
  // Future = locked
  return 'locked';
};

  const handleArcClick = (arc) => {
    const status = getArcStatus(arc.id);
    
    if (status === 'locked') {
      setSelectedArc({ ...arc, status, message: 'Complete previous Arc to unlock this path' });
      return;
    }
    
    // Navigate to lore cinematic
    navigate(`/lore/${arc.id}`);
  };

  return (
    <div className="relative w-full  h-screen bg-[#050505] overflow-hidden">
      {/* Particle Background */}
      <ParticleField  />
      
      {/* Title */}
     {/* Title — MOVED UP: top-4 instead of default */}
<motion.div 
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none"
>
  <h1 className="text-3xl md:text-5xl font-black tracking-tighter">
    <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
      TRANS
    </span>
    <span className="text-[#FFD700]">FINITY</span>
  </h1>
  <p className="text-gray-600 text-[10px] tracking-[0.4em] mt-1 uppercase">
    The Ascension Map
  </p>
</motion.div>

      {/* Rank Badge */}
      {isAuthenticated && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-8 right-8 z-20"
        >
          <div className="bg-black/80 border border-[#FFD700]/30 rounded-lg px-4 py-2 backdrop-blur-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Current Rank</p>
            <p className="text-[#FFD700] font-bold text-lg uppercase tracking-wider">{userRank}</p>
            <div className="w-full h-1 bg-gray-800 rounded-full mt-1">
              <div 
                className="h-full bg-[#FFD700] rounded-full transition-all"
                style={{ width: `${(user?.xp || 0) % 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{user?.xp || 0} XP</p>
          </div>
        </motion.div>
      )}

      {/* SVG Map */}
      <svg 
        ref={svgRef}
        viewBox="0 0 100 100" 
        className="w-full h-full absolute inset-0"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Glow Filters */}
          <filter id="glow-gold">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="glow-purple">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Energy Paths */}
        {ARCS.map((arc, i) => {
          if (i === 0) return null;
          const prev = ARCS[i - 1];
          return (
            <motion.path
              key={`path-${arc.id}`}
              d={`M ${prev.x} ${prev.y} Q ${(prev.x + arc.x) / 2} ${(prev.y + arc.y) / 2 + 10} ${arc.x} ${arc.y}`}
              fill="none"
              stroke={getArcStatus(arc.id) === 'locked' ? '#333' : arc.color}
              strokeWidth="0.3"
              strokeDasharray="1 1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: i * 0.3 }}
            />
          );
        })}

        {/* Center Portal - The Frame */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1 }}
        >
          <circle cx="50" cy="50" r="8" fill="none" stroke="#00FFFF" strokeWidth="0.5" opacity="0.6">
            <animate attributeName="r" values="8;10;8" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.3;0.6" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="50" r="5" fill="none" stroke="#FFD700" strokeWidth="0.3" opacity="0.4" />
          <text x="50" y="51" textAnchor="middle" fill="#00FFFF" fontSize="4" fontWeight="bold">∞</text>
          <text x="50" y="62" textAnchor="middle" fill="#666" fontSize="2" letterSpacing="0.2">THE FRAME</text>
        </motion.g>

        {/* Islands */}
        {ARCS.map((arc, i) => (
          <IslandNode
            key={arc.id}
            {...arc}
            status={getArcStatus(arc.id)}
            delay={i * 0.2}
            onHover={() => setHoveredArc(arc)}
            onLeave={() => setHoveredArc(null)}
            onClick={() => handleArcClick(arc)}
          />
        ))}
      </svg>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredArc && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none"
  >
    <div 
      className="bg-black/90 border rounded-lg px-6 py-3 backdrop-blur-sm"
      style={{ borderColor: hoveredArc.color }}
    >
      <p className="text-white font-bold text-lg">{hoveredArc.label}</p>
      <p className="text-gray-400 text-sm">{hoveredArc.subtitle}</p>
      
      {/* Single lock indicator */}
      <p className="text-xs mt-2 flex items-center justify-center gap-1">
        {getArcStatus(hoveredArc.id) === 'locked' && (
          <>
            <span className="text-red-500">🔒</span>
            <span className="text-red-400">LOCKED — Complete previous Arc</span>
          </>
        )}
        {getArcStatus(hoveredArc.id) === 'preview' && (
          <>
            <span className="text-yellow-500">👁</span>
            <span className="text-yellow-400">PREVIEW — Lore available</span>
          </>
        )}
        {getArcStatus(hoveredArc.id) === 'unlocked' && (
          <>
            <span className="text-green-500">✓</span>
            <span className="text-green-400">UNLOCKED — Click to explore</span>
          </>
        )}
      </p>
    </div>
  </motion.div>
)}
      </AnimatePresence>

      {/* Locked Modal */}
      <AnimatePresence>
        {selectedArc?.status === 'locked' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedArc(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-[#0a0a0a] border border-gray-700 rounded-2xl p-8 max-w-md text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold text-white mb-2">Path Locked</h3>
              <p className="text-gray-400 mb-6">{selectedArc.message}</p>
              <button 
                onClick={() => setSelectedArc(null)}
                className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200"
              >
                Understood
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}