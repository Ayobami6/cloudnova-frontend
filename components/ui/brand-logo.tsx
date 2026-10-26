"use client";

import React, { useId } from "react";
import Link from "next/link";

interface BrandMarkProps {
  size?: number;
  className?: string;
  withBackground?: boolean;
  withGlow?: boolean;
}

/**
 * Official TibiCloud Brand Mark — Concept 2: Pulse T (Aerodynamic Speed Cloud)
 * Scalable vector mark featuring the dual cyan/azure/indigo aerodynamic wings,
 * luminous crown bridge, data heartbeat core, and outer speed canopy trace.
 */
export function TibiCloudMark({
  size = 32,
  className = "",
  withBackground = false,
  withGlow = true,
}: BrandMarkProps) {
  const rawId = useId();
  // Sanitize id for SVG element selectors
  const id = rawId.replace(/[^a-zA-Z0-9-_]/g, "");

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`inline-block select-none shrink-0 ${className}`}
      fill="none"
      aria-label="TibiCloud Logo"
    >
      <defs>
        {/* Background Gradient for Icon/Avatar squircle */}
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#080C17" />
          <stop offset="50%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Wing 1: Cyber Cyan to Azure Blue */}
        <linearGradient id={`${id}-cyan`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F2FE" />
          <stop offset="45%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Wing 2: Electric Azure to Tech Indigo */}
        <linearGradient id={`${id}-indigo`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="55%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>

        {/* Center Spine & Bridge: Luminous Gradient */}
        <linearGradient id={`${id}-crown`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F0F9FF" />
          <stop offset="35%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Ambient Glow */}
        <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="16" floodColor="#0284C7" floodOpacity="0.35" />
        </filter>

        <filter id={`${id}-flare`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Container Base with Squircle Clip */}
      {withBackground && (
        <>
          <rect
            width="512"
            height="512"
            rx="116"
            fill={`url(#${id}-bg)`}
            stroke="#1E293B"
            strokeWidth="3"
          />
          {/* Subtle Ambient Blue Halo */}
          <circle
            cx="256"
            cy="235"
            r="150"
            fill="#0284C7"
            opacity="0.16"
            filter={`url(#${id}-flare)`}
          />
        </>
      )}

      {/* Aerodynamic Concept 2: Pulse T-Cloud Vector Body */}
      <g filter={withGlow ? `url(#${id}-glow)` : undefined} transform="translate(0, 8)">
        {/* Aerodynamic Cloud Canopy Trace (Outer Speed Stream) */}
        <path
          d="M 120 226 C 120 184 152 150 194 150 C 208 150 222 154 234 162 C 244 136 274 116 310 116 C 354 116 390 146 394 188 C 424 194 444 218 444 252 C 444 290 412 320 374 320 L 320 320"
          fill="none"
          stroke={`url(#${id}-indigo)`}
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.36"
        />

        {/* Left Aerodynamic Wing of 'T' */}
        <path
          d="M 136 204 L 244 204 C 252 204 256 208 256 216 L 256 376 C 256 392 242 404 226 404 C 210 404 198 392 198 376 L 198 256 L 136 256 C 120 256 108 244 108 228 C 108 212 120 204 136 204 Z"
          fill={`url(#${id}-cyan)`}
        />

        {/* Right Aerodynamic Wing of 'T' */}
        <path
          d="M 376 204 L 268 204 C 260 204 256 208 256 216 L 256 376 C 256 392 270 404 286 404 C 302 404 314 392 314 376 L 314 256 L 376 256 C 392 256 404 244 404 228 C 404 212 392 204 376 204 Z"
          fill={`url(#${id}-indigo)`}
        />

        {/* Cloud Crown Bridge forming upper T canopy dome */}
        <path
          d="M 176 186 C 188 144 222 114 256 114 C 290 114 324 144 336 186 Z"
          fill={`url(#${id}-crown)`}
          opacity="0.95"
        />

        {/* Central Glowing Data Conduit / Droplet Core (Heartbeat) */}
        <circle cx="256" cy="230" r="16" fill="#FFFFFF" filter={`url(#${id}-flare)`} />
        <circle cx="256" cy="230" r="7" fill="#00F2FE" />
      </g>
    </svg>
  );
}

interface BrandLogoProps {
  href?: string;
  size?: number;
  className?: string;
  showBadge?: boolean;
  badgeText?: string;
  subtitle?: string;
  withBackground?: boolean;
}

/**
 * Complete TibiCloud Lockup (Mark + Typographic Brand Name + Optional Cloud Pill)
 */
export function BrandLogo({
  href = "/",
  size = 36,
  className = "",
  showBadge = true,
  badgeText = "CLOUD",
  subtitle,
  withBackground = true,
}: BrandLogoProps) {
  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <TibiCloudMark size={size} withBackground={withBackground} />
      <div className="flex flex-col">
        <span className="font-semibold text-base tracking-tight text-[#1E1E1E] dark:text-white flex items-center gap-2 leading-tight">
          TibiCloud
          {showBadge && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6D8EA] dark:bg-[#2A2E3D] text-[#1E1E1E] dark:text-[#E2E8F0] font-semibold">
              {badgeText}
            </span>
          )}
        </span>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

