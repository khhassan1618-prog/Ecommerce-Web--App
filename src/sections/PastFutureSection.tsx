import React, { useState } from 'react';
import imgArchiveEditorial from '../assets/images/archive_retro_future_1790281640353.jpg';
import imgHeroCyber from '../assets/images/hero_fashion_cyber_1790281582176.jpg';
import { SlidersHorizontal } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const PastFutureSection: React.FC = () => {
  const { playClickSound } = useStore();
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0 - 100

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSplitPos(Number(e.target.value));
  };

  return (
    <section id="past-future" className="relative py-28 px-4 md:px-8 lg:px-12 bg-[#070707] border-b border-[#202221] overflow-hidden select-none">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#202221] pb-6 mb-12 gap-4">
          <div>
            <div className="text-xs font-mono text-[#FD8A46] tracking-widest uppercase mb-2">
              03 // CONTINUUM SPLICE
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-extrabold tracking-tighter text-[#F3EDD8] uppercase">
              THE PAST <span className="text-[#FD8A46] italic font-serif">VERSUS</span> THE FUTURE
            </h2>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-[#F3EDD8]/60">
            <SlidersHorizontal size={14} className="text-[#FD8A46]" />
            <span>INTERACTIVE CHRONO-SLIDER</span>
          </div>
        </div>

        {/* Interactive Comparison Split Stage */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] border border-[#202221] bg-[#121313] overflow-hidden shadow-2xl">
          {/* Layer 1: The Past (Analog 35mm grain look) */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={imgArchiveEditorial}
              alt="The Past: 1984 Vintage Analog Archive"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter sepia-[0.25] contrast-110 brightness-95"
            />
            {/* The Past Typography Overlay */}
            <div className="absolute top-8 left-8 z-10 font-mono">
              <span className="text-xs text-[#FD8A46] tracking-widest block mb-1">CHRONO-DOMAIN 01</span>
              <span className="text-3xl md:text-5xl font-display font-black text-[#F3EDD8] drop-shadow-lg">
                THE PAST
              </span>
              <p className="text-xs text-[#F3EDD8]/70 max-w-xs mt-2 hidden sm:block">
                Analog synthesizers, heavy wool gabardine, tactile chrome snaps, and 35mm cassette grain.
              </p>
            </div>
          </div>

          {/* Layer 2: The Future (Clipped by split position slider) */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden transition-none"
            style={{ clipPath: `inset(0 0 0 ${splitPos}%)` }}
          >
            <img
              src={imgHeroCyber}
              alt="The Future: 2091 Speculative Cybernetic Tailoring"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter contrast-125 saturate-110"
            />
            <div className="absolute inset-0 scanlines-overlay opacity-40 pointer-events-none" />

            {/* The Future Typography Overlay */}
            <div className="absolute top-8 right-8 z-10 font-mono text-right">
              <span className="text-xs text-[#FD8A46] tracking-widest block mb-1">CHRONO-DOMAIN 02</span>
              <span className="text-3xl md:text-5xl font-display font-black text-[#F3EDD8] drop-shadow-lg">
                THE FUTURE
              </span>
              <p className="text-xs text-[#F3EDD8]/70 max-w-xs mt-2 ml-auto hidden sm:block">
                Thermo-reactive polyamides, titanium modular chassis, and barometric adaptive silhouettes.
              </p>
            </div>
          </div>

          {/* Divider Line Indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#FD8A46] z-20 pointer-events-none shadow-[0_0_12px_#FD8A46]"
            style={{ left: `${splitPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#070707] border border-[#FD8A46] flex items-center justify-center text-[10px] font-mono text-[#FD8A46] font-bold shadow-lg">
              ↔
            </div>
          </div>

          {/* Range Input Slider (Overlaid for touch & mouse drag) */}
          <input
            type="range"
            min="0"
            max="100"
            value={splitPos}
            onChange={handleSliderChange}
            onPointerDown={() => playClickSound(800)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            aria-label="Split past and future comparison slider"
          />
        </div>

        {/* Bottom Helper Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 font-mono text-xs text-[#F3EDD8]/50 gap-2">
          <div>SLIDE OR DRAG HORIZONTALLY TO DISSOLVE TIMELINES</div>
          <div className="flex items-center gap-4 text-[#FD8A46]">
            <span>ANALOG WEIGHT: {100 - splitPos}%</span>
            <span>·</span>
            <span>SPECULATIVE CYBER: {splitPos}%</span>
          </div>
        </div>
      </div>
    </section>
  );
};
