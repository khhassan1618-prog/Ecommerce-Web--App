import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import heroImg from '../assets/images/hero_fashion_cyber_1790281582176.jpg';
import { ArrowDownRight, Compass, ShieldCheck, Mic } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { playClickSound, setSelectedProduct, setIsPDPModalOpen, openVoiceChatWithMic, products } = useStore();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    setMousePos({ x, y });
  };

  const scrollToCollection = () => {
    playClickSound(800);
    const col = document.getElementById('collection');
    if (col) {
      col.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openQuantumJacket = () => {
    playClickSound(880);
    const jkt = products.find(p => p.id === 'prod-01');
    if (jkt) {
      setSelectedProduct(jkt);
      setIsPDPModalOpen(true);
    }
  };

  return (
    <section
      id="index"
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex flex-col justify-between pt-28 pb-12 px-4 md:px-8 lg:px-12 bg-[#070707] overflow-hidden select-none border-b border-[#202221]"
    >
      {/* Background Ambience & Scanline Texture */}
      <div className="absolute inset-0 scanlines-overlay opacity-80 pointer-events-none" />
      <div className="absolute inset-0 noise-overlay opacity-40 pointer-events-none" />

      {/* Floating System Coordinates */}
      <div className="absolute top-24 right-8 md:right-16 text-right font-mono text-[10px] md:text-xs text-[#F3EDD8]/40 space-y-1 pointer-events-none hidden sm:block">
        <div>SYS_COORD: 33.6844° N / 73.0479° E</div>
        <div>BAROMETRIC: 1013.25 HPA</div>
        <div>OPTICAL FREQUENCY: 480 THZ</div>
        <div className="text-[#FD8A46]">NODE STATUS: SYNCHRONIZED</div>
      </div>

      {/* Main Hero Composition */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto w-full my-auto">
        {/* Left Column: Monumental Typography */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-[#FD8A46] inline-block shadow-[0_0_8px_#FD8A46]" />
            <span className="text-xs md:text-sm font-mono tracking-[0.25em] text-[#FD8A46] uppercase">
              RETRO-FUTURIST FASHION SYSTEM // VERSION 01.26
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-display font-extrabold tracking-tighter text-[#F3EDD8] leading-[0.92] uppercase text-balance">
            THE FUTURE <br />
            <span className="text-[#FD8A46] italic font-serif">REMEMBERS</span> <br />
            THE PAST.
          </h1>

          <p className="max-w-xl text-base md:text-lg text-[#F3EDD8]/70 font-sans leading-relaxed">
            NOVA/RETRON explores the speculative convergence of 1970s laboratory uniforms, 1984 cassette-futurism, and 2091 deep-orbital protective gear. Tailored for those who walk between realities.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={scrollToCollection}
              className="px-6 py-4 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-mono text-xs md:text-sm tracking-widest font-bold uppercase transition-all duration-200 cursor-pointer shadow-[0_0_24px_rgba(253,138,70,0.3)] flex items-center gap-2 group"
            >
              <span>EXPLORE COLLECTION</span>
              <ArrowDownRight className="transition-transform duration-200 group-hover:translate-x-1 group-hover:translate-y-1" size={18} />
            </button>

            <button
              onClick={openQuantumJacket}
              className="px-6 py-4 bg-transparent hover:bg-[#202221] text-[#F3EDD8] border border-[#202221] hover:border-[#FD8A46] font-mono text-xs md:text-sm tracking-widest uppercase transition-colors cursor-pointer"
            >
              ARCHIVE SPOTLIGHT // 01 JKT
            </button>

            <button
              onClick={openVoiceChatWithMic}
              className="px-5 py-4 bg-[#FD8A46]/10 hover:bg-[#FD8A46]/20 text-[#FD8A46] border border-[#FD8A46]/40 font-mono text-xs md:text-sm tracking-widest uppercase transition-colors cursor-pointer flex items-center gap-2"
            >
              <Mic size={15} className="animate-pulse" />
              <span>TALK TO AGENT (VOICE)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Layered Editorial Visual with Parallax */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div
            className="relative w-full max-w-md aspect-[3/4] border border-[#202221] bg-[#121313] overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-transform duration-300 ease-out"
            style={{
              transform: `perspective(1000px) rotateY(${mousePos.x * 6}deg) rotateX(${-mousePos.y * 6}deg)`
            }}
          >
            {/* The Generated Editorial Image */}
            <img
              src={heroImg}
              alt="NOVA/RETRON Speculative Outerwear Silhouette"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter contrast-105 saturate-95 group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-transparent opacity-80" />

            {/* Crosshairs & HUD Elements */}
            <div className="absolute top-4 left-4 font-mono text-[10px] text-[#FD8A46] tracking-widest bg-[#070707]/80 px-2 py-1 border border-[#202221]">
              SPECIMEN: NR-01 // COUTURE OBSIDIAN
            </div>

            <div className="absolute top-4 right-4 text-[#FD8A46]">
              <Compass size={18} className="animate-spin-slow opacity-80" />
            </div>

            <div className="absolute bottom-4 left-4 right-4 font-mono text-xs text-[#F3EDD8]/90 flex items-center justify-between border-t border-[#202221]/80 pt-3">
              <div>
                <div className="font-bold text-[#F3EDD8]">QUANTUM APPAREL</div>
                <div className="text-[10px] text-[#FD8A46]">THERMO-CONDUCTIVE MATRIX</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#F3EDD8]/60">ERA // 2026</div>
                <div className="font-bold text-[#F3EDD8]">PKR 48,500</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ticker & Metric Strip */}
      <div className="relative z-10 max-w-7xl mx-auto w-full pt-10 border-t border-[#202221] mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#F3EDD8]/60">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#FD8A46]" />
            <span>AUTHENTICATED SPECULATIVE ARCHIVE</span>
          </div>
          <span className="hidden md:inline">·</span>
          <span className="hidden md:inline">14-DAY ARCHIVAL INSPECTION PRIVILEGE</span>
        </div>

        <div className="flex items-center gap-4 text-[#FD8A46]">
          <span>PKR NATIONWIDE DISPATCH</span>
          <span>·</span>
          <span>EST. 2026</span>
        </div>
      </div>
    </section>
  );
};
