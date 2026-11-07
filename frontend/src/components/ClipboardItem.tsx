'use client';

import React, { useState } from 'react';
import { Copy, Check, FileText, Image as ImageIcon, File, Download, Loader2 } from 'lucide-react';
import { formatBytes } from '@/lib/format';

interface ItemType {
  id: string;
  type: 'text' | 'image' | 'file';
  content: string;
  timestamp: string;
  fileName?: string;
  fileSize?: number;
}

// Helper to convert any image URL or Data URI to a PNG Blob for ClipboardItem API
async function fetchImageAsPngBlob(contentUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas 2D context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to PNG blob'));
        }
      }, 'image/png');
    };
    img.onerror = (err) => reject(err);
    img.src = contentUrl;
  });
}

// Helper to trigger cross-origin & blob file downloads reliably
async function triggerFileDownload(url: string, fileName: string) {
  try {
    if (url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (err) {
    console.warn('Direct blob download failed, falling back to direct window open:', err);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default function ClipboardItem({ item }: { item: ItemType }) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopy = async () => {
    try {
      if (item.type === 'text') {
        await navigator.clipboard.writeText(item.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else if (item.type === 'image') {
        const pngBlob = await fetchImageAsPngBlob(item.content);
        await navigator.clipboard.write([
          new window.ClipboardItem({ 'image/png': pngBlob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else if (item.type === 'file') {
        await handleDownload();
      }
    } catch (err) {
      console.error('Failed to copy/download item: ', err);
      if (item.type === 'image') {
        alert('Could not copy image to clipboard automatically. Try downloading it instead.');
      }
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      let fileName = item.fileName;
      if (!fileName) {
        if (item.type === 'image') {
          let extension = 'png';
          const match = item.content.match(/^data:image\/(\w+);base64,/);
          if (match) extension = match[1];
          fileName = `pasted-image-${item.id}.${extension}`;
        } else {
          fileName = `shared-file-${item.id}`;
        }
      }
      await triggerFileDownload(item.content, fileName);
    } catch (err) {
      console.error('Failed to download: ', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const timeString = new Date(item.timestamp).toLocaleTimeString();

  return (
    <div
      className="glass-panel group rounded-2xl overflow-hidden flex flex-col relative transition-all duration-200 cursor-pointer animate-[fadeIn_0.3s_ease-out_forwards] md:hover:-translate-y-1 md:hover:shadow-md md:hover:border-accent-border/90 active:scale-[0.99] bg-surface border border-glass-border"
      onClick={handleCopy}
    >
      <div className="flex justify-between items-center px-4 py-3 bg-[var(--card-header)] border-b border-glass-border">
        <div className="flex items-center gap-2 text-muted text-xs sm:text-sm font-medium">
          {item.type === 'text' ? <FileText className="w-4 h-4 text-accent" /> : item.type === 'image' ? <ImageIcon className="w-4 h-4 text-accent" /> : <File className="w-4 h-4 text-accent" />}
          <span>{timeString}</span>
          {typeof item.fileSize === 'number' && item.fileSize > 0 && (
            <span className="text-[11px] opacity-75 font-mono">({formatBytes(item.fileSize)})</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {item.type === 'image' ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                className="bg-transparent border-none text-muted hover:text-foreground transition-colors p-1.5 active:scale-90 rounded-lg hover:bg-accent-light"
                title="Copy Image"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                disabled={isDownloading}
                className="bg-transparent border-none text-muted hover:text-foreground transition-colors p-1.5 active:scale-90 rounded-lg hover:bg-accent-light disabled:opacity-50"
                title="Download Image"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : <Download className="w-4 h-4" />}
              </button>
            </>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); handleCopy(); }}
              disabled={isDownloading}
              className="bg-transparent border-none text-muted hover:text-foreground transition-colors p-1.5 -mr-1 active:scale-90 rounded-lg hover:bg-accent-light disabled:opacity-50"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : item.type === 'file' ? (
                isDownloading ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : <Download className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="p-5 max-h-[250px] overflow-hidden relative bg-surface flex-1">
        {item.type === 'text' ? (
          <p className="font-mono text-[0.92rem] text-foreground leading-relaxed whitespace-pre-wrap break-words">
            {item.content}
          </p>
        ) : item.type === 'image' ? (
          <div className="relative w-full h-full min-h-[150px] rounded-xl overflow-hidden border border-glass-border">
            <img src={item.content} alt="Shared" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[140px] p-4 rounded-xl bg-accent-light/60 border border-accent-border/40">
            <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-accent shadow-xs mb-2.5">
              <File className="w-6 h-6" />
            </div>
            <p className="font-medium text-xs sm:text-sm text-foreground text-center break-all px-2 max-w-full">
              {item.fileName || 'file-download'}
            </p>
            {typeof item.fileSize === 'number' && item.fileSize > 0 && (
              <span className="text-[11px] text-muted font-mono mt-1">
                {formatBytes(item.fileSize)}
              </span>
            )}
          </div>
        )}
        {item.type === 'text' && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[var(--surface)] to-transparent pointer-events-none"></div>
        )}
      </div>

      {item.type === 'image' ? (
        <div className="hidden md:flex absolute inset-0 bg-black/75 items-center justify-center gap-3 opacity-0 transition-opacity duration-200 backdrop-blur-xs group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-surface text-foreground hover:bg-accent-light active:scale-[0.97] transition-all shadow-md"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Image'}</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-accent text-accent-text hover:bg-accent-hover active:scale-[0.97] transition-all shadow-md disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin text-accent-text" /> : <Download className="w-4 h-4" />}
            <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
          </button>
        </div>
      ) : (
        <div className="hidden md:flex absolute inset-0 bg-accent/90 items-center justify-center opacity-0 transition-opacity duration-200 backdrop-blur-xs group-hover:opacity-100">
          <span className="font-semibold text-sm sm:text-base tracking-wide text-accent-text">
            {item.type === 'file' ? (isDownloading ? 'Downloading...' : 'Click to Download') : 'Click to Copy'}
          </span>
        </div>
      )}

      {item.type === 'image' ? (
        <div className="md:hidden flex border-t border-glass-border divide-x divide-glass-border bg-[var(--card-header)]">
          <button
            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            className="flex-1 py-2.5 text-center text-xs text-foreground font-semibold hover:bg-accent-light active:bg-accent-light transition-colors flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
            disabled={isDownloading}
            className="flex-1 py-2.5 text-center text-xs text-foreground font-semibold hover:bg-accent-light active:bg-accent-light transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
          </button>
        </div>
      ) : (
        <div className="md:hidden bg-[var(--card-header)] py-2 text-center border-t border-glass-border">
          <span className="text-[11px] text-muted font-medium tracking-wide">
            {copied ? (item.type === 'file' ? 'Downloaded!' : 'Copied!') : (item.type === 'file' ? (isDownloading ? 'Downloading...' : 'Tap to Download') : 'Tap to Copy')}
          </span>
        </div>
      )}
    </div>
  );
}

