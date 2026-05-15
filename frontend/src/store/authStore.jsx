import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

const useAuthStore = create(
  persist(
    (set) => ({
      user:         null,
      access_token: null,
      refresh_token: null,
      isAuthenticated: false,

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

      // 🔥 NEW: Social login handler
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
    }),
    { name: 'auth-storage' }
  )
)

export default useAuthStore