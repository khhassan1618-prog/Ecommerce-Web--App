import React, { useState, useRef } from 'react';
import { ARCHIVE_RECORDS } from '../data/archives';
import { ArchiveRecord } from '../types';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export const ArchiveSection: React.FC = () => {
  const { playClickSound, setSelectedProduct, setIsPDPModalOpen, products } = useStore();
  const [activeEra, setActiveEra] = useState<ArchiveRecord>(ARCHIVE_RECORDS[1]); // Default 1984
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    playClickSound(700);
    if (!scrollContainerRef.current) return;
    const offset = direction === 'left' ? -380 : 380;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const openRelatedProduct = (era: string) => {
    playClickSound(850);
    const prod = products.find(p => p.era === era) || products[0];
    setSelectedProduct(prod);
    setIsPDPModalOpen(true);
  };

  return (
    <section id="archive" className="relative py-28 px-4 md:px-8 lg:px-12 bg-[#070707] border-b border-[#202221] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#202221] pb-6 mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 text-xs font-mono text-[#FD8A46] tracking-widest uppercase mb-2">
              <span className="w-2 h-2 bg-[#FD8A46]" />
              <span>CHRONOLOGICAL VAULT // 1970 — 2091</span>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tighter text-[#F3EDD8] uppercase">
              THE ARCHIVE
            </h2>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-[#F3EDD8]/50 hidden sm:inline">HORIZONTAL SCROLL ➔</span>
            <button
              onClick={() => scroll('left')}
              className="p-3 bg-[#202221] hover:bg-[#FD8A46] hover:text-[#070707] text-[#F3EDD8] border border-[#202221] cursor-pointer transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 bg-[#202221] hover:bg-[#FD8A46] hover:text-[#070707] text-[#F3EDD8] border border-[#202221] cursor-pointer transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Horizontal Scrolling Era Cards */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {ARCHIVE_RECORDS.map(record => {
            const isSelected = activeEra.year === record.year;
            return (
              <div
                key={record.year}
                onClick={() => {
                  playClickSound(800);
                  setActiveEra(record);
                }}
                className={`snap-start shrink-0 w-[300px] sm:w-[360px] border transition-all duration-300 cursor-pointer bg-[#121313] p-4 flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#FD8A46] shadow-[0_0_30px_rgba(253,138,70,0.15)] ring-1 ring-[#FD8A46]'
                    : 'border-[#202221] hover:border-[#F3EDD8]/40'
                }`}
              >
                {/* Top Card Metadata */}
                <div>
                  <div className="flex items-center justify-between font-mono text-xs mb-3 text-[#F3EDD8]/60">
                    <span className="text-xl font-display font-extrabold text-[#F3EDD8]">
                      {record.year}
                    </span>
                    <span className="text-[#FD8A46] text-[10px] tracking-wider uppercase">
                      {record.collectionId}
                    </span>
                  </div>

                  <div className="relative aspect-[4/5] overflow-hidden border border-[#202221] mb-4 group">
                    <img
                      src={record.image}
                      alt={record.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-transparent opacity-70" />
                    <div className="absolute bottom-3 left-3 right-3 text-xs font-mono text-[#F3EDD8]/90">
                      <div className="text-[10px] text-[#FD8A46] uppercase font-bold">{record.status}</div>
                      <div className="font-semibold truncate">{record.style}</div>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-lg text-[#F3EDD8] mb-2">
                    {record.title}
                  </h3>
                  <p className="text-xs text-[#F3EDD8]/70 font-sans leading-relaxed line-clamp-3 mb-4">
                    {record.description}
                  </p>
                </div>

                {/* Bottom Spec Footer */}
                <div className="pt-3 border-t border-[#202221] flex items-center justify-between font-mono text-[11px]">
                  <span className="text-[#F3EDD8]/40 truncate max-w-[190px]">
                    {record.materials}
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      openRelatedProduct(record.year);
                    }}
                    className="text-[#FD8A46] hover:text-[#F3EDD8] flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Eye size={12} />
                    <span>INSPECT</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Era Detailed Telemetry Box */}
        <div className="mt-12 bg-[#121313] border border-[#202221] p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-3 font-mono">
            <div className="text-xs text-[#FD8A46] mb-1">ACTIVE ARCHIVE SPECIMEN</div>
            <div className="text-3xl font-display font-extrabold text-[#F3EDD8]">
              ERA {activeEra.year}
            </div>
            <div className="text-xs text-[#F3EDD8]/50 mt-1">{activeEra.collectionId}</div>
          </div>

          <div className="lg:col-span-6 font-sans text-sm text-[#F3EDD8]/80 leading-relaxed border-y lg:border-y-0 lg:border-x border-[#202221] py-4 lg:py-0 lg:px-8">
            <div className="font-bold text-[#F3EDD8] mb-1">{activeEra.title} — {activeEra.style}</div>
            <div>{activeEra.description}</div>
            <div className="mt-2 text-xs font-mono text-[#FD8A46]">
              MATERIALS: {activeEra.materials}
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-2">
            <button
              onClick={() => openRelatedProduct(activeEra.year)}
              className="w-full py-3 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-mono text-xs tracking-widest font-bold uppercase transition-colors cursor-pointer text-center"
            >
              EXPLORE {activeEra.year} GARMENTS ➔
            </button>
            <div className="text-[10px] font-mono text-center text-[#F3EDD8]/40">
              STATUS: {activeEra.status}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
