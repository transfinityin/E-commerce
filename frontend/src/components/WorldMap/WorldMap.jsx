// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { motion, AnimatePresence, useAnimation } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// // import { Howl } from 'howler';
// import './WorldMap.css';

// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // ===== AUDIO MANAGER =====
// class AudioManager {
//   constructor() {
//     this.sounds = {};
//     this.isMuted = localStorage.getItem('map_muted') === 'true';
//     this.currentAmbient = null;
//     this.initialized = false;
//   }

//   init() {
//     if (this.initialized) return;

//     // Create synthesized sounds using Web Audio API (no external files needed)
//     this.createAmbientSounds();
//     this.initialized = true;
//   }

//   createAmbientSounds() {
//     // Ocean ambience - created procedurally
//     this.sounds.ocean = this.createLoopingSound('ocean', 0.15);
//     this.sounds.wind = this.createLoopingSound('wind', 0.1);
//     this.sounds.fire = this.createLoopingSound('fire', 0.08);

//     // One-shot effects
//     this.sounds.hover = { play: () => this.playTone(800, 0.05, 'sine') };
//     this.sounds.click = { play: () => this.playTone(1200, 0.1, 'triangle') };
//     this.sounds.unlock = { play: () => this.playChord([523, 659, 784], 0.3) };
//     this.sounds.treasure = { play: () => this.playChord([784, 988, 1175], 0.4) };
//     this.sounds.sail = { play: () => this.playTone(200, 0.5, 'sawtooth', 0.1) };
//   }

//   createLoopingSound(type, volume) {
//     // Return a mock object that can be controlled
//     return {
//       play: () => {},
//       stop: () => {},
//       fade: () => {},
//       volume: (v) => {}
//     };
//   }

//   stopAll() {
//     // Stop all ambient sounds
//     if (this.currentAmbient && this.sounds[this.currentAmbient]) {
//       this.sounds[this.currentAmbient].stop();
//     }
//     this.currentAmbient = null;

//     // Stop all one-shot sounds (they stop automatically, but just in case)
//     Object.values(this.sounds).forEach(sound => {
//       if (sound && typeof sound.stop === 'function') {
//         sound.stop();
//       }
//     });
//   }

//   playTone(freq, duration, type = 'sine', vol = 0.1) {
//     try {
//       const ctx = new (window.AudioContext || window.webkitAudioContext)();
//       const osc = ctx.createOscillator();
//       const gain = ctx.createGain();
//       osc.type = type;
//       osc.frequency.value = freq;
//       gain.gain.value = vol;
//       osc.connect(gain);
//       gain.connect(ctx.destination);
//       osc.start();
//       gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
//       osc.stop(ctx.currentTime + duration);
//     } catch(e) {}
//   }

//   playChord(freqs, duration) {
//     freqs.forEach((f, i) => setTimeout(() => this.playTone(f, duration, 'sine', 0.08), i * 50));
//   }

//   playEffect(name) {
//     if (this.isMuted || !this.sounds[name]) return;
//     this.sounds[name].play();
//   }

//   playAmbient(type) {
//     if (this.isMuted) return;
//     if (this.currentAmbient && this.sounds[this.currentAmbient]) {
//       this.sounds[this.currentAmbient].stop();
//     }
//     if (this.sounds[type]) {
//       this.sounds[type].play();
//       this.currentAmbient = type;
//     }
//   }

//   toggleMute() {
//     this.isMuted = !this.isMuted;
//     localStorage.setItem('map_muted', this.isMuted);
//     if (this.isMuted) {
//       if (this.currentAmbient) this.sounds[this.currentAmbient]?.stop();
//     }
//     return this.isMuted;
//   }
// }

// const audioManager = new AudioManager();

// // ===== SVG ISLAND SHAPES (Enhanced with terrain) =====
// const ISLAND_SHAPES = {
//   island: (color, name) => `
//     <defs>
//       <radialGradient id="grad-${name}" cx="40%" cy="30%">
//         <stop offset="0%" stop-color="${color}" stop-opacity="0.9"/>
//         <stop offset="50%" stop-color="${color}" stop-opacity="0.7"/>
//         <stop offset="100%" stop-color="#1a3a2f" stop-opacity="0.9"/>
//       </radialGradient>
//       <filter id="glow-${name}">
//         <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
//         <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
//       </filter>
//     </defs>
//     <!-- Main island body -->
//     <ellipse cx="50" cy="55" rx="45" ry="32" fill="url(#grad-${name})" filter="url(#glow-${name})"/>
//     <!-- Mountain peak -->
//     <polygon points="35,45 50,20 65,45" fill="${color}" opacity="0.6"/>
//     <polygon points="40,42 50,25 60,42" fill="#fff" opacity="0.3"/>
//     <!-- Trees -->
//     <circle cx="25" cy="50" r="8" fill="#0d5c3b" opacity="0.8"/>
//     <circle cx="75" cy="52" r="7" fill="#0d5c3b" opacity="0.7"/>
//     <circle cx="50" cy="40" r="6" fill="#0d5c3b" opacity="0.6"/>
//     <!-- Beach -->
//     <ellipse cx="50" cy="70" rx="40" ry="8" fill="#c4a35a" opacity="0.5"/>
//     <!-- Water ripple -->
//     <ellipse cx="50" cy="78" rx="35" ry="4" fill="none" stroke="#4fc3f7" stroke-width="1" opacity="0.4">
//       <animate attributeName="rx" values="35;40;35" dur="3s" repeatCount="indefinite"/>
//     </ellipse>
//   `,

//   volcano: (color, name) => `
//     <defs>
//       <radialGradient id="grad-${name}" cx="50%" cy="20%">
//         <stop offset="0%" stop-color="#ff6b35" stop-opacity="0.9"/>
//         <stop offset="30%" stop-color="${color}" stop-opacity="0.8"/>
//         <stop offset="100%" stop-color="#2d1b14" stop-opacity="0.9"/>
//       </radialGradient>
//     </defs>
//     <!-- Volcano body -->
//     <ellipse cx="50" cy="60" rx="42" ry="28" fill="url(#grad-${name})"/>
//     <!-- Crater -->
//     <ellipse cx="50" cy="22" rx="12" ry="6" fill="#1a0a05"/>
//     <!-- Lava flow -->
//     <path d="M50 22 Q45 35 42 50" stroke="#ff4500" stroke-width="3" fill="none" opacity="0.8">
//       <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
//     </path>
//     <path d="M50 22 Q55 35 58 48" stroke="#ff6b35" stroke-width="2" fill="none" opacity="0.7">
//       <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
//     </path>
//     <!-- Smoke -->
//     <circle cx="50" cy="15" r="4" fill="#666" opacity="0.5">
//       <animate attributeName="cy" values="15;5;15" dur="3s" repeatCount="indefinite"/>
//       <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite"/>
//     </circle>
//     <!-- Fire particles -->
//     <circle cx="48" cy="20" r="2" fill="#ff4500" opacity="0.8">
//       <animate attributeName="cy" values="20;10;20" dur="1s" repeatCount="indefinite"/>
//     </circle>
//   `,

