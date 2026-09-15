import { create } from 'zustand'

interface MapState {
  activeAttractionId: string | null
  setActiveAttraction: (id: string | null) => void
  cameraTarget: [number, number, number]
  setCameraTarget: (pos: [number, number, number]) => void
  isAnimating: boolean
  setIsAnimating: (v: boolean) => void
}

export const useMapStore = create<MapState>((set) => ({
  activeAttractionId: null,
  setActiveAttraction: (id) => set({ activeAttractionId: id }),
  cameraTarget: [0, 0, 0],
  setCameraTarget: (pos) => set({ cameraTarget: pos }),
  isAnimating: false,
  setIsAnimating: (v) => set({ isAnimating: v }),
}))
