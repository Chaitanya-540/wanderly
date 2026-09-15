import type { ImageRecord } from '@/types/image'

interface AttributionBlockProps {
  image: ImageRecord
}

export default function AttributionBlock({ image }: AttributionBlockProps) {
  return (
    <p className="text-xs text-white/40 mt-1 leading-tight">
      Photo by{' '}
      <a
        href={image.attributionUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-white/70 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50 rounded"
      >
        {image.authorName}
      </a>{' '}
      · {image.licenseName} · via{' '}
      <span className="capitalize">{image.source}</span>
    </p>
  )
}
