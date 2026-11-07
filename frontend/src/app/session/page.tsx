'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, CLIPBOARD_BUCKET } from '@/lib/supabase';
import { ArrowLeft, Copy, ShieldCheck, Paperclip, Activity, QrCode } from 'lucide-react';
import ClipboardItem from '@/components/ClipboardItem';
import QRCodeModal from '@/components/QRCodeModal';
import GitHubDropdown from '@/components/GitHubDropdown';

interface ItemType {
  id: string;
  type: 'text' | 'image' | 'file';
  content: string;
  timestamp: string;
  fileName?: string;
}

export default function Session() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [items, setItems] = useState<ItemType[]>([]);
  const itemsRef = useRef<ItemType[]>([]);
  itemsRef.current = items;
  const [copiedId, setCopiedId] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [activeUsersCount, setActiveUsersCount] = useState(1);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Resolve session ID from URL parameter (e.g. /session?id=12345678) or sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const queryId = searchParams.get('id') || searchParams.get('code');
      
      let validId: string | null = null;
      if (queryId && /^\d{8}$/.test(queryId)) {
        validId = queryId;
        sessionStorage.setItem('sessionId', validId);
      } else {
        const storedId = sessionStorage.getItem('sessionId');
        if (storedId && /^\d{8}$/.test(storedId)) {
          validId = storedId;
        }
      }

      if (!validId) {
        router.replace('/');
        return;
      }
      setSessionId(validId);
    }
  }, [router]);

  // Load cached items from localStorage as soon as sessionId is known
  useEffect(() => {
    if (!sessionId) return;
    try {
      const cached = localStorage.getItem(`synk_items_${sessionId}`) || localStorage.getItem(`paste_labs_items_${sessionId}`);
      if (cached) {
        const parsed: ItemType[] = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to read localStorage:', e);
    }
  }, [sessionId]);

  // Persist items to localStorage for this session so refresh retains them
  useEffect(() => {
    if (!sessionId || items.length === 0) return;
    try {
      localStorage.setItem(`synk_items_${sessionId}`, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [sessionId, items]);

  const BROADCAST_PAYLOAD_LIMIT = 30 * 1024; // 30KB — Supabase Realtime hard limit is ~32KB

  // Fetch uploaded files from Supabase Storage for this session
  const loadStoredFiles = useCallback(async (sid: string) => {
    setIsLoadingFiles(true);
    try {
      const { data: fileList, error } = await supabase.storage
        .from(CLIPBOARD_BUCKET)
        .list(sid, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        console.warn('Error fetching session files from Supabase Storage:', error);
        return;
      }

      if (!fileList || fileList.length === 0) return;

      const validFiles = fileList.filter(
        (f) => f.name && !f.name.startsWith('.') && f.name !== '.emptyFolderPlaceholder'
      );

      const loadedItems: ItemType[] = validFiles.map((file) => {
        const { data } = supabase.storage
          .from(CLIPBOARD_BUCKET)
          .getPublicUrl(`${sid}/${file.name}`);

        const mimeType = file.metadata?.mimetype || '';
        const isImg =
          mimeType.startsWith('image/') ||
          /\.(png|jpe?g|gif|webp|svg|bmp|ico|avif)$/i.test(file.name);

        const match = file.name.match(/^\d+-[a-z0-9]+-(.+)$/i);
        const originalName = match ? match[1] : file.name;

        return {
          id: file.id || file.name,
          type: isImg ? 'image' : 'file',
          content: data.publicUrl,
          timestamp: file.created_at || new Date().toISOString(),
          fileName: isImg ? undefined : originalName,
        };
      });

      setItems((prev) => {
        const existingUrls = new Set(prev.map((i) => i.content));
        const existingIds = new Set(prev.map((i) => i.id));
        const newItems = loadedItems.filter(
          (item) => !existingUrls.has(item.content) && !existingIds.has(item.id)
        );

        if (newItems.length === 0) return prev;

        return [...prev, ...newItems].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      });
    } catch (err) {
      console.warn('Error loading files from storage:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  // Fetch files from Supabase storage whenever sessionId changes
  useEffect(() => {
    if (!sessionId) return;
    void loadStoredFiles(sessionId);
  }, [sessionId, loadStoredFiles]);

  // Subscribe to the realtime channel for this session.
  // The channel exists implicitly the moment any device subscribes to it.
  useEffect(() => {
    if (!sessionId) return;

    const clientId = Math.random().toString(36).substr(2, 9);
    const channel = supabase.channel(`session:${sessionId}`, {
      config: {
        presence: { key: clientId },
      },
    });
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'clipboard' }, ({ payload }) => {
        const item = payload as ItemType;
        setItems((prev) => {
          if (prev.some((i) => i.id === item.id || i.content === item.content)) return prev;
          return [item, ...prev];
        });
      })
      .on('broadcast', { event: 'request_history' }, () => {
        if (itemsRef.current.length > 0) {
          const payload = itemsRef.current;
          const size = new TextEncoder().encode(JSON.stringify(payload)).length;
          if (size <= BROADCAST_PAYLOAD_LIMIT) {
            channel.send({
              type: 'broadcast',
              event: 'sync_history',
              payload,
            });
          } else {
            // If total items exceed broadcast limit, send recent items individually
            itemsRef.current.slice(0, 20).forEach((item) => {
              const itemSize = new TextEncoder().encode(JSON.stringify(item)).length;
              if (itemSize <= BROADCAST_PAYLOAD_LIMIT) {
                channel.send({
                  type: 'broadcast',
                  event: 'clipboard',
                  payload: item,
                });
              }
            });
          }
        }
      })
      .on('broadcast', { event: 'sync_history' }, ({ payload }) => {
        const receivedItems = payload as ItemType[];
        if (Array.isArray(receivedItems) && receivedItems.length > 0) {
          setItems((prev) => {
            const existingUrls = new Set(prev.map((i) => i.content));
            const existingIds = new Set(prev.map((i) => i.id));
            const toAdd = receivedItems.filter(
              (i) => !existingUrls.has(i.content) && !existingIds.has(i.id)
            );
            if (toAdd.length === 0) return prev;
            return [...toAdd, ...prev].sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          });
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setActiveUsersCount(Math.max(1, Object.keys(state).length));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
          channel.send({
            type: 'broadcast',
            event: 'request_history',
            payload: {},
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [sessionId, BROADCAST_PAYLOAD_LIMIT]);

  const broadcastItem = useCallback((newItem: ItemType) => {
    const payloadSize = new TextEncoder().encode(JSON.stringify(newItem)).length;
    if (payloadSize > BROADCAST_PAYLOAD_LIMIT) {
      console.error(
        `Broadcast payload too large (${(payloadSize / 1024).toFixed(1)} KB). ` +
        `Supabase Realtime limit is ~32 KB. Item will NOT sync to other devices.`
      );
      return;
    }
    channelRef.current?.send({
      type: 'broadcast',
      event: 'clipboard',
      payload: newItem,
    });
  }, []);

  // Uploads a blob to Supabase Storage and returns its public URL.
  // Used for images/files since their base64 size would exceed the
  // realtime broadcast payload limit.
  const uploadToStorage = async (blob: Blob, fileName: string): Promise<string> => {
    const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `${sessionId}/${Date.now()}-${Math.random().toString(36).substr(2, 6)}-${safeName}`;
    const { error } = await supabase.storage.from(CLIPBOARD_BUCKET).upload(path, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: blob.type || undefined,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(CLIPBOARD_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const addTextItem = useCallback((text: string) => {
    if (!text.trim()) return;
    const newItem: ItemType = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setItems((prev) => [newItem, ...prev]);
    broadcastItem(newItem);
  }, [broadcastItem]);


  const processFile = useCallback(async (file: File) => {
    if (!sessionId) return;

    setIsUploading(true);
    const isImage = file.type.startsWith('image/');
    let contentUrl: string | null = null;

    try {
      contentUrl = await uploadToStorage(file, file.name || 'file');
    } catch (err: any) {
      // Storage upload failed — do NOT fall back to data URLs.
      // Data URLs easily exceed Supabase Realtime's ~32 KB broadcast payload
      // limit, causing the message to be silently dropped on other devices.
      // The sender would see the item locally but no other device would receive it.
      console.error('Supabase storage upload failed:', err);
      const errMsg = err?.message || 'Unknown error';
      alert(
        `Failed to upload file to storage: ${errMsg}\n\n` +
        `Please make sure the "clipboard-uploads" bucket exists in your Supabase project ` +
        `and the storage RLS policies allow public uploads (run supabase_storage_setup.sql).`
      );
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (contentUrl) {
      const newItem: ItemType = {
        id: Math.random().toString(36).substr(2, 9),
        type: isImage ? 'image' : 'file',
        content: contentUrl,
        timestamp: new Date().toISOString(),
        fileName: isImage ? undefined : (file.name || 'shared-file'),
      };
      setItems((prev) => [newItem, ...prev]);
      broadcastItem(newItem);
    } else {
      alert('Failed to get a public URL for the uploaded file. Please try again.');
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [sessionId, broadcastItem]);

  const handlePaste = useCallback((e: any) => {
    if (!sessionId) return;
    if (e.target?.isContentEditable) {
      e.preventDefault();
    }

    const clipboardData = e.clipboardData || (window as any).clipboardData;
    if (!clipboardData) return;

    const itemsData = clipboardData.items;

    for (let i = 0; i < itemsData.length; i++) {
      const item = itemsData[i];

      if (item.kind === 'file') {
        const blob = item.getAsFile();
        if (!blob) continue;
        void processFile(blob);
      } else if (item.type === 'text/plain') {
        item.getAsString((text: string) => addTextItem(text));
      }
    }
  }, [sessionId, processFile, addTextItem]);

  const handlePasteButtonClick = async () => {
    if (!sessionId) return;
    try {
      if (navigator.clipboard.read) {
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
          const imageTypes = clipboardItem.types.filter((type) => type.startsWith('image/'));
          if (imageTypes.length > 0) {
            const blob = await clipboardItem.getType(imageTypes[0]);
            const ext = imageTypes[0].split('/')[1] || 'png';
            void processFile(new File([blob], `pasted-image.${ext}`, { type: blob.type }));
            return;
          }

          if (clipboardItem.types.includes('text/plain')) {
            const blob = await clipboardItem.getType('text/plain');
            const text = await blob.text();
            addTextItem(text);
            return;
          }
        }
      } else {
        const text = await navigator.clipboard.readText();
        addTextItem(text);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      alert('Browser blocked direct access. Please press Ctrl+V anywhere on the page to paste.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  const copySessionId = () => {
    if (!sessionId) return;
    navigator.clipboard.writeText(sessionId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (!sessionId) {
    return null;
  }

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-x-hidden w-full bg-background"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-accent/90 backdrop-blur-md flex items-center justify-center border-4 border-white/60 border-dashed m-4 rounded-3xl">
          <div className="flex flex-col items-center pointer-events-none text-white">
            <Paperclip className="w-16 h-16 mb-3 animate-bounce" />
            <h2 className="text-2xl sm:text-3xl font-bold tracking-wider">DROP FILE TO SHARE</h2>
          </div>
        </div>
      )}

      {/* Subtle modern dot-grid backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(#E5DDD3_1px,transparent_1px)] [background-size:28px_28px] opacity-40 pointer-events-none -z-10"></div>

      <header className="glass-panel flex items-center justify-between px-3 py-3 sm:px-6 sm:py-3.5 sticky top-0 z-10 border-x-0 border-t-0 rounded-none bg-white/90 backdrop-blur-md border-b border-glass-border">
        <button
          className="bg-transparent border-none text-muted hover:text-foreground cursor-pointer p-1.5 sm:p-2 rounded-full transition-all hover:bg-accent-light flex items-center justify-center"
          onClick={() => router.push('/')}
          title="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <div 
            className="flex items-center gap-1 sm:gap-2 cursor-pointer py-1 px-1.5 sm:py-1.5 sm:px-3 rounded-lg transition-colors hover:bg-accent-light"
            onClick={copySessionId}
            title="Click to copy Session ID"
          >
            <span className="text-muted text-xs sm:text-sm hidden sm:inline font-medium">Session ID</span>
            <div className="bg-accent-light border border-accent-border/70 text-foreground px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full font-mono text-sm sm:text-base md:text-lg font-semibold tracking-wide flex items-center shadow-xs">
              {sessionId}
              {copiedId ? (
                <ShieldCheck className="w-3.5 h-3.5 text-green-600 ml-1.5 sm:ml-2" />
              ) : (
                <Copy className="w-3.5 h-3.5 ml-1.5 sm:ml-2 text-muted" />
              )}
            </div>
          </div>

          <button
            onClick={() => setIsQRModalOpen(true)}
            className="flex items-center gap-1.5 bg-white border border-accent-border/80 hover:bg-accent-light text-foreground px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Show QR Code to share session"
          >
            <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
            <span className="hidden sm:inline">QR Code</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <GitHubDropdown />

          <div className="flex items-center gap-1.5 sm:gap-2 bg-white border border-accent-border/80 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-xs">
            <div className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-green-600"></span>
            </div>
            <span className="text-[10px] sm:text-xs text-foreground/80 font-medium tracking-wide flex items-center gap-1 sm:gap-1.5">
              <Activity className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-green-600" />
              {activeUsersCount} <span className="hidden sm:inline">{activeUsersCount === 1 ? 'Device' : 'Devices'}</span>
            </span>
          </div>
        </div>
      </header>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        sessionId={sessionId}
      />

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full flex flex-col">

        {/* Universal Paste Button - Fixed to bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-background via-background/95 to-transparent z-20 pointer-events-none">
          <div className="max-w-4xl mx-auto relative group pointer-events-auto">
            <div className="flex gap-3 relative">
              <button 
                onClick={handlePasteButtonClick}
                disabled={isUploading}
                className="flex-1 rounded-2xl p-4 md:p-5 text-center border border-accent flex items-center justify-center min-h-[68px] md:min-h-[82px] transition-all bg-accent hover:bg-accent-hover text-white shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-60"
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 text-base md:text-lg font-bold tracking-wide">
                    <Copy className="w-5 h-5" />
                    <span>{isUploading ? 'Uploading...' : 'Tap to Paste'}</span>
                  </div>
                  <span className="text-xs text-white/70 mt-0.5 hidden sm:inline-block">Instantly paste text or images from clipboard</span>
                </div>
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-[68px] md:w-[82px] shrink-0 bg-white border border-accent-border/80 hover:bg-accent-light rounded-2xl flex flex-col items-center justify-center min-h-[68px] md:min-h-[82px] transition-all shadow-sm active:scale-[0.96] cursor-pointer text-foreground disabled:opacity-60"
                title="Upload PDF or File"
              >
                <Paperclip className="w-5 h-5 md:w-6 md:h-6 mb-1 text-accent" />
                <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-foreground/80">File</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="*/*" 
                className="hidden" 
              />
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center text-muted min-h-[40vh] pb-24">
            <div className="w-16 h-16 rounded-2xl bg-accent-light border border-accent-border/60 text-accent flex items-center justify-center mb-4 shadow-xs">
              <Copy className="w-7 h-7" />
            </div>
            <h3 className="text-foreground text-xl md:text-2xl font-bold mb-1.5">
              {isLoadingFiles ? 'Loading session items...' : 'Waiting for clipboard items...'}
            </h3>
            <p className="max-w-md text-sm md:text-base text-muted">
              {isLoadingFiles
                ? 'Checking for uploaded files and history in this session...'
                : 'Press Ctrl+V anywhere, or use the buttons below to paste or upload.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-32 md:pb-28">
            {items.map(item => (
              <ClipboardItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
