import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, ArrowRight, Tag, ShieldCheck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discount,
    discountCode,
    shipping,
    total,
    applyCoupon,
    setIsCheckoutOpen,
    playClickSound
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ message: string; success: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
  };

  const handleProceedCheckout = () => {
    playClickSound(950);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#070707]/80 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-[#0e0f0f] border-l border-[#202221] shadow-2xl flex flex-col justify-between h-full text-[#F3EDD8] animate-in slide-in-from-right duration-300">
        {/* Cart Header */}
        <div className="p-6 border-b border-[#202221] flex items-center justify-between font-mono bg-[#070707]">
          <div>
            <div className="text-xs text-[#FD8A46] tracking-widest uppercase">DISPATCH MANIFEST</div>
            <div className="text-lg font-display font-bold text-[#F3EDD8]">
              SHOPPING CART [{cart.length}]
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

        {/* Cart Items List */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="py-20 text-center font-mono space-y-3">
              <div className="text-[#F3EDD8]/30 text-xs">ARCHIVE MANIFEST IS EMPTY</div>
              <p className="text-xs text-[#F3EDD8]/60">
                Explore our declassified collection to allocate garments.
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
            cart.map(item => (
              <div
                key={`${item.product.id}-${item.size}-${item.color}`}
                className="p-3 bg-[#121313] border border-[#202221] flex gap-3 relative group"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-24 object-cover border border-[#202221] shrink-0"
                />

                <div className="flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-display font-bold text-[#F3EDD8]">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                        className="text-[#F3EDD8]/40 hover:text-[#FD8A46] cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-[#F3EDD8]/50 mt-1">
                      SIZE: <span className="text-[#F3EDD8]">{item.size}</span> · COLOR: <span className="text-[#F3EDD8]">{item.color}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#202221] mt-2">
                    {/* Stepper */}
                    <div className="flex items-center border border-[#202221] bg-[#070707]">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                        className="px-2 py-0.5 font-mono text-xs hover:text-[#FD8A46] cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 font-mono text-xs tabular-nums font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                        className="px-2 py-0.5 font-mono text-xs hover:text-[#FD8A46] cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="font-mono text-xs font-bold text-[#FD8A46] tabular-nums">
                      PKR {(item.product.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer & Calculations */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-[#202221] bg-[#070707] space-y-4 font-mono text-xs">
            {/* Promo Code Form */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-grow">
                <Tag className="absolute left-3 top-2.5 text-[#FD8A46]" size={13} />
                <input
                  type="text"
                  placeholder="PROMO (NOVA10, ARCHIVE15)"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  className="w-full bg-[#121313] border border-[#202221] pl-8 pr-2 py-2 text-xs font-mono text-[#F3EDD8] uppercase placeholder-[#F3EDD8]/30 focus:border-[#FD8A46] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-[#202221] hover:bg-[#FD8A46] hover:text-[#070707] text-[#F3EDD8] font-bold text-xs uppercase cursor-pointer transition-colors"
              >
                APPLY
              </button>
            </form>

            {couponFeedback && (
              <div
                className={`text-[10px] tracking-wider ${
                  couponFeedback.success ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {couponFeedback.message}
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-2 border-t border-[#202221] text-[#F3EDD8]/80">
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
                <span>INSURED DISPATCH:</span>
                <span className="tabular-nums">
                  {shipping === 0 ? 'FREE (ORDERS > 25,000)' : `PKR ${shipping.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#F3EDD8] pt-2 border-t border-[#202221]">
                <span>FINAL ALLOCATION:</span>
                <span className="text-[#FD8A46] tabular-nums">
                  PKR {total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Primary Checkout CTA */}
            <button
              onClick={handleProceedCheckout}
              className="w-full py-4 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(253,138,70,0.3)] transition-all cursor-pointer"
            >
              <span>PROCEED TO SECURE CHECKOUT</span>
              <ArrowRight size={15} />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#F3EDD8]/40 text-center">
              <ShieldCheck size={12} className="text-[#FD8A46]" />
              <span>TEST DEMO ENVIRONMENT · NO ACTUAL PAYMENTS PROCESSED</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
