export default function WebGLFallback() {
  return (
    <div
      role="img"
      aria-label="Static map of India showing major states and attractions — interactive 3D view not available in your browser"
      className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white/50"
    >
      {/* Simple SVG outline of India as fallback */}
      <svg
        viewBox="0 0 200 220"
        className="w-64 h-64 opacity-60"
        aria-hidden="true"
        fill="none"
      >
        {/* Simplified India silhouette path */}
        <path
          d="M95 10 L115 12 L130 20 L145 35 L155 50 L160 70 L165 90 L160 110 L155 130 L145 150 L130 170 L115 185 L100 200 L90 195 L80 180 L70 165 L60 145 L50 125 L45 105 L42 85 L45 65 L50 48 L60 32 L75 20 Z"
          stroke="#7c3aed"
          strokeWidth="2"
          fill="#7c3aed11"
        />
        {/* Dots for major cities */}
        <circle cx="100" cy="100" r="3" fill="#a78bfa" />
        <circle cx="90" cy="70" r="2.5" fill="#38bdf8" />
        <circle cx="115" cy="80" r="2.5" fill="#38bdf8" />
        <circle cx="75" cy="115" r="2.5" fill="#38bdf8" />
        <circle cx="120" cy="110" r="2.5" fill="#38bdf8" />
        <circle cx="100" cy="140" r="2.5" fill="#38bdf8" />
      </svg>
      <p className="mt-4 text-sm text-center max-w-xs">
        3D map requires WebGL support.
        <br />
        <span className="text-white/30 text-xs">
          Try updating your browser or enabling hardware acceleration.
        </span>
      </p>
    </div>
  )
}
