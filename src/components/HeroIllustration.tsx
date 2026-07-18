export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 480"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#dcfce7" />
          <stop offset="1" stopColor="#f0fdf4" />
        </linearGradient>
        <linearGradient id="hill1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#86efac" />
          <stop offset="1" stopColor="#4ade80" />
        </linearGradient>
        <linearGradient id="hill2" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#22c55e" />
          <stop offset="1" stopColor="#16a34a" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#facc15" />
        </radialGradient>
      </defs>

      {/* Sky */}
      <rect width="600" height="480" fill="url(#sky)" rx="24" />

      {/* Sun */}
      <circle cx="470" cy="120" r="55" fill="url(#sun)" opacity="0.9" />
      <circle cx="470" cy="120" r="70" fill="#fde047" opacity="0.25" />
      <circle cx="470" cy="120" r="90" fill="#fde047" opacity="0.12" />

      {/* Distant clouds */}
      <ellipse cx="130" cy="90" rx="45" ry="16" fill="#ffffff" opacity="0.7" />
      <ellipse cx="180" cy="80" rx="30" ry="12" fill="#ffffff" opacity="0.6" />
      <ellipse cx="330" cy="140" rx="40" ry="14" fill="#ffffff" opacity="0.55" />

      {/* Back hill */}
      <path d="M 0 340 Q 150 240, 300 300 T 600 280 L 600 480 L 0 480 Z" fill="url(#hill1)" />

      {/* Front hill */}
      <path d="M 0 400 Q 120 340, 280 380 Q 420 410, 600 360 L 600 480 L 0 480 Z" fill="url(#hill2)" />

      {/* Small trees on back hill */}
      <g transform="translate(80, 280)">
        <rect x="-3" y="10" width="6" height="14" fill="#78350f" />
        <circle cx="0" cy="4" r="14" fill="#166534" />
        <circle cx="-9" cy="10" r="10" fill="#15803d" />
        <circle cx="9" cy="10" r="10" fill="#15803d" />
      </g>
      <g transform="translate(430, 260)">
        <rect x="-3" y="10" width="6" height="14" fill="#78350f" />
        <circle cx="0" cy="4" r="12" fill="#166534" />
        <circle cx="-8" cy="10" r="9" fill="#15803d" />
        <circle cx="8" cy="10" r="9" fill="#15803d" />
      </g>

      {/* Wheat stalks (left cluster) */}
      <g transform="translate(70, 380)">
        <line x1="0" y1="0" x2="0" y2="-60" stroke="#ca8a04" strokeWidth="2" />
        <ellipse cx="-4" cy="-45" rx="3" ry="6" fill="#eab308" />
        <ellipse cx="4" cy="-50" rx="3" ry="6" fill="#eab308" />
        <ellipse cx="-4" cy="-55" rx="3" ry="6" fill="#eab308" />
        <ellipse cx="0" cy="-60" rx="3" ry="6" fill="#facc15" />

        <line x1="12" y1="0" x2="12" y2="-55" stroke="#ca8a04" strokeWidth="2" />
        <ellipse cx="8" cy="-42" rx="3" ry="6" fill="#eab308" />
        <ellipse cx="16" cy="-47" rx="3" ry="6" fill="#eab308" />
        <ellipse cx="12" cy="-55" rx="3" ry="6" fill="#facc15" />

        <line x1="-12" y1="0" x2="-12" y2="-50" stroke="#ca8a04" strokeWidth="2" />
        <ellipse cx="-16" cy="-38" rx="3" ry="6" fill="#eab308" />
        <ellipse cx="-8" cy="-43" rx="3" ry="6" fill="#eab308" />
        <ellipse cx="-12" cy="-50" rx="3" ry="6" fill="#facc15" />
      </g>

      {/* Farmer figure */}
      <g transform="translate(300, 320)">
        {/* Shadow */}
        <ellipse cx="0" cy="90" rx="45" ry="6" fill="#000" opacity="0.15" />

        {/* Body */}
        <path d="M -22 90 L -22 25 Q -22 15, -12 15 L 12 15 Q 22 15, 22 25 L 22 90 Z" fill="#16a34a" />
        {/* Overall straps */}
        <path d="M -18 25 L -8 5 M 18 25 L 8 5" stroke="#166534" strokeWidth="3" fill="none" />
        {/* Shirt */}
        <path d="M -22 25 Q -22 -5, 0 -5 Q 22 -5, 22 25 L 22 45 L -22 45 Z" fill="#3b82f6" />

        {/* Neck */}
        <rect x="-6" y="-15" width="12" height="12" fill="#fbbf24" />
        {/* Head */}
        <circle cx="0" cy="-25" r="18" fill="#fcd34d" />
        {/* Hat */}
        <ellipse cx="0" cy="-38" rx="28" ry="6" fill="#78350f" />
        <path d="M -14 -38 Q -14 -55, 0 -55 Q 14 -55, 14 -38 Z" fill="#a16207" />
        <ellipse cx="0" cy="-46" rx="9" ry="2" fill="#78350f" />
        {/* Face */}
        <circle cx="-6" cy="-27" r="1.5" fill="#1f2937" />
        <circle cx="6" cy="-27" r="1.5" fill="#1f2937" />
        <path d="M -5 -20 Q 0 -16, 5 -20" stroke="#1f2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Arm holding basket */}
        <rect x="22" y="15" width="8" height="30" rx="4" fill="#fbbf24" transform="rotate(20 26 30)" />

        {/* Basket */}
        <g transform="translate(48, 40)">
          <path d="M -22 0 L -18 25 L 18 25 L 22 0 Z" fill="#a16207" />
          <rect x="-24" y="-3" width="48" height="6" rx="2" fill="#78350f" />
          {/* Handle */}
          <path d="M -18 -3 Q 0 -20, 18 -3" stroke="#78350f" strokeWidth="3" fill="none" />
          {/* Vegetables in basket */}
          <circle cx="-10" cy="-2" r="6" fill="#ef4444" />
          <circle cx="0" cy="-4" r="7" fill="#22c55e" />
          <circle cx="12" cy="-2" r="6" fill="#f97316" />
          <path d="M -4 -8 L -4 -14 L 4 -14 L 4 -10 Z" fill="#166534" />
        </g>
      </g>
    </svg>
  )
}
