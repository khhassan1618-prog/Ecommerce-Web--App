import React from 'react';
import { useStore } from '../context/StoreContext';
import { Tag, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const PromotionalSection: React.FC = () => {
  const { applyCoupon, addNotification, playClickSound, setIsCartOpen } = useStore();

  const handleClaimPromo = () => {
    playClickSound(950);
    applyCoupon('FUTURE20');
    addNotification('success', 'PROMO CODE ACTIVATED', '20% Speculative Bonus code FUTURE20 applied to your manifest.');
    setIsCartOpen(true);
  };

  return (
    <section className="relative py-20 px-4 md:px-8 lg:px-12 bg-[#0c0d0d] border-b border-[#202221] overflow-hidden">
      {/* Background Subtle Cyber Glow */}
      <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-96 h-96 bg-[#FD8A46]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="border border-[#FD8A46]/50 bg-[#121313]/90 p-8 md:p-12 shadow-[0_0_50px_rgba(253,138,70,0.12)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl font-mono">
            <div className="flex items-center gap-2 text-xs text-[#FD8A46] tracking-widest uppercase">
              <Sparkles size={14} className="animate-pulse" />
              <span>SEASONAL ARCHIVE DIRECTIVE // LIMITED ALLOCATION</span>
            </div>

            <h3 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-[#F3EDD8] uppercase tracking-tight">
              DEEP-ORBITAL ALLOCATION DROP: 20% SPECULATIVE BONUS
            </h3>

            <p className="text-xs md:text-sm text-[#F3EDD8]/70 font-sans leading-relaxed">
              Use cryptographic cipher <span className="text-[#FD8A46] font-mono font-bold">FUTURE20</span> at checkout to claim a 20% archival subsidy across our entire winter 2026 outer garment lineup. Free nationwide armored air cargo on orders over PKR 25,000.
            </p>

            <div className="flex items-center gap-4 text-[11px] text-[#F3EDD8]/50 pt-1">
              <span>● APPLIES TO ALL CATEGORIES</span>
              <span>·</span>
              <span>● 14-DAY ARCHIVAL PRIVILEGE INCLUDED</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0 font-mono">
            <button
              onClick={handleClaimPromo}
              className="px-8 py-4 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(253,138,70,0.3)] transition-all cursor-pointer"
            >
              <span>CLAIM 20% SUBSIDY</span>
              <ArrowRight size={15} />
            </button>

            <div className="p-3 bg-[#070707] border border-[#202221] text-center text-xs">
              <span className="text-[#F3EDD8]/50">PROMO CIPHER:</span>{' '}
              <strong className="text-[#FD8A46] tracking-widest font-mono">FUTURE20</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
