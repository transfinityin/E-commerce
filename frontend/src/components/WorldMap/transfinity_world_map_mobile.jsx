import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import audioManager from './AudioManager';
import './WorldMap.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ===== DETECT MOBILE / TOUCH =====
const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

const isMobileViewport = () => window.innerWidth <= 768;

// ===== ISLAND POSITIONS - RESPONSIVE =====
const ISLAND_POSITIONS = {
  desktop: {
    1:  { x: 5,  y: 25 },   // Founder's Arc
    2:  { x: 28, y: 38 },   // Phantom Arc
    3:  { x: 45, y: 20 },   // Ascension Arc
    4:  { x: 63, y: 40 },   // Rebirth Arc
    5:  { x: 68, y: 15 },   // Eclipse Arc
    6:  { x: 80, y: 40 },   // Crimson Arc
    7:  { x: 77, y: 75 },   // Void Arc
    8:  { x: 55, y: 60 },   // Zenith Arc
    9:  { x: 40, y: 80 },   // Cosmic Arc
    10: { x: 40, y: 45 },   // Shadow War Arc
    11: { x: 30, y: 70 },   // Celestial Arc
    12: { x: 7,  y: 70 },   // Eternal Arc
  },
  mobile: {
    1:  { x: 10, y: 85 },   // Founder's Arc - bottom
    2:  { x: 30, y: 70 },   // Phantom Arc
    3:  { x: 50, y: 60 },  // Ascension Arc
    4:  { x: 75, y: 65 },  // Rebirth Arc
    5:  { x: 85, y: 50 },  // Eclipse Arc
    6:  { x: 80, y: 35 },  // Crimson Arc
    7:  { x: 65, y: 25 },  // Void Arc
    8:  { x: 45, y: 30 },  // Zenith Arc
    9:  { x: 25, y: 35 },  // Cosmic Arc
    10: { x: 15, y: 50 },  // Shadow War Arc
    11: { x: 35, y: 45 },  // Celestial Arc
    12: { x: 50, y: 15 },  // Eternal Arc - top
  }
};

// ===== SIMPLIFIED SVG ISLANDS FOR MOBILE =====
const MOBILE_ISLAND_SVGS = {
  island: (color) => `<circle cx="50" cy="50" r="40" fill="${color}" opacity="0.7"/><circle cx="50" cy="45" r="25" fill="${color}" opacity="0.9"/>`,
  volcano: (color) => `<polygon points="50,10 20,70 80,70" fill="${color}" opacity="0.8"/><circle cx="50" cy="25" r="8" fill="#ff4500" opacity="0.9"><animate attributeName="opacity" values="0.9;0.4;0.9" dur="1s" repeatCount="indefinite"/></circle>`,
  fortress: (color) => `<rect x="20" y="30" width="60" height="40" rx="4" fill="${color}" opacity="0.8"/><rect x="30" y="20" width="12" height="20" fill="${color}"/><rect x="58" y="20" width="12" height="20" fill="${color}"/>`,
  void: (color) => `<circle cx="50" cy="50" r="35" fill="#1a0033" opacity="0.9"/><circle cx="50" cy="50" r="15" fill="#000" opacity="0.9"><animate attributeName="r" values="15;20;15" dur="3s" repeatCount="indefinite"/></circle>`,
  castle: (color) => `<rect x="25" y="35" width="50" height="35" fill="${color}" opacity="0.8"/><polygon points="25,35 50,15 75,35" fill="${color}" opacity="0.9"/>`,
  cosmic: (color) => `<circle cx="50" cy="50" r="35" fill="${color}" opacity="0.5"/><circle cx="50" cy="50" r="12" fill="#fff" opacity="0.3"><animate attributeName="r" values="12;18;12" dur="4s" repeatCount="indefinite"/></circle>`,
  celestial: (color) => `<ellipse cx="50" cy="50" rx="40" ry="30" fill="${color}" opacity="0.6"/><ellipse cx="50" cy="50" rx="45" ry="35" fill="none" stroke="#ffd700" stroke-width="2" opacity="0.3"><animate attributeName="opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite"/></ellipse>`,
  storm: (color) => `<ellipse cx="50" cy="50" rx="40" ry="30" fill="#2a2a3a" opacity="0.8"/><polygon points="45,25 40,45 50,45 45,65" fill="#fff" opacity="0"><animate attributeName="opacity" values="0;1;0" dur="0.2s" repeatCount="indefinite" begin="2s"/></polygon>`,
};

