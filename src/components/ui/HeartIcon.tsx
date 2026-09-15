interface HeartIconProps {
  filled?: boolean
  size?: number
  className?: string
}

export default function HeartIcon({ filled = false, size = 14, className }: HeartIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      {filled ? (
        <path
          d="M12 21C12 21 3 14.5 3 8.5A4.5 4.5 0 0 1 12 5.5 4.5 4.5 0 0 1 21 8.5C21 14.5 12 21 12 21z"
          fill="#FFB86B"
          stroke="#FFB86B"
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M12 21C12 21 3 14.5 3 8.5A4.5 4.5 0 0 1 12 5.5 4.5 4.5 0 0 1 21 8.5C21 14.5 12 21 12 21z"
          fill="none"
          stroke="rgba(232,224,212,0.45)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}
