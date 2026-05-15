import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import { 
  Map, 
  Lock, 
  Unlock, 
  Trophy, 
  Clock, 
  Coins, 
  ArrowRight, 
  Sparkles,
  Gift,
  Target
} from 'lucide-react'

export default function TreasureHunt() {
  const [activeMaps, setActiveMaps] = useState([])
  const [myMaps, setMyMaps] = useState([])
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(null)
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchActiveMaps()
    if (isAuthenticated) {
      fetchMyMaps()
    }
  }, [isAuthenticated])

  const fetchActiveMaps = async () => {
    try {
      const { data } = await api.get('/treasure/active-maps/')
      setActiveMaps(data.active_maps || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMyMaps = async () => {
    try {
      const { data } = await api.get('/treasure/my-maps/')
      setMyMaps(data.maps || [])
      setProgress(data.progress || null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const claimReward = async (mapId) => {
    if (!isAuthenticated) {
      toast.error('Please login to claim rewards')
      navigate('/login')
      return
    }

    setClaiming(mapId)
    try {
      const { data } = await api.post('/treasure/claim-reward/', { map_id: mapId })
      toast.success(data.message)
      fetchMyMaps()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to claim reward')
    } finally {
      setClaiming(null)
    }
  }

  const hasMap = (mapType) => {
    return myMaps.some(m => m.type === mapType)
  }

  const getMapStatus = (mapType) => {
    const map = myMaps.find(m => m.type === mapType)
    if (!map) return 'locked'
    return map.status
  }

  if (loading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C8A96E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 text-white" style={{ padding: '48px 24px' }}>
        <div className="mx-auto text-center" style={{ maxWidth: '896px', padding: '0 16px' }}>
          <div className="inline-flex items-center bg-white/20 backdrop-blur rounded-full" style={{ padding: '8px 16px', gap: '8px', marginBottom: '24px' }}>
            <Trophy size={16} />
            <span className="text-sm font-bold">Treasure Hunt Event</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{ marginBottom: '16px' }}>
            🏴‍☠️ Collect 12 Maps, Win ₹1,00,000!
          </h1>
          
          <p className="text-base sm:text-lg text-white/90 mx-auto" style={{ maxWidth: '672px', marginBottom: '24px' }}>
            Buy any T-Shirt to get a mystery map. Collect all 12 maps within their valid dates to unlock the grand prize!
          </p>

          {/* Progress Bar */}
          {progress && (
            <div className="bg-white/10 backdrop-blur rounded-2xl mx-auto" style={{ padding: '24px', maxWidth: '512px' }}>
              <div className="flex justify-between text-sm font-bold" style={{ marginBottom: '8px' }}>
                <span>Your Progress</span>
                <span>{progress.collected} / 12 Maps</span>
              </div>
              <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/80" style={{ marginTop: '12px' }}>
                <span>Collect 3 maps = ₹300</span>
                <span>All 12 maps = ₹1,00,000</span>
              </div>
              {progress.can_claim_full && (
                <button className="w-full bg-white text-amber-600 rounded-xl font-bold hover:shadow-lg transition-all" style={{ marginTop: '16px', padding: '12px 0' }}>
                  🎉 Claim ₹1,00,000 Grand Prize!
                </button>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <Link to="/login" 
                  className="inline-flex items-center gap-2 bg-white text-amber-600 rounded-2xl font-bold hover:shadow-xl transition-all"
                  style={{ padding: '12px 24px', marginTop: '24px' }}>
              Login to Track Progress
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto" style={{ maxWidth: '896px', padding: '48px 16px' }}>
        <h2 className="text-2xl font-bold text-center" style={{ marginBottom: '32px' }}>How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '24px' }}>
          {[
            { icon: Target, title: 'Buy T-Shirt', desc: 'Purchase any T-shirt from our store' },
            { icon: Gift, title: 'Get Map', desc: 'Receive a random mystery map' },
            { icon: Coins, title: 'Claim Prize', desc: 'Collect 3+ maps for rewards' },
          ].map((step, idx) => (
            <div key={idx} className="bg-white rounded-2xl text-center border border-[#E8E4DE] hover:shadow-md transition-all" style={{ padding: '24px' }}>
              <div className="inline-flex bg-[#F2E8D5] rounded-xl" style={{ padding: '12px', marginBottom: '16px' }}>
                <step.icon size={24} className="text-[#C8A96E]" />
              </div>
              <h3 className="font-bold" style={{ marginBottom: '8px' }}>{step.title}</h3>
              <p className="text-sm text-[#8A8A8A]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Active Maps */}
      <section className="mx-auto" style={{ maxWidth: '1152px', padding: '48px 16px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
          <div>
            <h2 className="text-2xl font-bold">Active Maps</h2>
            <p className="text-sm text-[#8A8A8A]" style={{ marginTop: '4px' }}>
              {activeMaps.length} maps currently available
            </p>
          </div>
          <Link to="/products?category=t-shirt" 
                className="inline-flex items-center gap-2 bg-[#0D0D0D] text-white rounded-xl font-bold text-sm hover:shadow-md transition-all"
                style={{ padding: '8px 16px' }}>
            Buy T-Shirt
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" style={{ gap: '16px' }}>
          {Array.from({ length: 12 }, (_, i) => {
            const mapNum = i + 1
            const mapType = `map_${mapNum}`
            const activeMap = activeMaps.find(m => m.type === mapType)
            const userMap = myMaps.find(m => m.type === mapType)
            const isReleased = !!activeMap
            const isCollected = !!userMap
            const canClaim = userMap?.is_valid_now && userMap?.status === 'claimed'

            return (
              <div key={mapType} 
                   className={`relative aspect-[3/4] rounded-2xl border-2 overflow-hidden transition-all hover:scale-[1.02]
                     ${isCollected 
                       ? 'border-[#C8A96E] bg-gradient-to-b from-amber-50 to-yellow-50' 
                       : isReleased 
                         ? 'border-dashed border-amber-300 bg-amber-50/50' 
                         : 'border-dashed border-[#E8E4DE] bg-[#F5F2EE]/50'
                     }`}>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ padding: '16px' }}>
                  {isCollected ? (
                    <>
                      <div className="text-4xl" style={{ marginBottom: '8px' }}>🗺️</div>
                      <h3 className="font-bold text-sm text-center" style={{ marginBottom: '4px' }}>
                        {activeMap?.name || `Map ${mapNum}`}
                      </h3>
                      <div className="flex items-center text-xs text-[#C8A96E]" style={{ gap: '4px', marginBottom: '8px' }}>
                        <Unlock size={12} />
                        <span>Collected</span>
                      </div>
                      
                      {userMap?.status === 'rewarded' ? (
                        <span className="bg-[#D6F0E4] text-[#1A6B43] text-xs font-bold rounded-full" style={{ padding: '4px 8px' }}>
                          ✓ Rewarded
                        </span>
                      ) : canClaim ? (
                        <button 
                          onClick={() => claimReward(userMap.id)}
                          disabled={claiming === userMap.id}
                          className="bg-[#C8A96E] text-white text-xs font-bold rounded-full hover:bg-[#A8873E] transition-all disabled:opacity-50"
                          style={{ padding: '6px 12px' }}>
                          {claiming === userMap.id ? 'Claiming...' : 'Claim ₹300'}
                        </button>
                      ) : (
                        <div className="flex items-center text-xs text-[#8A8A8A]" style={{ gap: '4px' }}>
                          <Clock size={12} />
                          <span>Wait...</span>
                        </div>
                      )}
                    </>
                  ) : isReleased ? (
                    <>
                      <div className="text-4xl opacity-50" style={{ marginBottom: '8px' }}>🗺️</div>
                      <h3 className="font-bold text-sm text-center text-[#8A8A8A]">
                        {activeMap?.name || `Map ${mapNum}`}
                      </h3>
                      <p className="text-xs text-[#8A8A8A] text-center" style={{ marginTop: '8px' }}>
                        Buy T-Shirt to unlock
                      </p>
                      <div className="flex items-center text-xs text-[#C8A96E]" style={{ marginTop: '8px', gap: '4px' }}>
                        <Lock size={12} />
                        <span>Locked</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl opacity-30" style={{ marginBottom: '8px' }}>🔒</div>
                      <h3 className="font-bold text-sm text-center text-[#8A8A8A]">
                        Map {mapNum}
                      </h3>
                      <p className="text-xs text-[#8A8A8A] text-center" style={{ marginTop: '8px' }}>
                        Coming Soon
                      </p>
                    </>
                  )}
                </div>

                <div className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${isCollected ? 'bg-[#C8A96E] text-white' : 'bg-[#F5F2EE] text-[#8A8A8A]'}`}>
                  {mapNum}
                </div>

                {userMap && (
                  <div className="absolute bottom-2 left-2 right-2 text-center">
                    <p className="text-[10px] text-[#8A8A8A]">
                      Valid: {new Date(userMap.valid_from).toLocaleDateString()} - {new Date(userMap.valid_until).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Rules Section */}
      <section className="mx-auto" style={{ maxWidth: '896px', padding: '48px 16px 80px' }}>
        <div className="bg-white rounded-2xl border border-[#E8E4DE]" style={{ padding: '24px 32px' }}>
          <h2 className="text-xl font-bold flex items-center" style={{ gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={20} className="text-amber-500" />
            Treasure Hunt Rules
          </h2>
          <ul className="text-sm text-[#8A8A8A]" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li className="flex items-start" style={{ gap: '8px' }}>
              <span className="text-amber-500 font-bold">1.</span>
              Buy any T-shirt to receive a random mystery map
            </li>
            <li className="flex items-start" style={{ gap: '8px' }}>
              <span className="text-amber-500 font-bold">2.</span>
              Each map is valid for 5 months from release date
            </li>
            <li className="flex items-start" style={{ gap: '8px' }}>
              <span className="text-amber-500 font-bold">3.</span>
              Collect 3+ different maps to claim ₹300 instant reward
            </li>
            <li className="flex items-start" style={{ gap: '8px' }}>
              <span className="text-amber-500 font-bold">4.</span>
              Collect all 12 maps to win the grand prize of ₹1,00,000
            </li>
            <li className="flex items-start" style={{ gap: '8px' }}>
              <span className="text-amber-500 font-bold">5.</span>
              Rewards must be claimed within the map's valid date range
            </li>
            <li className="flex items-start" style={{ gap: '8px' }}>
              <span className="text-amber-500 font-bold">6.</span>
              Each customer can collect each map only once
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}