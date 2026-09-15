import { create } from 'zustand'
import type { MoodTag, AttractionCategory } from '@/types/attraction'

interface FilterState {
  activeMoods: Set<MoodTag>
  toggleMood: (mood: MoodTag) => void
  clearMoods: () => void
  activeCategory: AttractionCategory | null
  setActiveCategory: (c: AttractionCategory | null) => void
  activeState: string | null
  setActiveState: (s: string | null) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
}

export const useFilterStore = create<FilterState>((set) => ({
  activeMoods: new Set<MoodTag>(),
  toggleMood: (mood) =>
    set((state) => {
      const next = new Set(state.activeMoods)
      if (next.has(mood)) {
        next.delete(mood)
      } else {
        next.add(mood)
      }
      return { activeMoods: next }
    }),
  clearMoods: () => set({ activeMoods: new Set<MoodTag>() }),
  activeCategory: null,
  setActiveCategory: (c) => set({ activeCategory: c }),
  activeState: null,
  setActiveState: (s) => set({ activeState: s }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
}))
