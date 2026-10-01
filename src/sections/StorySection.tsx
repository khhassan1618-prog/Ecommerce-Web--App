import React from 'react';
import imgArchiveEditorial from '../assets/images/archive_retro_future_1790281640353.jpg';
import { ArrowUpRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const StorySection: React.FC = () => {
  const { playClickSound } = useStore();

  const scrollToArchive = () => {
    playClickSound(750);
    const el = document.getElementById('archive');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="story" className="relative py-28 px-4 md:px-8 lg:px-12 bg-[#070707] border-b border-[#202221] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header Telemetry */}
        <div className="flex items-center justify-between border-b border-[#202221] pb-4 mb-16 text-xs font-mono text-[#F3EDD8]/60">
          <div className="flex items-center gap-3">
            <span className="text-[#FD8A46]">01 // CHAPTER</span>
            <span>THE PHILOSOPHICAL ARCHIVE</span>
          </div>
          <span className="hidden sm:inline">CHRONO-CONTINUUM DISPATCH</span>
        </div>

        {/* Large Editorial Headline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold tracking-tighter text-[#F3EDD8] leading-[0.95] uppercase">
              A JOURNEY <br />
              <span className="text-[#FD8A46] italic font-serif">THROUGH</span> <br />
              TIME <br />
              AND STYLE
            </h2>

            <div className="mt-12 space-y-6 max-w-xl text-base md:text-lg text-[#F3EDD8]/80 font-sans leading-relaxed">
              <p className="text-xl md:text-2xl text-[#F3EDD8] font-medium font-serif italic border-l-2 border-[#FD8A46] pl-6 py-2">
                "Fashion was never meant to move in a straight line."
              </p>
              <p>
                In standard linear history, the future is an endless march of disposable silicon and sterile white surfaces. NOVA/RETRON exists in an alternate timeline where 1984 cassette aesthetics never died—they evolved directly into deep-space orbital tailoring.
              </p>
              <p className="text-sm md:text-base text-[#F3EDD8]/60">
                We synthesize heavy natural textiles—double-face French loopback cottons, gabardine wools, and ballistic polyamides—with magnetic FIDLOCK® clasps, electroplated chrome stabilizers, and thermo-conductive membranes.
              </p>
            </div>

            <div className="mt-10">
              <button
                onClick={scrollToArchive}
                className="inline-flex items-center gap-2 text-xs md:text-sm font-mono tracking-widest text-[#FD8A46] hover:text-[#F3EDD8] transition-colors cursor-pointer group"
              >
                <span>ACCESS THE DECLASSIFIED TIMELINES</span>
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Layered Editorial Collage */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative border border-[#202221] bg-[#121313] p-3 shadow-2xl">
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={imgArchiveEditorial}
                  alt="NOVA/RETRON 1984 Archive Editorial"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter contrast-110 sepia-[0.1]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-transparent opacity-60" />
              </div>

              <div className="p-4 bg-[#070707] border-t border-[#202221] mt-3 flex items-center justify-between font-mono text-xs">
                <div>
                  <div className="text-[#F3EDD8] font-bold">PLATE 84 // PROTO-CYBER</div>
                  <div className="text-[10px] text-[#F3EDD8]/50">35MM ANALOG ARCHIVE PHOTOGRAPHY</div>
                </div>
                <div className="text-right text-[#FD8A46] text-[10px]">
                  RESTORED 2026
                </div>
              </div>
            </div>

            {/* Overlapping Spec Badge */}
            <div className="hidden sm:block absolute -bottom-6 -left-6 bg-[#202221] p-4 border border-[#FD8A46]/40 max-w-xs font-mono text-xs text-[#F3EDD8]/80 shadow-xl">
              <div className="text-[#FD8A46] font-bold mb-1">ARCHIVAL INVARIANT:</div>
              <div>Zero synthetic obsolescence. Every garment is constructed to endure across multiple decades of speculative weather.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
