import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Search, X, SlidersHorizontal, ArrowUpDown, RotateCcw, Sparkles } from 'lucide-react';

export const CollectionSection: React.FC = () => {
  const { products, playClickSound } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [activeEra, setActiveEra] = useState<string>('ALL');
  const [activeAvailability, setActiveAvailability] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK'>('ALL');
  const [activeSize, setActiveSize] = useState<string>('ALL');
  const [activeColor, setActiveColor] = useState<string>('ALL');
  const [priceTier, setPriceTier] = useState<'ALL' | 'UNDER_25K' | '25K_45K' | 'OVER_45K'>('ALL');
  const [sortBy, setSortBy] = useState<'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING' | 'NEWEST'>('FEATURED');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const categories = ['ALL', 'Outerwear', 'Footwear', 'Hoodies', 'Tops', 'Bags', 'Accessories'];
  const eras = ['ALL', '1970', '1984', '1999', '2026', '2091'];
  const commonSizes = ['ALL', 'S', 'M', 'L', 'XL', '42 EU'];
  const commonColors = ['ALL', 'Onyx', 'Titanium', 'Phosphor', 'Chrome', 'Cobalt'];

  const searchSuggestions = ['QUANTUM', 'CHROME', 'HOODIE', 'TEE', 'BAG', 'WATCH'];

  // Multi-tier filtering
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = product.name.toLowerCase().includes(q);
          const matchSku = product.sku.toLowerCase().includes(q);
          const matchCategory = product.category.toLowerCase().includes(q);
          const matchDesc = product.description.toLowerCase().includes(q);
          const matchMaterials = product.materials.some(m => m.toLowerCase().includes(q));
          if (!matchName && !matchSku && !matchCategory && !matchDesc && !matchMaterials) {
            return false;
          }
        }

        // Category filter
        if (activeCategory !== 'ALL' && product.category !== activeCategory) {
          return false;
        }

        // Era filter
        if (activeEra !== 'ALL' && product.era !== activeEra) {
          return false;
        }

        // Size filter
        if (activeSize !== 'ALL') {
          const hasSize = product.sizes.some(s => s.toLowerCase().includes(activeSize.toLowerCase()));
          if (!hasSize) return false;
        }

        // Color filter
        if (activeColor !== 'ALL') {
          const hasColor = product.colors.some(c => c.name.toLowerCase().includes(activeColor.toLowerCase()));
          if (!hasColor) return false;
        }

        // Availability filter
        if (activeAvailability === 'IN_STOCK') {
          if (!product.inStock || product.stockCount === 0) return false;
        } else if (activeAvailability === 'LOW_STOCK') {
          if (!product.inStock || product.stockCount <= 0 || product.stockCount > 5) return false;
        }

        // Price tier
        if (priceTier === 'UNDER_25K' && product.price >= 25000) return false;
        if (priceTier === '25K_45K' && (product.price < 25000 || product.price > 45000)) return false;
        if (priceTier === 'OVER_45K' && product.price <= 45000) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'PRICE_ASC') return a.price - b.price;
        if (sortBy === 'PRICE_DESC') return b.price - a.price;
        if (sortBy === 'RATING') return (b.rating || 5) - (a.rating || 5);
        if (sortBy === 'NEWEST') return parseInt(b.era) - parseInt(a.era);
        // Default FEATURED
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, searchQuery, activeCategory, activeEra, activeSize, activeColor, activeAvailability, priceTier, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    activeCategory !== 'ALL' ||
    activeEra !== 'ALL' ||
    activeSize !== 'ALL' ||
    activeColor !== 'ALL' ||
    activeAvailability !== 'ALL' ||
    priceTier !== 'ALL' ||
    sortBy !== 'FEATURED';

  const clearAllFilters = () => {
    playClickSound(700);
    setSearchQuery('');
    setActiveCategory('ALL');
    setActiveEra('ALL');
    setActiveSize('ALL');
    setActiveColor('ALL');
    setActiveAvailability('ALL');
    setPriceTier('ALL');
    setSortBy('FEATURED');
  };

  return (
    <section id="collection" className="relative py-28 px-4 md:px-8 lg:px-12 bg-[#070707] border-b border-[#202221]">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-[#202221] pb-6 gap-6">
          <div>
            <div className="flex items-center gap-3 text-xs font-mono text-[#FD8A46] tracking-widest uppercase mb-2">
              <span className="w-2 h-2 bg-[#FD8A46]" />
              <span>ARCHIVE DISPATCH // VERSION 2.0 CATALOG</span>
            </div>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tighter text-[#F3EDD8] uppercase">
              EXPLORE THE COLLECTION
            </h2>
          </div>

          {/* Quick Stats & Mobile Filter Toggle */}
          <div className="flex items-center gap-4">
            <div className="font-mono text-xs text-[#F3EDD8]/70">
              ALLOCATED: <span className="text-[#FD8A46] font-bold">{filteredProducts.length}</span> / {products.length} ARTIFACTS
            </div>
            <button
              onClick={() => {
                playClickSound(800);
                setShowFiltersMobile(!showFiltersMobile);
              }}
              className="lg:hidden px-3.5 py-2 bg-[#121313] border border-[#202221] hover:border-[#FD8A46] text-xs font-mono text-[#F3EDD8] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <SlidersHorizontal size={14} className="text-[#FD8A46]" />
              <span>{showFiltersMobile ? 'HIDE FILTERS' : 'ADVANCED FILTERS'}</span>
            </button>
          </div>
        </div>

        {/* Search & Discovery Control Bar */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input with Clear Button */}
            <div className="md:col-span-8 lg:col-span-8 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FD8A46]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="SEARCH BY GARMENT, SKU, MEMBRANE TEXTILE, OR CHRONO-ERA..."
                className="w-full bg-[#121313] border border-[#202221] focus:border-[#FD8A46] pl-11 pr-10 py-3 font-mono text-xs text-[#F3EDD8] placeholder-[#F3EDD8]/40 outline-none uppercase transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F3EDD8]/50 hover:text-[#FD8A46] p-1 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sorting Dropdown */}
            <div className="md:col-span-4 lg:col-span-4 relative">
              <div className="flex items-center bg-[#121313] border border-[#202221] px-3 py-1.5 font-mono text-xs text-[#F3EDD8]">
                <ArrowUpDown size={14} className="text-[#FD8A46] mr-2 shrink-0" />
                <span className="text-[#F3EDD8]/50 mr-2 text-[10px] uppercase">SORT:</span>
                <select
                  value={sortBy}
                  onChange={e => {
                    playClickSound(750);
                    setSortBy(e.target.value as any);
                  }}
                  className="bg-transparent text-[#F3EDD8] outline-none cursor-pointer w-full text-xs font-mono uppercase"
                >
                  <option value="FEATURED" className="bg-[#121313]">FEATURED SPECIMENS</option>
                  <option value="PRICE_ASC" className="bg-[#121313]">PRICE: LOW ➔ HIGH</option>
                  <option value="PRICE_DESC" className="bg-[#121313]">PRICE: HIGH ➔ LOW</option>
                  <option value="RATING" className="bg-[#121313]">ARCHIVAL RATING ★</option>
                  <option value="NEWEST" className="bg-[#121313]">SPECULATIVE ERA</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Search Suggestions */}
          {!searchQuery && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] font-mono text-[#F3EDD8]/50">
              <span className="shrink-0 text-[#FD8A46]">SUGGESTIONS:</span>
              {searchSuggestions.map(s => (
                <button
                  key={s}
                  onClick={() => {
                    playClickSound(750);
                    setSearchQuery(s);
                  }}
                  className="px-2 py-0.5 bg-[#121313] hover:bg-[#202221] hover:text-[#FD8A46] border border-[#202221] transition-colors cursor-pointer shrink-0"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Matrix (Desktop & Toggleable on Mobile) */}
        <div className={`space-y-4 pt-2 ${showFiltersMobile ? 'block' : 'hidden lg:block'}`}>
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-[#F3EDD8]/50 mr-2 uppercase tracking-wider">
              CATEGORY:
            </span>
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
                    : 'bg-[#121313] text-[#F3EDD8]/70 hover:text-[#F3EDD8] border border-[#202221]'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Secondary Filters Bar: Era, Price & Availability */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#202221] font-mono text-xs">
            {/* Era Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#F3EDD8]/50 uppercase">ERA:</span>
              {eras.map(era => (
                <button
                  key={era}
                  onClick={() => {
                    playClickSound(700);
                    setActiveEra(era);
                  }}
                  className={`px-2.5 py-1 text-[11px] transition-colors cursor-pointer ${
                    activeEra === era
                      ? 'bg-[#F3EDD8] text-[#070707] font-bold'
                      : 'text-[#F3EDD8]/60 hover:text-[#F3EDD8] bg-[#121313] border border-[#202221]'
                  }`}
                >
                  {era}
                </button>
              ))}
            </div>

            {/* Price Tiers */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#F3EDD8]/50 uppercase">PRICE:</span>
              <button
                onClick={() => setPriceTier('ALL')}
                className={`px-2.5 py-1 text-[11px] cursor-pointer transition-colors ${
                  priceTier === 'ALL'
                    ? 'bg-[#FD8A46] text-[#070707] font-bold'
                    : 'text-[#F3EDD8]/60 hover:text-[#F3EDD8] bg-[#121313] border border-[#202221]'
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => setPriceTier('UNDER_25K')}
                className={`px-2.5 py-1 text-[11px] cursor-pointer transition-colors ${
                  priceTier === 'UNDER_25K'
                    ? 'bg-[#FD8A46] text-[#070707] font-bold'
                    : 'text-[#F3EDD8]/60 hover:text-[#F3EDD8] bg-[#121313] border border-[#202221]'
                }`}
              >
                &lt; 25K
              </button>
              <button
                onClick={() => setPriceTier('25K_45K')}
                className={`px-2.5 py-1 text-[11px] cursor-pointer transition-colors ${
                  priceTier === '25K_45K'
                    ? 'bg-[#FD8A46] text-[#070707] font-bold'
                    : 'text-[#F3EDD8]/60 hover:text-[#F3EDD8] bg-[#121313] border border-[#202221]'
                }`}
              >
                25K - 45K
              </button>
              <button
                onClick={() => setPriceTier('OVER_45K')}
                className={`px-2.5 py-1 text-[11px] cursor-pointer transition-colors ${
                  priceTier === 'OVER_45K'
                    ? 'bg-[#FD8A46] text-[#070707] font-bold'
                    : 'text-[#F3EDD8]/60 hover:text-[#F3EDD8] bg-[#121313] border border-[#202221]'
                }`}
              >
                45K+
              </button>
            </div>

            {/* Stock Availability */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#F3EDD8]/50 uppercase">STOCK:</span>
              <button
                onClick={() => setActiveAvailability('ALL')}
                className={`px-2.5 py-1 text-[11px] cursor-pointer transition-colors ${
                  activeAvailability === 'ALL'
                    ? 'bg-[#F3EDD8] text-[#070707] font-bold'
                    : 'text-[#F3EDD8]/60 hover:text-[#F3EDD8] bg-[#121313] border border-[#202221]'
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => setActiveAvailability('IN_STOCK')}
                className={`px-2.5 py-1 text-[11px] cursor-pointer transition-colors ${
                  activeAvailability === 'IN_STOCK'
                    ? 'bg-emerald-500 text-[#070707] font-bold'
                    : 'text-[#F3EDD8]/60 hover:text-[#F3EDD8] bg-[#121313] border border-[#202221]'
                }`}
              >
                IN STOCK
              </button>
              <button
                onClick={() => setActiveAvailability('LOW_STOCK')}
                className={`px-2.5 py-1 text-[11px] cursor-pointer transition-colors ${
                  activeAvailability === 'LOW_STOCK'
                    ? 'bg-amber-500 text-[#070707] font-bold'
                    : 'text-[#F3EDD8]/60 hover:text-[#F3EDD8] bg-[#121313] border border-[#202221]'
                }`}
              >
                LOW STOCK
              </button>
            </div>
          </div>

          {/* Size & Color Filter Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#202221] font-mono text-xs">
            {/* Sizes */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#F3EDD8]/50 uppercase">SIZE:</span>
              {commonSizes.map(sz => (
                <button
                  key={sz}
                  onClick={() => {
                    playClickSound(700);
                    setActiveSize(sz);
                  }}
                  className={`px-2.5 py-1 text-[11px] transition-colors cursor-pointer ${
                    activeSize === sz
                      ? 'bg-[#FD8A46] text-[#070707] font-bold'
                      : 'text-[#F3EDD8]/60 hover:text-[#F3EDD8] bg-[#121313] border border-[#202221]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Colors */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#F3EDD8]/50 uppercase">COLOR PALETTE:</span>
              {commonColors.map(clr => (
                <button
                  key={clr}
                  onClick={() => {
                    playClickSound(700);
                    setActiveColor(clr);
                  }}
                  className={`px-2.5 py-1 text-[11px] transition-colors cursor-pointer ${
                    activeColor === clr
                      ? 'bg-[#F3EDD8] text-[#070707] font-bold'
                      : 'text-[#F3EDD8]/60 hover:text-[#F3EDD8] bg-[#121313] border border-[#202221]'
                  }`}
                >
                  {clr}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filter Chips & Reset Action */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 text-xs font-mono text-[#F3EDD8]/70">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-[#FD8A46]">ACTIVE CRITERIA:</span>
                {searchQuery && (
                  <span className="px-2 py-0.5 bg-[#121313] border border-[#FD8A46]/60 text-[#FD8A46] flex items-center gap-1.5">
                    QUERY: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-white cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {activeCategory !== 'ALL' && (
                  <span className="px-2 py-0.5 bg-[#121313] border border-[#202221] flex items-center gap-1.5">
                    CATEGORY: {activeCategory}
                    <button onClick={() => setActiveCategory('ALL')} className="hover:text-[#FD8A46] cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {activeEra !== 'ALL' && (
                  <span className="px-2 py-0.5 bg-[#121313] border border-[#202221] flex items-center gap-1.5">
                    ERA: {activeEra}
                    <button onClick={() => setActiveEra('ALL')} className="hover:text-[#FD8A46] cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {activeSize !== 'ALL' && (
                  <span className="px-2 py-0.5 bg-[#121313] border border-[#202221] flex items-center gap-1.5">
                    SIZE: {activeSize}
                    <button onClick={() => setActiveSize('ALL')} className="hover:text-[#FD8A46] cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {activeColor !== 'ALL' && (
                  <span className="px-2 py-0.5 bg-[#121313] border border-[#202221] flex items-center gap-1.5">
                    COLOR: {activeColor}
                    <button onClick={() => setActiveColor('ALL')} className="hover:text-[#FD8A46] cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {priceTier !== 'ALL' && (
                  <span className="px-2 py-0.5 bg-[#121313] border border-[#202221] flex items-center gap-1.5">
                    PRICE: {priceTier}
                    <button onClick={() => setPriceTier('ALL')} className="hover:text-[#FD8A46] cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {activeAvailability !== 'ALL' && (
                  <span className="px-2 py-0.5 bg-[#121313] border border-[#202221] flex items-center gap-1.5">
                    AVAILABILITY: {activeAvailability}
                    <button onClick={() => setActiveAvailability('ALL')} className="hover:text-[#FD8A46] cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>

              <button
                onClick={clearAllFilters}
                className="text-xs text-[#FD8A46] hover:text-[#F3EDD8] underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw size={12} />
                <span>CLEAR ALL FILTERS</span>
              </button>
            </div>
          )}
        </div>

        {/* Product Grid or Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center font-mono border border-dashed border-[#202221] bg-[#0c0d0d] p-8 space-y-4">
            <div className="w-12 h-12 border border-[#FD8A46] text-[#FD8A46] flex items-center justify-center mx-auto">
              <Search size={24} />
            </div>
            <div className="text-sm font-bold text-[#F3EDD8] uppercase tracking-wider">
              NO SPECIMENS MATCH CURRENT ARCHIVE CRITERIA
            </div>
            <p className="text-xs text-[#F3EDD8]/60 max-w-md mx-auto leading-relaxed">
              No declassified garments correspond to the selected telemetry parameters. Try relaxing your search query or reset the filter matrix.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-4 px-6 py-2.5 bg-[#FD8A46] text-[#070707] font-mono text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer hover:bg-[#F3EDD8]"
            >
              RESET ALL DISCOVERY FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                featured={idx === 0 && activeCategory === 'ALL' && !searchQuery}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
