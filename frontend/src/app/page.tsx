'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, ArrowRight, Zap, Type, Image as ImageIcon, File } from 'lucide-react';
import GitHubDropdown from '@/components/GitHubDropdown';

export default function Landing() {
  const [sessionId, setSessionId] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const queryId = searchParams.get('id') || searchParams.get('code');
      if (queryId && /^\d{8}$/.test(queryId)) {
        sessionStorage.setItem('sessionId', queryId);
        router.replace(`/session?id=${queryId}`);
      }
    }
  }, [router]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = sessionId.trim();
    if (cleanId.length === 8) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('sessionId', cleanId);
      }
      router.push('/session');
    } else {
      alert("Please enter a valid 8-digit session ID.");
    }
  };

  const handleCreate = () => {
    // No backend write needed: the session "exists" the moment a device
    // subscribes to its realtime channel. Just mint an ID and go.
    const randomId = Math.floor(10000000 + Math.random() * 90000000).toString();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('sessionId', randomId);
    }
    router.push('/session');
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen p-4 md:p-6 overflow-x-hidden w-full bg-background selection:bg-accent/10">
      {/* Subtle modern dot-grid backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(#E5DDD3_1px,transparent_1px)] [background-size:28px_28px] opacity-60 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[350px] bg-[radial-gradient(ellipse_at_top,rgba(226,217,206,0.5)_0%,transparent_70%)] pointer-events-none"></div>

      <div className="absolute top-4 right-4 z-20">
        <GitHubDropdown />
      </div>

      <div className="glass-panel p-6 sm:p-8 md:p-12 text-center max-w-lg w-full rounded-3xl z-10 animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)]">
        <div className="inline-flex p-3 sm:p-3.5 rounded-2xl bg-accent text-white shadow-sm mb-5">
          <Copy className="w-6 h-6 md:w-7 md:h-7" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">
          SYNK
        </h1>
        <p className="text-muted text-sm sm:text-base md:text-lg mb-6 leading-relaxed">
          Seamlessly sync your clipboard and files across devices in real time.
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 mb-7">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-light text-foreground text-xs sm:text-sm font-medium border border-accent-border/60">
            <Type className="w-3.5 h-3.5 text-accent" /> Text
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-light text-foreground text-xs sm:text-sm font-medium border border-accent-border/60">
            <ImageIcon className="w-3.5 h-3.5 text-accent" /> Images
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-light text-foreground text-xs sm:text-sm font-medium border border-accent-border/60">
            <File className="w-3.5 h-3.5 text-accent" /> Files
          </div>
        </div>

        <div className="bg-[#FAF7F3] border border-glass-border rounded-2xl p-4 md:p-5 mb-7 text-xs sm:text-sm text-foreground/80 text-left space-y-2.5">
          <p className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent text-white text-[11px] font-semibold flex items-center justify-center">1</span>
            <span>Create a new session or join an existing one.</span>
          </p>
          <p className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent text-white text-[11px] font-semibold flex items-center justify-center">2</span>
            <span>Open this site on your other device (e.g. phone or tablet).</span>
          </p>
          <p className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent text-white text-[11px] font-semibold flex items-center justify-center">3</span>
            <span>Enter the 8-digit Session ID to share instantly!</span>
          </p>
        </div>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-semibold bg-accent text-white shadow-sm hover:bg-accent-hover active:scale-[0.99] transition-all cursor-pointer"
          >
            <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Create New Session</span>
          </button>
          
          <div className="flex items-center text-muted/60 text-xs font-semibold uppercase tracking-wider">
            <div className="flex-1 border-b border-glass-border"></div>
            <span className="px-3">OR</span>
            <div className="flex-1 border-b border-glass-border"></div>
          </div>

          <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-2.5">
            <input 
              type="text" 
              placeholder="Enter 8-digit ID" 
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
              className="flex-1 bg-white border border-accent-border/80 focus:border-accent rounded-xl px-4 py-3 text-foreground placeholder-muted/50 text-base md:text-lg outline-none transition-colors text-center font-mono tracking-widest shadow-sm"
              maxLength={8}
            />
            <button 
              type="submit" 
              disabled={sessionId.length !== 8}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white border border-accent-border/80 hover:bg-accent-light hover:border-accent text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
            >
              <span>Join</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
