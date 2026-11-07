'use client';

import React from 'react';
import { HardDrive, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatBytes, MAX_SESSION_BYTES, MAX_FILE_BYTES } from '@/lib/format';

interface SessionStorageBarProps {
  totalBytes: number;
  maxBytes?: number;
  maxFileBytes?: number;
}

/**
 * Calculates video-game style HUD capacity colors:
 * Dynamically shifts from Green (0% - 49%) -> Yellow (50% - 79%) -> Red (80% - 100%)
 * with arcade glow, top gloss highlight, and reactive status badges.
 */
function getGameMeterColor(pct: number) {
  const p = Math.min(100, Math.max(0, pct));

  // Dynamic HSL Hue: 138 (Game Green) -> 48 (Game Yellow) -> 0 (Game Red)
  let hue = 138;
  if (p <= 50) {
    // 0% -> 50% maps hue from 138 (green) down to 48 (yellow)
    hue = 138 - (p / 50) * (138 - 48);
  } else {
    // 50% -> 100% maps hue from 48 (yellow) down to 0 (red)
    hue = 48 - ((p - 50) / 50) * 48;
  }

  const primaryColor = `hsl(${hue.toFixed(1)}, 88%, 46%)`;
  const glowColor = `hsla(${hue.toFixed(1)}, 95%, 50%, 0.6)`;
  const glowShadow = `0 0 10px ${glowColor}, inset 0 1px 1px rgba(255,255,255,0.45)`;

  if (p >= 80) {
    return {
      primaryColor,
      glowShadow,
      stage: 'danger' as const,
      iconClass: 'text-red-500 animate-pulse',
      badgeClass: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
      label: 'Critical',
    };
  }

  if (p >= 50) {
    return {
      primaryColor,
      glowShadow,
      stage: 'warning' as const,
      iconClass: 'text-amber-500 dark:text-amber-400',
      badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      label: 'Warning',
    };
  }

  return {
    primaryColor,
    glowShadow,
    stage: 'safe' as const,
    iconClass: 'text-emerald-500 dark:text-emerald-400',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    label: 'Optimal',
  };
}

export default function SessionStorageBar({
  totalBytes,
  maxBytes = MAX_SESSION_BYTES,
  maxFileBytes = MAX_FILE_BYTES,
}: SessionStorageBarProps) {
  const percentage = Math.min(100, (totalBytes / maxBytes) * 100);
  const meter = getGameMeterColor(percentage);

  return (
    <div className="sticky top-[53px] sm:top-[61px] z-10 bg-surface/95 backdrop-blur-md border-b border-glass-border px-3.5 py-2 sm:px-6 shadow-2xs transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        {/* Left: Storage label & numeric stats */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            {meter.stage === 'danger' ? (
              <AlertTriangle className={`w-3.5 h-3.5 ${meter.iconClass}`} />
            ) : meter.stage === 'warning' ? (
              <HardDrive className={`w-3.5 h-3.5 ${meter.iconClass}`} />
            ) : (
              <HardDrive className={`w-3.5 h-3.5 ${meter.iconClass}`} />
            )}
            <span>Session Storage</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-mono font-bold text-foreground">
              {formatBytes(totalBytes)}
            </span>
            <span className="text-muted">/ {formatBytes(maxBytes, 0)}</span>
            <span
              className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${meter.badgeClass}`}
            >
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Right: Video-Game HUD Style Progress Bar */}
        <div className="flex items-center gap-2.5 sm:gap-3 sm:max-w-md w-full sm:w-auto sm:justify-end">
          {/* Recessed arcade track */}
          <div
            className="flex-1 sm:w-48 md:w-64 h-2.5 sm:h-3 bg-accent-light/90 dark:bg-black/40 rounded-full overflow-hidden border border-glass-border shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.18)] relative"
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Session shared content storage capacity"
            title={`${formatBytes(totalBytes)} of ${formatBytes(maxBytes, 0)} used (${percentage.toFixed(1)}%)`}
          >
            {/* The active dynamic color bar (Green -> Yellow -> Red) */}
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden ${
                meter.stage === 'danger' ? 'animate-pulse' : ''
              }`}
              style={{
                width: `${totalBytes > 0 ? Math.max(1.8, percentage) : 0}%`,
                backgroundColor: meter.primaryColor,
                boxShadow: meter.glowShadow,
              }}
            >
              {/* Glossy top highlight shine typical of game HUDs */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />
            </div>
          </div>

          <span className="text-[10px] sm:text-[11px] text-muted whitespace-nowrap hidden xs:inline-block font-medium">
            Max {formatBytes(maxFileBytes, 0)}/file
          </span>
        </div>
      </div>
    </div>
  );
}
