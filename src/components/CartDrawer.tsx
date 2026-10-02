import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, ArrowRight, Tag, ShieldCheck, Bookmark, BookmarkCheck, Sparkles, Plus, Minus } from 'lucide-react';
import { Product } from '../types';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    saveForLater,
    moveToCartFromSaved,
    subtotal,
    discount,
    discountCode,
    shipping,
    total,
    applyCoupon,
    setIsCheckoutOpen,
    playClickSound,
    products,
    addToCart,
    setSelectedProduct,
    setIsPDPModalOpen
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ message: string; success: boolean } | null>(null);

  if (!isCartOpen) return null;

  const activeItems = cart.filter(item => !item.savedForLater);
  const savedItems = cart.filter(item => item.savedForLater);

  // Recommendations: products not in cart
  const cartProductIds = new Set(cart.map(item => item.product.id));
  const suggestedProducts = products.filter(p => !cartProductIds.has(p.id)).slice(0, 2);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    playClickSound(850);
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
  };

  const handleProceedCheckout = () => {
    if (activeItems.length === 0) return;
    playClickSound(950);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleInspectSuggested = (prod: Product) => {
    playClickSound(800);
    setSelectedProduct(prod);
    setIsPDPModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#070707]/80 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-[#0e0f0f] border-l border-[#202221] shadow-2xl flex flex-col justify-between h-full text-[#F3EDD8] animate-in slide-in-from-right duration-300">
        {/* Cart Header */}
        <div className="p-5 border-b border-[#202221] flex items-center justify-between font-mono bg-[#070707]">
          <div>
            <div className="text-xs text-[#FD8A46] tracking-widest uppercase">DISPATCH MANIFEST // V2</div>
            <div className="text-lg font-display font-bold text-[#F3EDD8]">
              SHOPPING CART [{activeItems.length}]
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound(600);
              setIsCartOpen(false);
            }}
            className="p-1 hover:text-[#FD8A46] transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Container: Active Items + Saved Items + Suggestions */}
        <div className="flex-grow overflow-y-auto p-5 space-y-6">
          {/* Active Items Section */}
          {activeItems.length === 0 ? (
            <div className="py-16 text-center font-mono space-y-3">
              <div className="text-[#F3EDD8]/30 text-xs">ACTIVE MANIFEST IS EMPTY</div>
              <p className="text-xs text-[#F3EDD8]/60 max-w-xs mx-auto">
                Explore our declassified collection to allocate archival garments for dispatch.
              </p>
              <button
                onClick={() => {
                  playClickSound(700);
                  setIsCartOpen(false);
                  const el = document.getElementById('collection');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-4 px-4 py-2 bg-[#202221] hover:bg-[#FD8A46] hover:text-[#070707] text-xs font-mono tracking-wider transition-colors cursor-pointer"
              >
                VIEW COLLECTION ➔
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeItems.map(item => {
                const isItemLowStock = item.product.inStock && item.product.stockCount <= 5;
                return (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color}`}
                    className="p-3 bg-[#121313] border border-[#202221] flex gap-3 relative group"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-24 object-cover border border-[#202221] shrink-0 bg-[#070707]"
                    />

                    <div className="flex flex-col justify-between flex-grow min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-display font-bold text-[#F3EDD8] truncate">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                            className="text-[#F3EDD8]/40 hover:text-rose-400 cursor-pointer p-0.5"
                            title="Remove from cart"
                            aria-label="Remove item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="text-[11px] font-mono text-[#F3EDD8]/50 mt-1">
                          SIZE: <span className="text-[#F3EDD8]">{item.size}</span> · COLOR:{' '}
                          <span className="text-[#F3EDD8]">{item.color}</span>
                        </div>

                        {isItemLowStock && (
                          <div className="text-[10px] font-mono text-amber-400 mt-0.5">
                            ● ONLY {item.product.stockCount} LEFT IN VAULT
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#202221] mt-2">
                        {/* Stepper with stock validation */}
                        <div className="flex items-center border border-[#202221] bg-[#070707]">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                            className="px-2 py-0.5 font-mono text-xs hover:text-[#FD8A46] cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="px-2 py-0.5 font-mono text-xs tabular-nums font-bold">
                            {item.quantity}
                          </span>
                          <button
                            disabled={item.quantity >= item.product.stockCount}
                            onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                            className={`px-2 py-0.5 font-mono text-xs cursor-pointer ${
                              item.quantity >= item.product.stockCount
                                ? 'text-[#F3EDD8]/20 cursor-not-allowed'
                                : 'hover:text-[#FD8A46]'
                            }`}
                            aria-label="Increase quantity"
                          >
                            <Plus size={10} />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => saveForLater(item.product.id, item.size, item.color)}
                            className="text-[10px] font-mono text-[#F3EDD8]/50 hover:text-[#FD8A46] cursor-pointer"
                            title="Save for Later"
                          >
                            SAVE FOR LATER
                          </button>
                          <div className="font-mono text-xs font-bold text-[#FD8A46] tabular-nums">
                            PKR {(item.product.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Saved for Later Shelf */}
          {savedItems.length > 0 && (
            <div className="pt-4 border-t border-[#202221] space-y-3 font-mono">
              <div className="text-xs text-[#FD8A46] font-bold flex items-center justify-between">
                <span>RESERVED / SAVED FOR LATER [{savedItems.length}]</span>
              </div>
              <div className="space-y-2">
                {savedItems.map(item => (
                  <div
                    key={`saved-${item.product.id}-${item.size}-${item.color}`}
                    className="p-2.5 bg-[#121313]/60 border border-[#202221] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-14 object-cover border border-[#202221] shrink-0"
                      />
                      <div className="truncate">
                        <div className="font-bold text-[#F3EDD8] truncate">{item.product.name}</div>
                        <div className="text-[10px] text-[#F3EDD8]/50">
                          {item.size} · PKR {item.product.price.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => moveToCartFromSaved(item.product.id, item.size, item.color)}
                        className="px-2.5 py-1 bg-[#202221] hover:bg-[#FD8A46] hover:text-[#070707] text-[#F3EDD8] text-[10px] font-bold uppercase transition-colors cursor-pointer"
                      >
                        MOVE TO CART
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                        className="text-[#F3EDD8]/40 hover:text-rose-400 p-1"
                        aria-label="Delete saved item"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complementary Artifacts Suggestions */}
          {suggestedProducts.length > 0 && (
            <div className="pt-4 border-t border-[#202221] space-y-2 font-mono">
              <div className="text-[11px] text-[#F3EDD8]/60 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={11} className="text-[#FD8A46]" />
                <span>ARCHIVAL PAIRING SUGGESTIONS:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {suggestedProducts.map(s => (
                  <div
                    key={s.id}
                    onClick={() => handleInspectSuggested(s)}
                    className="p-2 bg-[#121313] border border-[#202221] hover:border-[#FD8A46] cursor-pointer transition-colors flex flex-col justify-between"
                  >
                    <img
                      src={s.images[0]}
                      alt={s.name}
                      className="w-full aspect-[4/3] object-cover mb-1 border border-[#202221]"
                    />
                    <div className="text-[10px] font-bold text-[#F3EDD8] truncate">{s.name}</div>
                    <div className="text-[10px] text-[#FD8A46] mt-0.5">PKR {s.price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cart Footer & Calculations */}
        {activeItems.length > 0 && (
          <div className="p-5 border-t border-[#202221] bg-[#070707] space-y-3.5 font-mono text-xs">
            {/* Promo Code Form */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-grow">
                <Tag className="absolute left-3 top-2.5 text-[#FD8A46]" size={13} />
                <input
                  type="text"
                  placeholder="PROMO CODE (NOVA10, ARCHIVE15)"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  className="w-full bg-[#121313] border border-[#202221] pl-8 pr-2 py-2 text-xs font-mono text-[#F3EDD8] uppercase placeholder-[#F3EDD8]/30 focus:border-[#FD8A46] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-[#202221] hover:bg-[#FD8A46] hover:text-[#070707] text-[#F3EDD8] font-bold text-xs uppercase cursor-pointer transition-colors"
              >
                APPLY
              </button>
            </form>

            {couponFeedback && (
              <div
                className={`text-[10px] tracking-wider ${
                  couponFeedback.success ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {couponFeedback.message}
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-[#202221] text-[#F3EDD8]/80 text-[11px]">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span className="tabular-nums">PKR {subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#FD8A46]">
                  <span>DISCOUNT [{discountCode}]:</span>
                  <span className="tabular-nums">- PKR {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>INSURED AIR DISPATCH:</span>
                <span className="tabular-nums">
                  {shipping === 0 ? 'FREE (OVER PKR 25,000)' : `PKR ${shipping.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#F3EDD8] pt-2 border-t border-[#202221]">
                <span>FINAL TOTAL:</span>
                <span className="text-[#FD8A46] tabular-nums">PKR {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Primary Checkout CTA */}
            <button
              onClick={handleProceedCheckout}
              className="w-full py-3.5 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(253,138,70,0.3)] transition-all cursor-pointer"
            >
              <span>PROCEED TO SECURE CHECKOUT</span>
              <ArrowRight size={15} />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#F3EDD8]/50 text-center">
              <ShieldCheck size={12} className="text-[#FD8A46]" />
              <span>AUTHENTICATED DISPATCH // 14-DAY ARCHIVAL PRIVILEGE</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
