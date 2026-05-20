import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

import useAuthStore from '../store/authStore';
import api from '../services/api';
import { ArrowRight, Lock, Infinity } from 'lucide-react';

const ARC_THEMES = {
    wanderer: {
  // Background: Richer dark with subtle cyan nebula
  bg: 'bg-gradient-to-b from-black via-[#0a0f1a] to-cyan-950/40',
  
  // Core accent: Electric cyan (no more gray!)
  accent: '#00F0FF',
  accentClass: 'text-cyan-300',
  
  // Secondary: Warm gold for "premium" contrast
  accentSecondary: '#FFD700',
  accentSecondaryClass: 'text-amber-400',
  
  // Node styling: Glowing ring instead of dull gray
  nodeActive: `
    relative 
    bg-gradient-to-br from-cyan-500/20 to-blue-600/20 
    border-2 border-cyan-400/60 
    shadow-[0_0_30px_rgba(0,240,255,0.4),inset_0_0_20px_rgba(0,240,255,0.1)]
    backdrop-blur-sm
    animate-pulse-slow
  `,
  
  // Text effects
  titleClass: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-cyan-200 font-bold tracking-widest',
  subtitleClass: 'text-cyan-400/80 text-sm tracking-wider uppercase',
  
  // Card / Container
  borderClass: 'border border-cyan-500/30 backdrop-blur-md bg-black/40',
  borderHover: 'hover:border-cyan-400/60 hover:shadow-[0_0_40px_rgba(0,240,255,0.2)] transition-all duration-500',
  
  // Glow layers
  glow: 'shadow-cyan-500/30',
  glowStrong: 'shadow-[0_0_60px_rgba(0,240,255,0.5),0_0_100px_rgba(0,240,255,0.2)]',
  
  // Particles: Brighter cyan stardust
  particles: 'cyan-bright',
  
  // Icon: More mystical
  icon: '◉',
},
  founder: {
    bg: 'from-black via-gray-900 to-yellow-900/20',
    accent: '#FFD700',
    particles: 'gold',
  },
  ascendant: {
    bg: 'from-black via-purple-950 to-black',
    accent: '#9D4EDD',
    particles: 'purple',
  },
  phantom: {
    bg: 'from-black via-gray-900 to-gray-800',
    accent: '#808080',
    particles: 'gray',
  },
  eclipse: {
    bg: 'from-black via-red-950 to-black',
    accent: '#FF0040',
    particles: 'red',
  },
  eternal: {
    bg: 'from-black via-yellow-900/30 to-white/5',
    accent: '#FFD700',
    particles: 'gold',
  },
};

export default function LorePage() {
  const { arcName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [lore, setLore] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  useEffect(() => {
    fetchLore();
  }, [arcName]);

  const fetchLore = async () => {
    try {
      const { data } = await api.get(`/products/arcs/${arcName}/lore/`);
      setLore(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  if (!lore) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500">Arc not found</div>;

  const theme = ARC_THEMES[arcName] || ARC_THEMES.founder;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.bg} text-white relative overflow-hidden`}>
      {/* Ambient Particles Background */}
      <div className="absolute inset-0 opacity-30">
        {/* Add particle effect based on theme */}
      </div>

      {/* Hero Section */}
      <motion.section 
        style={{ opacity, scale }}
        className="h-screen flex flex-col items-center justify-center relative"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="text-center z-10"
        >
          <p className="text-sm tracking-[0.5em] mb-4" style={{ color: theme.accent }}>
            {lore.rank}
          </p>
          <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter">
            {lore.name}
          </h1>
          <p className="text-2xl md:text-3xl text-gray-400 font-light italic">
            "{lore.tagline}"
          </p>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-12"
          >
            <p className="text-xs text-gray-500 tracking-widest">SCROLL TO BEGIN</p>
            <div className="w-px h-12 bg-gradient-to-b from-transparent to-gray-500 mx-auto mt-2" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Story Section */}
      <section className="min-h-screen flex items-center justify-center px-4 md:px-20 py-20">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {lore.story.split('. ').map((sentence, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-xl md:text-2xl leading-relaxed text-gray-300 font-light"
              >
                {sentence}.
              </motion.p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-20 px-4">
        <h2 className="text-4xl font-bold text-center mb-12" style={{ color: theme.accent }}>
          The Collection
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {lore.products?.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.05 }}
              className="bg-black/50 border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm"
            >
              <div className="aspect-square bg-gray-900 flex items-center justify-center">
                <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-gray-400">₹{product.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Infinity className="w-16 h-16 mx-auto mb-6" style={{ color: theme.accent }} />
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            ENTER THE ARC
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Step into the {lore.name}. Your journey continues.
          </p>
          <button
            onClick={() => navigate(`/shop?arc=${arcName}`)}
            className="group px-8 py-4 font-bold text-lg rounded-none border-2 flex items-center gap-2 mx-auto transition-all hover:scale-105"
            style={{ 
              borderColor: theme.accent, 
              color: theme.accent,
              background: 'transparent'
            }}
          >
            ENTER SHOP
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </section>
    </div>
  );
}