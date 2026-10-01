import React, { useEffect, useState } from 'react';

export const CyberCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [targetPos, setTargetPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch device
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setTargetPos({ x: e.clientX, y: e.clientY });

      // Check if hovering over clickable element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, input, select, textarea, [role="button"], [data-cursor-hover]');
        setIsHovering(Boolean(interactive));
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Smooth lerp for outer crosshair
  useEffect(() => {
    if (isTouchDevice) return;

    let animId: number;
    const lerp = () => {
      setPos(prev => ({
        x: prev.x + (targetPos.x - prev.x) * 0.25,
        y: prev.y + (targetPos.y - prev.y) * 0.25
      }));
      animId = requestAnimationFrame(lerp);
    };
    animId = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(animId);
  }, [targetPos, isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Central pinpoint */}
      <div
        className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
        style={{
          left: `${targetPos.x}px`,
          top: `${targetPos.y}px`
        }}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full bg-[#FD8A46] shadow-[0_0_8px_#FD8A46] ${
            isClicking ? 'scale-150' : 'scale-100'
          }`}
        />
      </div>

      {/* Outer bracket crosshair */}
      <div
        className="fixed pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ease-out"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: isHovering ? '44px' : '26px',
          height: isHovering ? '44px' : '26px'
        }}
      >
        <div
          className={`w-full h-full border rounded-full transition-all duration-200 ${
            isHovering
              ? 'border-[#FD8A46] bg-[#FD8A46]/10 scale-110 shadow-[0_0_14px_rgba(253,138,70,0.4)]'
              : 'border-[#FD8A46]/40'
          }`}
        />

        {/* Small Technical Coordinates Tag */}
        {isHovering && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 font-mono text-[8px] text-[#FD8A46] whitespace-nowrap bg-[#070707]/90 px-1 border border-[#FD8A46]/30">
            [{Math.round(pos.x)}:{Math.round(pos.y)}]
          </div>
        )}
      </div>
    </>
  );
};