//   fortress: (color, name) => `
//     <defs>
//       <linearGradient id="grad-${name}" x1="0%" y1="0%" x2="0%" y2="100%">
//         <stop offset="0%" stop-color="${color}" stop-opacity="0.9"/>
//         <stop offset="100%" stop-color="#1a1a2e" stop-opacity="0.9"/>
//       </linearGradient>
//     </defs>
//     <!-- Island base -->
//     <ellipse cx="50" cy="65" rx="40" ry="20" fill="#2d4a3e"/>
//     <!-- Fortress walls -->
//     <rect x="25" y="35" width="50" height="30" rx="2" fill="url(#grad-${name})"/>
//     <!-- Towers -->
//     <rect x="20" y="25" width="12" height="25" fill="${color}"/>
//     <rect x="68" y="25" width="12" height="25" fill="${color}"/>
//     <rect x="44" y="20" width="12" height="20" fill="${color}"/>
//     <!-- Tower tops -->
//     <polygon points="20,25 26,18 32,25" fill="#4a4a6a"/>
//     <polygon points="68,25 74,18 80,25" fill="#4a4a6a"/>
//     <polygon points="44,20 50,13 56,20" fill="#4a4a6a"/>
//     <!-- Gate -->
//     <rect x="42" y="50" width="16" height="15" rx="8" fill="#1a1a2e"/>
//     <!-- Flag -->
//     <line x1="50" y1="13" x2="50" y2="5" stroke="#888" stroke-width="1"/>
//     <polygon points="50,5 62,8 50,11" fill="#ff4500"/>
//     <!-- Windows -->
//     <rect x="30" y="42" width="4" height="6" rx="2" fill="#1a1a2e"/>
//     <rect x="66" y="42" width="4" height="6" rx="2" fill="#1a1a2e"/>
//   `,

//   void: (color, name) => `
//     <defs>
//       <radialGradient id="grad-${name}" cx="50%" cy="50%">
//         <stop offset="0%" stop-color="#000" stop-opacity="1"/>
//         <stop offset="40%" stop-color="#1a0033" stop-opacity="0.9"/>
//         <stop offset="100%" stop-color="${color}" stop-opacity="0.3"/>
//       </radialGradient>
//       <filter id="void-glow-${name}">
//         <feGaussianBlur stdDeviation="4"/>
//       </filter>
//     </defs>
//     <!-- Void vortex -->
//     <ellipse cx="50" cy="55" rx="40" ry="30" fill="url(#grad-${name})"/>
//     <!-- Swirling effect -->
//     <ellipse cx="50" cy="55" rx="25" ry="18" fill="none" stroke="#4b0082" stroke-width="2" opacity="0.6">
//       <animateTransform attributeName="transform" type="rotate" from="0 50 55" to="360 50 55" dur="8s" repeatCount="indefinite"/>
//     </ellipse>
//     <ellipse cx="50" cy="55" rx="15" ry="10" fill="none" stroke="#8b00ff" stroke-width="1.5" opacity="0.4">
//       <animateTransform attributeName="transform" type="rotate" from="360 50 55" to="0 50 55" dur="5s" repeatCount="indefinite"/>
//     </ellipse>
//     <!-- Center void -->
//     <circle cx="50" cy="55" r="8" fill="#000">
//       <animate attributeName="r" values="8;10;8" dur="3s" repeatCount="indefinite"/>
//     </circle>
//     <!-- Purple glow -->
//     <circle cx="50" cy="55" r="12" fill="#4b0082" opacity="0.3" filter="url(#void-glow-${name})">
//       <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite"/>
//     </circle>
//   `,

//   castle: (color, name) => `
//     <defs>
//       <linearGradient id="grad-${name}" x1="0%" y1="0%" x2="0%" y2="100%">
//         <stop offset="0%" stop-color="${color}" stop-opacity="0.9"/>
//         <stop offset="100%" stop-color="#4a4a6a" stop-opacity="0.9"/>
//       </linearGradient>
//     </defs>
//     <!-- Hill -->
//     <ellipse cx="50" cy="65" rx="42" ry="22" fill="#2d5a27"/>
//     <!-- Castle main -->
//     <rect x="30" y="30" width="40" height="35" rx="2" fill="url(#grad-${name})"/>
//     <!-- Roof -->
//     <polygon points="25,30 50,10 75,30" fill="${color}" opacity="0.8"/>
//     <!-- Left tower -->
//     <rect x="22" y="22" width="14" height="20" fill="${color}"/>
//     <polygon points="22,22 29,15 36,22" fill="#ffd700" opacity="0.6"/>
//     <!-- Right tower -->
//     <rect x="64" y="22" width="14" height="20" fill="${color}"/>
//     <polygon points="64,22 71,15 78,22" fill="#ffd700" opacity="0.6"/>
//     <!-- Center spire -->
//     <rect x="44" y="15" width="12" height="18" fill="${color}"/>
//     <polygon points="44,15 50,5 56,15" fill="#ffd700" opacity="0.8"/>
//     <!-- Gate -->
//     <rect x="42" y="50" width="16" height="15" rx="8" fill="#1a1a2e"/>
//     <!-- Windows glowing -->
//     <rect x="35" y="38" width="3" height="5" rx="1" fill="#ffd700" opacity="0.6">
//       <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
//     </rect>
//     <rect x="62" y="38" width="3" height="5" rx="1" fill="#ffd700" opacity="0.6">
//       <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite"/>
//     </rect>
//     <!-- Bridge -->
//     <rect x="45" y="65" width="10" height="3" fill="#8b6914"/>
//   `,

