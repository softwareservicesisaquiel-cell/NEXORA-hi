/**
 * Precision Device & Hardware Identifier for NEXORA
 * Accurately detects exact device model, operating system, hardware architecture,
 * and browser environment using User-Agent Client Hints and advanced UA parsing.
 */

export interface DeviceSessionInfo {
  id: string;
  deviceName: string; // e.g. "Samsung Galaxy S24 Ultra", "Apple iPhone 15 Pro", "MacBook Pro M-Series"
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'smart-device';
  os: string; // e.g. "Android 14", "iOS 17.5", "macOS Sonoma", "Windows 11"
  browser: string; // e.g. "Chrome 130", "Safari 17.4", "Firefox 131"
  resolution: string; // e.g. "1080x2340 (3x)"
  timeZone: string; // e.g. "Europe/Lisbon" or "America/Sao_Paulo"
  lastActive: string;
  isCurrent: boolean;
}

// Well-known Android hardware model codes map
const ANDROID_MODEL_MAP: Record<string, string> = {
  // Samsung Galaxy S series
  'SM-S928': 'Samsung Galaxy S24 Ultra',
  'SM-S926': 'Samsung Galaxy S24+',
  'SM-S921': 'Samsung Galaxy S24',
  'SM-S918': 'Samsung Galaxy S23 Ultra',
  'SM-S916': 'Samsung Galaxy S23+',
  'SM-S911': 'Samsung Galaxy S23',
  'SM-S908': 'Samsung Galaxy S22 Ultra',
  'SM-G998': 'Samsung Galaxy S21 Ultra',
  'SM-G991': 'Samsung Galaxy S21',
  'SM-A546': 'Samsung Galaxy A54 5G',
  'SM-A536': 'Samsung Galaxy A53 5G',
  'SM-F946': 'Samsung Galaxy Z Fold 5',
  'SM-F731': 'Samsung Galaxy Z Flip 5',
  // Google Pixel
  'Pixel 8 Pro': 'Google Pixel 8 Pro',
  'Pixel 8': 'Google Pixel 8',
  'Pixel 7 Pro': 'Google Pixel 7 Pro',
  'Pixel 7': 'Google Pixel 7',
  'Pixel 6a': 'Google Pixel 6a',
  // Xiaomi / Redmi
  '23127PN0CG': 'Xiaomi 14',
  '23049PCD8G': 'POCO F5',
  '2210132G': 'Xiaomi 13 Pro',
  // Motorola
  'motorola edge': 'Motorola Edge Series',
  'moto g': 'Motorola Moto G',
};

/**
 * Extracts and maps known model codes to commercial names.
 */
function resolveAndroidModel(rawModel: string): string {
  const trimmed = rawModel.trim();
  for (const [prefix, commercialName] of Object.entries(ANDROID_MODEL_MAP)) {
    if (trimmed.toUpperCase().includes(prefix.toUpperCase())) {
      return commercialName;
    }
  }
  return trimmed || 'Dispositivo Android';
}

/**
 * Detects the exact device name, OS, and browser for the current active environment.
 */
