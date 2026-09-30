import React from 'react';

interface TriviaWheelLogoProps {
  className?: string;
  size?: number | string;
}

export default function TriviaWheelLogo({ className = '', size = 56 }: TriviaWheelLogoProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`select-none shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Background gradient */}
        <radialGradient id="bgGlow" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#431407" stopOpacity="0.3" />
          <stop offset="40%" stopColor="#3b0764" />
          <stop offset="100%" stopColor="#0f0728" />
        </radialGradient>

        {/* Glow Filters */}
        <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000000" floodOpacity="0.6" />
        </filter>
        <filter id="textGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#020617" floodOpacity="0.9" />
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#38bdf8" floodOpacity="0.4" />
        </filter>

        {/* Wedge Gradients */}
        {/* 1. Purple (Art) - Top */}
        <linearGradient id="wedgePurple" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7e22ce" />
        </linearGradient>

        {/* 2. Orange (Sports) - Top Right */}
        <linearGradient id="wedgeOrange" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>

        {/* 3. Green (Science) - Bottom Right */}
        <linearGradient id="wedgeGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        {/* 4. Pink (Entertainment) - Bottom */}
        <linearGradient id="wedgePink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#9f1239" />
        </linearGradient>

        {/* 5. Yellow (History) - Bottom Left */}
        <linearGradient id="wedgeYellow" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>

        {/* 6. Cyan (Geography) - Top Left */}
        <linearGradient id="wedgeCyan" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>

      {/* Outer rounded container background with cosmic space gradient */}
      <rect width="512" height="512" rx="96" fill="url(#bgGlow)" />

      {/* Cosmic Stars and sparkles */}
      <g opacity="0.8">
        <circle cx="90" cy="80" r="3" fill="#ffffff" opacity="0.6" />
        <circle cx="60" cy="180" r="2.5" fill="#ffffff" opacity="0.4" />
        <circle cx="120" cy="240" r="2" fill="#ffffff" opacity="0.5" />
        <circle cx="70" cy="400" r="3.5" fill="#ffffff" opacity="0.7" />
        <circle cx="120" cy="460" r="4" fill="#ffffff" opacity="0.6" />
        <circle cx="170" cy="480" r="2" fill="#ffffff" opacity="0.4" />
        <circle cx="440" cy="420" r="3.5" fill="#ffffff" opacity="0.6" />
        <circle cx="460" cy="320" r="2.5" fill="#ffffff" opacity="0.5" />
        <circle cx="430" cy="120" r="3" fill="#ffffff" opacity="0.6" />
        <circle cx="390" cy="70" r="2" fill="#ffffff" opacity="0.7" />
      </g>

      {/* Top right shooting star trails */}
      <g filter="url(#shadowFilter)">
        <path
          d="M340 70 Q 400 90 470 120"
          stroke="url(#wedgeCyan)"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.5"
          filter="blur(4px)"
        />
        <path
          d="M360 65 Q 410 80 475 110"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* 4-point star sparkles */}
        <g transform="translate(360, 50) scale(0.7)">
          <path d="M0 -20 Q0 0 20 0 Q0 0 0 20 Q0 0 -20 0 Q0 0 0 -20Z" fill="#ffffff" />
        </g>
        <g transform="translate(415, 75) scale(0.9)">
          <path d="M0 -20 Q0 0 20 0 Q0 0 0 20 Q0 0 -20 0 Q0 0 0 -20Z" fill="#ffffff" />
        </g>
        <g transform="translate(465, 115) scale(1.3)">
          <path d="M0 -24 Q0 0 24 0 Q0 0 0 24 Q0 0 -24 0 Q0 0 0 -24Z" fill="#ffffff" />
          <circle cx="0" cy="0" r="5" fill="#bae6fd" />
        </g>
      </g>

      {/* Translucent glass circle bezel */}
      <circle
        cx="256"
        cy="256"
        r="206"
        fill="rgba(255, 255, 255, 0.04)"
        stroke="rgba(255, 255, 255, 0.22)"
        strokeWidth="6"
        filter="url(#shadowFilter)"
      />

      {/* ========================================================
          6 TRIVIA WEDGES (PIE SLICES)
          Center: (256, 256), Radius ~175
          Each sector is 60° with rounded corners and distinct icon
         ======================================================== */}
      <g filter="url(#shadowFilter)">
        {/* 1. TOP: Purple (Art) - 240° to 300° (-120° to -60°) */}
        <path
          d="M 256 240 L 192 120 A 170 170 0 0 1 320 120 Z"
          fill="url(#wedgePurple)"
          stroke="#e9d5ff"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Art Palette Icon */}
        <g transform="translate(256, 155) scale(0.9)" opacity="0.45" stroke="#ffffff" strokeWidth="2.5" fill="none">
          <path d="M -16 -6 C -20 -18, 0 -22, 12 -12 C 20 -4, 22 12, 14 18 C 8 22, -4 20, -12 16 C -18 12, -22 6, -16 -6 Z" fill="rgba(255,255,255,0.15)" />
          <circle cx="-6" cy="-10" r="2.5" fill="#ffffff" />
          <circle cx="4" cy="-8" r="2.5" fill="#ffffff" />
          <circle cx="10" cy="2" r="2.5" fill="#ffffff" />
          <circle cx="-6" cy="8" r="4" fill="#7e22ce" stroke="#ffffff" />
        </g>

        {/* 2. TOP RIGHT: Orange (Sports) - 300° to 360° (-60° to 0°) */}
        <path
          d="M 268 248 L 332 135 A 170 170 0 0 1 415 240 Z"
          fill="url(#wedgeOrange)"
          stroke="#fed7aa"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Runner / Sports Icon */}
        <g transform="translate(345, 200) scale(0.9)" opacity="0.45" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="-14" r="4" fill="#ffffff" />
          <path d="M -8 14 L -2 6 L 8 0 L 14 -8" />
          <path d="M -2 6 L 6 12 L 14 16" />
          <path d="M 2 -4 L -8 -10" />
        </g>

        {/* 3. BOTTOM RIGHT: Green (Science) - 0° to 60° */}
        <path
          d="M 268 264 L 415 272 A 170 170 0 0 1 332 377 Z"
          fill="url(#wedgeGreen)"
          stroke="#bbf7d0"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Science Atom Icon */}
        <g transform="translate(345, 310) scale(0.9)" opacity="0.45" stroke="#ffffff" strokeWidth="2" fill="none">
          <ellipse cx="0" cy="0" rx="16" ry="6" transform="rotate(30)" />
          <ellipse cx="0" cy="0" rx="16" ry="6" transform="rotate(-30)" />
          <ellipse cx="0" cy="0" rx="16" ry="6" transform="rotate(90)" />
          <circle cx="0" cy="0" r="3.5" fill="#ffffff" />
        </g>

        {/* 4. BOTTOM: Pink (Entertainment) - 60° to 120° */}
        <path
          d="M 256 272 L 320 392 A 170 170 0 0 1 192 392 Z"
          fill="url(#wedgePink)"
          stroke="#fecdd3"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Theater Comedy / Drama Masks */}
        <g transform="translate(256, 355) scale(0.85)" opacity="0.45" stroke="#ffffff" strokeWidth="2" fill="none">
          <rect x="-16" y="-12" width="16" height="20" rx="7" fill="rgba(255,255,255,0.1)" />
          <circle cx="-12" cy="-5" r="1.5" fill="#ffffff" />
          <circle cx="-4" cy="-5" r="1.5" fill="#ffffff" />
          <path d="M -12 2 Q -8 6 -4 2" strokeLinecap="round" />
          <rect x="0" y="-8" width="16" height="20" rx="7" fill="rgba(255,255,255,0.1)" />
          <circle cx="4" cy="-1" r="1.5" fill="#ffffff" />
          <circle cx="12" cy="-1" r="1.5" fill="#ffffff" />
          <path d="M 4 6 Q 8 2 12 6" strokeLinecap="round" />
        </g>

        {/* 5. BOTTOM LEFT: Yellow (History) - 120° to 180° */}
        <path
          d="M 244 264 L 180 377 A 170 170 0 0 1 97 272 Z"
          fill="url(#wedgeYellow)"
          stroke="#fef08a"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Classical Column / History Icon */}
        <g transform="translate(167, 310) scale(0.9)" opacity="0.45" stroke="#ffffff" strokeWidth="2.5" fill="none">
          <line x1="-12" y1="-12" x2="12" y2="-12" />
          <line x1="-8" y1="-8" x2="8" y2="-8" />
          <line x1="-6" y1="-8" x2="-6" y2="10" />
          <line x1="0" y1="-8" x2="0" y2="10" />
          <line x1="6" y1="-8" x2="6" y2="10" />
          <line x1="-10" y1="10" x2="10" y2="10" />
          <line x1="-14" y1="14" x2="14" y2="14" />
        </g>

        {/* 6. TOP LEFT: Cyan (Geography) - 180° to 240° */}
        <path
          d="M 244 248 L 97 240 A 170 170 0 0 1 180 135 Z"
          fill="url(#wedgeCyan)"
          stroke="#bae6fd"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Map Pin Location Icon */}
        <g transform="translate(167, 200) scale(0.9)" opacity="0.45" stroke="#ffffff" strokeWidth="2" fill="none">
          <path d="M 0 -14 C -8 -14 -12 -8 -12 0 C -12 8 0 16 0 16 C 0 16 12 8 12 0 C 12 -8 8 -14 0 -14 Z" fill="rgba(255,255,255,0.15)" />
          <circle cx="0" cy="-3" r="4" fill="#0369a1" stroke="#ffffff" />
        </g>
      </g>

      {/* Luminous Horizontal Rainbow Horizon Band across middle */}
      <rect
        x="20"
        y="238"
        width="472"
        height="36"
        fill="url(#wedgeCyan)"
        opacity="0.18"
        filter="blur(10px)"
      />
      <rect
        x="60"
        y="244"
        width="392"
        height="24"
        fill="#ffffff"
        opacity="0.12"
        filter="blur(6px)"
      />

      {/* ========================================================
          CENTRAL "Trivia" CALLIGRAPHY TITLE
          Cream cursive typography with 3D drop shadow
         ======================================================== */}
      <g filter="url(#textGlow)">
        {/* Dark Underline / Outline Shadow */}
        <text
          x="256"
          y="288"
          textAnchor="middle"
          fontSize="118"
          fontFamily="'Brush Script MT', 'Dancing Script', 'Snell Roundhand', 'Pacifico', cursive, sans-serif"
          fontStyle="italic"
          fontWeight="bold"
          fill="#1e1b4b"
          stroke="#090d16"
          strokeWidth="14"
          strokeLinejoin="round"
        >
          Trivia
        </text>

        {/* Outer White Rim */}
        <text
          x="256"
          y="288"
          textAnchor="middle"
          fontSize="118"
          fontFamily="'Brush Script MT', 'Dancing Script', 'Snell Roundhand', 'Pacifico', cursive, sans-serif"
          fontStyle="italic"
          fontWeight="bold"
          fill="#fef08a"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinejoin="round"
        >
          Trivia
        </text>

        {/* Inner Warm Cream Text Fill */}
        <text
          x="256"
          y="288"
          textAnchor="middle"
          fontSize="118"
          fontFamily="'Brush Script MT', 'Dancing Script', 'Snell Roundhand', 'Pacifico', cursive, sans-serif"
          fontStyle="italic"
          fontWeight="bold"
          fill="#fffbeb"
        >
          Trivia
        </text>

        {/* Upper Highlight Gloss */}
        <text
          x="254"
          y="285"
          textAnchor="middle"
          fontSize="118"
          fontFamily="'Brush Script MT', 'Dancing Script', 'Snell Roundhand', 'Pacifico', cursive, sans-serif"
          fontStyle="italic"
          fontWeight="bold"
          fill="#ffffff"
          opacity="0.6"
        >
          Trivia
        </text>
      </g>
    </svg>
  );
}
