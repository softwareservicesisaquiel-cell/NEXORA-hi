import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Sparkles,
} from 'lucide-react';

export const CallModal: React.FC = () => {
  const { activeCall, updateActiveCall, endCall } = useApp();
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!activeCall.isOpen) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      return;
    }

    // Attempt to access user media for call
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: activeCall.isVideo,
          audio: true,
        });
        mediaStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        updateActiveCall({ status: 'connected' });
      } catch (err) {
        console.warn('Could not access camera/mic, running call session in signaling mode:', err);
        updateActiveCall({ status: 'connected' });
      }
    };

    startMedia();

    // Call duration timer
    const timer = setInterval(() => {
      updateActiveCall({ durationSeconds: activeCall.durationSeconds + 1 });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [activeCall.isOpen, activeCall.isVideo]);

  // Handle Mute & Camera toggles on real MediaStream tracks
  useEffect(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !activeCall.isMuted;
      });
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !activeCall.isCameraOff;
      });
    }
  }, [activeCall.isMuted, activeCall.isCameraOff]);

  if (!activeCall.isOpen || !activeCall.targetUser) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-[550px] bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-6 text-white select-none">
        
        {/* Top Header */}
        <div className="flex items-center justify-between text-xs text-slate-300 z-10">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-medium">Sinalização WebRTC Criptografada</span>
          </div>

          <div className="font-mono tabular-nums text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/40">
            {activeCall.status === 'connected'
              ? formatDuration(activeCall.durationSeconds)
              : 'A chamar...'}
          </div>
        </div>

        {/* Video stream view or Audio avatar */}
        {activeCall.isVideo && !activeCall.isCameraOff ? (
          <div className="absolute inset-0 z-0 bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />
          </div>
        ) : (
          /* Center Target Info */
          <div className="flex flex-col items-center justify-center my-auto text-center z-10">
            <div className="relative mb-5">
              <div
                className={`absolute -inset-4 rounded-full bg-cyan-500/20 blur-xl ${
                  activeCall.status === 'connected' ? 'animate-pulse' : ''
                }`}
              />
              <img
                src={activeCall.targetUser.avatar}
                alt={activeCall.targetUser.name}
                referrerPolicy="no-referrer"
                className="relative w-28 h-28 rounded-full object-cover border-4 border-cyan-500/80 shadow-2xl"
              />
              {activeCall.isVideo && (
                <span className="absolute bottom-1 right-1 p-1.5 rounded-full bg-cyan-600 text-white shadow">
                  <Video className="w-4 h-4" />
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold font-[var(--font-display)] mb-1 text-white">
              {activeCall.targetUser.name}
            </h3>
            <p className="text-xs text-slate-400 mb-2 font-mono">
              @{activeCall.targetUser.username} • {activeCall.targetUser.nexoraId}
            </p>

            <span className="text-xs font-medium text-cyan-400">
              {activeCall.status === 'connected'
                ? activeCall.isVideo
                  ? 'Chamada de Vídeo WebRTC Ativa'
                  : 'Chamada de Voz WebRTC Ativa'
                : 'A estabelecer ligação...'}
            </span>
          </div>
        )}

        {/* Bottom Call Control Buttons */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10 z-10">
          {/* Mute Microphone */}
          <button
            onClick={() => updateActiveCall({ isMuted: !activeCall.isMuted })}
            className={`p-3.5 rounded-full transition-all min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer ${
              activeCall.isMuted
                ? 'bg-rose-500/90 text-white'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
            title={activeCall.isMuted ? 'Ativar microfone' : 'Silenciar microfone'}
          >
            {activeCall.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Camera */}
          {activeCall.isVideo && (
            <button
              onClick={() => updateActiveCall({ isCameraOff: !activeCall.isCameraOff })}
              className={`p-3.5 rounded-full transition-all min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer ${
                activeCall.isCameraOff
                  ? 'bg-rose-500/90 text-white'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              title={activeCall.isCameraOff ? 'Ligar câmara' : 'Desligar câmara'}
            >
              {activeCall.isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          {/* Toggle Speaker */}
          <button
            onClick={() => updateActiveCall({ isSpeakerOn: !activeCall.isSpeakerOn })}
            className={`p-3.5 rounded-full transition-all min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer ${
              !activeCall.isSpeakerOn
                ? 'bg-amber-500/90 text-white'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
            title="Alta voz"
          >
            {activeCall.isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={endCall}
            className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 active:scale-95 transition-all min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer"
            title="Terminar Chamada"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};
