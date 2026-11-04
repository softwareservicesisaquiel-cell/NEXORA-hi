import React, { useState, useEffect } from 'react';
import {
  getOptimizedImageUrl,
  isImageCachedInMemory,
  markImageCachedInMemory,
} from '../utils/imageCache';
import { Check } from 'lucide-react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface OptimizedAvatarProps {
  src?: string;
  name?: string;
  alt?: string;
  username?: string;
  size?: AvatarSize;
  className?: string;
  isVerified?: boolean;
  isOnline?: boolean;
  hasStory?: boolean;
  hasUnseenStory?: boolean;
  onClick?: () => void;
}

const SIZE_CLASSES: Record<AvatarSize, { container: string; text: string; badge: string; icon: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', badge: 'w-2 h-2', icon: 'w-2 h-2 text-[7px]' },
  sm: { container: 'w-8 h-8', text: 'text-xs', badge: 'w-2.5 h-2.5', icon: 'w-2.5 h-2.5 text-[8px]' },
  md: { container: 'w-10 h-10', text: 'text-sm', badge: 'w-3 h-3', icon: 'w-3.5 h-3.5 text-[9px]' },
  lg: { container: 'w-12 h-12', text: 'text-base', badge: 'w-3.5 h-3.5', icon: 'w-4 h-4 text-[10px]' },
  xl: { container: 'w-16 h-16', text: 'text-lg', badge: 'w-4 h-4', icon: 'w-5 h-5 text-xs' },
  '2xl': { container: 'w-24 h-24 sm:w-28 sm:h-28', text: 'text-2xl', badge: 'w-5 h-5', icon: 'w-6 h-6 text-sm' },
};

export const OptimizedAvatar: React.FC<OptimizedAvatarProps> = ({
  src,
  name,
  alt,
  username,
  size = 'md',
  className = '',
  isVerified = false,
  isOnline = false,
  hasStory = false,
  hasUnseenStory = false,
  onClick,
}) => {
  const displayName = name || alt || 'Utilizador';
  const targetDimension = size === '2xl' ? 240 : size === 'xl' ? 160 : size === 'lg' ? 120 : 80;
  const optimizedSrc = getOptimizedImageUrl(src, {
    width: targetDimension,
    height: targetDimension,
    quality: 85,
  });

  const initiallyCached = isImageCachedInMemory(optimizedSrc);
  const [isLoaded, setIsLoaded] = useState<boolean>(initiallyCached);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (!optimizedSrc) {
      setHasError(true);
      return;
    }

    if (isImageCachedInMemory(optimizedSrc)) {
      setIsLoaded(true);
      setHasError(false);
      return;
    }

    setIsLoaded(false);
    setHasError(false);

    const img = new Image();
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    img.onload = () => {
      markImageCachedInMemory(optimizedSrc);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoaded(true);
    };
    img.src = optimizedSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [optimizedSrc]);

  // Fallback initials calculation
  const getInitials = () => {
    const clean = displayName.trim();
    if (!clean) return 'NX';
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const sizeStyle = SIZE_CLASSES[size];

  // Story border styling
  const storyWrapperClass = hasStory
    ? hasUnseenStory
      ? 'p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600'
      : 'p-[2px] rounded-full bg-slate-300 dark:bg-slate-700'
    : '';

  return (
    <div
      onClick={onClick}
      className={`relative inline-block shrink-0 select-none ${storyWrapperClass} ${
        onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''
      }`}
    >
      <div
        className={`relative rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 ${sizeStyle.container} ${className}`}
      >
        {/* Shimmer skeleton before load */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-slate-300 dark:bg-slate-700 animate-pulse" />
        )}

        {/* Fallback Initials / Dicebear if error or empty */}
        {hasError || !optimizedSrc ? (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold font-[var(--font-display)] ${sizeStyle.text}`}>
            {getInitials()}
          </div>
        ) : (
          <img
            src={optimizedSrc}
            alt={displayName || username || 'Avatar'}
            decoding="async"
            loading="lazy"
            referrerPolicy="no-referrer"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            className={`w-full h-full object-cover transition-opacity duration-200 no-drag select-none protected-image ui-avatar ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => {
              setIsLoaded(true);
              markImageCachedInMemory(optimizedSrc);
            }}
            onError={() => {
              setHasError(true);
              setIsLoaded(true);
            }}
          />
        )}
      </div>

      {/* Online Status Indicator */}
      {isOnline && (
        <span
          className={`absolute bottom-0 right-0 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 ${sizeStyle.badge}`}
          title="Online"
        />
      )}

      {/* Verified Badge */}
      {isVerified && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shadow ring-1 ring-white dark:ring-slate-900 ${sizeStyle.icon}`}
          title="Conta Verificada"
        >
          ✓
        </span>
      )}
    </div>
  );
};
