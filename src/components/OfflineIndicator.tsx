import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowRestoredNotice(true);
      const timer = setTimeout(() => {
        setShowRestoredNotice(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showRestoredNotice) {
    return null;
  }

  if (!isOnline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-20 md:bottom-6 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-600/95 text-white px-3.5 py-2 text-xs font-semibold shadow-xl backdrop-blur-md border border-amber-400/40 animate-in fade-in slide-in-from-bottom-2 duration-200"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>
        <WifiOff className="w-4 h-4 shrink-0 text-amber-200" />
        <span>Modo Offline Ativo — Cache local do NEXORA HI em utilização</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 left-4 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600/95 text-white px-3.5 py-2 text-xs font-semibold shadow-xl backdrop-blur-md border border-emerald-400/40 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <Wifi className="w-4 h-4 shrink-0 text-emerald-200" />
      <span>Ligação restabelecida! Em sincronia com o mundo.</span>
    </div>
  );
};
