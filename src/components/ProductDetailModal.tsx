import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductViewer3D } from './ProductViewer3D';
import {
  X,
  ShoppingBag,
  Zap,
  Heart,
  Rotate3d,
  Image as ImageIcon,
  Bot,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Maximize2,
  Check,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

export const ProductDetailModal: React.FC = () => {
  const {
    isPDPModalOpen,
    setIsPDPModalOpen,
    selectedProduct,
    setSelectedProduct,
    addToCart,
    wishlist,
    toggleWishlist,
    playClickSound,
    setIsCheckoutOpen,
    setIsAISupportOpen,
    addNotification,
    products
  } = useStore();

  const [activeTab, setActiveTab] = useState<'3d' | 'gallery'>('3d');
  const [infoTab, setInfoTab] = useState<'specs' | 'shipping' | 'returns'>('specs');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [is3DFullscreen, setIs3DFullscreen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  if (!selectedProduct) return null;

  const currentSize = selectedSize || selectedProduct.sizes[0];
  const currentColor = selectedColor || selectedProduct.colors[0].name;
  const isWishlisted = wishlist.includes(selectedProduct.id);
  const isLowStock = selectedProduct.inStock && selectedProduct.stockCount > 0 && selectedProduct.stockCount <= 5;
  const isOutOfStock = !selectedProduct.inStock || selectedProduct.stockCount === 0;

  // Related products
  const relatedProducts = products
    .filter(p => p.id !== selectedProduct.id && (p.category === selectedProduct.category || p.era === selectedProduct.era))
    .slice(0, 3);

  const handleClose = () => {
    playClickSound(600);
    setIsPDPModalOpen(false);
    setIs3DFullscreen(false);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      addNotification('warning', 'DEPLETED ALLOCATION', `${selectedProduct.name} is currently out of stock.`);
      return;
    }
    playClickSound(880);
    addToCart(selectedProduct, currentSize, currentColor, quantity);
    addNotification(
      'success',
      'ALLOCATED TO DISPATCH',
      `${selectedProduct.name} (${quantity} unit${quantity > 1 ? 's' : ''}, ${currentSize}) added to cart.`
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      addNotification('warning', 'DEPLETED ALLOCATION', `${selectedProduct.name} is currently out of stock.`);
      return;
    }
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
        detail: `Tell me about the design, materials, and sizing recommendations for ${selectedProduct.name} (PKR ${selectedProduct.price.toLocaleString()}).`
      });
      window.dispatchEvent(event);
    }, 150);
  };

  const handleSwitchToRelated = (prod: Product) => {
    playClickSound(800);
    setSelectedProduct(prod);
    setSelectedSize('');
    setSelectedColor('');
    setQuantity(1);
    setSelectedImageIdx(0);
  };

  return (
    <AnimatePresence>
      {isPDPModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#070707]/90 backdrop-blur-md overflow-y-auto"
        >
          {/* Main Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, filter: 'blur(10px) brightness(1.2)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px) brightness(1)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${
              is3DFullscreen ? 'max-w-7xl h-[95vh]' : 'max-w-6xl max-h-[92vh]'
            } bg-[#0e0f0f] border border-[#202221] shadow-[0_0_60px_rgba(0,0,0,0.9)] my-auto text-[#F3EDD8] overflow-hidden flex flex-col transition-all duration-300`}
          >
            {/* Holographic Scanning Laser Line */}
            <motion.div
              initial={{ top: '-10%', opacity: 0.8 }}
              animate={{ top: '110%', opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FD8A46] to-transparent pointer-events-none z-30 shadow-[0_0_15px_#FD8A46]"
            />

            {/* Top Header Bar */}
            <div className="px-5 py-3.5 border-b border-[#202221] flex items-center justify-between font-mono text-xs text-[#F3EDD8]/60 bg-[#070707]">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-[#FD8A46] animate-pulse" />
                <span className="text-[#FD8A46] font-bold">{selectedProduct.sku}</span>
                <span aria-hidden="true">·</span>
                <span className="hidden sm:inline">{selectedProduct.collection}</span>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
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

                {/* Fullscreen 3D Toggle */}
                {activeTab === '3d' && (
                  <button
                    onClick={() => setIs3DFullscreen(!is3DFullscreen)}
                    className="p-1 hover:text-[#FD8A46] transition-colors cursor-pointer hidden md:block"
                    title={is3DFullscreen ? 'Exit Expanded View' : 'Expand 3D View'}
                    aria-label="Toggle Fullscreen"
                  >
                    <Maximize2 size={16} />
                  </button>
                )}

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
              <div
                className={`${
                  is3DFullscreen ? 'lg:col-span-8' : 'lg:col-span-7'
                } bg-[#070707] border-b lg:border-b-0 lg:border-r border-[#202221] relative flex flex-col justify-center min-h-[380px] lg:min-h-[550px] transition-all`}
              >
                {activeTab === '3d' ? (
                  <div className="relative w-full h-full min-h-[440px]">
                    <ProductViewer3D product={selectedProduct} className="w-full h-full min-h-[440px]" />
                    {/* Fallback button if WebGL takes time */}
                    <div className="absolute bottom-3 left-3 bg-[#070707]/80 backdrop-blur-xs border border-[#202221] px-2.5 py-1 text-[10px] font-mono text-[#F3EDD8]/60 flex items-center gap-2">
                      <span>360° ORBITAL TELEMETRY</span>
                      <button
                        onClick={() => setActiveTab('gallery')}
                        className="text-[#FD8A46] hover:underline cursor-pointer"
                      >
                        VIEW 2D STILLS
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-6 space-y-4">
                    <img
                      src={selectedProduct.images[selectedImageIdx] || selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      referrerPolicy="no-referrer"
                      className="max-h-[460px] w-auto object-contain filter contrast-105 border border-[#202221]"
                    />
                    {selectedProduct.images.length > 1 && (
                      <div className="flex gap-2">
                        {selectedProduct.images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIdx(idx)}
                            className={`w-14 h-14 border cursor-pointer overflow-hidden ${
                              selectedImageIdx === idx ? 'border-[#FD8A46] ring-1 ring-[#FD8A46]' : 'border-[#202221]'
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

              {/* Right Product Details & Purchase Module */}
              <div
                className={`${
                  is3DFullscreen ? 'lg:col-span-4' : 'lg:col-span-5'
                } p-6 md:p-8 flex flex-col justify-between space-y-6 bg-[#0e0f0f] transition-all`}
              >
                <div className="space-y-4">
                  {/* Category & Rating */}
                  <div className="flex items-center justify-between text-xs font-mono text-[#F3EDD8]/60">
                    <span>{selectedProduct.category.toUpperCase()} // ERA {selectedProduct.era}</span>
                    {selectedProduct.rating && (
                      <span className="flex items-center gap-1 text-[#FD8A46]">
                        <Star size={12} className="fill-[#FD8A46]" />
                        <span className="font-bold">{selectedProduct.rating.toFixed(1)}</span>
                        {selectedProduct.reviewCount && (
                          <span className="text-[#F3EDD8]/40">({selectedProduct.reviewCount} PATRONS)</span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Title & Stock Indicator */}
                  <div>
                    <h2 className="text-2xl md:text-3xl font-display font-black text-[#F3EDD8] leading-tight uppercase">
                      {selectedProduct.name}
                    </h2>
                    <div className="mt-1 flex items-center gap-2 font-mono text-xs">
                      {isOutOfStock ? (
                        <span className="text-rose-400 font-bold uppercase">● ALLOCATION DEPLETED</span>
                      ) : isLowStock ? (
                        <span className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                          CRITICAL STOCK: ONLY {selectedProduct.stockCount} UNITS REMAINING
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                          AUTHENTICATED // READY FOR DISPATCH
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing with Original / Discount Price */}
                  <div className="flex items-baseline gap-3 pt-1">
                    <span className="text-2xl md:text-3xl font-mono font-bold text-[#FD8A46] tabular-nums">
                      PKR {selectedProduct.price.toLocaleString()}
                    </span>
                    {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                      <>
                        <span className="text-sm font-mono text-[#F3EDD8]/40 line-through tabular-nums">
                          PKR {selectedProduct.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-xs font-mono text-emerald-400 px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-500/30 uppercase">
                          SAVE PKR {(selectedProduct.originalPrice - selectedProduct.price).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>

                  <p className="text-xs md:text-sm text-[#F3EDD8]/75 font-sans leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  {/* Size Selector */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-[#F3EDD8]/70 mb-2">
                      <span>CHASSIS SIZE:</span>
                      <button
                        onClick={handleAskAIAboutProduct}
                        className="text-[#FD8A46] hover:underline flex items-center gap-1 cursor-pointer text-[11px]"
                      >
                        <Bot size={12} />
                        <span>AI SIZE ADVISOR</span>
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
                          className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-colors cursor-pointer border ${
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
                  <div>
                    <div className="text-xs font-mono text-[#F3EDD8]/70 mb-2">
                      COLOR FINISH: <span className="text-[#FD8A46] font-bold">{currentColor}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
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
                  <div className="flex items-center gap-4">
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
                        disabled={quantity >= selectedProduct.stockCount}
                        onClick={() => {
                          playClickSound(600);
                          setQuantity(Math.min(selectedProduct.stockCount, quantity + 1));
                        }}
                        className={`px-3 py-1 font-mono text-sm cursor-pointer ${
                          quantity >= selectedProduct.stockCount
                            ? 'text-[#F3EDD8]/20 cursor-not-allowed'
                            : 'hover:text-[#FD8A46]'
                        }`}
                      >
                        +
                      </button>
                    </div>
                    {isLowStock && (
                      <span className="text-[11px] font-mono text-amber-400">
                        MAX: {selectedProduct.stockCount}
                      </span>
                    )}
                  </div>

                  {/* Tabbed Specs, Shipping & Return Guarantee */}
                  <div className="border-t border-[#202221] pt-4">
                    <div className="flex border-b border-[#202221] gap-4 font-mono text-xs mb-3">
                      <button
                        onClick={() => setInfoTab('specs')}
                        className={`pb-1 cursor-pointer transition-colors ${
                          infoTab === 'specs'
                            ? 'text-[#FD8A46] border-b-2 border-[#FD8A46] font-bold'
                            : 'text-[#F3EDD8]/50 hover:text-[#F3EDD8]'
                        }`}
                      >
                        SPECIFICATIONS
                      </button>
                      <button
                        onClick={() => setInfoTab('shipping')}
                        className={`pb-1 cursor-pointer transition-colors ${
                          infoTab === 'shipping'
                            ? 'text-[#FD8A46] border-b-2 border-[#FD8A46] font-bold'
                            : 'text-[#F3EDD8]/50 hover:text-[#F3EDD8]'
                        }`}
                      >
                        SHIPPING
                      </button>
                      <button
                        onClick={() => setInfoTab('returns')}
                        className={`pb-1 cursor-pointer transition-colors ${
                          infoTab === 'returns'
                            ? 'text-[#FD8A46] border-b-2 border-[#FD8A46] font-bold'
                            : 'text-[#F3EDD8]/50 hover:text-[#F3EDD8]'
                        }`}
                      >
                        RETURNS
                      </button>
                    </div>

                    <div className="font-mono text-xs text-[#F3EDD8]/70 space-y-1.5 min-h-[70px]">
                      {infoTab === 'specs' && (
                        <div className="space-y-1">
                          {selectedProduct.details.map((detail, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-[#FD8A46] mt-0.5">❯</span>
                              <span>{detail}</span>
                            </div>
                          ))}
                          <div className="text-[11px] text-[#F3EDD8]/50 pt-1">
                            MATERIALS: {selectedProduct.materials.join(', ')}
                          </div>
                        </div>
                      )}
                      {infoTab === 'shipping' && (
                        <div className="space-y-1 leading-relaxed">
                          <p>
                            • Express Air Cargo dispatch nationwide across Pakistan (24-48 hours delivery).
                          </p>
                          <p>• Complimentary armored delivery on allocations exceeding PKR 25,000.</p>
                          <p>• Every dispatch includes serialized tamper-evident security sealing.</p>
                        </div>
                      )}
                      {infoTab === 'returns' && (
                        <div className="space-y-1 leading-relaxed">
                          <p>
                            • 14-Day Archival Inspection Privilege: Inspect garments in your personal sanctum.
                          </p>
                          <p>• Complimentary courier pickup arranged for size exchange or return.</p>
                          <p>• Unworn items with original cyber tags eligible for 100% refund.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: Contiguous Purchase Module */}
                <div className="space-y-3 pt-4 border-t border-[#202221]">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={isOutOfStock}
                      onClick={handleAddToCart}
                      className={`w-full py-3.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isOutOfStock
                          ? 'bg-[#202221] text-[#F3EDD8]/30 cursor-not-allowed'
                          : justAdded
                          ? 'bg-emerald-500 text-[#070707]'
                          : 'bg-[#202221] hover:bg-[#FD8A46] hover:text-[#070707] text-[#F3EDD8] border border-[#202221] hover:border-[#FD8A46]'
                      }`}
                    >
                      {justAdded ? (
                        <>
                          <Check size={14} />
                          <span>ALLOCATED</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={14} />
                          <span>ADD TO CART</span>
                        </>
                      )}
                    </button>

                    <button
                      disabled={isOutOfStock}
                      onClick={handleBuyNow}
                      className={`w-full py-3.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isOutOfStock
                          ? 'bg-[#202221] text-[#F3EDD8]/30 cursor-not-allowed'
                          : 'bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] shadow-[0_0_20px_rgba(253,138,70,0.3)]'
                      }`}
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

                    <button
                      onClick={handleAskAIAboutProduct}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FD8A46]/10 hover:bg-[#FD8A46]/20 border border-[#FD8A46]/40 text-[#FD8A46] text-xs font-mono tracking-wider cursor-pointer transition-colors"
                    >
                      <Bot size={13} />
                      <span>ASK ARCHIVE AI</span>
                    </button>
                  </div>

                  {/* Related Artifacts Mini-Carousel */}
                  {relatedProducts.length > 0 && (
                    <div className="pt-3 border-t border-[#202221]">
                      <div className="text-[11px] font-mono text-[#FD8A46] mb-2 uppercase tracking-wider">
                        COMPLEMENTARY ARCHIVAL ALLOCATIONS:
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {relatedProducts.map(rel => (
                          <div
                            key={rel.id}
                            onClick={() => handleSwitchToRelated(rel)}
                            className="p-1.5 bg-[#121313] border border-[#202221] hover:border-[#FD8A46] cursor-pointer transition-colors flex flex-col justify-between"
                          >
                            <img
                              src={rel.images[0]}
                              alt={rel.name}
                              referrerPolicy="no-referrer"
                              className="w-full aspect-[4/3] object-cover mb-1"
                            />
                            <div className="text-[10px] font-mono font-bold truncate text-[#F3EDD8]">
                              {rel.name.split('—')[1] || rel.name}
                            </div>
                            <div className="text-[9px] font-mono text-[#FD8A46]">
                              PKR {rel.price.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