//   cosmic: (color, name) => `
//     <defs>
//       <radialGradient id="grad-${name}" cx="50%" cy="50%">
//         <stop offset="0%" stop-color="#fff" stop-opacity="0.9"/>
//         <stop offset="30%" stop-color="${color}" stop-opacity="0.5"/>
//         <stop offset="100%" stop-color="#000033" stop-opacity="0.8"/>
//       </radialGradient>
//     </defs>
//     <!-- Cosmic body -->
//     <ellipse cx="50" cy="55" rx="40" ry="30" fill="url(#grad-${name})"/>
//     <!-- Stars on surface -->
//     <circle cx="30" cy="45" r="2" fill="#fff" opacity="0.8">
//       <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/>
//     </circle>
//     <circle cx="70" cy="50" r="1.5" fill="#fff" opacity="0.6">
//       <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
//     </circle>
//     <circle cx="55" cy="35" r="2" fill="#ffd700" opacity="0.7">
//       <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.5s" repeatCount="indefinite"/>
//     </circle>
//     <circle cx="45" cy="65" r="1" fill="#fff" opacity="0.5">
//       <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
//     </circle>
//     <!-- Orbiting ring -->
//     <ellipse cx="50" cy="55" rx="35" ry="25" fill="none" stroke="#4b0082" stroke-width="1" opacity="0.4" transform="rotate(-20 50 55)"/>
//     <!-- Core glow -->
//     <circle cx="50" cy="55" r="10" fill="#fff" opacity="0.3">
//       <animate attributeName="r" values="10;14;10" dur="4s" repeatCount="indefinite"/>
//     </circle>
//   `,

//   celestial: (color, name) => `
//     <defs>
//       <radialGradient id="grad-${name}" cx="40%" cy="30%">
//         <stop offset="0%" stop-color="#fff" stop-opacity="0.9"/>
//         <stop offset="30%" stop-color="#e0e0ff" stop-opacity="0.7"/>
//         <stop offset="100%" stop-color="${color}" stop-opacity="0.3"/>
//       </radialGradient>
//       <filter id="halo-${name}">
//         <feGaussianBlur stdDeviation="5"/>
//       </filter>
//     </defs>
//     <!-- Divine halo -->
//     <ellipse cx="50" cy="55" rx="45" ry="35" fill="none" stroke="#ffd700" stroke-width="2" opacity="0.3" filter="url(#halo-${name})">
//       <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite"/>
//     </ellipse>
//     <!-- Island body -->
//     <ellipse cx="50" cy="55" rx="38" ry="28" fill="url(#grad-${name})"/>
//     <!-- Floating pillars -->
//     <rect x="25" y="30" width="6" height="20" rx="2" fill="#e0e0ff" opacity="0.6"/>
//     <rect x="69" y="30" width="6" height="20" rx="2" fill="#e0e0ff" opacity="0.6"/>
//     <rect x="47" y="25" width="6" height="15" rx="2" fill="#ffd700" opacity="0.5">
//       <animate attributeName="y" values="25;22;25" dur="3s" repeatCount="indefinite"/>
//     </rect>
//     <!-- Central light beam -->
//     <polygon points="45,40 50,15 55,40" fill="#fff" opacity="0.4">
//       <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite"/>
//     </polygon>
//     <!-- Clouds at base -->
//     <ellipse cx="35" cy="72" rx="15" ry="5" fill="#fff" opacity="0.3"/>
//     <ellipse cx="65" cy="70" rx="12" ry="4" fill="#fff" opacity="0.3"/>
//   `,

//   storm: (color, name) => `
//     <defs>
//       <radialGradient id="grad-${name}" cx="50%" cy="50%">
//         <stop offset="0%" stop-color="#4a4a6a" stop-opacity="0.8"/>
//         <stop offset="100%" stop-color="${color}" stop-opacity="0.4"/>
//       </radialGradient>
//     </defs>
//     <!-- Storm cloud island -->
//     <ellipse cx="50" cy="55" rx="42" ry="30" fill="url(#grad-${name})"/>
//     <!-- Lightning -->
//     <polygon points="48,25 45,40 52,40 47,55" fill="#fff" opacity="0">
//       <animate attributeName="opacity" values="0;1;0" dur="0.2s" repeatCount="indefinite" begin="2s"/>
//     </polygon>
//     <polygon points="52,30 49,42 56,42 51,58" fill="#ffd700" opacity="0">
//       <animate attributeName="opacity" values="0;0.8;0" dur="0.15s" repeatCount="indefinite" begin="3.5s"/>
//     </polygon>
//     <!-- Rain -->
//     <line x1="30" y1="45" x2="28" y2="55" stroke="#4fc3f7" stroke-width="1" opacity="0.5">
//       <animate attributeName="y1" values="45;48;45" dur="0.5s" repeatCount="indefinite"/>
//     </line>
//     <line x1="50" y1="40" x2="48" y2="50" stroke="#4fc3f7" stroke-width="1" opacity="0.4">
//       <animate attributeName="y1" values="40;43;40" dur="0.6s" repeatCount="indefinite"/>
//     </line>
//     <line x1="70" y1="48" x2="68" y2="58" stroke="#4fc3f7" stroke-width="1" opacity="0.5">
//       <animate attributeName="y1" values="48;51;48" dur="0.4s" repeatCount="indefinite"/>
//     </line>
//     <!-- Dark cloud top -->
//     <ellipse cx="50" cy="30" rx="25" ry="10" fill="#2a2a3a" opacity="0.7"/>
//   `,
// };

// // ===== AMBIENT EFFECTS =====
// const AmbientEffect = ({ type }) => {
//   const effects = {
//     fog: (
//       <motion.div 
//         className="ambient-fog" 
//         animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.3, 1] }} 
//         transition={{ duration: 4, repeat: Infinity }}
//       />
//     ),
//     fire: (
//       <motion.div 
//         className="ambient-fire" 
//         animate={{ opacity: [0.5, 1, 0.5], y: [0, -15, 0], scale: [1, 1.2, 1] }} 
//         transition={{ duration: 1.5, repeat: Infinity }}
//       />
//     ),
//     stars: (
//       <motion.div 
//         className="ambient-stars" 
//         animate={{ opacity: [0.3, 0.9, 0.3], rotate: [0, 180, 360] }} 
//         transition={{ duration: 8, repeat: Infinity }}
//       />
//     ),
//     storm: (
//       <motion.div 
//         className="ambient-storm" 
//         animate={{ opacity: [0.3, 0.8, 0.3], x: [-5, 5, -5] }} 
//         transition={{ duration: 0.5, repeat: Infinity }}
//       />
//     ),
//     glow: (
//       <motion.div 
//         className="ambient-glow" 
//         animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.4, 1] }} 
//         transition={{ duration: 3, repeat: Infinity }}
//       />
//     ),
//     darkness: (
//       <motion.div 
//         className="ambient-darkness" 
//         animate={{ opacity: [0.6, 0.95, 0.6], scale: [1, 1.1, 1] }} 
//         transition={{ duration: 5, repeat: Infinity }}
//       />
//     ),
//   };
//   return effects[type] || null;
// };

