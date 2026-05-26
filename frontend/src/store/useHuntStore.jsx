import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useHuntStore = create(
  persist(
    (set, get) => ({
      // State
      progress: null,
      locations: [],
      rewards: [],
      isLoading: false,
      error: null,
      scanResult: null,
      currentClue: null,

      // Actions
      setProgress: (progress) => set({ progress }),
      setLocations: (locations) => set({ locations }),
      setRewards: (rewards) => set({ rewards }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setScanResult: (scanResult) => set({ scanResult }),
      setCurrentClue: (clue) => set({ currentClue: clue }),

      // 🔴 PUTHUSA ADD PANNATHU: Backend-la irunthu progress fetch panna
      fetchProgress: async () => {
        set({ isLoading: true });
        try {
          // Unga backend-la progress get pandra URL-a inga check pannikonga
          const response = await api.get('/hunt/hunt-progress/'); // 'hunt' nu maathunga
          if (response.data) {
            set({ 
              progress: response.data,
              isLoading: false,
              error: null
            });
          }
        } catch (error) {
          console.error('Failed to fetch hunt progress:', error);
          set({ 
            error: error.response?.data?.message || 'Failed to load progress', 
            isLoading: false 
          });
        }
      },

      // Update level after verification
      unlockLevel: (newLevel, reward) => set((state) => ({
        progress: {
          ...state.progress,
          current_level: newLevel,
          rewards_claimed: [
            ...(state.progress?.rewards_claimed || []),
            reward
          ]
        }
      })),

      // Reset hunt (for logout)
      resetHunt: () => set({
        progress: null,
        locations: [],
        rewards: [],
        error: null,
        scanResult: null,
        currentClue: null
      }),

      // Computed
      isHuntActive: () => {
        const { progress } = get();
        return progress && progress.current_level > 0;
      },

      isCompleted: () => {
        const { progress } = get();
        return progress?.is_completed || false;
      },

      nextLevel: () => {
        const { progress } = get();
        return progress?.next_location || null;
      }
    }),
    {
      name: 'treasure-hunt-storage',
      partialize: (state) => ({
        progress: state.progress,
        rewards: state.rewards
      })
    }
  )
);