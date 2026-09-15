import DestinationCard from '@/components/cards/DestinationCard'
import type { Attraction } from '@/types/attraction'

interface NearbyDestinationsProps {
  nearby: Attraction[]
}

export default function NearbyDestinations({ nearby }: NearbyDestinationsProps) {
  if (nearby.length === 0) return null

  return (
    <section aria-labelledby="nearby-heading">
      <h2 id="nearby-heading" className="text-sm font-semibold text-white mb-3">
        Nearby Destinations
      </h2>
      <div className="space-y-3">
        {nearby.map((a) => (
          <DestinationCard key={a.id} attraction={a} compact />
        ))}
      </div>
    </section>
  )
}