// // ===== SHIP COMPONENT =====
// const Ship = ({ position, isMoving, direction }) => {
//   const shipVariants = {
//     idle: {
//       y: [0, -4, 0],
//       rotate: [-3, 3, -3],
//       transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
//     },
//     moving: {
//       y: [0, -6, 0],
//       rotate: [-8, 8, -8],
//       transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
//     }
//   };

//   return (
//     <motion.div
//       className={`ship ${isMoving ? 'moving' : ''}`}
//       style={{ left: `${position.x}%`, top: `${position.y}%` }}
//       variants={shipVariants}
//       animate={isMoving ? 'moving' : 'idle'}
//     >
//       <svg viewBox="0 0 50 50" width="50" height="50">
//         <defs>
//           <linearGradient id="shipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" stopColor="#FFD700"/>
//             <stop offset="100%" stopColor="#B8860B"/>
//           </linearGradient>
//         </defs>
//         {/* Hull */}
//         <path d="M10 30 Q25 45 40 30 L35 25 L15 25 Z" fill="url(#shipGrad)" stroke="#FFF" strokeWidth="0.5"/>
//         {/* Sail */}
//         <path d="M25 25 L25 8 L38 22 Z" fill="#FFF" opacity="0.9"/>
//         <path d="M25 25 L25 12 L12 22 Z" fill="#DDD" opacity="0.7"/>
//         {/* Mast */}
//         <line x1="25" y1="25" x2="25" y2="5" stroke="#8B6914" strokeWidth="2"/>
//         {/* Flag */}
//         <polygon points="25,5 32,8 25,11" fill="#FF4500"/>
//         {/* Glow */}
//         <circle cx="25" cy="30" r="20" fill="#FFD700" opacity="0.15">
//           <animate attributeName="r" values="20;25;20" dur="2s" repeatCount="indefinite"/>
//         </circle>
//       </svg>
//       {/* Wake effect when moving */}
//       {isMoving && (
//         <motion.div 
//           className="ship-wake"
//           animate={{ opacity: [0.6, 0, 0.6], scaleX: [1, 1.5, 1] }}
//           transition={{ duration: 1, repeat: Infinity }}
//         />
//       )}
//     </motion.div>
//   );
// };

// // ===== ISLAND COMPONENT =====
// const Island = ({ arc, status, onClick, isHovered, onHover, onComplete }) => {
//   const isLocked = status === 'locked';
//   const isHidden = status === 'hidden';
//   const isUnlocked = status === 'unlocked';
//   const islandShape = ISLAND_SHAPES[arc.island_icon] || ISLAND_SHAPES.island;

//   return (
//     <motion.div
//       className={`island-wrapper ${status}`}
//       style={{ left: `${arc.map_x}%`, top: `${arc.map_y}%` }}
//       initial={{ scale: 0, opacity: 0, y: 50 }}
//       animate={{ scale: 1, opacity: 1, y: 0 }}
//       transition={{ delay: arc.arc_number * 0.15, duration: 0.6, type: "spring" }}
//       onMouseEnter={() => { onHover(arc.id); if (isUnlocked) audioManager.playEffect('hover'); }}
//       onMouseLeave={() => onHover(null)}
//     >
//       {/* Fog for locked/hidden */}
//       {(isLocked || isHidden) && (
//         <motion.div 
//           className="island-fog" 
//           animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] }} 
//           transition={{ duration: 3, repeat: Infinity }}
//         />
//       )}

//       {/* Lock icon */}
//       {isLocked && (
//         <motion.div 
//           className="island-lock" 
//           animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }} 
//           transition={{ duration: 2, repeat: Infinity }}
//         >
//           🔒
//         </motion.div>
//       )}

//       {/* Island shape */}
//       <motion.div
//         className="island-shape"
//         onClick={() => {
//           if (isUnlocked) {
//             audioManager.playEffect('click');
//             onClick(arc);
//           }
//         }}
//         whileHover={isUnlocked ? { scale: 1.25, y: -5 } : { scale: 1.05 }}
//         whileTap={isUnlocked ? { scale: 0.9 } : {}}
//         animate={isUnlocked ? { 
//           filter: ['brightness(1)', 'brightness(1.4)', 'brightness(1)'],
//         } : {}}
//         transition={{ duration: 3, repeat: Infinity }}
//         style={{ cursor: isUnlocked ? 'pointer' : 'not-allowed' }}
//       >
//         <svg 
//           viewBox="0 0 100 100" 
//           width={70 * arc.island_size} 
//           height={70 * arc.island_size}
//           dangerouslySetInnerHTML={{ __html: islandShape(arc.theme_color, arc.arc_key) }}
//         />
//       </motion.div>

//       {/* Label */}
//       <motion.div 
//         className="island-label" 
//         animate={isHovered === arc.id ? { y: -8, opacity: 1, scale: 1.1 } : { y: 0, opacity: 0.85, scale: 1 }}
//       >
//         <span className="arc-number">ARC {String(arc.arc_number).padStart(2, '0')}</span>
//         <span className="arc-name">{arc.name}</span>
//         <span className="arc-subtitle">{arc.subtitle}</span>
//         {isUnlocked && <span className="arc-status unlocked">✦ UNLOCKED</span>}
//         {isLocked && <span className="arc-status locked">🔒 LOCKED</span>}
//         {isHidden && <span className="arc-status hidden">👁 DISCOVER</span>}
//       </motion.div>

//       {/* Pulse ring for unlocked */}
//       {isUnlocked && (
//         <motion.div 
//           className="island-pulse" 
//           animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }} 
//           transition={{ duration: 2.5, repeat: Infinity }}
//           style={{ borderColor: arc.theme_color }}
//         />
//       )}

//       {/* Complete button */}
//       {isUnlocked && onComplete && (
//         <motion.button
//           className="complete-arc-btn"
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//           onClick={(e) => { e.stopPropagation(); onComplete(arc); }}
//         >
//           ⚔️ Complete
//         </motion.button>
//       )}

//       {/* Ambient effect */}
//       {arc.ambient_effect !== 'none' && <AmbientEffect type={arc.ambient_effect} />}
//     </motion.div>
//   );
// };

