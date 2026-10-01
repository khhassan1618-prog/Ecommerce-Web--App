import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Film,
  Layers,
  Radio,
  Sliders,
  CheckCircle2
} from 'lucide-react';

const CINEMATIC_REELS = [
  {
    id: 'reel-01',
    title: 'ACT I // ORBITAL WINTER',
    garment: '01 — QUANTUM JACKET',
    era: '2026',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    specs: 'Thermo-reactive membrane in sub-zero atmospheric storm'
  },
  {
    id: 'reel-02',
    title: 'ACT II // KINETIC ACCELERATION',
    garment: '02 — CHROME RUNNER',
    era: '1999/2091',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    specs: 'Electroplated chrome heel counter in high-velocity transit'
  },
  {
    id: 'reel-03',
    title: 'ACT III // BRUTALIST HEAVYWEAVE',
    garment: '03 — SIGNAL HOODIE',
    era: '1984',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    specs: '550 GSM double-face French terry architectural silhouette'
  },
  {
    id: 'reel-04',
    title: 'ACT IV // CHRONOMETRIC PULSE',
    garment: '06 — VECTOR WATCH',
    era: '2091',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    specs: 'Grade 5 Titanium mechanical gears + amber LED telemetry'
  }
];

export const CinematicVideoSection: React.FC = () => {
  const { playClickSound } = useStore();
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showScanlines, setShowScanlines] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const currentReel = CINEMATIC_REELS[activeReelIndex];

  const handleTogglePlay = () => {
    playClickSound(750);
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = () => {
    playClickSound(850);
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleFullscreen = () => {
    playClickSound(950);
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const selectReel = (idx: number) => {
    playClickSound(880);
    setActiveReelIndex(idx);
    setIsPlaying(true);
  };

  return (
    <section
      id="cinematic"
      className="relative py-24 md:py-32 px-4 md:px-8 lg:px-12 bg-[#070707] border-b border-[#202221] overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 noise-overlay opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#202221] pb-8">
          <div>
            <div className="flex items-center gap-2.5 font-mono text-xs text-[#FD8A46] tracking-[0.25em] uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-[#FD8A46] animate-pulse" />
              <span>CINEMATIC ARCHIVE // 60 FPS MOTION STREAM</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-[#F3EDD8] uppercase">
              MOTION IN <br className="hidden sm:inline" />
              <span className="text-[#FD8A46] italic font-serif">THE VOID.</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="max-w-md text-xs sm:text-sm text-[#F3EDD8]/70 font-sans leading-relaxed">
              Archival 4K footage capturing garment aerodynamics, water-repellent polymers, and kinetic hardware under orbital studio lights.
            </p>
          </div>
        </div>

        {/* Cinematic Video Cinema Viewport */}
        <div className="relative border border-[#202221] bg-[#050505] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)]">
          {/* Top Camera HUD Overlay */}
          <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between text-xs font-mono pointer-events-none text-[#F3EDD8]">
            <div className="flex items-center gap-3 bg-[#070707]/80 px-3 py-1.5 border border-[#202221] backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-red-400 font-bold">LIVE REEL // {currentReel.title}</span>
            </div>

            <div className="hidden sm:flex items-center gap-4 bg-[#070707]/80 px-3 py-1.5 border border-[#202221] text-[11px] text-[#F3EDD8]/70 backdrop-blur-sm">
              <span>ERA: <strong className="text-[#FD8A46]">{currentReel.era}</strong></span>
              <span>LENS: 50MM F/1.2</span>
              <span>ISO: 800</span>
              <span className="text-[#FD8A46]">60 FPS SHUTTER</span>
            </div>
          </div>

          {/* Corner Crosshairs */}
          <div className="absolute top-3 left-3 text-[#FD8A46]/60 font-mono text-xs pointer-events-none z-20">+</div>
          <div className="absolute top-3 right-3 text-[#FD8A46]/60 font-mono text-xs pointer-events-none z-20">+</div>
          <div className="absolute bottom-16 left-3 text-[#FD8A46]/60 font-mono text-xs pointer-events-none z-20">+</div>
          <div className="absolute bottom-16 right-3 text-[#FD8A46]/60 font-mono text-xs pointer-events-none z-20">+</div>

          {/* Optional Scanlines CRT Overlay */}
          {showScanlines && (
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-50 z-20" />
          )}

          {/* Video Player */}
          <div className="relative aspect-video w-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              src={currentReel.src}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* Bottom Interactive HUD Bar */}
          <div className="relative z-30 bg-[#0c0d0d] border-t border-[#202221] px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={handleTogglePlay}
                className="px-3 py-1.5 bg-[#202221] hover:bg-[#FD8A46] hover:text-[#070707] border border-[#202221] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>

              <button
                onClick={handleToggleMute}
                className="p-1.5 bg-[#202221] hover:bg-[#FD8A46] hover:text-[#070707] border border-[#202221] transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-[#FD8A46]" />}
              </button>

              <button
                onClick={() => {
                  playClickSound(700);
                  const nextSpeed = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 0.5 : 1;
                  setPlaybackSpeed(nextSpeed);
                  if (videoRef.current) videoRef.current.playbackRate = nextSpeed;
                }}
                className="px-2.5 py-1.5 border border-[#202221] hover:border-[#FD8A46] text-[11px] text-[#F3EDD8]/70 hover:text-[#FD8A46] cursor-pointer"
              >
                {playbackSpeed}X SPEED
              </button>

              <button
                onClick={() => {
                  playClickSound(700);
                  setShowScanlines(!showScanlines);
                }}
                className={`px-2.5 py-1.5 border text-[11px] cursor-pointer transition-colors ${
                  showScanlines ? 'border-[#FD8A46] text-[#FD8A46]' : 'border-[#202221] text-[#F3EDD8]/40'
                }`}
              >
                CRT SCANLINES: {showScanlines ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-[11px] text-[#F3EDD8]/60 hidden md:block">
                GARMENT: <span className="text-[#FD8A46] font-bold">{currentReel.garment}</span>
              </div>

              <button
                onClick={handleFullscreen}
                className="p-1.5 border border-[#202221] hover:border-[#FD8A46] text-[#F3EDD8]/70 hover:text-[#FD8A46] cursor-pointer"
                title="Fullscreen"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Reel Selector Track (4 Cinematic Acts) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          {CINEMATIC_REELS.map((reel, idx) => (
            <button
              key={reel.id}
              onClick={() => selectReel(idx)}
              className={`p-4 border text-left transition-all cursor-pointer relative group ${
                activeReelIndex === idx
                  ? 'border-[#FD8A46] bg-[#121313]'
                  : 'border-[#202221] bg-[#0c0d0d] hover:border-[#FD8A46]/50'
              }`}
            >
              {activeReelIndex === idx && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#FD8A46] animate-ping" />
              )}
              <div className="text-[10px] text-[#FD8A46] uppercase tracking-wider mb-1 font-bold">
                {reel.title}
              </div>
              <div className="font-display font-bold text-sm text-[#F3EDD8] mb-1">
                {reel.garment}
              </div>
              <div className="text-[11px] text-[#F3EDD8]/50 line-clamp-1">
                {reel.specs}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
