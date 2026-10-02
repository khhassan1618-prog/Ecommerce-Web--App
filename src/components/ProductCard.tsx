import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { ShoppingBag, Eye, Heart, Rotate3d, Star, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, featured = false }) => {
  const {
    addToCart,
    setSelectedProduct,
    setIsPDPModalOpen,
    wishlist,
    toggleWishlist,
    playClickSound,
    recordProductView,
    addNotification
  } = useStore();

  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const isLowStock = product.inStock && product.stockCount > 0 && product.stockCount <= 5;
  const isOutOfStock = !product.inStock || product.stockCount === 0;

  const handleOpenPDP = () => {
    playClickSound(850);
    recordProductView(product.id);
    setSelectedProduct(product);
    setIsPDPModalOpen(true);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      addNotification('warning', 'OUT OF STOCK', `${product.name} is currently depleted.`);
      return;
    }
    playClickSound(900);
    addToCart(product, product.sizes[0], product.colors[0].name, 1);
    addNotification('success', 'MANIFEST ALLOCATED', `Added ${product.name} (Size: ${product.sizes[0]}) to cart.`);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound(750);
    toggleWishlist(product.id);
    if (!isWishlisted) {
      addNotification('info', 'SAVED TO ARCHIVE', `${product.name} added to your wishlist.`);
    }
  };

  return (
    <motion.article
      whileHover={{ y: -4, transition: { duration: 0.25, ease: 'easeOut' } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleOpenPDP}
      className={`group relative border border-[#202221] hover:border-[#FD8A46]/70 bg-[#121313] flex flex-col justify-between transition-colors duration-300 cursor-pointer overflow-hidden ${
        featured ? 'md:col-span-2 lg:col-span-2' : 'col-span-1'
      }`}
    >
      {/* Top Card Bar */}
      <div className="p-3.5 border-b border-[#202221] flex items-center justify-between font-mono text-xs text-[#F3EDD8]/60 bg-[#0c0d0d]">
        <div className="flex items-center gap-2">
          <span className="text-[#FD8A46] font-bold">{product.sku}</span>
          <span aria-hidden="true">·</span>
          <span className="text-[11px] truncate max-w-[140px] sm:max-w-[200px] text-[#F3EDD8]/70">
            {product.collection}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleWishlistToggle}
            className="p-1 hover:text-[#FD8A46] transition-colors cursor-pointer"
            title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
            aria-label={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
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
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter contrast-105 group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* 3D Inspect Indicator */}
        <div className="absolute top-3 left-3 bg-[#070707]/85 backdrop-blur-xs border border-[#202221] px-2.5 py-1 flex items-center gap-1.5 text-[10px] font-mono text-[#FD8A46]">
          <Rotate3d size={12} />
          <span>3D CHASSIS</span>
        </div>

        {/* Era Tag */}
        <div className="absolute top-3 right-3 text-[10px] font-mono text-[#F3EDD8]/70 bg-[#070707]/85 px-2.5 py-1 border border-[#202221]">
          ERA {product.era}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute bottom-3 left-3">
          {isOutOfStock ? (
            <span className="text-[10px] font-mono bg-rose-950/80 text-rose-300 border border-rose-500/40 px-2 py-0.5 uppercase tracking-wider">
              DEPLETED
            </span>
          ) : isLowStock ? (
            <span className="text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-400 animate-pulse rounded-full" />
              LOW STOCK [{product.stockCount} LEFT]
            </span>
          ) : (
            <span className="text-[10px] font-mono bg-[#070707]/80 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              ALLOCATED
            </span>
          )}
        </div>

        {/* Quick Action Overlay on hover */}
        <div
          className={`absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#070707] to-transparent transition-opacity duration-200 flex items-center justify-end gap-2 ${
            isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0'
          }`}
        >
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              handleOpenPDP();
            }}
            className="px-3 py-1.5 bg-[#121313]/90 hover:bg-[#202221] border border-[#202221] hover:border-[#FD8A46] text-[#F3EDD8] font-mono text-[11px] tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye size={12} />
            <span>INSPECT</span>
          </button>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleQuickAdd}
            className={`px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
              isOutOfStock
                ? 'bg-[#202221] text-[#F3EDD8]/40 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-500 text-[#070707]'
                : 'bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707]'
            }`}
          >
            {justAdded ? (
              <>
                <Check size={12} />
                <span>ADDED</span>
              </>
            ) : (
              <>
                <ShoppingBag size={12} />
                <span>ALLOCATE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-grow space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[#F3EDD8]/50 mb-1">
            <span>{product.category.toUpperCase()}</span>
            {product.rating && (
              <span className="flex items-center gap-1 text-[#FD8A46]">
                <Star size={11} className="fill-[#FD8A46]" />
                <span className="font-bold">{product.rating.toFixed(1)}</span>
                {product.reviewCount && (
                  <span className="text-[#F3EDD8]/40">({product.reviewCount})</span>
                )}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-display font-extrabold text-[#F3EDD8] group-hover:text-[#FD8A46] transition-colors uppercase leading-snug">
            {product.name}
          </h3>

          <p className="text-xs text-[#F3EDD8]/65 font-sans mt-1 line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>
        </div>

        {/* Pricing & Allocation Footnote */}
        <div className="pt-3 border-t border-[#202221] flex items-center justify-between font-mono">
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-bold text-[#FD8A46] tabular-nums">
              PKR {product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-[#F3EDD8]/40 line-through tabular-nums">
                PKR {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="text-[10px] text-[#F3EDD8]/40 uppercase tracking-widest">
            {product.sizes.length} SIZES READY
          </div>
        </div>
      </div>
    </motion.article>
  );
};