// // ===== BACKGROUND SCENERY =====
// const BackgroundScenery = () => {
//   return (
//     <div className="background-scenery">
//       {/* Distant mountains */}
//       <div className="mountains-back">
//         <svg viewBox="0 0 1200 300" preserveAspectRatio="none" className="mountains-svg">
//           <path d="M0 300 L0 200 L100 100 L200 180 L300 80 L400 200 L500 120 L600 220 L700 90 L800 200 L900 110 L1000 190 L1100 100 L1200 200 L1200 300 Z" 
//                 fill="#0a1628" opacity="0.6"/>
//           <path d="M0 300 L0 220 L150 140 L250 200 L350 130 L450 210 L550 150 L650 220 L750 140 L850 200 L950 130 L1050 210 L1200 160 L1200 300 Z" 
//                 fill="#0d1f3c" opacity="0.4"/>
//         </svg>
//       </div>

//       {/* Birds */}
//       {[...Array(5)].map((_, i) => (
//         <motion.div
//           key={i}
//           className="bird"
//           style={{ top: `${10 + i * 8}%`, left: `${-10}%` }}
//           animate={{ 
//             x: ['0vw', '110vw'],
//             y: [0, -20, 10, -15, 0],
//           }}
//           transition={{ 
//             duration: 20 + i * 5, 
//             repeat: Infinity, 
//             delay: i * 3,
//             ease: "linear"
//           }}
//         >
//           <svg width="20" height="10" viewBox="0 0 20 10">
//             <path d="M0 5 Q5 0 10 5 Q15 0 20 5" fill="none" stroke="#666" strokeWidth="1" opacity="0.5"/>
//           </svg>
//         </motion.div>
//       ))}

//       {/* Clouds */}
//       {[...Array(4)].map((_, i) => (
//         <motion.div
//           key={`cloud-${i}`}
//           className="bg-cloud"
//           style={{ top: `${5 + i * 15}%`, left: `${i * 25}%` }}
//           animate={{ x: [0, 100, 0], opacity: [0.2, 0.4, 0.2] }}
//           transition={{ duration: 30 + i * 10, repeat: Infinity, ease: "linear" }}
//         >
//           <div className="cloud-shape" />
//         </motion.div>
//       ))}
//     </div>
//   );
// };

// // ===== MAIN WORLD MAP =====
// const WorldMap = () => {
//   const navigate = useNavigate();
//   const [arcs, setArcs] = useState([]);
//   const [paths, setPaths] = useState([]);
//   const [userProgress, setUserProgress] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [hoveredIsland, setHoveredIsland] = useState(null);
//   const [immersionMode, setImmersionMode] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);

//   // Boat travel animation state
//   const [shipPosition, setShipPosition] = useState({ x: 15, y: 80 });
//   const [isShipMoving, setIsShipMoving] = useState(false);
//   const [shipTarget, setShipTarget] = useState(null);

//   // Touch drag for mobile
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
//   const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
//   const mapRef = useRef(null);

//   useEffect(() => {
//     audioManager.init();
//     fetchMapData();

//     return () => {
//       audioManager.stopAll();
//     };
//   }, []);

//   useEffect(() => {
//     if (immersionMode && !isMuted) {
//       audioManager.playAmbient('ocean');
//     } else {
//       audioManager.stopAll();
//     }
//   }, [immersionMode, isMuted]);

//   const fetchMapData = async () => {
//     try {
//       const token = localStorage.getItem('access_token');
//       const headers = token ? { Authorization: `Bearer ${token}` } : {};
//       const response = await axios.get(`${API_BASE}/map/world/`, { headers });

//       setArcs(response.data.arcs || []);
//       setPaths(response.data.paths || []);
//       setUserProgress(response.data.user_progress);

//       // Set initial ship position
//       const currentArc = response.data.arcs?.find(
//         a => a.arc_number === (response.data.user_progress?.current_arc || 1)
//       );
//       if (currentArc) {
//         setShipPosition({ x: currentArc.map_x, y: currentArc.map_y });
//       }

//       setLoading(false);
//     } catch (error) {
//       console.error('Failed to load map:', error);
//       setLoading(false);
//     }
//   };

//   // ===== BOAT TRAVEL ANIMATION =====
//   const travelToArc = async (targetArc) => {
//     if (isShipMoving) return;

//     const startArc = arcs.find(a => 
//       a.arc_number === (userProgress?.current_arc || 1)
//     );
//     if (!startArc) return;

//     setIsShipMoving(true);
//     setShipTarget(targetArc);
//     audioManager.playEffect('sail');

//     // Animate ship along path
//     const steps = 50;
//     const dx = (targetArc.map_x - startArc.map_x) / steps;
//     const dy = (targetArc.map_y - startArc.map_y) / steps;

//     for (let i = 0; i <= steps; i++) {
//       setShipPosition({
//         x: startArc.map_x + dx * i,
//         y: startArc.map_y + dy * i
//       });
//       await new Promise(r => setTimeout(r, 30));
//     }

//     // Mark arc as visited
//     try {
//       const token = localStorage.getItem('access_token');
//       await axios.post(`${API_BASE}/arcs/${targetArc.arc_key}/visit/`, {}, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       audioManager.playEffect('unlock');
//     } catch (e) {
//       console.log('Visit tracking failed', e);
//     }

//     setIsShipMoving(false);
//     setShipTarget(null);

//     // Navigate to arc detail
//     navigate(`/arc/${targetArc.arc_key}`);
//   };

//   const handleIslandClick = (arc) => {
//     if (arc.arc_number === (userProgress?.current_arc || 1)) {
//       // Already at this arc, just navigate
//       navigate(`/arc/${arc.arc_key}`);
//     } else {
//       // Travel animation first
//       travelToArc(arc);
//     }
//   };

//   const handleCompleteArc = (arc) => {
//     // Find next arc
//     const nextArc = arcs.find(a => a.arc_number === arc.arc_number + 1);
//     if (nextArc) {
//       travelToArc(nextArc);
//     }
//   };

//   const getIslandStatus = (arc) => {
//     if (!userProgress) return arc.is_unlocked ? 'unlocked' : 'locked';
//     if (userProgress.unlocked_arcs?.includes(arc.arc_key)) return 'unlocked';
//     if (arc.is_revealed) return 'locked';
//     return 'hidden';
//   };

//   // Touch handlers for mobile
//   const handleTouchStart = (e) => {
//     setIsDragging(true);
//     setDragStart({
//       x: e.touches[0].clientX - mapOffset.x,
//       y: e.touches[0].clientY - mapOffset.y,
//     });
//   };

//   const handleTouchMove = (e) => {
//     if (!isDragging) return;
//     e.preventDefault();
//     setMapOffset({
//       x: e.touches[0].clientX - dragStart.x,
//       y: e.touches[0].clientY - dragStart.y,
//     });
//   };

//   const handleTouchEnd = () => {
//     setIsDragging(false);
//   };

//   const toggleImmersion = () => {
//     const newMode = !immersionMode;
//     setImmersionMode(newMode);
//   };

