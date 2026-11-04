import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Music,
  Play,
  Pause,
  Search,
  Sparkles,
  Check,
  Disc3,
  TrendingUp,
  Volume2,
} from 'lucide-react';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  genre: string;
  category: 'trending' | 'lofi' | 'electronic' | 'acoustic' | 'cinematic';
  synthPattern: {
    freqs: number[];
    type: OscillatorType;
    tempo: number;
  };
}

export const CURATED_TRACKS: MusicTrack[] = [
  {
    id: 'track_1',
    title: 'Cyber Pulse NEXORA',
    artist: 'Synthetica Sound',
    duration: '0:30',
    genre: 'Synthwave / Cyberpunk',
    category: 'electronic',
    synthPattern: { freqs: [220, 277.18, 329.63, 440, 370, 329.63, 277.18], type: 'sawtooth', tempo: 220 },
  },
  {
    id: 'track_2',
    title: 'Midnight Coffee Lo-Fi',
    artist: 'Aura Chill Collective',
    duration: '0:35',
    genre: 'Lo-Fi Chill Hop',
    category: 'lofi',
    synthPattern: { freqs: [261.63, 329.63, 392.0, 523.25, 392.0, 329.63], type: 'sine', tempo: 340 },
  },
  {
    id: 'track_3',
    title: 'Viral Horizon Beat',
    artist: 'K-Nova Studio',
    duration: '0:25',
    genre: 'Trap / Pop Viral',
    category: 'trending',
    synthPattern: { freqs: [174.61, 220, 261.63, 349.23, 261.63, 220], type: 'triangle', tempo: 200 },
  },
  {
    id: 'track_4',
    title: 'Golden Sunset Acoustic',
    artist: 'Elena & Wood',
    duration: '0:30',
    genre: 'Acoustic / Warm Folk',
    category: 'acoustic',
    synthPattern: { freqs: [293.66, 369.99, 440, 587.33, 440, 369.99], type: 'sine', tempo: 360 },
  },
  {
    id: 'track_5',
    title: 'Epic Dawn Revelation',
    artist: 'Nexus Symphony Orchestra',
    duration: '0:40',
    genre: 'Cinematic / Orchestral',
    category: 'cinematic',
    synthPattern: { freqs: [164.81, 196.0, 246.94, 329.63, 392.0, 493.88], type: 'sawtooth', tempo: 300 },
  },
  {
    id: 'track_6',
    title: 'Deep House Skyline',
    artist: 'Club Resonance',
    duration: '0:30',
    genre: 'Deep House / Dance',
    category: 'electronic',
    synthPattern: { freqs: [246.94, 293.66, 369.99, 493.88, 369.99], type: 'square', tempo: 190 },
  },
  {
    id: 'track_7',
    title: 'Urban Starlight',
    artist: 'Vibe Project Lisboa',
    duration: '0:28',
    genre: 'Afrobeat / Urban',
    category: 'trending',
    synthPattern: { freqs: [220, 261.63, 329.63, 392.0, 329.63, 261.63], type: 'triangle', tempo: 240 },
  },
  {
    id: 'track_8',
    title: 'Rainy Day Reverie',
    artist: 'Sleepy Panda Beats',
    duration: '0:32',
    genre: 'Lo-Fi Piano',
    category: 'lofi',
    synthPattern: { freqs: [329.63, 392.0, 493.88, 587.33, 493.88], type: 'sine', tempo: 400 },
  },
];

interface MusicSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrack: (track: { title: string; artist: string; audioUrl?: string; genre?: string }) => void;
  selectedTrackTitle?: string;
}

export const MusicSelectorModal: React.FC<MusicSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectTrack,
  selectedTrackTitle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  // Web Audio Context for realistic melodious track previews
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const activeOscRef = useRef<OscillatorNode | null>(null);
  const activeGainRef = useRef<GainNode | null>(null);

  // Stop playback when modal closes or unmounts
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (activeGainRef.current && audioCtxRef.current) {
      try {
        activeGainRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      } catch {
        // ignore
      }
    }
    if (activeOscRef.current) {
      try {
        activeOscRef.current.stop();
        activeOscRef.current.disconnect();
      } catch {
        // ignore
      }
      activeOscRef.current = null;
    }
    setPlayingTrackId(null);
  };

  const handlePlayPreview = (track: MusicTrack) => {
    if (playingTrackId === track.id) {
      stopAudio();
      return;
    }

    stopAudio();

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      setPlayingTrackId(track.id);

      let step = 0;
      const { freqs, type, tempo } = track.synthPattern;

      const playTone = () => {
        if (!audioCtxRef.current) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freqs[step % freqs.length], ctx.currentTime);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (tempo / 1000) * 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + (tempo / 1000) * 0.9);

        step++;
      };

      playTone();
      intervalRef.current = window.setInterval(playTone, tempo);
    } catch {
      setPlayingTrackId(null);
    }
  };

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'trending', label: 'Em Alta 🔥' },
    { id: 'lofi', label: 'Lo-Fi ☕' },
    { id: 'electronic', label: 'Eletrónico ⚡' },
    { id: 'acoustic', label: 'Acústico 🎸' },
    { id: 'cinematic', label: 'Cinemático 🎬' },
  ];

  const filteredTracks = CURATED_TRACKS.filter((track) => {
    const matchesCategory = activeCategory === 'all' || track.category === activeCategory;
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelect = (track: MusicTrack) => {
    stopAudio();
    onSelectTrack({
      title: track.title,
      artist: track.artist,
      genre: track.genre,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-[var(--font-display)] text-slate-900 dark:text-white">
                Biblioteca de Música NEXORA
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Áudios originais & bandas sonoras sem direitos de autor
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopAudio();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar música, artista ou estilo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-1 focus:ring-purple-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* Genre / Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Track List */}
        <div className="overflow-y-auto flex-1 space-y-2 pr-1 -mr-1">
          {filteredTracks.map((track) => {
            const isPlaying = playingTrackId === track.id;
            const isSelected = selectedTrackTitle === track.title;

            return (
              <div
                key={track.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700/60'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {/* Play/Pause Button & Waveform Icon */}
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => handlePlayPreview(track)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform hover:scale-105 ${
                      isPlaying
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                        : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                    }`}
                    title={isPlaying ? 'Pausar prévia' : 'Ouvir prévia sonora'}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5 fill-current" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {track.title}
                      </p>
                      {isPlaying && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] font-mono animate-pulse">
                          <Volume2 className="w-2.5 h-2.5" />
                          <span>A tocar</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {track.artist} · <span className="font-mono text-[10px]">{track.duration}</span>
                    </p>
                  </div>
                </div>

                {/* Select Button */}
                <button
                  onClick={() => handleSelect(track)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-purple-600 hover:text-white'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Selecionada</span>
                    </>
                  ) : (
                    <span>Usar Áudio</span>
                  )}
                </button>
              </div>
            );
          })}

          {filteredTracks.length === 0 && (
            <p className="text-center text-xs text-slate-400 py-8">
              Nenhuma faixa musical encontrada para "{searchQuery}".
            </p>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Disc3 className="w-3.5 h-3.5 text-purple-500" />
            <span>Licenciamento livre para publicações e Reels</span>
          </span>
          <button
            onClick={() => {
              stopAudio();
              onSelectTrack({ title: '', artist: '' });
              onClose();
            }}
            className="hover:text-rose-500 transition-colors"
          >
            Remover Áudio
          </button>
        </div>
      </div>
    </div>
  );
};
