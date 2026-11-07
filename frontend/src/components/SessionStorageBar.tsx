'use client';

import React from 'react';
import { HardDrive, AlertTriangle } from 'lucide-react';
import { formatBytes, MAX_SESSION_BYTES, MAX_FILE_BYTES } from '@/lib/format';

interface SessionStorageBarProps {
  totalBytes: number;
  maxBytes?: number;
  maxFileBytes?: number;
}

export default function SessionStorageBar({
  totalBytes,
  maxBytes = MAX_SESSION_BYTES,
  maxFileBytes = MAX_FILE_BYTES,
}: SessionStorageBarProps) {
  const percentage = Math.min(100, (totalBytes / maxBytes) * 100);
  const isNearLimit = percentage >= 75;
  const isOverLimit = percentage >= 90;

  // Determine bar fill color
  const barColor = isOverLimit
    ? 'bg-red-500'
    : isNearLimit
    ? 'bg-amber-500'
    : 'bg-accent';

  const badgeColor = isOverLimit
    ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
    : isNearLimit
    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
    : 'bg-accent-light text-foreground border-accent-border/60';

  return (
    <div className="sticky top-[53px] sm:top-[61px] z-10 bg-surface/95 backdrop-blur-md border-b border-glass-border px-3.5 py-2 sm:px-6 shadow-2xs transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        {/* Left: Storage label & numeric stats */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            {isOverLimit ? (
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            ) : (
              <HardDrive className="w-3.5 h-3.5 text-accent" />
            )}
            <span>Session Storage</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-mono font-bold text-foreground">
              {formatBytes(totalBytes)}
            </span>
            <span className="text-muted">/ {formatBytes(maxBytes, 0)}</span>
            <span
              className={`text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded-full border ${badgeColor}`}
            >
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Right: Progress bar & limits */}
        <div className="flex items-center gap-2.5 sm:gap-3 sm:max-w-md w-full sm:w-auto sm:justify-end">
          <div
            className="flex-1 sm:w-48 md:w-60 h-2 bg-accent-light/80 rounded-full overflow-hidden border border-glass-border relative"
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Session shared content storage capacity"
            title={`${formatBytes(totalBytes)} of ${formatBytes(maxBytes, 0)} used (${percentage.toFixed(1)}%)`}
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${barColor}`}
              style={{ width: `${totalBytes > 0 ? Math.max(1, percentage) : 0}%` }}
            />
          </div>

          <span className="text-[10px] sm:text-[11px] text-muted whitespace-nowrap hidden xs:inline-block font-medium">
            Max {formatBytes(maxFileBytes, 0)}/file
          </span>
        </div>
      </div>
    </div>
  );
}
