'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ImageWithFallbackProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
}

export default function ImageWithFallback({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
}: ImageWithFallbackProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-white/5 text-white/30 text-sm text-center p-4 ${className ?? ''}`}
        aria-label="Image currently unavailable"
        role="img"
      >
        <span aria-hidden="true">🖼️</span>
        <span className="ml-2">Image currently unavailable</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      {loading && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-white/10 animate-pulse"
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        className={`transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'} ${fill ? 'object-cover' : ''}`}
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true) }}
      />
    </div>
  )
}