//   const toggleMute = () => {
//     const newMuted = audioManager.toggleMute();
//     setIsMuted(newMuted);
//   };

//   if (loading) {
//     return (
//       <div className="world-map-loading">
//         <motion.div 
//           className="loading-infinity" 
//           animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
//           transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
//         >
//           ⚓
//         </motion.div>
//         <p>Loading The Infinite Path...</p>
//         <div className="loading-waves">
//           {[...Array(3)].map((_, i) => (
//             <motion.div 
//               key={i} 
//               className="loading-wave"
//               animate={{ x: ['-100%', '100%'] }}
//               transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
//             />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`world-map-container ${immersionMode ? 'immersion-mode' : ''}`}>
//       {/* Background layers */}
//       <div className="map-background">
//         {/* Deep ocean gradient */}
//         <div className="ocean-gradient" />

//         {/* Animated waves */}
//         <div className="ocean-waves">
//           {[...Array(6)].map((_, i) => (
//             <motion.div 
//               key={i} 
//               className="wave" 
//               style={{ top: `${i * 16}%`, opacity: 0.03 + i * 0.01 }}
//               animate={{ x: ['-100%', '0%'] }}
//               transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear" }}
//             />
//           ))}
//         </div>

//         {/* Scenery */}
//         <BackgroundScenery />

//         {/* Particles */}
//         <div className="map-particles">
//           {[...Array(40)].map((_, i) => (
//             <motion.div 
//               key={i} 
//               className="particle" 
//               style={{ 
//                 left: `${Math.random() * 100}%`, 
//                 top: `${Math.random() * 100}%`,
//                 width: `${1 + Math.random() * 2}px`,
//                 height: `${1 + Math.random() * 2}px`,
//               }}
//               animate={{ 
//                 opacity: [0, Math.random() * 0.6, 0], 
//                 y: [0, -30, 0],
//                 scale: [0, 1, 0] 
//               }}
//               transition={{ 
//                 duration: 4 + Math.random() * 6, 
//                 repeat: Infinity, 
//                 delay: Math.random() * 5 
//               }}
//             />
//           ))}
//         </div>
//       </div>

//       {/* Map content with touch support */}
//       <div 
//         className="map-content"
//         ref={mapRef}
//         onTouchStart={handleTouchStart}
//         onTouchMove={handleTouchMove}
//         onTouchEnd={handleTouchEnd}
//         style={{
//           transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
//         }}
//       >
//         {/* Path lines */}
//         <svg className="paths-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
//           {paths.map((path) => {
//             const fromArc = arcs.find(a => a.arc_number === path.from_arc_number);
//             const toArc = arcs.find(a => a.arc_number === path.to_arc_number);
//             if (!fromArc || !toArc) return null;

//             const isActive = getIslandStatus(fromArc) === 'unlocked';
//             const midX = (fromArc.map_x + toArc.map_x) / 2;
//             const midY = Math.min(fromArc.map_y, toArc.map_y) - 15;

//             return (
//               <motion.path
//                 key={path.id}
//                 d={`M ${fromArc.map_x} ${fromArc.map_y} Q ${midX} ${midY} ${toArc.map_x} ${toArc.map_y}`}
//                 fill="none"
//                 stroke={isActive ? "#FFD700" : "#1a3a5c"}
//                 strokeWidth={isActive ? "0.6" : "0.3"}
//                 strokeDasharray={isActive ? "2 1" : "1 2"}
//                 initial={{ pathLength: 0 }}
//                 animate={{ pathLength: isActive ? 1 : 0.3 }}
//                 transition={{ duration: 3, ease: "easeInOut" }}
//                 opacity={isActive ? 0.7 : 0.15}
//               />
//             );
//           })}
//         </svg>

//         {/* Ship */}
//         <Ship 
//           position={shipPosition} 
//           isMoving={isShipMoving}
//         />

//         {/* Islands */}
//         {arcs.map((arc) => (
//           <Island 
//             key={arc.id} 
//             arc={arc} 
//             status={getIslandStatus(arc)} 
//             onClick={handleIslandClick}
//             onComplete={handleCompleteArc}
//             isHovered={hoveredIsland} 
//             onHover={setHoveredIsland}
//           />
//         ))}
//       </div>

//       {/* UI Overlay */}
//       <div className="map-ui-overlay">
//         {/* Header */}
//         <motion.div 
//           className="map-header" 
//           initial={{ y: -50, opacity: 0 }} 
//           animate={{ y: 0, opacity: 1 }} 
//           transition={{ delay: 0.5 }}
//         >
//           <h1>⚓ TRANSFINITY</h1>
//           <p>The Infinite Path Across 12 Realms</p>
//         </motion.div>

//         {/* Progress Panel */}
//         {userProgress && (
//           <motion.div 
//             className="progress-panel" 
//             initial={{ x: 50, opacity: 0 }} 
//             animate={{ x: 0, opacity: 1 }} 
//             transition={{ delay: 0.8 }}
//           >
//             <div className="rank-badge">
//               <span className="rank-icon">⚔️</span>
//               <div className="rank-info">
//                 <span className="rank-name">{userProgress.rank?.toUpperCase() || 'WANDERER'}</span>
//                 <span className="rank-title">Founder Rank</span>
//               </div>
//             </div>
//             <div className="xp-section">
//               <div className="xp-bar">
//                 <motion.div 
//                   className="xp-fill" 
//                   initial={{ width: 0 }}
//                   animate={{ width: `${Math.min(100, (userProgress.xp % 1000) / 10)}%` }}
//                   transition={{ duration: 1, delay: 1 }}
//                 />
//               </div>
//               <span className="xp-text">{userProgress.xp || 0} XP</span>
//             </div>
//             <div className="progress-stats">
//               <div className="stat">
//                 <span className="stat-icon">🗺️</span>
//                 <span className="stat-value">{userProgress.unlocked_arcs?.length || 0}/12 Arcs</span>
//               </div>
//               <div className="stat">
//                 <span className="stat-icon">💎</span>
//                 <span className="stat-value">{userProgress.secrets_found || 0} Secrets</span>
//               </div>
//               <div className="stat">
//                 <span className="stat-icon">⚓</span>
//                 <span className="stat-value">{userProgress.total_distance?.toFixed(1) || 0}km Traveled</span>
//               </div>
//             </div>
//           </motion.div>
//         )}

//         {/* Controls */}
//         <div className="map-controls">
//           <motion.button 
//             className="control-btn mute-btn" 
//             onClick={toggleMute}
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.9 }}
//             title={isMuted ? 'Unmute' : 'Mute'}
//           >
//             {isMuted ? '🔇' : '🔊'}
//           </motion.button>