// Desktop detailed SVGs (from original)
const DESKTOP_ISLAND_SVGS = {
  // ... (keep original detailed SVGs)
  island: (color, name) => `
    <defs>
      <radialGradient id="grad-${name}" cx="40%" cy="30%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.9"/>
        <stop offset="50%" stop-color="${color}" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="#1a3a2f" stop-opacity="0.9"/>
      </radialGradient>
    </defs>
    <ellipse cx="50" cy="55" rx="45" ry="32" fill="url(#grad-${name})"/>
    <polygon points="35,45 50,20 65,45" fill="${color}" opacity="0.6"/>
    <polygon points="40,42 50,25 60,42" fill="#fff" opacity="0.3"/>
    <circle cx="25" cy="50" r="8" fill="#0d5c3b" opacity="0.8"/>
    <circle cx="75" cy="52" r="7" fill="#0d5c3b" opacity="0.7"/>
    <circle cx="50" cy="40" r="6" fill="#0d5c3b" opacity="0.6"/>
    <ellipse cx="50" cy="70" rx="40" ry="8" fill="#c4a35a" opacity="0.5"/>
  `,
  volcano: (color, name) => `
    <defs>
      <radialGradient id="grad-${name}" cx="50%" cy="20%">
        <stop offset="0%" stop-color="#ff6b35" stop-opacity="0.9"/>
        <stop offset="30%" stop-color="${color}" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#2d1b14" stop-opacity="0.9"/>
      </radialGradient>
    </defs>
    <ellipse cx="50" cy="60" rx="42" ry="28" fill="url(#grad-${name})"/>
    <ellipse cx="50" cy="22" rx="12" ry="6" fill="#1a0a05"/>
    <path d="M50 22 Q45 35 42 50" stroke="#ff4500" stroke-width="3" fill="none" opacity="0.8">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
    </path>
    <circle cx="50" cy="15" r="4" fill="#666" opacity="0.5">
      <animate attributeName="cy" values="15;5;15" dur="3s" repeatCount="indefinite"/>
    </circle>
  `,
  fortress: (color, name) => `
    <defs>
      <linearGradient id="grad-${name}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#1a1a2e" stop-opacity="0.9"/>
      </linearGradient>
    </defs>
    <ellipse cx="50" cy="65" rx="40" ry="20" fill="#2d4a3e"/>
    <rect x="25" y="35" width="50" height="30" rx="2" fill="url(#grad-${name})"/>
    <rect x="20" y="25" width="12" height="25" fill="${color}"/>
    <rect x="68" y="25" width="12" height="25" fill="${color}"/>
    <rect x="44" y="20" width="12" height="20" fill="${color}"/>
    <polygon points="20,25 26,18 32,25" fill="#4a4a6a"/>
    <polygon points="68,25 74,18 80,25" fill="#4a4a6a"/>
    <polygon points="44,20 50,13 56,20" fill="#4a4a6a"/>
    <rect x="42" y="50" width="16" height="15" rx="8" fill="#1a1a2e"/>
  `,
  void: (color, name) => `
    <defs>
      <radialGradient id="grad-${name}" cx="50%" cy="50%">
        <stop offset="0%" stop-color="#000" stop-opacity="1"/>
        <stop offset="40%" stop-color="#1a0033" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.3"/>
      </radialGradient>
    </defs>
    <ellipse cx="50" cy="55" rx="40" ry="30" fill="url(#grad-${name})"/>
    <ellipse cx="50" cy="55" rx="25" ry="18" fill="none" stroke="#4b0082" stroke-width="2" opacity="0.6">
      <animateTransform attributeName="transform" type="rotate" from="0 50 55" to="360 50 55" dur="8s" repeatCount="indefinite"/>
    </ellipse>
    <circle cx="50" cy="55" r="8" fill="#000">
      <animate attributeName="r" values="8;10;8" dur="3s" repeatCount="indefinite"/>
    </circle>
  `,
  castle: (color, name) => `
    <ellipse cx="50" cy="65" rx="42" ry="22" fill="#2d5a27"/>
    <rect x="30" y="30" width="40" height="35" rx="2" fill="${color}" opacity="0.9"/>
    <polygon points="25,30 50,10 75,30" fill="${color}" opacity="0.8"/>
    <rect x="22" y="22" width="14" height="20" fill="${color}"/>
    <rect x="64" y="22" width="14" height="20" fill="${color}"/>
    <rect x="44" y="15" width="12" height="18" fill="${color}"/>
    <rect x="42" y="50" width="16" height="15" rx="8" fill="#1a1a2e"/>
  `,
  cosmic: (color, name) => `
    <ellipse cx="50" cy="55" rx="40" ry="30" fill="${color}" opacity="0.5"/>
    <circle cx="30" cy="45" r="2" fill="#fff" opacity="0.8">
      <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="70" cy="50" r="1.5" fill="#fff" opacity="0.6">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="50" cy="55" r="10" fill="#fff" opacity="0.3">
      <animate attributeName="r" values="10;14;10" dur="4s" repeatCount="indefinite"/>
    </circle>
  `,
  celestial: (color, name) => `
    <ellipse cx="50" cy="55" rx="45" ry="35" fill="none" stroke="#ffd700" stroke-width="2" opacity="0.3">
      <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite"/>
    </ellipse>
    <ellipse cx="50" cy="55" rx="38" ry="28" fill="${color}" opacity="0.5"/>
    <rect x="25" y="30" width="6" height="20" rx="2" fill="#e0e0ff" opacity="0.6"/>
    <rect x="69" y="30" width="6" height="20" rx="2" fill="#e0e0ff" opacity="0.6"/>
    <rect x="47" y="25" width="6" height="15" rx="2" fill="#ffd700" opacity="0.5">
      <animate attributeName="y" values="25;22;25" dur="3s" repeatCount="indefinite"/>
    </rect>
  `,
  storm: (color, name) => `
    <ellipse cx="50" cy="55" rx="42" ry="30" fill="#2a2a3a" opacity="0.8"/>
    <polygon points="48,25 45,40 52,40 47,55" fill="#fff" opacity="0">
      <animate attributeName="opacity" values="0;1;0" dur="0.2s" repeatCount="indefinite" begin="2s"/>
    </polygon>
    <ellipse cx="50" cy="30" rx="25" ry="10" fill="#2a2a3a" opacity="0.7"/>
  `,
};

