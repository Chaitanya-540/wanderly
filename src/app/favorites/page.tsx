'use client'

import HeartIcon from '@/components/ui/HeartIcon'

import { useFavorites } from '@/hooks/useFavorites'
import { ATTRACTIONS } from '@/data/attractions'
import DestinationCard from '@/components/cards/DestinationCard'

export default function FavoritesPage() {
  const { favorites } = useFavorites()
  const favorited = ATTRACTIONS.filter((a) => favorites.has(a.id))

  return (
    <div className="min-h-screen bg-[#09090f] px-6 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Favorites</h1>
      <p className="text-white/50 text-sm mb-8">Your saved attractions</p>

      {favorited.length === 0 ? (
        <div className="text-center py-24" style={{ color: 'rgba(232,224,212,0.25)' }}>
          <div style={{ marginBottom: 16 }}>
            <HeartIcon filled={false} size={40} />
          </div>
          <p style={{ fontFamily: 'var(--font-playfair, Playfair Display, serif)', fontSize: 18, color: 'rgba(232,224,212,0.4)' }}>No saved destinations yet.</p>
          <p style={{ fontSize: 12, marginTop: 6, fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)', color: 'rgba(232,224,212,0.25)' }}>Save any attraction to find it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorited.map((a) => (
            <DestinationCard key={a.id} attraction={a} />
          ))}
        </div>
      )}
    </div>
  )
}