//           <motion.button 
//             className="control-btn immersion-btn" 
//             onClick={toggleImmersion}
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.9 }}
//             title={immersionMode ? 'Exit Immersion' : 'Immersion Mode'}
//           >
//             {immersionMode ? '🌊' : '📺'}
//           </motion.button>
//         </div>

//         {/* Legend */}
//         <motion.div 
//           className="map-legend" 
//           initial={{ y: 50, opacity: 0 }} 
//           animate={{ y: 0, opacity: 1 }} 
//           transition={{ delay: 1.2 }}
//         >
//           <div className="legend-item">
//             <span className="legend-dot unlocked" /> 
//             <span>Unlocked</span>
//           </div>
//           <div className="legend-item">
//             <span className="legend-dot locked" /> 
//             <span>Locked</span>
//           </div>
//           <div className="legend-item">
//             <span className="legend-dot hidden" /> 
//             <span>Hidden</span>
//           </div>
//         </motion.div>

//         {/* Travel notification */}
//         <AnimatePresence>
//           {isShipMoving && shipTarget && (
//             <motion.div 
//               className="travel-notification"
//               initial={{ y: 50, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 50, opacity: 0 }}
//             >
//               <span className="travel-icon">⚓</span>
//               <span>Sailing to {shipTarget.name}...</span>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// };

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './WorldMap.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ===== AUDIO MANAGER (Web Audio API - No Howler) =====
class AudioManager {
  constructor() {
    this.isMuted = localStorage.getItem('map_muted') === 'true';
    this.audioCtx = null;
    this.masterVolume = parseFloat(localStorage.getItem('map_volume') || '0.5');
    this.currentAmbient = null;
    this._proceduralOcean = null;
  }

  init() {
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      console.log('[AudioManager] Initialized');
    } catch (e) {
      console.warn('[AudioManager] Web Audio not supported');
    }
  }

  destroy() {
    this.stopAmbient();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }

  playTone(freq, duration, type = 'sine', vol = 0.05) {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = vol;
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  }

  playChord(freqs, duration, vol = 0.05) {
    freqs.forEach((f, i) => setTimeout(() => this.playTone(f, duration, 'sine', vol), i * 60));
  }

  playEffect(name) {
    if (this.isMuted) return;
    const effects = {
      hover: () => this.playTone(600, 0.08, 'sine', 0.03),
      click: () => this.playTone(900, 0.12, 'triangle', 0.05),
      unlock: () => this.playChord([523, 659, 784], 0.35),
      treasure: () => this.playChord([784, 988, 1175], 0.4),
      sail: () => this.playTone(160, 0.5, 'sawtooth', 0.03),
      complete: () => {
        this.playChord([523, 659, 784, 1047], 0.5);
        setTimeout(() => this.playChord([659, 784, 988, 1175], 0.5), 300);
      },
      error: () => this.playTone(150, 0.3, 'sawtooth', 0.05),
      levelup: () => {
        this.playArpeggio([523, 659, 784, 1047, 1319], 0.3);
      },
    };
    if (effects[name]) effects[name]();
  }

  playArpeggio(freqs, duration, vol = 0.04) {
    freqs.forEach((f, i) => setTimeout(() => this.playTone(f, duration * 0.5, 'sine', vol), i * 120));
  }

  // Procedural ocean ambience
  startProceduralOcean() {
    if (this.isMuted || !this.audioCtx) return;
    const ctx = this.audioCtx;
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.5;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = ctx.createGain();
    gain.gain.value = 0.08 * this.masterVolume;

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
    lfo.start();

    this._proceduralOcean = { whiteNoise, lfo, gain };
  }

  stopProceduralOcean() {
    if (this._proceduralOcean) {
      try {
        this._proceduralOcean.whiteNoise.stop();
        this._proceduralOcean.lfo.stop();
      } catch (e) {}
      this._proceduralOcean = null;
    }
  }

  playAmbient(type) {
    if (this.isMuted) return;
    this.stopAmbient();
    if (type === 'ocean') {
      this.startProceduralOcean();
      this.currentAmbient = 'ocean';
    }
  }

  stopAmbient() {
    this.stopProceduralOcean();
    this.currentAmbient = null;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('map_muted', this.isMuted);
    if (this.isMuted) {
      this.stopAmbient();
    }
    return this.isMuted;
  }

  setVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('map_volume', this.masterVolume);
  }
}

// Singleton instance
const audioManager = new AudioManager();

// ===== ISLAND POSITIONS - PERFECTLY MATCHED =====
const ISLAND_POSITIONS = {
  1:  { x: 5,  y: 25 },   // Founder's Arc - bottom left
  2:  { x: 28, y: 38 },   // Phantom Arc - top left
  3:  { x: 45, y: 20 },   // Ascension Arc - top
  4:  { x: 63, y: 40 },   // Rebirth Arc - top center-right
  5:  { x: 68, y: 15 },   // Eclipse Arc - top right
  6:  { x: 80, y: 40 },   // Crimson Arc - mid right
  7:  { x: 77, y: 75 },   // Void Arc - mid center
  8:  { x: 55, y: 60 },   // Zenith Arc - mid center-left
  9:  { x: 40, y: 80 },   // Cosmic Arc - mid left
  10: { x: 40, y: 45 },   // Shadow War Arc - bottom center-left
  11: { x: 30, y: 70 },   // Celestial Arc - bottom center
  12: { x: 7,  y: 70 },   // Eternal Arc - bottom right
};

// ===== SHIP COMPONENT =====
const Ship = ({ position, isMoving }) => (
  <motion.div
    className={`ship ${isMoving ? 'moving' : ''}`}
    style={{ left: `${position.x}%`, top: `${position.y}%` }}
    animate={isMoving ? { y: [0, -6, 0], rotate: [-8, 8, -8] } : { y: [0, -3, 0], rotate: [-3, 3, -3] }}
    transition={{ duration: isMoving ? 0.8 : 3, repeat: Infinity, ease: "easeInOut" }}
  >
    <svg viewBox="0 0 50 50" width="36" height="36">
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
      <motion.div className="ship-wake" animate={{ opacity: [0.5, 0, 0.5], scaleX: [1, 1.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }}/>
    )}
  </motion.div>
);

