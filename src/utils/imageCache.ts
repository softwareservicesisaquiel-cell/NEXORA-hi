/**
 * High-Performance Image Cache & Optimization Utility for NEXORA
 * Provides responsive URL optimization, preloading, in-memory caching,
 * and persistent CacheStorage integration.
 */

interface OptimizeImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg';
  fit?: 'crop' | 'clip' | 'scale';
}

// Memory cache to prevent layout flashes on component re-mounts
const memoryImageCache = new Set<string>();

/**
 * Checks if an image URL has already been loaded in memory in the current session.
 */
export function isImageCachedInMemory(url: string): boolean {
  return memoryImageCache.has(url);
}

/**
 * Marks an image URL as loaded in memory.
 */
export function markImageCachedInMemory(url: string): void {
  if (url && !url.startsWith('data:')) {
    memoryImageCache.add(url);
  }
}

/**
 * Optimizes an image URL by applying format, quality, and dimension parameters.
 * Currently optimizes Unsplash URLs (used extensively across profiles, feed, and stories).
 */
export function getOptimizedImageUrl(
  url?: string,
  options: OptimizeImageOptions = {}
): string {
  if (!url) return '';

  // Data URLs, SVGs, or local paths don't need CDN query transformation
  if (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.endsWith('.svg') ||
    url.startsWith('/')
  ) {
    return url;
  }

  try {
    // Unsplash Optimization Engine
    if (url.includes('images.unsplash.com')) {
      const parsed = new URL(url);
      const width = options.width || 800;
      const quality = options.quality || 80;
      const fit = options.fit || 'crop';

      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', fit);
      parsed.searchParams.set('q', quality.toString());
      parsed.searchParams.set('w', width.toString());

      if (options.height) {
        parsed.searchParams.set('h', options.height.toString());
      }

      return parsed.toString();
    }

    // Dicebear avatar optimization (ensure format and seed are stable)
    if (url.includes('api.dicebear.com')) {
      return url;
    }

    return url;
  } catch {
    return url;
  }
}

/**
 * Preloads a single image and caches it in memory and browser cache.
 */
export function preloadImage(
  url: string,
  options: OptimizeImageOptions = {}
): Promise<string> {
  const optimizedUrl = getOptimizedImageUrl(url, options);

  if (!optimizedUrl) {
    return Promise.resolve('');
  }

  if (memoryImageCache.has(optimizedUrl)) {
    return Promise.resolve(optimizedUrl);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';

    img.onload = () => {
      markImageCachedInMemory(optimizedUrl);
      resolve(optimizedUrl);
    };

    img.onerror = () => {
      // Resolve anyway so batch operations don't reject
      resolve(optimizedUrl);
    };

    img.src = optimizedUrl;
  });
}

/**
 * Preloads a batch of images concurrently with a concurrency limit.
 */
export async function preloadImages(
  urls: (string | undefined)[],
  options: OptimizeImageOptions = {},
  maxConcurrent = 4
): Promise<string[]> {
  const validUrls = urls.filter((u): u is string => typeof u === 'string' && u.length > 0);
  const results: string[] = [];

  for (let i = 0; i < validUrls.length; i += maxConcurrent) {
    const batch = validUrls.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(batch.map((u) => preloadImage(u, options)));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Clears in-memory image cache and notifies Service Worker to clear disk cache.
 */
export async function clearAllImageCache(): Promise<void> {
  memoryImageCache.clear();

  if ('caches' in window) {
    try {
      await caches.delete('nexora-images-v2');
    } catch (err) {
      console.warn('Failed to delete image cache storage:', err);
    }
  }

  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_IMAGE_CACHE' });
  }
}
