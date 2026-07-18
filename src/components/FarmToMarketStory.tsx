'use client'

import { useLanguage } from '@/lib/LanguageContext'

export function FarmToMarketStory() {
  const { t } = useLanguage()

  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-green-900 mb-2">{t('journeyTitle')}</h2>
        <p className="text-gray-600">{t('journeySubtitle')}</p>
      </div>

      <div className="relative rounded-3xl overflow-hidden border border-green-100 shadow-inner bg-linear-to-b from-sky-100 via-sky-50 to-green-50">
        <svg
          viewBox="0 0 900 380"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto block"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="skyGradFTM" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="70%" stopColor="#f0fdf4" />
              <stop offset="100%" stopColor="#dcfce7" />
            </linearGradient>
            <linearGradient id="frontHillFTM" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            <linearGradient id="hutRoofFTM" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <linearGradient id="barnRoof" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect width="900" height="380" fill="url(#skyGradFTM)" />

          {/* Sun with rotating rays */}
          <g transform="translate(90 78)">
            <g>
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="24s" repeatCount="indefinite" />
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <line key={deg} x1="0" y1="-38" x2="0" y2="-52" stroke="#facc15" strokeWidth="4" strokeLinecap="round" transform={`rotate(${deg})`} />
              ))}
            </g>
            <circle r="28" fill="#fde047" />
            <circle r="24" fill="#facc15" opacity="0.6" />
            {/* Smile */}
            <path d="M-8 4 Q 0 12 8 4" stroke="#a16207" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="-8" cy="-4" r="1.5" fill="#a16207" />
            <circle cx="8" cy="-4" r="1.5" fill="#a16207" />
          </g>

          {/* Birds flying */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="0 0; 900 -20; 0 0" dur="18s" repeatCount="indefinite" />
            <g transform="translate(-40 90)">
              <path d="M0 0 Q 6 -6 12 0 Q 18 -6 24 0" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round">
                <animate attributeName="d" values="M0 0 Q 6 -6 12 0 Q 18 -6 24 0;M0 0 Q 6 -2 12 0 Q 18 -2 24 0;M0 0 Q 6 -6 12 0 Q 18 -6 24 0" dur="0.6s" repeatCount="indefinite" />
              </path>
            </g>
            <g transform="translate(-80 110)">
              <path d="M0 0 Q 5 -5 10 0 Q 15 -5 20 0" stroke="#4b5563" strokeWidth="1.5" fill="none" strokeLinecap="round">
                <animate attributeName="d" values="M0 0 Q 5 -5 10 0 Q 15 -5 20 0;M0 0 Q 5 -1 10 0 Q 15 -1 20 0;M0 0 Q 5 -5 10 0 Q 15 -5 20 0" dur="0.7s" repeatCount="indefinite" />
              </path>
            </g>
          </g>

          {/* Clouds */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="-30 0; 40 0; -30 0" dur="22s" repeatCount="indefinite" />
            <g transform="translate(320 60)">
              <ellipse cx="0" cy="0" rx="34" ry="12" fill="white" />
              <ellipse cx="-18" cy="-8" rx="20" ry="10" fill="white" />
              <ellipse cx="16" cy="-6" rx="16" ry="9" fill="white" />
            </g>
          </g>
          <g>
            <animateTransform attributeName="transform" type="translate" values="20 0; -30 0; 20 0" dur="26s" repeatCount="indefinite" />
            <g transform="translate(640 45)">
              <ellipse cx="0" cy="0" rx="28" ry="10" fill="white" opacity="0.95" />
              <ellipse cx="-14" cy="-6" rx="17" ry="8" fill="white" opacity="0.95" />
            </g>
          </g>
          <g>
            <animateTransform attributeName="transform" type="translate" values="0 0; 20 0; 0 0" dur="30s" repeatCount="indefinite" />
            <g transform="translate(500 100)">
              <ellipse cx="0" cy="0" rx="22" ry="8" fill="white" opacity="0.8" />
              <ellipse cx="-10" cy="-4" rx="12" ry="6" fill="white" opacity="0.8" />
            </g>
          </g>

          {/* Distant hills with windmill */}
          <path d="M0 240 Q 200 195 400 225 T 900 215 L 900 380 L 0 380 Z" fill="#bbf7d0" opacity="0.7" />

          {/* Windmill on distant hill */}
          <g transform="translate(760 190)">
            {/* Tower */}
            <path d="M-4 40 L -6 0 L 6 0 L 4 40 Z" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
            {/* Rotating blades */}
            <g transform="translate(0 0)">
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
              <rect x="-1.5" y="-24" width="3" height="24" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="0.5" />
              <rect x="0" y="-1.5" width="24" height="3" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="0.5" />
              <rect x="-1.5" y="0" width="3" height="24" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="0.5" />
              <rect x="-24" y="-1.5" width="24" height="3" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="0.5" />
            </g>
            <circle cx="0" cy="0" r="2.5" fill="#6b7280" />
          </g>

          {/* Barn in mid-background */}
          <g transform="translate(200 200)">
            {/* Body */}
            <rect x="-30" y="0" width="60" height="45" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="1" />
            {/* Roof */}
            <path d="M-36 0 L 0 -22 L 36 0 Z" fill="url(#barnRoof)" />
            {/* Doors */}
            <rect x="-12" y="18" width="24" height="27" fill="#78350f" />
            <line x1="0" y1="18" x2="0" y2="45" stroke="#451a03" strokeWidth="1" />
            {/* Window */}
            <rect x="-6" y="4" width="12" height="10" fill="#fef3c7" stroke="#7f1d1d" strokeWidth="0.8" />
            <line x1="0" y1="4" x2="0" y2="14" stroke="#7f1d1d" strokeWidth="0.5" />
            <line x1="-6" y1="9" x2="6" y2="9" stroke="#7f1d1d" strokeWidth="0.5" />
          </g>

          {/* Front hill */}
          <path d="M0 280 Q 200 258 400 275 T 900 265 L 900 380 L 0 380 Z" fill="url(#frontHillFTM)" />

          {/* Big shady tree on far left */}
          <g transform="translate(50 280)">
            <g>
              <animateTransform attributeName="transform" type="rotate" values="-2;2;-2" dur="5s" repeatCount="indefinite" />
              <rect x="-4" y="-30" width="8" height="30" fill="#78350f" rx="1" />
              <circle cx="-10" cy="-42" r="18" fill="#16a34a" />
              <circle cx="10" cy="-42" r="18" fill="#16a34a" />
              <circle cx="0" cy="-52" r="20" fill="#22c55e" />
              <circle cx="-6" cy="-38" r="12" fill="#15803d" />
              {/* Apples */}
              <circle cx="-14" cy="-38" r="2.5" fill="#ef4444" />
              <circle cx="8" cy="-46" r="2.5" fill="#ef4444" />
              <circle cx="-2" cy="-56" r="2.5" fill="#ef4444" />
            </g>
          </g>

          {/* Wooden fence */}
          <g transform="translate(120 270)">
            {[0, 30, 60, 90, 120, 150, 180].map((x) => (
              <path key={x} d={`M${x} 0 L ${x} 20 M ${x - 3} 4 L ${x + 3} 4 M ${x - 3} 12 L ${x + 3} 12`} stroke="#92400e" strokeWidth="2" strokeLinecap="round" fill="none" />
            ))}
            <line x1="0" y1="7" x2="180" y2="7" stroke="#92400e" strokeWidth="2" />
            <line x1="0" y1="15" x2="180" y2="15" stroke="#92400e" strokeWidth="2" />
          </g>

          {/* Farmer */}
          <g transform="translate(155 305)">
            {/* Legs */}
            <rect x="-8" y="18" width="7" height="22" fill="#166534" rx="1.5" />
            <rect x="1" y="18" width="7" height="22" fill="#166534" rx="1.5" />
            {/* Shoes */}
            <ellipse cx="-4.5" cy="41" rx="6" ry="2.5" fill="#292524" />
            <ellipse cx="4.5" cy="41" rx="6" ry="2.5" fill="#292524" />
            {/* Body */}
            <path d="M-13 -4 L 13 -4 L 15 24 L -15 24 Z" fill="#2563eb" />
            <rect x="-13" y="20" width="26" height="4" fill="#1e40af" />
            {/* Left arm */}
            <rect x="-17" y="0" width="7" height="20" fill="#2563eb" rx="2" />
            {/* Right arm holding watering can — animated */}
            <g>
              <animateTransform attributeName="transform" type="rotate" values="-8;4;-8" dur="3s" repeatCount="indefinite" additive="sum" />
              <rect x="10" y="0" width="7" height="20" fill="#2563eb" rx="2" />
              {/* Watering can */}
              <g transform="translate(16 14)">
                <rect x="0" y="0" width="14" height="12" fill="#0d9488" rx="1.5" />
                <path d="M13 3 L 20 -2 L 20 8 Z" fill="#0d9488" />
                <rect x="3" y="-3" width="8" height="3" fill="#0d9488" rx="1" />
                {/* Water drops */}
                <circle cx="16" cy="10" r="1.3" fill="#38bdf8">
                  <animate attributeName="cy" values="10;18;10" dur="1.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0;1" dur="1.4s" repeatCount="indefinite" />
                </circle>
                <circle cx="18" cy="8" r="1" fill="#38bdf8">
                  <animate attributeName="cy" values="8;16;8" dur="1.4s" begin="0.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0;1" dur="1.4s" begin="0.4s" repeatCount="indefinite" />
                </circle>
                <circle cx="14" cy="12" r="0.9" fill="#38bdf8">
                  <animate attributeName="cy" values="12;20;12" dur="1.4s" begin="0.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0;1" dur="1.4s" begin="0.8s" repeatCount="indefinite" />
                </circle>
              </g>
            </g>
            {/* Head */}
            <circle cx="0" cy="-12" r="10" fill="#fed7aa" />
            <circle cx="-3" cy="-13" r="1" fill="#292524" />
            <circle cx="3" cy="-13" r="1" fill="#292524" />
            <path d="M-3 -8 Q 0 -5 3 -8" stroke="#7c2d12" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            {/* Hat */}
            <ellipse cx="0" cy="-20" rx="18" ry="4" fill="#b45309" />
            <path d="M-9 -20 Q 0 -30 9 -20 Z" fill="#d97706" />
            <ellipse cx="0" cy="-20" rx="9" ry="1.5" fill="#92400e" opacity="0.5" />
            {/* Bandana */}
            <path d="M-9 -3 L 9 -3 L 6 2 L -6 2 Z" fill="#dc2626" />
          </g>

          {/* Chicken */}
          <g transform="translate(115 340)">
            <g>
              <animateTransform attributeName="transform" type="translate" values="0 0;2 -1;0 0" dur="0.6s" repeatCount="indefinite" />
              {/* Body */}
              <ellipse cx="0" cy="0" rx="10" ry="7" fill="#fef3c7" stroke="#d97706" strokeWidth="0.5" />
              {/* Wing */}
              <ellipse cx="1" cy="-1" rx="6" ry="4" fill="#fde68a" />
              {/* Head */}
              <circle cx="-8" cy="-5" r="4" fill="#fef3c7" />
              {/* Beak */}
              <path d="M-12 -5 L -15 -4 L -12 -3 Z" fill="#f97316" />
              {/* Comb */}
              <path d="M-9 -9 L -8 -12 L -7 -9 L -6 -12 L -5 -9 Z" fill="#dc2626" />
              {/* Eye */}
              <circle cx="-9" cy="-6" r="0.7" fill="#292524" />
              {/* Tail feathers */}
              <path d="M8 -2 Q 14 -5 12 2" stroke="#d97706" strokeWidth="2" fill="none" strokeLinecap="round" />
              {/* Legs */}
              <line x1="-3" y1="6" x2="-3" y2="10" stroke="#f97316" strokeWidth="1.5" />
              <line x1="3" y1="6" x2="3" y2="10" stroke="#f97316" strokeWidth="1.5" />
            </g>
          </g>

          {/* CROPS ROW 1 — large, in front of front hill */}
          {/* Tomato plant */}
          <g transform="translate(220 335)">
            <g>
              <animateTransform attributeName="transform" type="scale" values="1 0.85;1 1;1 0.85" dur="2.6s" repeatCount="indefinite" />
              {/* Stem */}
              <line x1="0" y1="0" x2="0" y2="-40" stroke="#166534" strokeWidth="2.5" />
              {/* Leaves */}
              <ellipse cx="-6" cy="-15" rx="5" ry="8" fill="#16a34a" transform="rotate(-30 -6 -15)" />
              <ellipse cx="6" cy="-25" rx="5" ry="8" fill="#16a34a" transform="rotate(30 6 -25)" />
              <ellipse cx="-4" cy="-35" rx="4" ry="6" fill="#22c55e" transform="rotate(-20 -4 -35)" />
              {/* Tomatoes */}
              <circle cx="4" cy="-20" r="4" fill="#dc2626" />
              <circle cx="4" cy="-20" r="1.5" fill="#ef4444" opacity="0.6" />
              <path d="M4 -24 L 4 -25 M 2 -24 L 3 -25 M 6 -24 L 5 -25" stroke="#166534" strokeWidth="0.8" />
              <circle cx="-4" cy="-32" r="3.5" fill="#dc2626" />
              <circle cx="-4" cy="-32" r="1.2" fill="#ef4444" opacity="0.6" />
            </g>
          </g>

          {/* Corn stalk */}
          <g transform="translate(260 335)">
            <g>
              <animateTransform attributeName="transform" type="scale" values="1 0.85;1 1;1 0.85" dur="2.6s" begin="0.3s" repeatCount="indefinite" />
              <line x1="0" y1="0" x2="0" y2="-50" stroke="#15803d" strokeWidth="3" />
              {/* Leaves */}
              <path d="M0 -20 Q -12 -25 -16 -18" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M0 -30 Q 14 -34 18 -26" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M0 -42 Q -10 -46 -14 -40" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Corn cob */}
              <ellipse cx="5" cy="-25" rx="3" ry="8" fill="#facc15" transform="rotate(15 5 -25)" />
              <ellipse cx="5" cy="-25" rx="2" ry="7" fill="#eab308" transform="rotate(15 5 -25)" />
              {/* Corn husk */}
              <path d="M8 -18 Q 10 -14 6 -12" stroke="#22c55e" strokeWidth="1.5" fill="none" />
              {/* Top tassel */}
              <path d="M0 -50 L -2 -54 M 0 -50 L 2 -54 M 0 -50 L 0 -55" stroke="#eab308" strokeWidth="1" />
            </g>
          </g>

          {/* Cabbage / lettuce head */}
          <g transform="translate(300 340)">
            <g>
              <animateTransform attributeName="transform" type="scale" values="0.9;1;0.9" dur="2.4s" begin="0.6s" repeatCount="indefinite" />
              <ellipse cx="0" cy="-3" rx="14" ry="10" fill="#22c55e" />
              <ellipse cx="-4" cy="-6" rx="10" ry="8" fill="#16a34a" opacity="0.7" />
              <ellipse cx="4" cy="-5" rx="9" ry="7" fill="#4ade80" />
              <ellipse cx="0" cy="-10" rx="7" ry="5" fill="#16a34a" />
              <path d="M-10 -6 Q -6 -14 0 -10" stroke="#15803d" strokeWidth="1" fill="none" opacity="0.6" />
              <path d="M6 -8 Q 10 -14 4 -12" stroke="#15803d" strokeWidth="1" fill="none" opacity="0.6" />
            </g>
          </g>

          {/* Carrots (peeking out of ground with tops) */}
          <g transform="translate(340 335)">
            {[0, 12, 24].map((x, i) => (
              <g key={x} transform={`translate(${x} 0)`}>
                <g>
                  <animateTransform attributeName="transform" type="scale" values="0.85 1; 1 1; 0.85 1" dur="2.6s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
                  {/* Carrot leaves */}
                  <path d="M0 0 L -3 -12 M 0 0 L 0 -14 M 0 0 L 3 -12" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
                  <path d="M0 0 L -5 -9 M 0 0 L 5 -9" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                  {/* Carrot top peeking */}
                  <ellipse cx="0" cy="1" rx="3" ry="2" fill="#f97316" />
                </g>
              </g>
            ))}
          </g>

          {/* Second tomato plant */}
          <g transform="translate(400 335)">
            <g>
              <animateTransform attributeName="transform" type="scale" values="1 0.85;1 1;1 0.85" dur="2.8s" begin="0.9s" repeatCount="indefinite" />
              <line x1="0" y1="0" x2="0" y2="-38" stroke="#166534" strokeWidth="2.5" />
              <ellipse cx="6" cy="-14" rx="5" ry="7" fill="#16a34a" transform="rotate(30 6 -14)" />
              <ellipse cx="-6" cy="-26" rx="5" ry="7" fill="#16a34a" transform="rotate(-30 -6 -26)" />
              <circle cx="-4" cy="-18" r="4" fill="#f97316" />
              <circle cx="-4" cy="-18" r="1.5" fill="#fb923c" opacity="0.6" />
              <circle cx="5" cy="-30" r="3.5" fill="#dc2626" />
            </g>
          </g>

          {/* Journey path arrow */}
          <path d="M 450 320 Q 550 270 660 305" stroke="#16a34a" strokeWidth="2.5" strokeDasharray="7 5" fill="none" opacity="0.7" />
          <path d="M 657 302 L 668 306 L 657 311 Z" fill="#16a34a" opacity="0.8" />

          {/* Traveling basket */}
          <g>
            <animateMotion dur="5s" repeatCount="indefinite" path="M 450 320 Q 550 270 660 305" />
            <g>
              <animate attributeName="opacity" values="0;1;1;1;0" dur="5s" repeatCount="indefinite" />
              <g transform="translate(-16 -18)">
                <path d="M0 5 L 32 5 L 28 24 L 4 24 Z" fill="#c2410c" />
                <path d="M0 5 L 32 5 L 28 24 L 4 24 Z" stroke="#7c2d12" strokeWidth="1" fill="none" />
                <line x1="2" y1="12" x2="30" y2="12" stroke="#7c2d12" strokeWidth="0.7" opacity="0.6" />
                <line x1="3" y1="18" x2="29" y2="18" stroke="#7c2d12" strokeWidth="0.7" opacity="0.6" />
                <ellipse cx="16" cy="5" rx="16" ry="3" fill="#7c2d12" />
                {/* Produce */}
                <circle cx="7" cy="2" r="3.5" fill="#dc2626" />
                <circle cx="14" cy="1" r="3.8" fill="#f97316" />
                <circle cx="21" cy="2" r="3.5" fill="#facc15" />
                <circle cx="27" cy="3" r="3" fill="#dc2626" />
                <ellipse cx="10" cy="-1" rx="5" ry="2.5" fill="#22c55e" />
                <ellipse cx="20" cy="-1" rx="4" ry="2" fill="#16a34a" />
                <path d="M14 -3 Q 17 -8 20 -5" stroke="#166534" strokeWidth="1.3" fill="none" strokeLinecap="round" />
              </g>
            </g>
          </g>

          {/* Delivery truck near market */}
          <g transform="translate(530 315)">
            <g>
              <animateTransform attributeName="transform" type="translate" values="0 0; 6 0; 0 0" dur="3s" repeatCount="indefinite" />
              {/* Cab */}
              <rect x="0" y="0" width="18" height="14" fill="#22c55e" rx="2" />
              <rect x="2" y="2" width="8" height="7" fill="#bfdbfe" rx="1" />
              {/* Cargo box */}
              <rect x="18" y="-4" width="26" height="18" fill="white" stroke="#16a34a" strokeWidth="1.5" rx="1" />
              <path d="M22 -1 L 40 -1 M 22 3 L 40 3 M 22 7 L 40 7" stroke="#16a34a" strokeWidth="0.5" opacity="0.5" />
              {/* Wheels */}
              <circle cx="5" cy="16" r="3" fill="#292524" />
              <circle cx="5" cy="16" r="1" fill="#78716c" />
              <circle cx="36" cy="16" r="3" fill="#292524" />
              <circle cx="36" cy="16" r="1" fill="#78716c" />
              {/* Logo */}
              <text x="31" y="8" textAnchor="middle" fontSize="4" fontWeight="700" fill="#166534" fontFamily="Arial, sans-serif">FE</text>
            </g>
          </g>

          {/* Marketplace hut */}
          <g transform="translate(750 225)">
            {/* Body */}
            <rect x="-80" y="15" width="160" height="90" fill="white" stroke="#16a34a" strokeWidth="3" />
            {/* Awning (rounded top) */}
            <path d="M -90 15 L -90 -20 Q -90 -42 -68 -42 L 68 -42 Q 90 -42 90 -20 L 90 15 Z" fill="url(#hutRoofFTM)" />
            {/* Scalloped bottom of awning */}
            <path d="M -90 15 L 90 15 L 90 15 Q 80 28 70 15 Q 60 28 50 15 Q 40 28 30 15 Q 20 28 10 15 Q 0 28 -10 15 Q -20 28 -30 15 Q -40 28 -50 15 Q -60 28 -70 15 Q -80 28 -90 15 Z" fill="#16a34a" />
            {/* Sign */}
            <rect x="-36" y="-30" width="72" height="20" rx="3" fill="white" opacity="0.95" />
            <text x="0" y="-16" textAnchor="middle" fontSize="12" fontWeight="700" fill="#166534" fontFamily="Arial, sans-serif">FarmEasy</text>
            {/* Door */}
            <path d="M -14 105 L -14 68 Q -14 54 0 54 Q 14 54 14 68 L 14 105 Z" fill="#16a34a" />
            <circle cx="9" cy="82" r="1.5" fill="#facc15" />
            {/* Left window */}
            <rect x="-64" y="35" width="30" height="22" fill="#dbeafe" stroke="#16a34a" strokeWidth="1.5" rx="2" />
            <line x1="-49" y1="35" x2="-49" y2="57" stroke="#16a34a" strokeWidth="1" />
            <line x1="-64" y1="46" x2="-34" y2="46" stroke="#16a34a" strokeWidth="1" />
            {/* Right window with produce */}
            <rect x="34" y="35" width="30" height="22" fill="#fef3c7" stroke="#16a34a" strokeWidth="1.5" rx="2" />
            <circle cx="40" cy="47" r="2.5" fill="#ef4444" />
            <circle cx="47" cy="47" r="2.5" fill="#22c55e" />
            <circle cx="54" cy="47" r="2.5" fill="#f97316" />
            <circle cx="60" cy="47" r="2" fill="#facc15" />
            {/* OPEN sign */}
            <g>
              <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite" />
              <rect x="20" y="65" width="24" height="10" fill="#dc2626" rx="1" />
              <text x="32" y="72" textAnchor="middle" fontSize="6" fontWeight="700" fill="white" fontFamily="Arial, sans-serif">OPEN</text>
            </g>
          </g>

          {/* Produce crates outside shop */}
          <g transform="translate(660 315)">
            <rect x="0" y="0" width="26" height="18" fill="#92400e" rx="1" />
            <line x1="0" y1="6" x2="26" y2="6" stroke="#78350f" strokeWidth="0.8" />
            <line x1="0" y1="12" x2="26" y2="12" stroke="#78350f" strokeWidth="0.8" />
            <circle cx="5" cy="-2" r="4" fill="#dc2626" />
            <circle cx="12" cy="-3" r="4.5" fill="#f97316" />
            <circle cx="19" cy="-2" r="4" fill="#facc15" />
            <ellipse cx="8" cy="-6" rx="3" ry="1.5" fill="#22c55e" />
          </g>
          <g transform="translate(690 320)">
            <rect x="0" y="0" width="24" height="15" fill="#a16207" rx="1" />
            <line x1="0" y1="5" x2="24" y2="5" stroke="#78350f" strokeWidth="0.8" />
            <circle cx="6" cy="-2" r="3.5" fill="#84cc16" />
            <circle cx="13" cy="-3" r="3.8" fill="#4ade80" />
            <circle cx="19" cy="-2" r="3" fill="#a3e635" />
          </g>

          {/* Buyer 1 — approaching with cart */}
          <g transform="translate(620 340)">
            <g>
              <animateTransform attributeName="transform" type="translate" values="0 0;0 -2;0 0" dur="1.8s" repeatCount="indefinite" />
              {/* Legs */}
              <rect x="-5" y="12" width="4" height="16" fill="#3b82f6" rx="1" />
              <rect x="1" y="12" width="4" height="16" fill="#3b82f6" rx="1" />
              <ellipse cx="-3" cy="29" rx="4" ry="1.5" fill="#292524" />
              <ellipse cx="3" cy="29" rx="4" ry="1.5" fill="#292524" />
              {/* Body */}
              <rect x="-8" y="-4" width="16" height="18" fill="#dc2626" rx="3" />
              {/* Head */}
              <circle cx="0" cy="-11" r="7" fill="#fed7aa" />
              {/* Hair (long) */}
              <path d="M-7 -12 Q 0 -19 7 -12 L 7 -5 L 6 -3 L -6 -3 L -7 -5 Z" fill="#78350f" />
              {/* Eyes */}
              <circle cx="-2.5" cy="-11" r="0.8" fill="#292524" />
              <circle cx="2.5" cy="-11" r="0.8" fill="#292524" />
              <path d="M-2 -8 Q 0 -6 2 -8" stroke="#7c2d12" strokeWidth="1" fill="none" strokeLinecap="round" />
              {/* Arm holding cart */}
              <rect x="6" y="-2" width="10" height="4" fill="#dc2626" rx="1.5" />
              {/* Shopping cart */}
              <g transform="translate(15 4)">
                <path d="M0 0 L 4 0 L 8 10 L 20 10 L 22 4 L 6 4" stroke="#374151" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="14" r="2" fill="#374151" />
                <circle cx="18" cy="14" r="2" fill="#374151" />
                {/* Produce in cart */}
                <circle cx="12" cy="7" r="1.8" fill="#dc2626" />
                <circle cx="16" cy="7" r="1.8" fill="#f97316" />
              </g>
            </g>
          </g>

          {/* Buyer 2 — at the door */}
          <g transform="translate(748 320)">
            <g>
              <animateTransform attributeName="transform" type="translate" values="0 0;0 -1.5;0 0" dur="2.2s" begin="0.5s" repeatCount="indefinite" />
              {/* Legs */}
              <rect x="-5" y="15" width="4" height="18" fill="#7c2d12" rx="1" />
              <rect x="1" y="15" width="4" height="18" fill="#7c2d12" rx="1" />
              <ellipse cx="-3" cy="34" rx="4" ry="1.5" fill="#292524" />
              <ellipse cx="3" cy="34" rx="4" ry="1.5" fill="#292524" />
              {/* Body */}
              <rect x="-8" y="-2" width="16" height="20" fill="#7c3aed" rx="3" />
              {/* Head */}
              <circle cx="0" cy="-11" r="7" fill="#fed7aa" />
              {/* Hair (short/beard) */}
              <path d="M-7 -13 Q 0 -18 7 -13 L 7 -8 L -7 -8 Z" fill="#292524" />
              <circle cx="-2.5" cy="-11" r="0.8" fill="#292524" />
              <circle cx="2.5" cy="-11" r="0.8" fill="#292524" />
              <path d="M-2 -8 Q 0 -6 2 -8" stroke="#7c2d12" strokeWidth="1" fill="none" strokeLinecap="round" />
              {/* Shopping bag */}
              <g transform="translate(8 4)">
                <rect x="-4" y="0" width="12" height="14" fill="#84cc16" rx="1" />
                <path d="M-3 0 Q 2 -6 7 0" stroke="#65a30d" strokeWidth="1.5" fill="none" />
                <circle cx="0" cy="1" r="1.8" fill="#dc2626" />
                <circle cx="4" cy="1" r="1.8" fill="#f97316" />
                <ellipse cx="2" cy="-2" rx="3" ry="1.5" fill="#22c55e" />
              </g>
            </g>
          </g>

          {/* Buyer 3 — child near crates */}
          <g transform="translate(683 340)">
            <g>
              <animateTransform attributeName="transform" type="translate" values="0 0;1 -1;0 0" dur="1.4s" repeatCount="indefinite" />
              <rect x="-3.5" y="8" width="3" height="12" fill="#0369a1" rx="1" />
              <rect x="0.5" y="8" width="3" height="12" fill="#0369a1" rx="1" />
              <ellipse cx="-2" cy="21" rx="3" ry="1" fill="#292524" />
              <ellipse cx="2" cy="21" rx="3" ry="1" fill="#292524" />
              {/* Body */}
              <rect x="-6" y="-2" width="12" height="12" fill="#f59e0b" rx="2" />
              {/* Head */}
              <circle cx="0" cy="-8" r="5" fill="#fed7aa" />
              <path d="M-5 -9 Q 0 -13 5 -9 L 4 -6 L -4 -6 Z" fill="#78350f" />
              <circle cx="-1.5" cy="-8" r="0.6" fill="#292524" />
              <circle cx="1.5" cy="-8" r="0.6" fill="#292524" />
              <path d="M-1.5 -6 Q 0 -4 1.5 -6" stroke="#7c2d12" strokeWidth="0.8" fill="none" strokeLinecap="round" />
              {/* Arm pointing */}
              <rect x="-9" y="-1" width="4" height="6" fill="#f59e0b" rx="1" transform="rotate(-30 -7 2)" />
            </g>
          </g>

          {/* Foreground grass tufts */}
          {[10, 70, 180, 340, 470, 580, 730, 830, 880].map((x) => (
            <g key={x} transform={`translate(${x} 350)`}>
              <g>
                <animateTransform attributeName="transform" type="rotate" values="-4;4;-4" dur="4s" begin={`${(x % 5) * 0.3}s`} repeatCount="indefinite" />
                <path d="M-4 0 L -1 -10 L 2 0 Z" fill="#16a34a" />
                <path d="M-7 0 L -4 -7 L -1 0 Z" fill="#22c55e" />
                <path d="M1 0 L 4 -8 L 7 0 Z" fill="#22c55e" />
              </g>
            </g>
          ))}

          {/* Small flowers scattered */}
          {[
            { x: 90, c: '#f472b6' },
            { x: 380, c: '#facc15' },
            { x: 500, c: '#f472b6' },
            { x: 720, c: '#facc15' },
            { x: 810, c: '#f472b6' },
          ].map(({ x, c }) => (
            <g key={x} transform={`translate(${x} 345)`}>
              <line x1="0" y1="0" x2="0" y2="-8" stroke="#166534" strokeWidth="1" />
              <circle cx="0" cy="-9" r="1.8" fill={c} />
              <circle cx="0" cy="-9" r="0.8" fill="#facc15" />
              <ellipse cx="-1" cy="-4" rx="2" ry="1" fill="#22c55e" transform="rotate(-30 -1 -4)" />
            </g>
          ))}
        </svg>
      </div>
    </section>
  )
}
