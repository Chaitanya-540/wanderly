import { create } from 'zustand'

interface UIState {
  // Destination card
  activeDestinationCardId: string | null
  setActiveDestinationCardId: (id: string | null) => void
  // Panels
  isPopularAttractionsPanelOpen: boolean
  setPopularAttractionsPanelOpen: (v: boolean) => void
  isQuickListOpen: boolean
  setQuickListOpen: (v: boolean) => void
  isMoodFilterOpen: boolean
  setMoodFilterOpen: (v: boolean) => void
  // Mobile
  isBottomSheetOpen: boolean
  setBottomSheetOpen: (v: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeDestinationCardId: null,
  setActiveDestinationCardId: (id) => set({ activeDestinationCardId: id }),
  isPopularAttractionsPanelOpen: true,
  setPopularAttractionsPanelOpen: (v) => set({ isPopularAttractionsPanelOpen: v }),
  isQuickListOpen: false,
  setQuickListOpen: (v) => set({ isQuickListOpen: v }),
  isMoodFilterOpen: false,
  setMoodFilterOpen: (v) => set({ isMoodFilterOpen: v }),
  isBottomSheetOpen: false,
  setBottomSheetOpen: (v) => set({ isBottomSheetOpen: v }),
}))
