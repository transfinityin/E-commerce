import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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