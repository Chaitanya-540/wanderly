import { useState, useCallback, useEffect } from 'react'
import type { LocalProfile } from '@/types/profile'

const STORAGE_KEY = 'bharat3d:profile'

const DEFAULT_PROFILE: LocalProfile = {
  displayName: '',
  defaultMoods: [],
}

function loadProfile(): LocalProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PROFILE }
    return JSON.parse(raw) as LocalProfile
  } catch {
    return { ...DEFAULT_PROFILE }
  }
}

function persistProfile(profile: LocalProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export interface UseLocalProfileReturn {
  profile: LocalProfile
  setProfile: (profile: LocalProfile) => void
  storageAvailable: boolean
}

export function useLocalProfile(): UseLocalProfileReturn {
  const [storageAvailable, setStorageAvailable] = useState(false)
  const [profile, setProfileState] = useState<LocalProfile>({ ...DEFAULT_PROFILE })

  useEffect(() => {
    try {
      localStorage.setItem('__test__', '1')
      localStorage.removeItem('__test__')
      setStorageAvailable(true)
      setProfileState(loadProfile())
    } catch {
      setStorageAvailable(false)
    }
  }, [])

  const setProfile = useCallback(
    (newProfile: LocalProfile) => {
      setProfileState(newProfile)
      if (storageAvailable) persistProfile(newProfile)
    },
    [storageAvailable],
  )

  return { profile, setProfile, storageAvailable }
}
