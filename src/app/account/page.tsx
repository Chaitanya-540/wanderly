'use client'

import { useState } from 'react'
import { useLocalProfile } from '@/hooks/useLocalProfile'
import { MOOD_TAGS } from '@/data/moodTags'
import type { MoodTag } from '@/types/attraction'

export default function AccountPage() {
  const { profile, setProfile, storageAvailable } = useLocalProfile()
  const [name, setName] = useState(profile.displayName)
  const [moods, setMoods] = useState<MoodTag[]>(profile.defaultMoods)
  const [saved, setSaved] = useState(false)

  function toggleMood(tag: MoodTag) {
    setMoods((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
    setSaved(false)
  }

  function handleSave() {
    setProfile({ displayName: name, defaultMoods: moods })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#09090f] px-6 py-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Account</h1>
      <p className="text-white/50 text-sm mb-8">Your local preferences</p>

      {!storageAvailable && (
        <div role="alert" className="mb-6 bg-amber-900/30 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-200 text-sm">
          ⚠️ localStorage is not available. Your settings won&apos;t be saved between sessions.
        </div>
      )}

      <section className="space-y-6">
        {/* Display name */}
        <div>
          <label htmlFor="display-name" className="block text-sm font-medium text-white/80 mb-2">
            Display Name
          </label>
          <input
            id="display-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setSaved(false) }}
            placeholder="Your name"
            className="w-full bg-white/10 text-white placeholder-white/30 px-4 py-2.5 rounded-xl text-sm border border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            maxLength={50}
          />
        </div>

        {/* Default moods */}
        <div>
          <fieldset>
            <legend className="block text-sm font-medium text-white/80 mb-3">
              Default Mood Preferences
            </legend>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((tag) => {
                const selected = moods.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleMood(tag)}
                    aria-pressed={selected}
                    className={[
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500',
                      selected
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20',
                    ].join(' ')}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </fieldset>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
        >
          {saved ? '✓ Saved' : 'Save Preferences'}
        </button>
      </section>
    </div>
  )
}
