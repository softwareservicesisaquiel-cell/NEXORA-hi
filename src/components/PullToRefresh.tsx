import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { RefreshCw, ArrowDown, Check } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  pullText?: string;
  releaseText?: string;
  refreshingText?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className = '',
  pullText = 'Puxa para atualizar',
  releaseText = 'Larga para atualizar',
  refreshingText = 'A atualizar novidades...',
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const THRESHOLD = 64; // Pixels needed to trigger refresh
  const MAX_PULL = 96; // Maximum pull distance

  const checkIsAtTop = () => {
    if (containerRef.current) {
      return containerRef.current.scrollTop <= 0 && window.scrollY <= 0;
    }
    return window.scrollY <= 0;
  };

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing) return;
    if (checkIsAtTop()) {
      startYRef.current = e.touches[0].clientY;
      isDraggingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0 && checkIsAtTop()) {
      // Calculate pull with progressive damping resistance
      const dampedDistance = Math.min(Math.pow(diff, 0.82), MAX_PULL);
      setPullDistance(dampedDistance);

      // Light vibration feedback when threshold crossed
      if (dampedDistance >= THRESHOLD && pullDistance < THRESHOLD) {
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(15);
          } catch (_) {}
        }
      }
    } else {
      setPullDistance(0);
      isDraggingRef.current = false;
    }
  };

  const handleTouchEnd = async () => {
    if (!isDraggingRef.current || isRefreshing) return;
    isDraggingRef.current = false;

    if (pullDistance >= THRESHOLD) {
      await executeRefresh();
    } else {
      setPullDistance(0);
    }
  };

  // Desktop Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isRefreshing) return;
    if (checkIsAtTop()) {
      startYRef.current = e.clientY;
      isDraggingRef.current = true;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || isRefreshing) return;
    const diff = e.clientY - startYRef.current;

    if (diff > 0 && checkIsAtTop()) {
      const dampedDistance = Math.min(Math.pow(diff, 0.82), MAX_PULL);
      setPullDistance(dampedDistance);
    } else {
      setPullDistance(0);
      isDraggingRef.current = false;
    }
  };

  const handleMouseUp = async () => {
    if (!isDraggingRef.current || isRefreshing) return;
    isDraggingRef.current = false;

    if (pullDistance >= THRESHOLD) {
      await executeRefresh();
    } else {
      setPullDistance(0);
    }
  };

  const executeRefresh = async () => {
    setIsRefreshing(true);
    setPullDistance(THRESHOLD); // Stay at indicator height during refresh
    try {
      await onRefresh();
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 500);
    } catch (err) {
      console.error('Pull to refresh failed:', err);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 400);
    }
  };

  const isPastThreshold = pullDistance >= THRESHOLD;
  const rotationDegrees = Math.min((pullDistance / THRESHOLD) * 180, 180);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative w-full overflow-hidden select-none ${className}`}
    >
      {/* Pull Indicator Area */}
      <div
        className="w-full flex items-center justify-center transition-all duration-150 pointer-events-none z-30"
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 10 ? 1 : 0,
        }}
      >
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md transition-all duration-200 ${
            isSuccess
              ? 'bg-emerald-500 text-white'
              : isRefreshing
              ? 'bg-blue-600 text-white shadow-blue-500/25'
              : isPastThreshold
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white scale-105'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {isSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 animate-in zoom-in-50" />
              <span>Atualizado!</span>
            </>
          ) : isRefreshing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{refreshingText}</span>
            </>
          ) : (
            <>
              <ArrowDown
                className="w-3.5 h-3.5 transition-transform duration-150"
                style={{
                  transform: `rotate(${rotationDegrees}deg)`,
                }}
              />
              <span>{isPastThreshold ? releaseText : pullText}</span>
            </>
          )}
        </div>
      </div>

      {/* Main Content with smooth dynamic pull offset */}
      <div
        style={{
          transform: `translateY(${pullDistance * 0.15}px)`,
          transition: isDraggingRef.current ? 'none' : 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );
};
