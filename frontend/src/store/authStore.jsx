import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:         null,
      access_token: null,
      refresh_token: null,
      isAuthenticated: false,

      // === EXISTING METHODS (keep all) ===
      login: async (email, password) => {
        const { data } = await api.post('/auth/login/', { email, password })
        localStorage.setItem('access_token',  data.access)
        localStorage.setItem('refresh_token', data.refresh)
        set({ user: data.user, access_token: data.access,
              refresh_token: data.refresh, isAuthenticated: true })
        return data
      },

      register: async (formData) => {
        const { data } = await api.post('/auth/register/', formData)
        localStorage.setItem('access_token',  data.access)
        localStorage.setItem('refresh_token', data.refresh)
        set({ user: data.user, access_token: data.access,
              refresh_token: data.refresh, isAuthenticated: true })
        return data
      },

      socialLogin: async (accessToken, provider) => {
        const { data } = await api.post(`/auth/social/${provider}/`, {
          access_token: accessToken,
        })
        localStorage.setItem('access_token',  data.access)
        localStorage.setItem('refresh_token', data.refresh)
        set({ user: data.user, access_token: data.access,
              refresh_token: data.refresh, isAuthenticated: true })
        return data
      },

      logout: async () => {
        try {
          const refresh = localStorage.getItem('refresh_token')
          await api.post('/auth/logout/', { refresh })
        } catch {}
        localStorage.clear()
        set({ user: null, access_token: null, refresh_token: null, isAuthenticated: false })
      },

      updateUser: (user) => set({ user }),

      // === NEW: TRANSFINITY RANK SYSTEM ===
      
      /** Fetch current user rank + XP from backend */
      fetchRank: async () => {
        try {
          const { data } = await api.get('/auth/me/rank/')
          set((state) => ({
            user: state.user ? { 
              ...state.user, 
              rank: data.rank,
              xp: data.xp,
              unlocked_arcs: data.unlocked_arcs,
              next_rank: data.next_rank,
              can_access: data.can_access
            } : null
          }))
          return data
        } catch (err) {
          console.error('Failed to fetch rank:', err)
          return null
        }
      },

      /** Add XP (after QR scan, purchase, etc.) */
      addXP: async (amount) => {
        try {
          const { data } = await api.post('/auth/add-xp/', { amount })
          set((state) => ({
            user: state.user ? { 
              ...state.user, 
              xp: data.xp,
              rank: data.rank 
            } : null
          }))
          return data
        } catch (err) {
          console.error('Failed to add XP:', err)
          return null
        }
      },

      /** Scan QR code for XP + lore unlock */
      scanQR: async (code) => {
        try {
          const { data } = await api.post('/auth/scan-qr/', { code })
          set((state) => ({
            user: state.user ? { 
              ...state.user, 
              xp: data.total_xp,
              rank: data.rank,
              // If rank up happened, add to unlocked_arcs
              unlocked_arcs: data.rank !== state.user?.rank 
                ? [...(state.user?.unlocked_arcs || []), data.rank]
                : state.user?.unlocked_arcs
            } : null
          }))
          return data
        } catch (err) {
          console.error('QR scan failed:', err)
          throw err
        }
      },

      /** Check if user can access specific arc */
      canAccessArc: (arcName) => {
        const { user } = get()
        if (!user) return arcName === 'founder' // Only founder preview for guests
        
        const rankOrder = ['wanderer', 'founder', 'ascendant', 'phantom', 'eclipse', 'eternal']
        const userIdx = rankOrder.indexOf(user.rank || 'wanderer')
        const arcIdx = rankOrder.indexOf(arcName)
        
        // Can view current rank + next locked preview
        return arcIdx <= userIdx + 1
      },

      /** Check if arc is fully unlocked (can purchase) */
      isArcUnlocked: (arcName) => {
        const { user } = get()
        if (!user) return false
        
        const rankOrder = ['wanderer', 'founder', 'ascendant', 'phantom', 'eclipse', 'eternal']
        const userIdx = rankOrder.indexOf(user.rank || 'wanderer')
        const arcIdx = rankOrder.indexOf(arcName)
        
        return userIdx >= arcIdx
      },

      /** Get next rank name */
      getNextRank: () => {
        const { user } = get()
        const rankOrder = ['wanderer', 'founder', 'ascendant', 'phantom', 'eclipse', 'eternal']
        const idx = rankOrder.indexOf(user?.rank || 'wanderer')
        return rankOrder[idx + 1] || null
      },
    }),
    { 
      name: 'auth-storage',
      // Only persist these fields
      partialize: (state) => ({ 
        user: state.user,
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore