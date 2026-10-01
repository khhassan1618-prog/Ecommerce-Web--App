import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Volume2, VolumeX, Bot, Shield, User, Menu, X, Search, Mic } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    cartCount,
    setIsCartOpen,
    setIsAISupportOpen,
    openVoiceChatWithMic,
    setIsAdminOpen,
    setIsAuthOpen,
    setIsTrackingOpen,
    currentCustomer,
    isAudioOn,
    toggleAudio,
    playClickSound,
    products,
    setSelectedProduct,
    setIsPDPModalOpen
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    playClickSound(700);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredProducts = searchQuery.trim()
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#070707]/90 backdrop-blur-md border-b border-[#202221] py-3.5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Brand Wordmark (Zone 1) */}
          <div className="flex items-center gap-3">
            <a
              href="#index"
              onClick={e => {
                e.preventDefault();
                scrollToSection('index');
              }}
              className="text-lg md:text-xl font-display font-black tracking-widest text-[#F3EDD8] hover:text-[#FD8A46] transition-colors uppercase cursor-pointer"
            >
              NOVA/RETRON
            </a>
            <span className="hidden xl:inline text-[10px] font-mono text-[#F3EDD8]/40 tracking-wider">
              SYS_01.26
            </span>
          </div>

          {/* Nav Links (Zone 2) */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-mono tracking-widest text-[#F3EDD8]/80">
            <button
              onClick={() => scrollToSection('index')}
              className="hover:text-[#FD8A46] transition-colors uppercase cursor-pointer py-1"
            >
              INDEX
            </button>
            <button
              onClick={() => scrollToSection('story')}
              className="hover:text-[#FD8A46] transition-colors uppercase cursor-pointer py-1"
            >
              STORY
            </button>
            <button
              onClick={() => scrollToSection('archive')}
              className="hover:text-[#FD8A46] transition-colors uppercase cursor-pointer py-1"
            >
              ARCHIVE
            </button>
            <button
              onClick={() => scrollToSection('past-future')}
              className="hover:text-[#FD8A46] transition-colors uppercase cursor-pointer py-1"
            >
              PAST/FUTURE
            </button>
            <button
              onClick={() => scrollToSection('collection')}
              className="hover:text-[#FD8A46] transition-colors uppercase cursor-pointer py-1 text-[#FD8A46]"
            >
              COLLECTION
            </button>
            <button
              onClick={openVoiceChatWithMic}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FD8A46]/10 hover:bg-[#FD8A46]/20 border border-[#FD8A46]/30 text-[#FD8A46] transition-colors uppercase cursor-pointer"
            >
              <Mic size={12} className="animate-pulse" />
              <span>VOICE AGENT</span>
            </button>
            <button
              onClick={() => {
                playClickSound(800);
                setIsTrackingOpen(true);
              }}
              className="hover:text-[#FD8A46] transition-colors uppercase cursor-pointer py-1 text-[#F3EDD8]/60"
            >
              TRACK ORDER
            </button>
          </nav>

          {/* Actions & Utilities (Zone 3) */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Ambient Sound Toggle */}
            <button
              onClick={() => {
                playClickSound(950);
                toggleAudio();
              }}
              title={isAudioOn ? 'Mute ambient sound' : 'Turn on ambient sound'}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#202221]/70 hover:bg-[#202221] border border-[#202221] text-[11px] font-mono tracking-wider text-[#F3EDD8]/80 cursor-pointer transition-colors"
            >
              {isAudioOn ? (
                <>
                  <Volume2 size={13} className="text-[#FD8A46] animate-pulse" />
                  <span className="hidden xl:inline">SOUND: ON</span>
                </>
              ) : (
                <>
                  <VolumeX size={13} className="text-[#F3EDD8]/40" />
                  <span className="hidden xl:inline">SOUND: OFF</span>
                </>
              )}
            </button>

            {/* Search Trigger */}
            <button
              onClick={() => {
                playClickSound(780);
                setIsSearchOpen(true);
              }}
              title="Search catalog"
              aria-label="Search catalog"
              className="p-2 bg-[#202221]/70 hover:bg-[#202221] border border-[#202221] text-[#F3EDD8] cursor-pointer transition-colors"
            >
              <Search size={15} />
            </button>

            {/* AI Support Button */}
            <button
              onClick={() => {
                playClickSound(880);
                setIsAISupportOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#FD8A46]/10 hover:bg-[#FD8A46]/20 border border-[#FD8A46]/40 text-[#FD8A46] text-xs font-mono tracking-wider transition-colors cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FD8A46] animate-ping" />
              <Bot size={14} />
              <span className="hidden sm:inline">AI SUPPORT</span>
            </button>

            {/* Customer Account */}
            <button
              onClick={() => {
                playClickSound(780);
                setIsAuthOpen(true);
              }}
              title={currentCustomer ? `Account: ${currentCustomer.name}` : "Customer Account"}
              aria-label="Customer Account"
              className="relative p-2 bg-[#202221]/70 hover:bg-[#202221] border border-[#202221] text-[#F3EDD8] cursor-pointer transition-colors"
            >
              <User size={15} />
              {currentCustomer && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-[#070707]" />
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => {
                playClickSound(840);
                setIsCartOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#202221] hover:bg-[#FD8A46] hover:text-[#070707] text-[#F3EDD8] border border-[#202221] text-xs font-mono tracking-widest transition-all cursor-pointer"
            >
              <ShoppingBag size={14} />
              <span className="tabular-nums font-bold">[{cartCount}]</span>
            </button>

            {/* Admin Portal Shortcut */}
            <button
              onClick={() => {
                playClickSound(980);
                setIsAdminOpen(true);
              }}
              title="Admin Portal"
              aria-label="Admin Portal"
              className="hidden lg:flex p-2 text-[#F3EDD8]/40 hover:text-[#FD8A46] transition-colors cursor-pointer"
            >
              <Shield size={14} />
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => {
                playClickSound(650);
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="lg:hidden p-2 text-[#F3EDD8] bg-[#202221]/70 border border-[#202221] cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#070707]/98 border-b border-[#202221] px-6 py-6 font-mono text-sm tracking-widest space-y-4">
            <button
              onClick={() => scrollToSection('index')}
              className="block w-full text-left py-2 text-[#F3EDD8] hover:text-[#FD8A46]"
            >
              ➔ INDEX
            </button>
            <button
              onClick={() => scrollToSection('story')}
              className="block w-full text-left py-2 text-[#F3EDD8] hover:text-[#FD8A46]"
            >
              ➔ STORY
            </button>
            <button
              onClick={() => scrollToSection('archive')}
              className="block w-full text-left py-2 text-[#F3EDD8] hover:text-[#FD8A46]"
            >
              ➔ ARCHIVE
            </button>
            <button
              onClick={() => scrollToSection('past-future')}
              className="block w-full text-left py-2 text-[#F3EDD8] hover:text-[#FD8A46]"
            >
              ➔ PAST / FUTURE
            </button>
            <button
              onClick={() => scrollToSection('collection')}
              className="block w-full text-left py-2 text-[#FD8A46]"
            >
              ➔ EXPLORE COLLECTION
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openVoiceChatWithMic();
              }}
              className="block w-full text-left py-2 text-[#FD8A46] font-bold"
            >
              ➔ AI VOICE AGENT (LIVE MIC)
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsTrackingOpen(true);
              }}
              className="block w-full text-left py-2 text-[#F3EDD8]/70 hover:text-[#FD8A46]"
            >
              ➔ TRACK DISPATCH
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAdminOpen(true);
              }}
              className="block w-full text-left py-2 text-[#F3EDD8]/40 hover:text-[#FD8A46]"
            >
              ➔ SYSTEM ADMIN PORTAL
            </button>
          </div>
        )}
      </header>

      {/* Global Quick Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-[#070707]/95 backdrop-blur-md p-6 flex flex-col justify-start items-center pt-24">
          <div className="max-w-2xl w-full">
            <div className="flex items-center justify-between border-b border-[#FD8A46] pb-3 mb-6">
              <span className="text-xs font-mono tracking-widest text-[#FD8A46]">
                ARCHIVE LOOKUP // CATALOG SCAN
              </span>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-[#F3EDD8]/60 hover:text-[#F3EDD8] cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-[#FD8A46]" size={18} />
              <input
                type="text"
                autoFocus
                placeholder="Search jackets, hoodies, runners, watches..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#121313] border border-[#202221] pl-12 pr-4 py-3 text-[#F3EDD8] placeholder-[#F3EDD8]/30 font-mono text-sm focus:border-[#FD8A46] focus:outline-none"
              />
            </div>

            {/* Results */}
            <div className="mt-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {searchQuery && filteredProducts.length === 0 && (
                <div className="text-xs font-mono text-[#F3EDD8]/40 py-8 text-center">
                  NO SPECULATIVE RECORDS MATCHING "{searchQuery.toUpperCase()}"
                </div>
              )}
              {filteredProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    playClickSound(800);
                    setSelectedProduct(p);
                    setIsPDPModalOpen(true);
                    setIsSearchOpen(false);
                  }}
                  className="p-3 bg-[#121313] hover:bg-[#202221] border border-[#202221] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover border border-[#202221]"
                    />
                    <div>
                      <div className="font-display font-bold text-sm text-[#F3EDD8]">{p.name}</div>
                      <div className="text-xs font-mono text-[#F3EDD8]/50">{p.category} · {p.sku}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-[#FD8A46] font-bold">
                      PKR {p.price.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-mono text-[#F3EDD8]/40">VIEW SPECS ➔</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
