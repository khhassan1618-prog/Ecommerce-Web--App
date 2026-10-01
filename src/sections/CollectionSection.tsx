import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { ShoppingBag, Eye, Heart, Rotate3d, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const CollectionSection: React.FC = () => {
  const {
    products,
    addToCart,
    setSelectedProduct,
    setIsPDPModalOpen,
    wishlist,
    toggleWishlist,
    playClickSound,
    recordProductView
  } = useStore();

  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Outerwear', 'Footwear', 'Hoodies', 'Tops', 'Bags', 'Accessories'];

  const filteredProducts = activeCategory === 'ALL'
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleOpenPDP = (product: Product) => {
    playClickSound(850);
    recordProductView(product.id);
    setSelectedProduct(product);
    setIsPDPModalOpen(true);
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, product.sizes[0], product.colors[0].name, 1);
  };

  const handleWishlist = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    toggleWishlist(productId);
  };

  return (
    <section id="collection" className="relative py-28 px-4 md:px-8 lg:px-12 bg-[#070707] border-b border-[#202221]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-[#202221] pb-6 mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 text-xs font-mono text-[#FD8A46] tracking-widest uppercase mb-2">
              <span className="w-2 h-2 bg-[#FD8A46]" />
              <span>ACTIVE ARCHIVE DISPATCH // ALLOCATIONS OPEN</span>
            </div>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tighter text-[#F3EDD8] uppercase">
              EXPLORE THE COLLECTION
            </h2>
          </div>

          {/* Interactive Category Segmented Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1 bg-[#121313] border border-[#202221]">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  playClickSound(700);
                  setActiveCategory(cat);
                }}
                className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#FD8A46] text-[#070707] font-bold shadow-xs'
                    : 'text-[#F3EDD8]/60 hover:text-[#F3EDD8]'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Editorial Product Grid: Staggered Architecture with Motion Parallax Lift */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, idx) => {
            const isWishlisted = wishlist.includes(product.id);
            const isFeatured = idx === 0 || idx === 5;

            return (
              <motion.div
                key={product.id}
                whileHover={{ y: -4, transition: { duration: 0.25, ease: 'easeOut' } }}
                onClick={() => handleOpenPDP(product)}
                className={`group relative border border-[#202221] hover:border-[#FD8A46]/70 bg-[#121313] flex flex-col justify-between transition-colors duration-300 cursor-pointer overflow-hidden ${
                  isFeatured ? 'md:col-span-2 lg:col-span-2' : 'col-span-1'
                }`}
              >
                {/* Top Card Bar */}
                <div className="p-4 border-b border-[#202221] flex items-center justify-between font-mono text-xs text-[#F3EDD8]/60 bg-[#0c0d0d]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#FD8A46] font-bold">{product.sku}</span>
                    <span>·</span>
                    <span className="text-[11px] truncate max-w-[140px] sm:max-w-[220px]">{product.collection}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => handleWishlist(e, product.id)}
                      className="p-1 hover:text-[#FD8A46] transition-colors cursor-pointer"
                      title="Save to Wishlist"
                      aria-label="Save to Wishlist"
                    >
                      <Heart
                        size={15}
                        className={isWishlisted ? 'fill-[#FD8A46] text-[#FD8A46]' : 'text-[#F3EDD8]/50'}
                      />
                    </button>
                  </div>
                </div>

                {/* Imagery Area with Film Scrim & 3D Badge */}
                <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-[#070707]">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center filter contrast-105 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-transparent opacity-60" />

                  {/* 3D Inspect Badge */}
                  <div className="absolute top-3 left-3 bg-[#070707]/80 backdrop-blur-xs border border-[#202221] px-2.5 py-1 flex items-center gap-1.5 text-[10px] font-mono text-[#FD8A46]">
                    <Rotate3d size={12} />
                    <span>3D CHASSIS READY</span>
                  </div>

                  {/* Era metadata */}
                  <div className="absolute top-3 right-3 text-[10px] font-mono text-[#F3EDD8]/60 bg-[#070707]/80 px-2 py-1 border border-[#202221]">
                    ERA {product.era}
                  </div>

                  {/* Quick Action Overlay on hover */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={e => handleQuickAdd(e, product)}
                      className="px-3 py-1.5 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
                    >
                      <ShoppingBag size={13} />
                      <span>QUICK ADD</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Details & Pricing */}
                <div className="p-5 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-xl md:text-2xl font-display font-bold text-[#F3EDD8] group-hover:text-[#FD8A46] transition-colors mb-1.5">
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#F3EDD8]/70 font-sans line-clamp-2 mb-4">
                      {product.tagline}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#202221] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-[#F3EDD8]/50">SPECULATIVE PRICING</div>
                      <div className="text-lg md:text-xl font-mono font-bold text-[#FD8A46] tabular-nums">
                        PKR {product.price.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs text-[#F3EDD8]/70 group-hover:text-[#F3EDD8]">
                      <span>INSPECT 3D DETAILS</span>
                      <Eye size={14} className="text-[#FD8A46]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Archival Custom Advisory Banner */}
        <div className="mt-16 bg-[#121313] border border-[#202221] p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#FD8A46]/10 border border-[#FD8A46]/30 text-[#FD8A46]">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="font-display font-bold text-base text-[#F3EDD8]">
                NEED TAILORED ARCHIVE SIZING?
              </div>
              <div className="text-xs text-[#F3EDD8]/60 font-mono mt-0.5">
                Our contextual AI Stylist can calculate your architectural fit based on height & build.
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound(900);
              const event = new CustomEvent('open-ai-chat-prompt', {
                detail: 'WHAT SIZE SHOULD I GET?'
              });
              window.dispatchEvent(event);
            }}
            className="px-5 py-3 bg-[#202221] hover:bg-[#FD8A46] hover:text-[#070707] text-[#F3EDD8] border border-[#202221] font-mono text-xs tracking-wider uppercase font-bold transition-colors cursor-pointer shrink-0"
          >
            CONSULT AI STYLIST ➔
          </button>
        </div>
      </div>
    </section>
  );
};