// ===== ARC CARD COMPONENT =====
const ArcCard = ({ arc, status, onClick }) => {
  const pos = ISLAND_POSITIONS[arc.arc_number] || { x: 50, y: 50 };
  const isLocked = status === 'locked';
  const isHidden = status === 'hidden';
  const isUnlocked = status === 'unlocked';

  return (
    <motion.div
      className={`arc-card ${status}`}
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: arc.arc_number * 0.08, duration: 0.5, type: "spring" }}
    >
      {isLocked && (
        <motion.div className="card-lock-icon" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          🔒
        </motion.div>
      )}

      {isUnlocked && (
        <motion.div className="card-pulse" animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 2.5, repeat: Infinity }}/>
      )}

      <motion.div
        className="card-box"
        onClick={() => { 
          if (isUnlocked || arc.arc_number === 1) { 
            audioManager.playEffect('click'); 
            onClick(arc); 
          }
        }}
        whileHover={(isUnlocked || arc.arc_number === 1) ? { scale: 1.05, y: -5 } : { scale: 1.02 }}
        whileTap={(isUnlocked || arc.arc_number === 1) ? { scale: 0.95 } : {}}
        style={{ cursor: (isUnlocked || arc.arc_number === 1) ? 'pointer' : 'not-allowed' }}
      >
        <span className="card-number">ARC {String(arc.arc_number).padStart(2, '0')}</span>
        <span className="card-name">{arc.name}</span>
        <span className="card-subtitle">{arc.subtitle}</span>
        <span className={`card-status ${status}`}>
          {isUnlocked && '✦ EXPLORE'}
          {isLocked && '🔒 LOCKED'}
          {isHidden && '👁 HIDDEN'}
        </span>
      </motion.div>
    </motion.div>
  );
};

// ===== MAIN WORLD MAP COMPONENT =====
const WorldMap = () => {
  const navigate = useNavigate();
  const [arcs, setArcs] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [immersionMode, setImmersionMode] = useState(false);

  const [shipPosition, setShipPosition] = useState({ x: 13, y: 66 });
  const [isShipMoving, setIsShipMoving] = useState(false);
  const [shipTarget, setShipTarget] = useState(null);

  // Initialize audio on mount
  useEffect(() => {
    audioManager.init();
    return () => {
      audioManager.destroy();
    };
  }, []);

  // Handle immersion mode ambient sound
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

      const arcsWithPositions = (response.data.arcs || []).map(arc => ({
        ...arc,
        map_x: ISLAND_POSITIONS[arc.arc_number]?.x || 50,
        map_y: ISLAND_POSITIONS[arc.arc_number]?.y || 50,
      }));

      setArcs(arcsWithPositions);
      setUserProgress(response.data.user_progress);

      const currentArcNum = response.data.user_progress?.current_arc || 1;
      const currentPos = ISLAND_POSITIONS[currentArcNum] || ISLAND_POSITIONS[1];
      setShipPosition(currentPos);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load map:', error);
      setLoading(false);
    }
  };

  const travelToArc = async (targetArc) => {
    if (isShipMoving) return;
    const targetPos = ISLAND_POSITIONS[targetArc.arc_number];
    if (!targetPos) return;

    setIsShipMoving(true);
    setShipTarget(targetArc);
    audioManager.playEffect('sail');

    const startPos = { ...shipPosition };
    const steps = 40;
    const dx = (targetPos.x - startPos.x) / steps;
    const dy = (targetPos.y - startPos.y) / steps;

    for (let i = 0; i <= steps; i++) {
      setShipPosition({ x: startPos.x + dx * i, y: startPos.y + dy * i });
      await new Promise(r => setTimeout(r, 25));
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

    if (targetArc.arc_number === 1) {
      navigate(`/arc/${targetArc.arc_key}/detail`);
    } else {
      navigate(`/arc/${targetArc.arc_key}`);
    }
  };

  const handleArcClick = (arc) => {
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

  const getArcStatus = (arc) => {
    if (!userProgress) return arc.is_unlocked ? 'unlocked' : 'locked';
    if (userProgress.unlocked_arcs?.includes(arc.arc_key)) return 'unlocked';
    if (arc.is_revealed) return 'locked';
    return 'hidden';
  };

  const toggleMute = () => {
    const newMuted = audioManager.toggleMute();
    setIsMuted(newMuted);
  };

  const toggleImmersion = () => {
    setImmersionMode(prev => !prev);
  };

  if (loading) {
    return (
      <div className="world-map-loading">
        <motion.div className="loading-ship" animate={{ rotate: [0, 10, -10, 0], y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          ⚓
        </motion.div>
        <p>Loading The Infinite Path...</p>
      </div>
    );
  }

  return (
    <div className="world-map-v2">
      <div className="map-bg-container">
        <img 
          src="/images/treasure-map-islands1.png" 
          alt="Transfinity World Map" 
          className="map-bg-image"
          draggable={false}
        />
        <div className="map-overlay" />

        <div className="map-interactive-layer">
          <Ship position={shipPosition} isMoving={isShipMoving} />

          {arcs.map((arc) => (
            <ArcCard 
              key={arc.id} 
              arc={arc} 
              status={getArcStatus(arc)} 
              onClick={handleArcClick}
            />
          ))}
        </div>

        <div className="map-ui-v2">
          <motion.div className="map-header-v2" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <h1>⚓ TRANSFINITY</h1>
            <p>The Infinite Path Across 12 Realms</p>
          </motion.div>

          {userProgress && (
            <motion.div className="progress-panel-v2" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
              <div className="rank-row">
                <span className="rank-icon">⚔️</span>
                <div>
                  <span className="rank-name">{userProgress.rank?.toUpperCase() || 'WANDERER'}</span>
                  <span className="rank-xp">{userProgress.xp || 0} XP</span>
                </div>
              </div>
              <div className="stats-row">
                <span>🗺️ {userProgress.unlocked_arcs?.length || 0}/12</span>
                <span>💎 {userProgress.secrets_found || 0}</span>
                <span>⚓ {(userProgress.total_distance || 0).toFixed(1)}km</span>
              </div>
            </motion.div>
          )}

          <div className="map-controls-v2">
            <motion.button className="ctrl-btn" onClick={toggleMute} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              {isMuted ? '🔇' : '🔊'}
            </motion.button>
            <motion.button className="ctrl-btn" onClick={toggleImmersion} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              {immersionMode ? '🌊' : '📺'}
            </motion.button>
          </div>

          <motion.div className="map-legend-v2" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}>
            <div className="legend-row"><span className="dot unlocked"/> Unlocked</div>
            <div className="legend-row"><span className="dot locked"/> Locked</div>
            <div className="legend-row"><span className="dot hidden"/> Hidden</div>
          </motion.div>

          <AnimatePresence>
            {isShipMoving && shipTarget && (
              <motion.div className="travel-notify" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>
                <span>⚓ Sailing to {shipTarget.name}...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;