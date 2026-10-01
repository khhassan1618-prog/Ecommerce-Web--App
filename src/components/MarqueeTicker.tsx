import React from 'react';

interface MarqueeTickerProps {
  text?: string[];
  direction?: 'left' | 'right';
  className?: string;
  speed?: number;
}

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({
  text = [
    'NOVA/RETRON',
    'FASHION FROM A FUTURE THAT NEVER HAPPENED',
    'ARCHIVAL SYSTEM 01.26',
    'QUANTUM MEMBRANES',
    'CHASSIS VELOCITY',
    '1984 VINTAGE TO 2091 ORBITAL TAILORING',
    'PKR NATIONWIDE AIR CARGO',
    '14-DAY ARCHIVE INSPECTION PRIVILEGE'
  ],
  direction = 'left',
  className = ''
}) => {
  return (
    <div className={`w-full overflow-hidden border-y border-[#202221] bg-[#0c0d0d] py-3 select-none pointer-events-none ${className}`}>
      <div className="flex w-max animate-marquee font-mono text-xs md:text-sm tracking-[0.25em] text-[#F3EDD8]/70 uppercase">
        {Array.from({ length: 4 }).map((_, repeatIdx) => (
          <div key={repeatIdx} className="flex items-center gap-6 shrink-0 pr-6">
            {text.map((item, itemIdx) => (
              <React.Fragment key={itemIdx}>
                <span className="hover:text-[#FD8A46] transition-colors">{item}</span>
                <span className="text-[#FD8A46] text-xs">✦</span>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
