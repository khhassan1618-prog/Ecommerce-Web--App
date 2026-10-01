import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductViewer3D } from './ProductViewer3D';
import { X, ShoppingBag, Zap, Heart, Rotate3d, Image as ImageIcon, Bot, ShieldCheck, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProductDetailModal: React.FC = () => {
  const {
    isPDPModalOpen,
    setIsPDPModalOpen,
    selectedProduct,
    addToCart,
    wishlist,
    toggleWishlist,
    playClickSound,
    setIsCheckoutOpen,
    setIsAISupportOpen
  } = useStore();

  const [activeTab, setActiveTab] = useState<'3d' | 'gallery'>('3d');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);

  if (!selectedProduct) return null;

  const currentSize = selectedSize || selectedProduct.sizes[0];
  const currentColor = selectedColor || selectedProduct.colors[0].name;
  const isWishlisted = wishlist.includes(selectedProduct.id);

  const handleClose = () => {
    playClickSound(600);
    setIsPDPModalOpen(false);
  };

  const handleAddToCart = () => {
    playClickSound(880);
    addToCart(selectedProduct, currentSize, currentColor, quantity);
  };

  const handleBuyNow = () => {
    playClickSound(950);
    addToCart(selectedProduct, currentSize, currentColor, quantity);
    setIsPDPModalOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleAskAIAboutProduct = () => {
    playClickSound(900);
    setIsAISupportOpen(true);
    setTimeout(() => {
      const event = new CustomEvent('open-ai-chat-prompt', {
        detail: `Is the ${selectedProduct.name} available in size ${currentSize}?`
      });
      window.dispatchEvent(event);
    }, 150);
  };

  return (
    <AnimatePresence>
      {isPDPModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#070707]/90 backdrop-blur-md overflow-y-auto"
        >
          {/* Main Animated Modal Container with Mask Reveal & Scale */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, filter: 'blur(10px) brightness(1.3)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px) brightness(1)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
            transition={{
              duration: 0.38,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="relative w-full max-w-6xl bg-[#0e0f0f] border border-[#202221] shadow-[0_0_60px_rgba(0,0,0,0.9)] my-auto text-[#F3EDD8] overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Holographic Scanning Laser Line */}
            <motion.div
              initial={{ top: '-10%', opacity: 0.8 }}
              animate={{ top: '110%', opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FD8A46] to-transparent pointer-events-none z-30 shadow-[0_0_15px_#FD8A46]"
            />

            {/* Top Header Bar */}
            <div className="px-6 py-4 border-b border-[#202221] flex items-center justify-between font-mono text-xs text-[#F3EDD8]/60 bg-[#070707]">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-[#FD8A46] animate-pulse" />
                <span className="text-[#FD8A46] font-bold">{selectedProduct.sku}</span>
                <span>·</span>
                <span>{selectedProduct.collection}</span>
              </div>

              <div className="flex items-center gap-4">
                {/* View Mode Toggle: 3D vs 2D Gallery */}
                <div className="flex items-center p-0.5 bg-[#121313] border border-[#202221]">
                  <button
                    onClick={() => {
                      playClickSound(750);
                      setActiveTab('3d');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                      activeTab === '3d'
                        ? 'bg-[#FD8A46] text-[#070707] font-bold'
                        : 'text-[#F3EDD8]/70 hover:text-[#F3EDD8]'
                    }`}
                  >
                    <Rotate3d size={13} />
                    <span>3D CHASSIS</span>
                  </button>
                  <button
                    onClick={() => {
                      playClickSound(750);
                      setActiveTab('gallery');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                      activeTab === 'gallery'
                        ? 'bg-[#FD8A46] text-[#070707] font-bold'
                        : 'text-[#F3EDD8]/70 hover:text-[#F3EDD8]'
                    }`}
                  >
                    <ImageIcon size={13} />
                    <span>LOOKBOOK</span>
                  </button>
                </div>

                <button
                  onClick={handleClose}
                  className="p-1 hover:text-[#FD8A46] transition-colors cursor-pointer"
                  aria-label="Close details"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body: Split Screen */}
            <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-grow">
              {/* Left Visual Area: 3D Viewport OR High-Res Gallery */}
              <div className="lg:col-span-7 bg-[#070707] border-b lg:border-b-0 lg:border-r border-[#202221] relative flex flex-col justify-center min-h-[380px] lg:min-h-[550px]">
                {activeTab === '3d' ? (
                  <ProductViewer3D product={selectedProduct} className="w-full h-full min-h-[440px]" />
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
                    <img
                      src={selectedProduct.images[selectedImageIdx] || selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      referrerPolicy="no-referrer"
                      className="max-h-[460px] w-auto object-contain filter contrast-105"
                    />
                    {selectedProduct.images.length > 1 && (
                      <div className="flex gap-2 mt-4">
                        {selectedProduct.images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIdx(idx)}
                            className={`w-12 h-12 border cursor-pointer overflow-hidden ${
                              selectedImageIdx === idx ? 'border-[#FD8A46]' : 'border-[#202221]'
                            }`}
                          >
                            <img src={img} alt="thumb" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Product Details & Contiguous Purchase Module */}
              <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between space-y-6 bg-[#0e0f0f]">
                <div>
                  {/* Category & Era */}
                  <div className="flex items-center justify-between text-xs font-mono text-[#F3EDD8]/60 mb-2">
                    <span>{selectedProduct.category.toUpperCase()} // ERA {selectedProduct.era}</span>
                    <span className="text-[#FD8A46] font-bold">
                      {selectedProduct.inStock ? `● ${selectedProduct.stockCount} UNITS REMAINING` : 'RESERVE LIST'}
                    </span>
                  </div>

                  {/* Title & Price */}
                  <h2 className="text-2xl md:text-3xl font-display font-black text-[#F3EDD8] mb-2 leading-tight">
                    {selectedProduct.name}
                  </h2>

                  <div className="text-2xl font-mono font-bold text-[#FD8A46] mb-4 tabular-nums">
                    PKR {selectedProduct.price.toLocaleString()}
                  </div>

                  <p className="text-xs md:text-sm text-[#F3EDD8]/75 font-sans leading-relaxed mb-6">
                    {selectedProduct.description}
                  </p>

                  {/* Garment Details & Tech Specs */}
                  <div className="border-t border-b border-[#202221] py-4 my-4 space-y-2 font-mono text-xs text-[#F3EDD8]/70">
                    <div className="text-[11px] text-[#FD8A46] font-bold mb-1">SPECIFICATIONS:</div>
                    {selectedProduct.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-[#FD8A46] mt-0.5">❯</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>

                  {/* Size Selector */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs font-mono text-[#F3EDD8]/70 mb-2">
                      <span>SELECT ARCHIVAL SIZE:</span>
                      <button
                        onClick={handleAskAIAboutProduct}
                        className="text-[#FD8A46] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Bot size={12} />
                        <span>FIT ADVISOR</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map(size => (
                        <button
                          key={size}
                          onClick={() => {
                            playClickSound(700);
                            setSelectedSize(size);
                          }}
                          className={`px-3.5 py-2 text-xs font-mono tracking-wider transition-colors cursor-pointer border ${
                            currentSize === size
                              ? 'bg-[#FD8A46] text-[#070707] border-[#FD8A46] font-bold'
                              : 'bg-[#121313] text-[#F3EDD8]/70 border-[#202221] hover:border-[#FD8A46]'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Finish Selector */}
                  <div className="mb-4">
                    <div className="text-xs font-mono text-[#F3EDD8]/70 mb-2">
                      CHASSIS COLORWAY: <span className="text-[#FD8A46]">{currentColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedProduct.colors.map(col => (
                        <button
                          key={col.name}
                          onClick={() => {
                            playClickSound(700);
                            setSelectedColor(col.name);
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-mono cursor-pointer transition-colors ${
                            currentColor === col.name
                              ? 'border-[#FD8A46] bg-[#202221]'
                              : 'border-[#202221] bg-[#121313] text-[#F3EDD8]/60 hover:border-[#F3EDD8]/40'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-[#070707]"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span>{col.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-xs font-mono text-[#F3EDD8]/70">UNITS:</span>
                    <div className="flex items-center border border-[#202221] bg-[#121313]">
                      <button
                        onClick={() => {
                          playClickSound(600);
                          setQuantity(Math.max(1, quantity - 1));
                        }}
                        className="px-3 py-1 font-mono text-sm hover:text-[#FD8A46] cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-mono text-xs tabular-nums font-bold">
                        {quantity}
                      </span>
                      <button
                        onClick={() => {
                          playClickSound(600);
                          setQuantity(Math.min(selectedProduct.stockCount, quantity + 1));
                        }}
                        className="px-3 py-1 font-mono text-sm hover:text-[#FD8A46] cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: Contiguous Purchase Module */}
                <div className="space-y-3 pt-4 border-t border-[#202221]">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="w-full py-3.5 bg-[#202221] hover:bg-[#FD8A46] hover:text-[#070707] text-[#F3EDD8] border border-[#202221] hover:border-[#FD8A46] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <ShoppingBag size={14} />
                      <span>ADD TO CART</span>
                    </button>

                    <button
                      onClick={handleBuyNow}
                      className="w-full py-3.5 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(253,138,70,0.3)] transition-all cursor-pointer"
                    >
                      <Zap size={14} />
                      <span>BUY NOW</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-[#F3EDD8]/60 pt-2">
                    <button
                      onClick={() => toggleWishlist(selectedProduct.id)}
                      className="flex items-center gap-2 hover:text-[#FD8A46] cursor-pointer"
                    >
                      <Heart size={14} className={isWishlisted ? 'fill-[#FD8A46] text-[#FD8A46]' : ''} />
                      <span>{isWishlisted ? 'IN WISHLIST' : 'SAVE TO WISHLIST'}</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleAskAIAboutProduct}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FD8A46]/10 hover:bg-[#FD8A46]/20 border border-[#FD8A46]/40 text-[#FD8A46] text-xs font-mono tracking-wider cursor-pointer transition-colors"
                      >
                        <Bot size={13} />
                        <span>ASK AI STYLIST</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#F3EDD8]/40 pt-1">
                    <ShieldCheck size={12} className="text-[#FD8A46]" />
                    <span>INCLUDES NATIONWIDE EXPRESS AIR CARGO DISPATCH & 14-DAY ARCHIVE RETURN PRIVILEGE</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
