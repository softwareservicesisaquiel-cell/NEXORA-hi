import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Heart,
  Send,
  Users,
  Camera,
  Mic,
  MicOff,
  Share2,
  Radio,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { OptimizedAvatar } from './OptimizedAvatar';

interface FloatingHeart {
  id: number;
  x: number;
  color: string;
  size: number;
}

interface LiveComment {
  id: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  time: string;
}

interface LiveRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamTitle?: string;
  isHost?: boolean;
}

const HEART_COLORS = [
  '#ef4444', // red
  '#ec4899', // pink
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // emerald
  '#f59e0b', // amber
  '#06b6d4', // cyan
];

export const LiveRoomModal: React.FC<LiveRoomModalProps> = ({
  isOpen,
  onClose,
  streamTitle = 'Transmissão ao Vivo NEXORA',
  isHost = true,
}) => {
  const { currentUser, addToast } = useApp();

  const [viewerCount, setViewerCount] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<LiveComment[]>([
    {
      id: 'c1',
      senderName: 'Sofia Martins',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      text: 'Olá! A transmissão está com ótima qualidade!',
      time: 'Agora',
    },
    {
      id: 'c2',
      senderName: 'Lucas Ferreira',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      text: 'Grande abraço de Luanda! 🚀🔥',
      time: 'Agora',
    },
    {
      id: 'c3',
      senderName: 'Beatriz Costa',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      text: 'Adoro a interface da Nexora! Super rápida ❤️',
      time: 'Agora',
    },
  ]);

  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [isEndingConfirm, setIsEndingConfirm] = useState(false);
  const [liveDuration, setLiveDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const commentsBottomRef = useRef<HTMLDivElement | null>(null);

  // Initialize camera for live streaming
  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const s = await navigator.mediaDevices.getUserMedia({
            video: { facingMode },
            audio: true,
          });
          if (active && videoRef.current) {
            videoRef.current.srcObject = s;
            streamRef.current = s;
          }
        }
      } catch (err) {
        console.warn('Live camera stream unavailable, using simulated stream preview', err);
      }
    }

    initCamera();

    // Live duration timer
    const timerInterval = setInterval(() => {
      setLiveDuration((prev) => prev + 1);
    }, 1000);

    // Viewer count simulation
    const viewerInterval = setInterval(() => {
      setViewerCount((prev) => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(12, prev + change);
      });
    }, 4000);

    return () => {
      active = false;
      clearInterval(timerInterval);
      clearInterval(viewerInterval);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, facingMode]);

  // Auto-scroll comments to bottom
  useEffect(() => {
    commentsBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: LiveComment = {
      id: Date.now().toString(),
      senderName: currentUser?.name || 'Eu',
      senderAvatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=nexora',
      text: commentText.trim(),
      time: 'Agora',
    };

    setComments((prev) => [...prev, newComment]);
    setCommentText('');

    // Trigger automatic floating heart burst when commenting
    triggerFloatingHeart();
  };

  const triggerFloatingHeart = () => {
    const newHeart: FloatingHeart = {
      id: Date.now() + Math.random(),
      x: 65 + (Math.random() * 25 - 12), // right aligned near heart button
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
      size: 24 + Math.floor(Math.random() * 16),
    };

    setHearts((prev) => [...prev.slice(-20), newHeart]);

    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 2000);
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
    addToast(isMuted ? 'Microfone ativado' : 'Microfone silenciado', 'info');
  };

  const handleEndLive = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setIsEndingConfirm(false);
    onClose();
    addToast('Transmissão ao vivo encerrada com sucesso.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden animate-in fade-in duration-200">
      {/* Background / Live Video Viewfinder */}
      <div className="relative w-full h-full max-w-md mx-auto bg-slate-950 flex flex-col justify-between overflow-hidden">
        
        {/* Real Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
        />

        {/* Fallback Live Backdrop if hardware camera is denied */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none" />

        {/* Floating Heart Animations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {hearts.map((h) => (
            <div
              key={h.id}
              className="absolute animate-floating-heart"
              style={{
                left: `${h.x}%`,
                bottom: '90px',
                color: h.color,
                animationDuration: '2.2s',
              }}
            >
              <Heart
                fill={h.color}
                style={{ width: `${h.size}px`, height: `${h.size}px` }}
              />
            </div>
          ))}
        </div>

        {/* TOP HEADER */}
        <div className="relative z-30 p-4 pt- safe flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            {/* Host Avatar & Name */}
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
              <OptimizedAvatar
                src={currentUser?.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=nexora'}
                alt={currentUser?.name || 'Nexora'}
                size="sm"
                className="w-7 h-7"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight truncate max-w-[110px]">
                  {currentUser?.name || 'Transmissão Nexora'}
                </span>
                <span className="text-[10px] text-slate-300 font-mono">
                  {formatTimer(liveDuration)}
                </span>
              </div>
            </div>

            {/* LIVE Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-rose-600/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>AO VIVO</span>
            </div>

            {/* Viewer Count */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-medium border border-white/10">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{viewerCount}</span>
            </div>
          </div>

          {/* Close / End Button */}
          <button
            onClick={() => setIsEndingConfirm(true)}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/75 transition-colors cursor-pointer border border-white/15"
            title="Encerrar Transmissão"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STREAM TITLE PILL */}
        <div className="relative z-30 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white/90 text-xs">
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-spin" />
            <span className="font-medium truncate max-w-[240px]">{streamTitle}</span>
          </div>
        </div>

        {/* BOTTOM AREA: Live Comments & Floating Hearts */}
        <div className="relative z-30 p-4 pb-safe space-y-3">
          {/* Comments Stream (Instagram/TikTok style scrolling up) */}
          <div className="max-h-48 overflow-y-auto no-scrollbar space-y-2 pr-12">
            {comments.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-2xl max-w-[85%] border border-white/5 animate-in slide-in-from-bottom-2 duration-200"
              >
                <img
                  src={c.senderAvatar}
                  alt={c.senderName}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-cyan-300 block leading-tight">
                    {c.senderName}
                  </span>
                  <p className="text-xs text-white leading-snug break-words">
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
            <div ref={commentsBottomRef} />
          </div>

          {/* Bottom Bar: Input + Heart Button + Broadcaster Tools */}
          <div className="flex items-center gap-2">
            {/* Comment Form */}
            <form onSubmit={handleSendComment} className="flex-1 flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-3.5 py-1.5 border border-white/20">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enviar comentário ao vivo..."
                className="flex-1 bg-transparent text-white placeholder-slate-400 text-xs focus:outline-none"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-1 rounded-full text-blue-400 disabled:opacity-40 hover:text-blue-300 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Floating Heart Button */}
            <button
              onClick={triggerFloatingHeart}
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 hover:scale-110 active:scale-95 transition-transform cursor-pointer shrink-0"
              title="Gostar / Reagir"
            >
              <Heart className="w-5 h-5 fill-white" />
            </button>

            {/* Broadcaster Quick Controls */}
            {isHost && (
              <>
                <button
                  onClick={toggleCamera}
                  className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center border border-white/15 hover:bg-black/75 cursor-pointer shrink-0"
                  title="Inverter câmara"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <button
                  onClick={toggleMute}
                  className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border border-white/15 cursor-pointer shrink-0 ${
                    isMuted ? 'bg-rose-600 text-white' : 'bg-black/50 text-white hover:bg-black/75'
                  }`}
                  title={isMuted ? 'Ativar microfone' : 'Silenciar microfone'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Confirmation Modal to End Broadcast */}
        {isEndingConfirm && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-150">
            <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center text-white space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-base font-[var(--font-display)]">
                  Encerrar transmissão?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  A sua sessão ao vivo terminará e os espectadores serão notificados.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleEndLive}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                >
                  Confirmar e Encerrar
                </button>
                <button
                  onClick={() => setIsEndingConfirm(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Continuar em Direto
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
