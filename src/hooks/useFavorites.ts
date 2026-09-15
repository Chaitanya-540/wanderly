import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'bharat3d:favorites'

function loadFromStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as string[]
    return new Set(arr)
  } catch {
    return new Set()
  }
}

function saveToStorage(favorites: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]))
}

export interface UseFavoritesReturn {
  favorites: Set<string>
  toggle: (id: string) => void
  isFavorite: (id: string) => boolean
  storageAvailable: boolean
}

export function useFavorites(): UseFavoritesReturn {
  const [storageAvailable, setStorageAvailable] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Hydrate from localStorage on client mount only
  useEffect(() => {
    try {
      localStorage.setItem('__test__', '1')
      localStorage.removeItem('__test__')
      setStorageAvailable(true)
      setFavorites(loadFromStorage())
    } catch {
      setStorageAvailable(false)
    }
  }, [])

  const toggle = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        if (storageAvailable) {
          saveToStorage(next)
        }
        return next
      })
    },
    [storageAvailable],
  )

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites])

  return { favorites, toggle, isFavorite, storageAvailable }
}
