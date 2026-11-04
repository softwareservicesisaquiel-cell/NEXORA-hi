/**
 * Device and Personal Data Permission Manager for NEXORA
 * Ensures user consent is explicitly requested and stored before accessing
 * device media (photos, videos), camera/microphone, or geolocation.
 */

export type PermissionType = 'photos' | 'location' | 'camera';

export interface PermissionDetail {
  type: PermissionType;
  title: string;
  description: string;
  dataUsage: string;
  iconName: 'image' | 'mapPin' | 'camera';
}

export const PERMISSION_DETAILS: Record<PermissionType, PermissionDetail> = {
  photos: {
    type: 'photos',
    title: 'Aceder às Fotografias e Ficheiros do Dispositivo',
    description:
      'Para publicar fotos, vídeos e Reels na sua conta NEXORA, precisamos da sua autorização para aceder à galeria do seu dispositivo.',
    dataUsage:
      'As suas fotos pessoais permanecem privadas e nunca são transmitidas sem a sua confirmação explícita de publicação.',
    iconName: 'image',
  },
  location: {
    type: 'location',
    title: 'Aceder à Localização do Dispositivo',
    description:
      'Para identificar a sua cidade ou região ao criar publicações e momentos, a NEXORA solicita acesso à localização.',
    dataUsage:
      'Apenas a cidade/país selecionada é partilhada na sua publicação. Não registamos o seu histórico de deslocações.',
    iconName: 'mapPin',
  },
  camera: {
    type: 'camera',
    title: 'Aceder à Câmara e Microfone',
    description:
      'Necessário para realizar videochamadas e chamadas de voz com outros utilizadores no NEXORA.',
    dataUsage:
      'A transmissão audiovisual é em tempo real e cifrada ponto a ponto durante as chamadas.',
    iconName: 'camera',
  },
};

const PERM_STORAGE_PREFIX = 'nexora_permission_';

export function getPermissionStatus(type: PermissionType): 'granted' | 'denied' | 'prompt' {
  try {
    const val = localStorage.getItem(`${PERM_STORAGE_PREFIX}${type}`);
    if (val === 'granted') return 'granted';
    if (val === 'denied') return 'denied';
    return 'prompt';
  } catch {
    return 'prompt';
  }
}

export function hasPermission(type: PermissionType): boolean {
  return getPermissionStatus(type) === 'granted';
}

export function setPermissionStatus(type: PermissionType, status: 'granted' | 'denied'): void {
  try {
    localStorage.setItem(`${PERM_STORAGE_PREFIX}${type}`, status);
  } catch (err) {
    console.warn('Failed to persist permission:', err);
  }
}

export function revokePermission(type: PermissionType): void {
  try {
    localStorage.removeItem(`${PERM_STORAGE_PREFIX}${type}`);
  } catch (err) {
    console.warn('Failed to revoke permission:', err);
  }
}

export function resetAllPermissions(): void {
  try {
    localStorage.removeItem(`${PERM_STORAGE_PREFIX}photos`);
    localStorage.removeItem(`${PERM_STORAGE_PREFIX}location`);
    localStorage.removeItem(`${PERM_STORAGE_PREFIX}camera`);
  } catch (err) {
    console.warn('Failed to reset permissions:', err);
  }
}
