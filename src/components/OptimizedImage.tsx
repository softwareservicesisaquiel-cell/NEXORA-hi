import React, { useState, useEffect } from 'react';
import {
  getOptimizedImageUrl,
  isImageCachedInMemory,
  markImageCachedInMemory,
} from '../utils/imageCache';
import { Image as ImageIcon } from 'lucide-react';

interface OptimizedImageProps {
  src?: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  quality?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  fallbackSrc?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  aspectRatio,
  priority = false,
  width,
  height,
  quality = 80,
  objectFit,
  fallbackSrc = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  referrerPolicy = 'no-referrer',
  style,
  onClick,
}) => {
  const optimizedSrc = getOptimizedImageUrl(src, { width, height, quality });
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
    img.referrerPolicy = referrerPolicy;
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
  }, [optimizedSrc, referrerPolicy]);

  const displaySrc = hasError ? fallbackSrc : (optimizedSrc || fallbackSrc);

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800/80 ${containerClassName}`}
      style={aspectRatio ? { aspectRatio } : undefined}
      onClick={onClick}
    >
      {/* Shimmer skeleton while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-slate-400 dark:text-slate-600 animate-pulse" />
        </div>
      )}

      {/* Optimized Image with Anti-Copy & Anti-Drag Protection */}
      <img
        src={displaySrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy={referrerPolicy}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{ ...(objectFit ? { objectFit } : {}), ...style }}
        className={`w-full h-full select-none no-drag protected-image ${objectFit ? '' : 'object-cover'} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={() => {
          setIsLoaded(true);
          markImageCachedInMemory(optimizedSrc);
        }}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
      />
    </div>
  );
};
