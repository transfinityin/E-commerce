import { motion } from 'framer-motion';

export default function IslandNode({ x, y, color, label, subtitle, status, delay, onHover, onLeave, onClick }) {
  const isLocked = status === 'locked';
  const isPreview = status === 'preview';
  
  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, delay, type: 'spring' }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      className="cursor-pointer"
      style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
    >
      {/* Outer Glow */}
      {!isLocked && (
        <motion.circle
          cx={x}
          cy={y}
          r="6"
          fill={color}
          opacity="0.1"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}
      
      {/* Pulse Ring (unlocked only) */}
      {status === 'unlocked' && (
        <motion.circle
          cx={x}
          cy={y}
          r="4.5"
          fill="none"
          stroke={color}
          strokeWidth="0.3"
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
        
      {/* Island Body */}
      <circle
        cx={x}
        cy={y}
        r="3.5"
        fill={isLocked ? '#1a1a1a' : color}
        stroke={isLocked ? '#333' : color}
        strokeWidth={isLocked ? '0.2' : '0.5'}
        opacity={isLocked ? 0.5 : 0.9}
        filter={!isLocked ? `url(#glow-${color === '#9D4EDD' ? 'purple' : 'gold'})` : undefined}
      />
      
      {/* Lock Icon */}
      {isLocked && (
        <text x={x} y={y + 1.2} textAnchor="middle" fill="#555" fontSize="2.5">🔒</text>
      )}
      
      {/* Preview Teaser (faded glow) */}
      {isPreview && (
        <circle
          cx={x}
          cy={y}
          r="5"
          fill="none"
          stroke={color}
          strokeWidth="0.2"
          strokeDasharray="1 1"
          opacity="0.3"
        />
      )}
      
      {/* Label */}
      <text x={x} y={y - 5} textAnchor="middle" fill={isLocked ? '#555' : color} fontSize="2.5" fontWeight="bold" letterSpacing="0.1">
        {label}
      </text>
      <text x={x} y={y - 3} textAnchor="middle" fill="#888" fontSize="1.5" letterSpacing="0.05">
        {subtitle}
      </text>
      
      {/* Storm Effect (locked) */}
      {isLocked && (
        <motion.circle
          cx={x}
          cy={y}
          r="5"
          fill="none"
          stroke="#333"
          strokeWidth="0.2"
          strokeDasharray="0.5 0.5"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        />
      )}
    </motion.g>
  );
}