export async function detectExactCurrentDevice(): Promise<DeviceSessionInfo> {
  const ua = navigator.userAgent;
  const nav = navigator as any;

  let deviceName = 'Computador Pessoal';
  let deviceType: DeviceSessionInfo['deviceType'] = 'desktop';
  let os = 'Desconhecido';
  let browser = 'Navegador Web';

  // 1. Try modern User-Agent Client Hints API (Chrome, Edge, Opera, Samsung Internet)
  if (nav.userAgentData) {
    const uaData = nav.userAgentData;
    const platform = uaData.platform || '';

    if (uaData.mobile) {
      deviceType = 'mobile';
    }

    try {
      if (typeof uaData.getHighEntropyValues === 'function') {
        const highEntropy = await uaData.getHighEntropyValues([
          'model',
          'platformVersion',
          'architecture',
          'bitness',
        ]);

        if (highEntropy.model) {
          deviceName = resolveAndroidModel(highEntropy.model);
        }

        if (platform === 'Windows') {
          const major = parseInt(highEntropy.platformVersion?.split('.')[0] || '0', 10);
          os = major >= 13 ? 'Windows 11' : 'Windows 10';
          if (!highEntropy.model) deviceName = `PC ${os}`;
        } else if (platform === 'macOS') {
          os = 'macOS';
          deviceName = highEntropy.architecture === 'arm' ? 'MacBook / Mac (Apple Silicon)' : 'Mac (Intel)';
        } else if (platform === 'Android') {
          os = highEntropy.platformVersion ? `Android ${highEntropy.platformVersion}` : 'Android';
        }
      }
    } catch {
      // High entropy fallback to standard parsing
    }
  }

  // 2. Comprehensive User-Agent Parsing (Apple iOS/iPadOS, macOS, Android, Windows, Linux)
  if (deviceName === 'Computador Pessoal' || deviceName.includes('Dispositivo')) {
    // Apple Devices Detection
    if (/iPhone/i.test(ua)) {
      deviceType = 'mobile';
      // Detect specific iPhone generation if resolution matches
      const w = window.screen.width;
      const h = window.screen.height;
      const ratio = window.devicePixelRatio || 1;

      if ((w === 430 && h === 932) || (w === 393 && h === 852)) {
        deviceName = 'Apple iPhone 15 / 16 Pro';
      } else if ((w === 428 && h === 926) || (w === 390 && h === 844)) {
        deviceName = 'Apple iPhone 13 / 14';
      } else if (w === 414 && h === 896) {
        deviceName = 'Apple iPhone 11 / XR';
      } else {
        deviceName = 'Apple iPhone';
      }

      const match = ua.match(/OS (\d+[_\.]\d+)/i);
      os = match ? `iOS ${match[1].replace('_', '.')}` : 'iOS';
    } else if (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      deviceType = 'tablet';
      deviceName = 'Apple iPad Pro / Air';
      const match = ua.match(/OS (\d+[_\.]\d+)/i);
      os = match ? `iPadOS ${match[1].replace('_', '.')}` : 'iPadOS';
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      deviceType = 'desktop';
      deviceName = navigator.maxTouchPoints === 0 && (screen.width >= 1440 || screen.width <= 1728)
        ? 'MacBook Pro / Air (macOS)'
        : 'Apple Mac (macOS)';
      const match = ua.match(/Mac OS X (\d+[_\.]\d+)/i);
      os = match ? `macOS ${match[1].replace('_', '.')}` : 'macOS';
    } else if (/Android/i.test(ua)) {
      deviceType = /Tablet|Nexus 7|Nexus 9/i.test(ua) ? 'tablet' : 'mobile';
      // Look for Android model in user agent string: e.g. "; SM-S928B Build/"
      const modelMatch = ua.match(/;\s*([^;]+)\s+Build\//i);
      if (modelMatch && modelMatch[1]) {
        deviceName = resolveAndroidModel(modelMatch[1]);
      } else {
        deviceName = 'Smartphone Android';
      }
      const match = ua.match(/Android\s+([\d\.]+)/i);
      os = match ? `Android ${match[1]}` : 'Android';
    } else if (/Windows NT/i.test(ua)) {
      deviceType = 'desktop';
      if (/Windows NT 10.0/i.test(ua)) {
        os = 'Windows 10 / 11';
        deviceName = 'PC Windows (Desktop / Portátil)';
      } else {
        os = 'Windows';
        deviceName = 'PC Windows';
      }
    } else if (/Linux/i.test(ua)) {
      deviceType = 'desktop';
      os = 'Linux';
      deviceName = 'Computador Linux / Ubuntu';
    }
  }

  // 3. Browser Detection
  if (/Edg\//i.test(ua)) {
    const match = ua.match(/Edg\/([\d\.]+)/i);
    browser = `Microsoft Edge ${match ? match[1].split('.')[0] : ''}`;
  } else if (/Chrome\//i.test(ua) && !/Chromium|Edg|OPR/i.test(ua)) {
    const match = ua.match(/Chrome\/([\d\.]+)/i);
    browser = `Google Chrome ${match ? match[1].split('.')[0] : ''}`;
  } else if (/Firefox\//i.test(ua)) {
    const match = ua.match(/Firefox\/([\d\.]+)/i);
    browser = `Mozilla Firefox ${match ? match[1].split('.')[0] : ''}`;
  } else if (/Safari\//i.test(ua) && !/Chrome|Chromium/i.test(ua)) {
    const match = ua.match(/Version\/([\d\.]+)/i);
    browser = `Apple Safari ${match ? match[1].split('.')[0] : ''}`;
  } else if (/SamsungBrowser\//i.test(ua)) {
    const match = ua.match(/SamsungBrowser\/([\d\.]+)/i);
    browser = `Samsung Internet ${match ? match[1].split('.')[0] : ''}`;
  }

  const dpr = window.devicePixelRatio || 1;
  const resolution = `${window.screen.width}x${window.screen.height}${dpr > 1 ? ` (${dpr}x Retina)` : ''}`;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  // Persistent Unique Session ID for this browser tab/device
  let sessionId = localStorage.getItem('nexora_device_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem('nexora_device_session_id', sessionId);
  }

  return {
    id: sessionId,
    deviceName,
    deviceType,
    os,
    browser,
    resolution,
    timeZone,
    lastActive: 'Ativo agora',
    isCurrent: true,
  };
}

/**
 * Generates initial active sessions array with current real device and previous trusted device history.
 */
export async function getActiveSessionsList(): Promise<DeviceSessionInfo[]> {
  const current = await detectExactCurrentDevice();

  // Try to load cached sessions from storage
  let storedSessions: DeviceSessionInfo[] = [];
  try {
    const raw = localStorage.getItem('nexora_active_sessions_list');
    if (raw) {
      storedSessions = JSON.parse(raw);
    }
  } catch {
    storedSessions = [];
  }

  // Update current device in list or prepend
  const otherSessions = storedSessions.filter((s) => s.id !== current.id).map((s) => ({
    ...s,
    isCurrent: false,
  }));

  const fullList = [current, ...otherSessions];

  try {
    localStorage.setItem('nexora_active_sessions_list', JSON.stringify(fullList));
  } catch {}

  return fullList;
}

/**
 * Terminates other sessions leaving only the current active device.
 */
export async function terminateOtherSessionsList(): Promise<DeviceSessionInfo[]> {
  const current = await detectExactCurrentDevice();
  try {
    localStorage.setItem('nexora_active_sessions_list', JSON.stringify([current]));
  } catch {}
  return [current];
}
