'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode, ExternalLink, Smartphone } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export default function QRCodeModal({ isOpen, onClose, sessionId }: QRCodeModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [sessionUrl, setSessionUrl] = useState('');

  const [qrSize, setQrSize] = useState(160);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionId) {
      const url = `${window.location.origin}/session?id=${sessionId}`;
      setSessionUrl(url);
    }
  }, [sessionId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setQrSize(window.innerWidth < 640 ? 150 : 180);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyLink = () => {
    if (!sessionUrl) return;
    navigator.clipboard.writeText(sessionUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCode = () => {
    if (!sessionId) return;
    navigator.clipboard.writeText(sessionId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[var(--modal-backdrop)] backdrop-blur-xs flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div 
        className="glass-panel p-6 sm:p-7 text-center max-w-sm w-full rounded-3xl bg-surface border border-glass-border shadow-2xl relative z-10 animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-foreground p-1.5 rounded-full hover:bg-accent-light transition-all cursor-pointer"
          aria-label="Close QR Code Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Icon */}
        <div className="inline-flex p-3 rounded-2xl bg-accent-light border border-accent-border/50 mb-3 text-accent shadow-xs">
          <QrCode className="w-7 h-7" />
        </div>
        
        <h3 className="text-xl font-bold text-foreground mb-1">
          Scan to Join
        </h3>
        
        <p className="text-muted text-xs sm:text-sm mb-4 flex items-center justify-center gap-1.5">
          <Smartphone className="w-4 h-4 text-accent" />
          Point phone camera to join session
        </p>

        {/* QR Code Container */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl inline-block shadow-sm mb-4 border border-glass-border relative group">
          {sessionUrl ? (
            <QRCodeSVG
              value={sessionUrl}
              size={qrSize}
              level="H"
              includeMargin={false}
            />
          ) : (
            <div className="flex items-center justify-center text-muted text-sm" style={{ width: qrSize, height: qrSize }}>
              Generating...
            </div>
          )}
        </div>

        {/* Session Details & Copy Actions */}
        <div className="flex flex-col gap-2.5 w-full">
          {/* Session ID Pill */}
          <div className="flex items-center justify-between bg-background border border-glass-border px-3.5 py-2.5 rounded-xl">
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase tracking-wider text-muted font-medium">Session ID</span>
              <span className="text-foreground font-mono text-base font-bold tracking-widest">{sessionId}</span>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-accent-light text-xs font-semibold text-foreground transition-all border border-glass-border shadow-2xs active:scale-95 cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-green-600 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-muted" />
                  <span>Code</span>
                </>
              )}
            </button>
          </div>

          {/* Direct Link Copy Button */}
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold bg-accent text-[var(--accent-text)] hover:bg-accent-hover active:scale-[0.98] transition-all shadow-sm text-sm cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                <span>Copy Direct Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
