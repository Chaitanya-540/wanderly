import Link from 'next/link'

export default function AttractionNotFound() {
  return (
    <div className="min-h-screen bg-[#09090f] flex flex-col items-center justify-center text-center px-6">
      <div className="text-6xl mb-6" aria-hidden>🗺️</div>
      <h1 className="text-3xl font-bold text-white mb-2">Attraction Not Found</h1>
      <p className="text-white/50 mb-8">We couldn&apos;t find the attraction you&apos;re looking for.</p>
      <div className="flex gap-4">
        <Link href="/" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400">
          Go to Map
        </Link>
        <Link href="/quick-list" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
          Browse All
        </Link>
      </div>
    </div>
  )
}
