export default function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-xl overflow-hidden bg-white/5 border border-white/10"
    >
      {/* Image area */}
      <div className="h-48 bg-white/10" />
      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
        <div className="h-3 bg-white/10 rounded w-full" />
        <div className="h-3 bg-white/10 rounded w-5/6" />
        <div className="flex gap-2 mt-2">
          <div className="h-7 bg-white/10 rounded-full w-20" />
          <div className="h-7 bg-white/10 rounded-full w-16" />
        </div>
      </div>
    </div>
  )
}
