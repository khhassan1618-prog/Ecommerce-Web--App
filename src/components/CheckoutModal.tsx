import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import confetti from 'canvas-confetti';
import { X, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    subtotal,
    discount,
    discountCode,
    shipping,
    total,
    currentCustomer,
    createOrder,
    setIsTrackingOpen,
    setTrackingQueryId,
    playClickSound
  } = useStore();

  const [formData, setFormData] = useState({
    name: currentCustomer?.name || 'Malik Vance',
    email: currentCustomer?.email || 'malik.vance@retronova.arch',
    phone: currentCustomer?.phone || '+92 300 8472910',
    address: currentCustomer?.address || 'Sector 4, Cyber-Quarter 9B, DHA Phase 6',
    city: currentCustomer?.city || 'Lahore',
    postalCode: currentCustomer?.postalCode || '54792'
  });

  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Card' | 'Bank Transfer'>('Cash on Delivery');
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  if (!isCheckoutOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound(1000);

    const newOrder = createOrder({
      customerId: currentCustomer?.customerId || 'CUST-DEMO',
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      items: [...cart],
      subtotal,
      discount,
      discountCode: discountCode || undefined,
      total,
      paymentMethod,
      shippingAddress: {
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode
      },
      status: 'ORDER PLACED'
    });

    setCreatedOrder(newOrder);

    // Trigger celebration
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FD8A46', '#F3EDD8', '#202221']
      });
    } catch {
      // ignore
    }
  };

  const handleOpenTracking = () => {
    if (!createdOrder) return;
    playClickSound(800);
    setTrackingQueryId(createdOrder.orderId);
    setIsCheckoutOpen(false);
    setIsTrackingOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#070707]/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0e0f0f] border border-[#202221] shadow-2xl my-auto text-[#F3EDD8] p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#202221] pb-4 mb-6 font-mono">
          <div>
            <div className="text-xs text-[#FD8A46] tracking-widest uppercase">DISPATCH CONFIRMATION</div>
            <div className="text-xl font-display font-bold text-[#F3EDD8]">
              {createdOrder ? 'ORDER AUTHORIZED' : 'SECURE CHECKOUT // DEMO'}
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound(600);
              setIsCheckoutOpen(false);
            }}
            className="p-1 hover:text-[#FD8A46] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success View */}
        {createdOrder ? (
          <div className="space-y-6 text-center py-4 font-mono">
            <div className="w-16 h-16 rounded-full bg-[#FD8A46]/20 border border-[#FD8A46] text-[#FD8A46] flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <div className="text-xs text-[#FD8A46] tracking-widest">DISPATCH ID ASSIGNED</div>
              <div className="text-2xl md:text-3xl font-display font-extrabold text-[#F3EDD8] mt-1">
                {createdOrder.orderId}
              </div>
            </div>

            <div className="bg-[#121313] p-4 border border-[#202221] text-xs text-left space-y-2 text-[#F3EDD8]/80">
              <div className="flex justify-between">
                <span>RECIPIENT:</span>
                <span className="text-[#F3EDD8] font-bold">{createdOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>DESTINATION:</span>
                <span className="text-[#F3EDD8]">{createdOrder.shippingAddress.address}, {createdOrder.shippingAddress.city}</span>
              </div>
              <div className="flex justify-between">
                <span>PAYMENT METHOD:</span>
                <span className="text-[#F3EDD8]">{createdOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-[#FD8A46] font-bold pt-2 border-t border-[#202221]">
                <span>TOTAL CHARGED (DEMO):</span>
                <span>PKR {createdOrder.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleOpenTracking}
                className="flex-1 py-3.5 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg"
              >
                <span>TRACK THIS ORDER IN REAL-TIME</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="py-3.5 px-6 bg-[#202221] hover:bg-[#121313] text-[#F3EDD8] font-mono text-xs uppercase cursor-pointer"
              >
                RETURN TO CATALOG
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-[#F3EDD8]/70 mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#121313] border border-[#202221] px-3 py-2 text-xs font-mono text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#F3EDD8]/70 mb-1">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#121313] border border-[#202221] px-3 py-2 text-xs font-mono text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#F3EDD8]/70 mb-1">
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#121313] border border-[#202221] px-3 py-2 text-xs font-mono text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#F3EDD8]/70 mb-1">
                  CITY
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-[#121313] border border-[#202221] px-3 py-2 text-xs font-mono text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono text-[#F3EDD8]/70 mb-1">
                  STREET ADDRESS & SECTOR
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#121313] border border-[#202221] px-3 py-2 text-xs font-mono text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#F3EDD8]/70 mb-1">
                  POSTAL CODE
                </label>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full bg-[#121313] border border-[#202221] px-3 py-2 text-xs font-mono text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#F3EDD8]/70 mb-1">
                  PAYMENT TARIFF METHOD
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-[#121313] border border-[#202221] px-3 py-2 text-xs font-mono text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none cursor-pointer"
                >
                  <option value="Cash on Delivery">Cash on Delivery (Pakistan)</option>
                  <option value="Card">Credit / Debit Card (Demo)</option>
                  <option value="Bank Transfer">Direct Bank Wire (Demo)</option>
                </select>
              </div>
            </div>

            {/* Total summary */}
            <div className="p-4 bg-[#121313] border border-[#202221] flex items-center justify-between font-mono text-xs">
              <div>
                <div className="text-[#F3EDD8]/60">TOTAL DEMO AMOUNT:</div>
                <div className="text-lg font-bold text-[#FD8A46] tabular-nums">
                  PKR {total.toLocaleString()}
                </div>
              </div>
              <div className="text-right text-[10px] text-[#F3EDD8]/40">
                <div>INCLUDES NATIONWIDE COURIER</div>
                <div>EXPRESS TRANSIT</div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-mono text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg"
            >
              CONFIRM DISPATCH ALLOCATION ➔
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-[#F3EDD8]/40">
              <ShieldCheck size={13} className="text-[#FD8A46]" />
              <span>DEMO MODE ACTIVATED · NO REAL FUNDS WILL BE CHARGED</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
