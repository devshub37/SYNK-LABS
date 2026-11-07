'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Github, GitPullRequest, MessageSquare, ChevronDown, ExternalLink } from 'lucide-react';

export default function GitHubDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const repoUrl = process.env.NEXT_PUBLIC_GITHUB_REPO_URL || 'https://github.com/devshub37/paste-lab-extended_01';
  const issueUrl = `${repoUrl}/issues/new`;
  const prUrl = `${repoUrl}/pulls`;

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button
        onClick={toggleDropdown}
        className={`flex items-center gap-1.5 sm:gap-2 bg-white border border-accent-border/80 hover:bg-accent-light text-foreground px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95 shadow-xs ${
          isOpen ? 'border-accent bg-accent-light text-foreground' : ''
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
        <span className="hidden sm:inline">GitHub</span>
        <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180 text-accent' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-glass-border shadow-xl overflow-hidden z-50 animate-[slideUp_0.2s_cubic-bezier(0.16,1,0.3,1)]"
          role="menu"
        >
          <div className="p-1.5 flex flex-col gap-1">
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-foreground hover:bg-accent-light hover:text-accent font-medium transition-all group"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <Github className="w-4 h-4 text-accent" />
                <span>View Repository</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-all" />
            </a>

            <a
              href={issueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-foreground hover:bg-accent-light hover:text-accent font-medium transition-all group"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-accent" />
                <span>Suggest & Report</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-all" />
            </a>

            <a
              href={prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-foreground hover:bg-accent-light hover:text-accent font-medium transition-all group"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <GitPullRequest className="w-4 h-4 text-accent" />
                <span>Create & View PR</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-all" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
