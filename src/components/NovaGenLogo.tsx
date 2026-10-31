import React from 'react';

interface Props {
  className?: string;
  size?: number;
  showText?: boolean;
  versionBadge?: string;
}

export default function NovaGenLogo({ className = '', size = 32, showText = false, versionBadge }: Props) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        {/* SVG Vector Stellar Core & Quantum Orbitals */}
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]"
        >
          <defs>
            {/* Core Radial Supernova Glow */}
            <radialGradient id="novaCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#00F0FF" />
              <stop offset="65%" stopColor="#D946EF" />
              <stop offset="100%" stopColor="#07090E" stopOpacity="0" />
            </radialGradient>

            {/* Orbit Gradient Cyan-Magenta */}
            <linearGradient id="orbitCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#A855F7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="orbitMagenta" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#EC4899" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.8" />
            </linearGradient>

            {/* Particle Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Radiant Cosmic Rays */}
          <g opacity="0.6">
            <line x1="60" y1="10" x2="60" y2="110" stroke="#00F0FF" strokeWidth="1" strokeDasharray="2 4" />
            <line x1="10" y1="60" x2="110" y2="60" stroke="#EC4899" strokeWidth="1" strokeDasharray="2 4" />
            <line x1="25" y1="25" x2="95" y2="95" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 4" />
            <line x1="25" y1="95" x2="95" y2="25" stroke="#00F0FF" strokeWidth="1" strokeDasharray="2 4" />
          </g>

          {/* Intersecting Elliptical Quantum Orbitals */}
          <g filter="url(#glow)">
            {/* Orbital 1 - Horizontal 0deg */}
            <ellipse
              cx="60"
              cy="60"
              rx="48"
              ry="18"
              stroke="url(#orbitCyan)"
              strokeWidth="2.5"
              fill="none"
              transform="rotate(0 60 60)"
            />
            {/* Orbital 2 - 60deg */}
            <ellipse
              cx="60"
              cy="60"
              rx="48"
              ry="18"
              stroke="url(#orbitMagenta)"
              strokeWidth="2.5"
              fill="none"
              transform="rotate(60 60 60)"
            />
            {/* Orbital 3 - 120deg */}
            <ellipse
              cx="60"
              cy="60"
              rx="48"
              ry="18"
              stroke="url(#orbitCyan)"
              strokeWidth="2.5"
              fill="none"
              transform="rotate(120 60 60)"
            />
          </g>

          {/* Glowing Quantum Particle Nodes on Orbitals */}
          <circle cx="108" cy="60" r="4" fill="#00F0FF" filter="url(#glow)" />
          <circle cx="36" cy="18" r="3.5" fill="#EC4899" filter="url(#glow)" />
          <circle cx="36" cy="102" r="3.5" fill="#F59E0B" filter="url(#glow)" />
          <circle cx="84" cy="102" r="3.5" fill="#38BDF8" filter="url(#glow)" />

          {/* Stellar Core / Supernova Central Mass */}
          <circle cx="60" cy="60" r="22" fill="url(#novaCore)" />
          <circle cx="60" cy="60" r="9" fill="#FFFFFF" />
          <circle cx="60" cy="60" r="4" fill="#00F0FF" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300">
              NOVAGEN
            </span>
            {versionBadge && (
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[9px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                {versionBadge}
              </span>
            )}
          </div>
          <span className="text-[10px] text-cyan-300/80 font-mono tracking-widest uppercase truncate">
            The Quantum & Cosmic Rule Engine
          </span>
        </div>
      )}
    </div>
  );
}