// ===== SHIP COMPONENT =====
const Ship = ({ position, isMoving, isMobile }) => {
  const size = isMobile ? 28 : 40;

  return (
    <motion.div
      className={`ship ${isMoving ? 'moving' : ''}`}
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      animate={isMoving 
        ? { y: [0, -5, 0], rotate: [-6, 6, -6] } 
        : { y: [0, -3, 0], rotate: [-3, 3, -3] }
      }
      transition={{ duration: isMoving ? 0.8 : 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 50 50" width={size} height={size}>
        <defs>
          <linearGradient id="shipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700"/>
            <stop offset="100%" stopColor="#B8860B"/>
          </linearGradient>
        </defs>
        <path d="M10 30 Q25 45 40 30 L35 25 L15 25 Z" fill="url(#shipGrad)" stroke="#8B6914" strokeWidth="1"/>
        <path d="M25 25 L25 8 L38 22 Z" fill="#FFF" opacity="0.9"/>
        <path d="M25 25 L25 12 L12 22 Z" fill="#DDD" opacity="0.7"/>
        <line x1="25" y1="25" x2="25" y2="5" stroke="#8B6914" strokeWidth="2"/>
        <polygon points="25,5 32,8 25,11" fill="#FF4500"/>
      </svg>
      {isMoving && (
        <motion.div 
          className="ship-wake"
          animate={{ opacity: [0.5, 0, 0.5], scaleX: [1, 1.5, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

// ===== ISLAND COMPONENT =====
const Island = ({ arc, status, onClick, isMobile }) => {
  const isLocked = status === 'locked';
  const isHidden = status === 'hidden';
  const isUnlocked = status === 'unlocked';

  const islandSize = isMobile ? (arc.island_size || 1) * 0.6 : (arc.island_size || 1);
  const svgSize = isMobile ? 50 : 80;

  const islandShape = isMobile 
    ? (MOBILE_ISLAND_SVGS[arc.island_icon] || MOBILE_ISLAND_SVGS.island)
    : (DESKTOP_ISLAND_SVGS[arc.island_icon] || DESKTOP_ISLAND_SVGS.island);

  return (
    <motion.div
      className={`island-wrapper ${status} ${isMobile ? 'mobile' : ''}`}
      style={{ left: `${arc.map_x}%`, top: `${arc.map_y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: arc.arc_number * 0.08, duration: 0.5, type: "spring" }}
    >
      {/* Fog for locked/hidden */}
      {(isLocked || isHidden) && !isMobile && (
        <motion.div 
          className="island-fog" 
          animate={{ opacity: [0.5, 0.8, 0.5] }} 
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* Lock icon */}
      {isLocked && (
        <motion.div 
          className="island-lock" 
          animate={{ scale: [1, 1.15, 1] }} 
          transition={{ duration: 2, repeat: Infinity }}
        >
          🔒
        </motion.div>
      )}

      {/* Island shape */}
      <motion.div
        className="island-shape"
        onClick={() => {
          if (isUnlocked || arc.arc_number === 1) {
            audioManager.playEffect('click');
            onClick(arc);
          }
        }}
        whileHover={isUnlocked ? { scale: 1.15 } : {}}
        whileTap={isUnlocked ? { scale: 0.9 } : {}}
        style={{ cursor: isUnlocked ? 'pointer' : 'not-allowed' }}
      >
        <svg 
          viewBox="0 0 100 100" 
          width={svgSize * islandSize} 
          height={svgSize * islandSize}
          dangerouslySetInnerHTML={{ 
            __html: isMobile 
              ? islandShape(arc.theme_color) 
              : islandShape(arc.theme_color, arc.arc_key) 
          }}
        />
      </motion.div>

      {/* Label */}
      <motion.div 
        className={`island-label ${isMobile ? 'mobile' : ''}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: arc.arc_number * 0.08 + 0.3 }}
      >
        <span className="arc-number">ARC {String(arc.arc_number).padStart(2, '0')}</span>
        <span className="arc-name">{arc.name}</span>
        {!isMobile && <span className="arc-subtitle">{arc.subtitle}</span>}
        {isUnlocked && <span className="arc-status unlocked">✦</span>}
        {isLocked && <span className="arc-status locked">🔒</span>}
        {isHidden && <span className="arc-status hidden">?</span>}
      </motion.div>

      {/* Pulse ring for unlocked - desktop only */}
      {isUnlocked && !isMobile && (
        <motion.div 
          className="island-pulse" 
          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }} 
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{ borderColor: arc.theme_color }}
        />
      )}
    </motion.div>
  );
};

// ===== BACKGROUND SCENERY =====
const BackgroundScenery = ({ isMobile }) => {
  if (isMobile) {
    // Simplified scenery for mobile
    return (
      <div className="background-scenery mobile">
        {/* Simplified clouds */}
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            className="bg-cloud"
            style={{ top: `${5 + i * 20}%`, left: `${i * 40}%` }}
            animate={{ x: [0, 50, 0], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 25 + i * 10, repeat: Infinity, ease: "linear" }}
          >
            <div className="cloud-shape" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="background-scenery">
      {/* Distant mountains */}
      <div className="mountains-back">
        <svg viewBox="0 0 1200 300" preserveAspectRatio="none" className="mountains-svg">
          <path d="M0 300 L0 200 L100 100 L200 180 L300 80 L400 200 L500 120 L600 220 L700 90 L800 200 L900 110 L1000 190 L1100 100 L1200 200 L1200 300 Z" 
                fill="#0a1628" opacity="0.6"/>
          <path d="M0 300 L0 220 L150 140 L250 200 L350 130 L450 210 L550 150 L650 220 L750 140 L850 200 L950 130 L1050 210 L1200 160 L1200 300 Z" 
                fill="#0d1f3c" opacity="0.4"/>
        </svg>
      </div>

      {/* Birds */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="bird"
          style={{ top: `${10 + i * 8}%`, left: `${-10}%` }}
          animate={{ 
            x: ['0vw', '110vw'],
            y: [0, -20, 10, -15, 0],
          }}
          transition={{ 
            duration: 20 + i * 5, 
            repeat: Infinity, 
            delay: i * 3,
            ease: "linear"
          }}
        >
          <svg width="20" height="10" viewBox="0 0 20 10">
            <path d="M0 5 Q5 0 10 5 Q15 0 20 5" fill="none" stroke="#666" strokeWidth="1" opacity="0.5"/>
          </svg>
        </motion.div>
      ))}

      {/* Clouds */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`cloud-${i}`}
          className="bg-cloud"
          style={{ top: `${5 + i * 15}%`, left: `${i * 25}%` }}
          animate={{ x: [0, 100, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 30 + i * 10, repeat: Infinity, ease: "linear" }}
        >
          <div className="cloud-shape" />
        </motion.div>
      ))}
    </div>
  );
};

// ===== MAIN WORLD MAP =====
const WorldMap = () => {
  const navigate = useNavigate();
  const [arcs, setArcs] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [immersionMode, setImmersionMode] = useState(false);

  // Boat travel animation state
  const [shipPosition, setShipPosition] = useState({ x: 5, y: 25 });
  const [isShipMoving, setIsShipMoving] = useState(false);
  const [shipTarget, setShipTarget] = useState(null);

  // Touch drag state for mobile
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const mapRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const lastTouchTime = useRef(0);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileViewport() || isTouchDevice());
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize audio
  useEffect(() => {
    audioManager.init();
    const muted = localStorage.getItem('map_muted') === 'true';
    setIsMuted(muted);

    return () => {
      audioManager.destroy();
    };
  }, []);

  // Handle immersion mode ambient
  useEffect(() => {
    if (immersionMode && !isMuted) {
      audioManager.playAmbient('ocean');
    } else {
      audioManager.stopAmbient();
    }
  }, [immersionMode, isMuted]);

  // Fetch map data
  useEffect(() => { 
    fetchMapData(); 
  }, []);

  const fetchMapData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_BASE}/map/world/`, { headers });

      const positions = isMobile ? ISLAND_POSITIONS.mobile : ISLAND_POSITIONS.desktop;

      const arcsWithPositions = (response.data.arcs || []).map(arc => ({
        ...arc,
        map_x: positions[arc.arc_number]?.x || 50,
        map_y: positions[arc.arc_number]?.y || 50,
      }));

      setArcs(arcsWithPositions);
      setUserProgress(response.data.user_progress);

      const currentArcNum = response.data.user_progress?.current_arc || 1;
      const currentPos = positions[currentArcNum] || positions[1];
      setShipPosition(currentPos);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load map:', error);
      setLoading(false);
    }
  };

  // ===== BOAT TRAVEL ANIMATION =====
  const travelToArc = async (targetArc) => {
    if (isShipMoving) return;

    const positions = isMobile ? ISLAND_POSITIONS.mobile : ISLAND_POSITIONS.desktop;
    const targetPos = positions[targetArc.arc_number];
    if (!targetPos) return;

    setIsShipMoving(true);
    setShipTarget(targetArc);
    audioManager.playEffect('sail');

    const startPos = { ...shipPosition };
    const steps = isMobile ? 30 : 40; // Faster on mobile
    const dx = (targetPos.x - startPos.x) / steps;
    const dy = (targetPos.y - startPos.y) / steps;

    for (let i = 0; i <= steps; i++) {
      setShipPosition({ x: startPos.x + dx * i, y: startPos.y + dy * i });
      await new Promise(r => setTimeout(r, isMobile ? 20 : 25));
    }

    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_BASE}/arcs/${targetArc.arc_key}/visit/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      audioManager.playEffect('unlock');
    } catch (e) {}

    setIsShipMoving(false);
    setShipTarget(null);

    // Navigate
    if (targetArc.arc_number === 1) {
      navigate(`/arc/${targetArc.arc_key}/detail`);
    } else {
      navigate(`/arc/${targetArc.arc_key}`);
    }
  };

  const handleIslandClick = (arc) => {
    const currentArcNum = userProgress?.current_arc || 1;
    if (arc.arc_number === currentArcNum) {
      if (arc.arc_number === 1) {
        navigate(`/arc/${arc.arc_key}/detail`);
      } else {
        navigate(`/arc/${arc.arc_key}`);
      }
    } else {
      travelToArc(arc);
    }
  };

  const getIslandStatus = (arc) => {
    if (!userProgress) return arc.is_unlocked ? 'unlocked' : 'locked';
    if (userProgress.unlocked_arcs?.includes(arc.arc_key)) return 'unlocked';
    if (arc.is_revealed) return 'locked';
    return 'hidden';
  };

  // ===== TOUCH HANDLERS FOR MOBILE =====
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    lastTouchTime.current = Date.now();

    setDragStart({
      x: touch.clientX - mapOffset.x,
      y: touch.clientY - mapOffset.y,
    });
  }, [mapOffset]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];

    // Check if this is a drag or a tap
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);

    if (dx > 10 || dy > 10) {
      setIsDragging(true);
      setMapOffset({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    const touchDuration = Date.now() - lastTouchTime.current;
    const wasDragging = isDragging;

    setIsDragging(false);

    // If it was a quick tap and not a drag, let the click handler work
    if (!wasDragging && touchDuration < 300) {
      // Click will be handled by the element's onClick
    }
  }, [isDragging]);

  const toggleMute = () => {
    const newMuted = audioManager.toggleMute();
    setIsMuted(newMuted);
  };

  const toggleImmersion = () => {
    setImmersionMode(prev => !prev);
  };

  // ===== PATHS SVG =====
  const renderPaths = useMemo(() => {
    if (!arcs.length) return null;

    const paths = [];
    for (let i = 0; i < arcs.length - 1; i++) {
      const fromArc = arcs[i];
      const toArc = arcs[i + 1];
      if (!fromArc || !toArc) continue;

      const isActive = getIslandStatus(fromArc) === 'unlocked';
      const midX = (fromArc.map_x + toArc.map_x) / 2;
      const midY = Math.min(fromArc.map_y, toArc.map_y) - (isMobile ? 5 : 15);

      paths.push(
        <motion.path
          key={`path-${i}`}
          d={`M ${fromArc.map_x} ${fromArc.map_y} Q ${midX} ${midY} ${toArc.map_x} ${toArc.map_y}`}
          fill="none"
          stroke={isActive ? "#FFD700" : "#1a3a5c"}
          strokeWidth={isActive ? (isMobile ? "0.4" : "0.6") : (isMobile ? "0.2" : "0.3")}
          strokeDasharray={isActive ? "2 1" : "1 2"}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isActive ? 1 : 0.3 }}
          transition={{ duration: 3, ease: "easeInOut" }}
          opacity={isActive ? 0.7 : 0.15}
        />
      );
    }
    return paths;
  }, [arcs, isMobile]);

  if (loading) {
    return (
      <div className="world-map-loading">
        <motion.div 
          className="loading-ship" 
          animate={{ rotate: [0, 10, -10, 0], y: [0, -5, 0] }} 
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⚓
        </motion.div>
        <p>Loading The Infinite Path...</p>
      </div>
    );
  }

  return (
    <div className={`world-map-container ${immersionMode ? 'immersion-mode' : ''} ${isMobile ? 'mobile' : ''}`}>
      {/* Background layers */}
      <div className="map-background">
        <div className="ocean-gradient" />

        {/* Animated waves - fewer on mobile */}
        <div className="ocean-waves">
          {[...Array(isMobile ? 3 : 6)].map((_, i) => (
            <motion.div 
              key={i} 
              className="wave" 
              style={{ top: `${i * (isMobile ? 30 : 16)}%`, opacity: 0.03 + i * 0.01 }}
              animate={{ x: ['-100%', '0%'] }}
              transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </div>

        <BackgroundScenery isMobile={isMobile} />

        {/* Particles - fewer on mobile */}
        <div className="map-particles">
          {[...Array(isMobile ? 10 : 40)].map((_, i) => (
            <motion.div 
              key={i} 
              className="particle" 
              style={{ 
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 100}%`,
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
              }}
              animate={{ 
                opacity: [0, Math.random() * 0.6, 0], 
                y: [0, -30, 0],
                scale: [0, 1, 0] 
              }}
              transition={{ 
                duration: 4 + Math.random() * 6, 
                repeat: Infinity, 
                delay: Math.random() * 5 
              }}
            />
          ))}
        </div>
      </div>

      {/* Map content with touch support */}
      <div 
        className="map-content"
        ref={mapRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: isMobile ? `translate(${mapOffset.x}px, ${mapOffset.y}px)` : 'none',
        }}
      >
        {/* Path lines */}
        <svg className="paths-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
          {renderPaths}
        </svg>

        {/* Ship */}
        <Ship 
          position={shipPosition} 
          isMoving={isShipMoving}
          isMobile={isMobile}
        />

        {/* Islands */}
        {arcs.map((arc) => (
          <Island 
            key={arc.id} 
            arc={arc} 
            status={getIslandStatus(arc)} 
            onClick={handleIslandClick}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* UI Overlay */}
      <div className="map-ui-overlay">
        {/* Header */}
        <motion.div 
          className={`map-header ${isMobile ? 'mobile' : ''}`}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h1>⚓ TRANSFINITY</h1>
          {!isMobile && <p>The Infinite Path Across 12 Realms</p>}
        </motion.div>

        {/* Progress Panel */}
        {userProgress && (
          <motion.div 
            className={`progress-panel ${isMobile ? 'mobile' : ''}`}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="rank-badge">
              <span className="rank-icon">⚔️</span>
              <div className="rank-info">
                <span className="rank-name">{userProgress.rank?.toUpperCase() || 'WANDERER'}</span>
                {!isMobile && <span className="rank-title">Founder Rank</span>}
              </div>
            </div>
            <div className="xp-section">
              <div className="xp-bar">
                <motion.div 
                  className="xp-fill" 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (userProgress.xp % 1000) / 10)}%` }}
                  transition={{ duration: 1, delay: 1 }}
                />
              </div>
              <span className="xp-text">{userProgress.xp || 0} XP</span>
            </div>
            {!isMobile && (
              <div className="progress-stats">
                <div className="stat">
                  <span className="stat-icon">🗺️</span>
                  <span className="stat-value">{userProgress.unlocked_arcs?.length || 0}/12 Arcs</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">💎</span>
                  <span className="stat-value">{userProgress.secrets_found || 0} Secrets</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">⚓</span>
                  <span className="stat-value">{userProgress.total_distance?.toFixed(1) || 0}km</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Controls */}
        <div className={`map-controls ${isMobile ? 'mobile' : ''}`}>
          <motion.button 
            className="control-btn mute-btn"
            onClick={toggleMute}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </motion.button>

          {!isMobile && (
            <motion.button 
              className="control-btn immersion-btn"
              onClick={toggleImmersion}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={immersionMode ? 'Exit Immersion' : 'Immersion Mode'}
            >
              {immersionMode ? '🌊' : '📺'}
            </motion.button>
          )}
        </div>

        {/* Legend - hidden on mobile */}
        {!isMobile && (
          <motion.div 
            className="map-legend"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="legend-item">
              <span className="legend-dot unlocked" /> 
              <span>Unlocked</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot locked" /> 
              <span>Locked</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot hidden" /> 
              <span>Hidden</span>
            </div>
          </motion.div>
        )}

        {/* Travel notification */}
        <AnimatePresence>
          {isShipMoving && shipTarget && (
            <motion.div 
              className="travel-notification"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <span className="travel-icon">⚓</span>
              <span>Sailing to {shipTarget.name}...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorldMap;