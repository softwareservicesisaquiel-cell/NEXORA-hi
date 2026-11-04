import React from 'react';
import {
  PermissionType,
  PERMISSION_DETAILS,
  setPermissionStatus,
} from '../utils/permissionManager';
import { Image, MapPin, Video, ShieldCheck, X, Lock } from 'lucide-react';

interface PermissionModalProps {
  isOpen: boolean;
  type?: PermissionType;
  permissionType?: PermissionType;
  onAccept?: () => void;
  onDecline?: () => void;
  onGranted?: () => void;
  onClose?: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  type,
  permissionType,
  onAccept,
  onDecline,
  onGranted,
  onClose,
}) => {
  if (!isOpen) return null;

  const resolvedType = permissionType || type || 'photos';
  const detail = PERMISSION_DETAILS[resolvedType] || PERMISSION_DETAILS.photos;

  const handleAllow = () => {
    setPermissionStatus(resolvedType, 'granted');
    if (onGranted) onGranted();
    if (onAccept) onAccept();
  };

  const handleDeny = () => {
    setPermissionStatus(resolvedType, 'denied');
    if (onClose) onClose();
    if (onDecline) onDecline();
  };

  const renderIcon = () => {
    switch (detail.iconName) {
      case 'image':
        return <Image className="w-8 h-8 text-blue-500" />;
      case 'mapPin':
        return <MapPin className="w-8 h-8 text-rose-500" />;
      case 'camera':
        return <Video className="w-8 h-8 text-purple-500" />;
      default:
        return <Image className="w-8 h-8 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-slate-100 text-center animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={handleDeny}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon with Glowing Ring */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center mb-4 shadow-sm">
          {renderIcon()}
        </div>

        {/* Title */}
        <h3 className="font-bold text-base sm:text-lg font-[var(--font-display)] text-slate-900 dark:text-white mb-2 leading-snug">
          {detail.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          {detail.description}
        </p>

        {/* Security & Privacy Guarantee Callout */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 mb-5 text-left">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Privacidade & Controlo NEXORA</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            {detail.dataUsage} Pode revogar esta permissão a qualquer momento nas Configurações.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleAllow}
            className="w-full py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            Permitir Acesso
          </button>
          <button
            onClick={handleDeny}
            className="w-full py-2.5 rounded-2xl font-medium text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Agora Não
          </button>
        </div>
      </div>
    </div>
  );
};
