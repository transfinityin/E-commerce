import { useEffect, useState } from 'react'
import api from '../services/api'

export default function MyMaps() {
  const [maps, setMaps] = useState([])
  const [progress, setProgress] = useState(null)
  
  useEffect(() => {
    api.get('/treasure/my-maps/').then(r => {
      setMaps(r.data.maps)
      setProgress(r.data.progress)
    })
  }, [])
  
 return (
  <div className="min-h-screen bg-[#FAFAF8]" style={{ padding: '40px 16px' }}>
    <div className="mx-auto" style={{ maxWidth: '1280px' }}>
      <div style={{ marginBottom: '32px' }}>
        <p className="text-xs uppercase font-bold text-[#C8A96E]" style={{ letterSpacing: '5px', marginBottom: '12px' }}>
          Treasure Collection
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-[#0D0D0D]">
          My Treasure Maps
        </h1>
        <p className="text-[#8A8A8A]" style={{ marginTop: '8px' }}>
          Collect all 12 maps to win the grand prize of ₹1,00,000.
        </p>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr]" style={{ gap: '32px', alignItems: 'start' }}>
        {/* Progress Panel */}
        <div className="bg-[#0D0D0D] text-white rounded-[28px] sticky shadow-xl" style={{ padding: '28px', top: '112px' }}>
          <div className="rounded-2xl bg-[#C8A96E] flex items-center justify-center text-2xl" style={{ width: '56px', height: '56px', marginBottom: '24px' }}>
            🗺️
          </div>

          <h2 className="text-3xl font-bold" style={{ marginBottom: '8px' }}>
            Hunt Progress
          </h2>

          <p className="text-white/60 text-sm" style={{ marginBottom: '24px' }}>
            Complete your collection and unlock rewards.
          </p>

          <div className="flex justify-between items-end" style={{ marginBottom: '12px' }}>
            <span className="text-white/70 text-sm">Collected</span>
            <span className="text-2xl font-bold">
              {progress?.collected || 0}/12
            </span>
          </div>

          <div className="h-3 bg-white/10 rounded-full overflow-hidden" style={{ marginBottom: '12px' }}>
            <div
              className="h-full bg-gradient-to-r from-[#C8A96E] to-yellow-400 rounded-full transition-all duration-700"
              style={{ width: `${progress?.percentage || 0}%` }}
            />
          </div>

          <p className="text-[#C8A96E] font-bold" style={{ marginBottom: '32px' }}>
            {progress?.percentage || 0}% Completed
          </p>

          <div className="text-sm" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="bg-white/10 rounded-2xl" style={{ padding: '16px' }}>
              🎁 Collect 3 maps to claim ₹300
            </div>
            <div className="bg-white/10 rounded-2xl" style={{ padding: '16px' }}>
              🏆 Collect 12 maps to claim ₹1,00,000
            </div>
          </div>

          {progress?.can_claim_full && (
            <button className="w-full bg-[#C8A96E] text-black font-bold" style={{ marginTop: '24px', padding: '16px 0', borderRadius: '9999px' }}>
              Claim ₹1,00,000
            </button>
          )}
        </div>

        {/* Maps Grid */}
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" style={{ gap: '20px' }}>
            {Array.from({ length: 12 }, (_, i) => {
              const mapNum = i + 1
              const mapType = `map_${mapNum}`
              const userMap = maps.find(m => m.type === mapType)

              return (
                <div
                  key={mapType}
                  className={`group relative aspect-[3/4] rounded-[26px] overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    userMap
                      ? 'bg-white border-[#C8A96E] shadow-md'
                      : 'bg-[#F5F2EE] border-dashed border-[#D0CAC0]'
                  }`}
                >
                  {userMap ? (
                    <>
                      <img
                        src={userMap.image}
                        alt={userMap.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-[#C8A96E] text-black flex items-center justify-center text-sm font-bold">
                        {mapNum}
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 text-white" style={{ padding: '16px' }}>
                        <p className="font-bold text-sm line-clamp-1">
                          {userMap.name}
                        </p>

                        <p className="text-xs text-white/75" style={{ marginTop: '4px' }}>
                          {userMap.status === 'rewarded'
                            ? '✓ Reward Claimed'
                            : userMap.is_valid_now
                              ? '🔥 Ready to Claim'
                              : '⏳ Waiting Period'}
                        </p>
                      </div>

                      {userMap.is_valid_now && userMap.status === 'claimed' && (
                        <button className="absolute top-3 right-3 bg-[#C8A96E] text-black text-xs font-bold rounded-full shadow-lg" style={{ padding: '6px 12px' }}>
                          Claim ₹300
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center" style={{ padding: '16px' }}>
                      <div className="w-14 h-14 rounded-full bg-white border border-[#E8E4DE] flex items-center justify-center text-2xl" style={{ marginBottom: '16px' }}>
                        🔒
                      </div>

                      <p className="font-bold text-[#3A3A3A]">
                        Map {mapNum}
                      </p>

                      <p className="text-xs text-[#8A8A8A]" style={{ marginTop: '4px' }}>
                        Locked
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  </div>
)
}