import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';

const MESSAGES = [
  'CONNECTING TO ARCHIVE...',
  'CALIBRATING VISUAL ENGINE...',
  'LOADING FASHION DATABASE...',
  'RESTORING FUTURE ARCHIVES...',
  'ESTABLISHING NEURAL LINK...',
  'SYSTEM READY.'
];

export const Preloader: React.FC = () => {
  const { isPreloaderFinished, setIsPreloaderFinished, playClickSound } = useStore();
  const [progress, setProgress] = useState(0);
  const [currentMsgIdx, setCurrentMsgIdx] = useState(0);
  const [systemCode, setSystemCode] = useState('0x7F9B // REG_A');
  const [coords, setCoords] = useState('LAT 33.6844° N // LON 73.0479° E');

  useEffect(() => {
    if (isPreloaderFinished) return;

    // Progress interval
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsPreloaderFinished(true);
          }, 400);
          return 100;
        }
        const increment = Math.floor(Math.random() * 8) + 4;
        const next = Math.min(100, prev + increment);

        // Update message based on progress
        const msgIdx = Math.min(MESSAGES.length - 1, Math.floor((next / 100) * MESSAGES.length));
        setCurrentMsgIdx(msgIdx);

        // Random hex codes
        setSystemCode(`0x${Math.floor(Math.random() * 0xffff).toString(16).toUpperCase()} // NODE_${Math.floor(next * 1.4)}`);
        return next;
      });
    }, 70);

    return () => clearInterval(interval);
  }, [isPreloaderFinished, setIsPreloaderFinished]);

  if (isPreloaderFinished) return null;

  const handleSkip = () => {
    playClickSound(880);
    setProgress(100);
    setIsPreloaderFinished(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#070707] text-[#F3EDD8] p-6 md:p-12 select-none overflow-hidden scanlines-overlay">
      {/* Top telemetry bar */}
      <div className="flex items-center justify-between text-xs font-mono tracking-widest text-[#F3EDD8]/60 border-b border-[#202221] pb-4">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 bg-[#FD8A46] animate-pulse" />
          <span>NOVA/RETRON // ARCHIVAL CORE</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <span>{coords}</span>
          <span>{systemCode}</span>
        </div>
        <button
          onClick={handleSkip}
          className="px-3 py-1 bg-[#202221] hover:bg-[#FD8A46] hover:text-[#070707] transition-colors text-[11px] font-mono tracking-wider cursor-pointer uppercase"
        >
          [SKIP PRELOADER ➔]
        </button>
      </div>

      {/* Center display */}
      <div className="my-auto max-w-4xl w-full mx-auto">
        <div className="mb-2 text-xs font-mono uppercase tracking-[0.3em] text-[#FD8A46]">
          SYSTEM INITIALIZATION // V01.26
        </div>

        <h1 className="text-4xl md:text-7xl lg:text-8xl font-display font-extrabold tracking-tighter text-[#F3EDD8] leading-none mb-6">
          NOVA/RETRON
        </h1>

        {/* Status terminal text */}
        <div className="h-8 flex items-center font-mono text-sm md:text-base text-[#F3EDD8]/90 tracking-widest">
          <span className="text-[#FD8A46] mr-2">❯</span>
          <span>{MESSAGES[currentMsgIdx]}</span>
          <span className="inline-block w-2 h-4 bg-[#FD8A46] ml-2 animate-pulse" />
        </div>

        {/* Progress bar container */}
        <div className="mt-8 border border-[#202221] p-1 bg-[#121313]/80">
          <div
            className="h-2 bg-[#FD8A46] transition-all duration-75 ease-out shadow-[0_0_12px_rgba(253,138,70,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-3 text-xs font-mono text-[#F3EDD8]/50">
          <span>ARCHIVAL SYNC: {progress}%</span>
          <span>CHUNKS: {Math.floor(progress * 4.2)} / 420 LOADED</span>
        </div>
      </div>

      {/* Bottom telemetry */}
      <div className="flex items-center justify-between text-xs font-mono text-[#F3EDD8]/40 border-t border-[#202221] pt-4">
        <span>SPECULATIVE CHRONO-SYSTEMS // ISLAMABAD HUB</span>
        <span className="hidden sm:inline">AUTHENTICATED PROTOCOL AES-256</span>
        <span>© 2026 NOVA/RETRON</span>
      </div>
    </div>
  );
};
