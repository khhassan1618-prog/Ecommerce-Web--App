import React from 'react';
import { useStore } from '../context/StoreContext';
import { Shield, ArrowUp, Compass } from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    setIsAdminOpen,
    setIsTrackingOpen,
    setIsAISupportOpen,
    setIsAuthOpen,
    playClickSound
  } = useStore();

  const scrollToTop = () => {
    playClickSound(700);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    playClickSound(700);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#070707] border-t border-[#202221] text-[#F3EDD8] pt-20 pb-12 px-4 md:px-8 lg:px-12 select-none">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 items-start">
          {/* Brand Philosophy */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-[#FD8A46]" />
              <span className="text-2xl md:text-3xl font-display font-black tracking-widest text-[#F3EDD8]">
                NOVA/RETRON
              </span>
            </div>

            <p className="text-sm font-sans text-[#F3EDD8]/70 max-w-md leading-relaxed">
              "FASHION FROM A FUTURE THAT NEVER HAPPENED."
            </p>

            <p className="text-xs font-sans text-[#F3EDD8]/50 max-w-md leading-relaxed">
              Synthesizing 1970s laboratory uniforms, 1984 cassette-futurism, and 2091 deep-orbital technical wear. Engineered with titanium clasps, thermo-conductive membranes, and zero planned obsolescence.
            </p>

            <div className="font-mono text-xs text-[#FD8A46] flex items-center gap-4">
              <span>HUB: ISLAMABAD / LAHORE</span>
              <span>·</span>
              <span>CURRENCY: PKR</span>
            </div>
          </div>

          {/* Nav Links Column 1 */}
          <div className="lg:col-span-2 space-y-4 font-mono text-xs">
            <div className="text-[#FD8A46] font-bold tracking-widest uppercase">
              INDEX // CHAPTERS
            </div>
            <ul className="space-y-2.5 text-[#F3EDD8]/70">
              <li>
                <button
                  onClick={() => scrollToSection('index')}
                  className="hover:text-[#FD8A46] transition-colors cursor-pointer"
                >
                  00. HERO CONTINUUM
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('story')}
                  className="hover:text-[#FD8A46] transition-colors cursor-pointer"
                >
                  01. THE STORY
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('archive')}
                  className="hover:text-[#FD8A46] transition-colors cursor-pointer"
                >
                  02. CHRONO ARCHIVE
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('past-future')}
                  className="hover:text-[#FD8A46] transition-colors cursor-pointer"
                >
                  03. PAST / FUTURE
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('collection')}
                  className="hover:text-[#FD8A46] transition-colors cursor-pointer"
                >
                  04. COLLECTION
                </button>
              </li>
            </ul>
          </div>

          {/* Logistics & Support */}
          <div className="lg:col-span-2 space-y-4 font-mono text-xs">
            <div className="text-[#FD8A46] font-bold tracking-widest uppercase">
              SYSTEM PORTALS
            </div>
            <ul className="space-y-2.5 text-[#F3EDD8]/70">
              <li>
                <button
                  onClick={() => {
                    playClickSound(800);
                    setIsTrackingOpen(true);
                  }}
                  className="hover:text-[#FD8A46] transition-colors cursor-pointer"
                >
                  TRACK ORDER (NR-...)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    playClickSound(800);
                    setIsAISupportOpen(true);
                  }}
                  className="hover:text-[#FD8A46] transition-colors cursor-pointer text-[#FD8A46]"
                >
                  AI SUPPORT TERMINAL
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    playClickSound(800);
                    setIsAuthOpen(true);
                  }}
                  className="hover:text-[#FD8A46] transition-colors cursor-pointer"
                >
                  CUSTOMER DOSSIER
                </button>
              </li>
              <li>
                <span className="text-[#F3EDD8]/40">14-DAY ARCHIVE INSPECTION</span>
              </li>
              <li>
                <span className="text-[#F3EDD8]/40">NATIONWIDE AIR CARGO</span>
              </li>
            </ul>
          </div>

          {/* Telemetry Coordinates & Back to Top */}
          <div className="lg:col-span-3 space-y-6 font-mono text-xs">
            <div className="p-4 bg-[#121313] border border-[#202221] space-y-2">
              <div className="flex items-center gap-2 text-[#FD8A46]">
                <Compass size={14} />
                <span>TERMINAL BROADCAST NODE</span>
              </div>
              <div className="text-[#F3EDD8]/60 text-[11px]">
                LAT 33.6844° N // LON 73.0479° E
              </div>
              <div className="text-[#F3EDD8]/40 text-[10px]">
                ALL APPAREL DECLASSIFIED UNDER RETRO-FUTURIST DIRECTIVE NR-2026.
              </div>
            </div>

            <button
              onClick={scrollToTop}
              className="w-full py-3 bg-[#202221] hover:bg-[#FD8A46] hover:text-[#070707] text-[#F3EDD8] border border-[#202221] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>RETURN TO TOP APEX</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="pt-8 border-t border-[#202221] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#F3EDD8]/50">
          <div>
            © 2026 NOVA/RETRON. ALL SPECULATIVE RIGHTS RESERVED.
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                playClickSound(950);
                setIsAdminOpen(true);
              }}
              className="hover:text-[#FD8A46] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Shield size={12} />
              <span>ADMIN CONSOLE</span>
            </button>
            <span>·</span>
            <span>SYSTEM VERSION 01.26</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
