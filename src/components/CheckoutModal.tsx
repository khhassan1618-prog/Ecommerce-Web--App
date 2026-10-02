import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import confetti from 'canvas-confetti';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Mail,
  Database,
  RefreshCw,
  Send,
  CreditCard,
  Building,
  Truck,
  User,
  MapPin,
  Lock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Order } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    clearCart,
    subtotal,
    discount,
    discountCode,
    shipping,
    total,
    currentCustomer,
    createOrder,
    sendOrderConfirmation,
    isGmailConnected,
    ownerGmail,
    setIsTrackingOpen,
    setTrackingQueryId,
    playClickSound,
    addNotification
  } = useStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: currentCustomer?.name || 'Malik Vance',
    email: currentCustomer?.email || 'kh.hassan.16.18@gmail.com',
    phone: currentCustomer?.phone || '+92 300 8472910',
    address: currentCustomer?.address || 'Sector 4, Cyber-Quarter 9B, DHA Phase 6',
    city: currentCustomer?.city || 'Lahore',
    postalCode: currentCustomer?.postalCode || '54792',
    deliveryNotes: '',
    courierOption: 'standard' as 'standard' | 'express',
    paymentMethod: 'Cash on Delivery' as 'Cash on Delivery' | 'Card' | 'Bank Transfer',
    cardNumber: '•••• •••• •••• 4291',
    cardExp: '11/28',
    cardCvc: '840'
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    if (currentCustomer) {
      setFormData(prev => ({
        ...prev,
        name: currentCustomer.name || prev.name,
        email: currentCustomer.email || prev.email,
        phone: currentCustomer.phone || prev.phone,
        address: currentCustomer.address || prev.address,
        city: currentCustomer.city || prev.city,
        postalCode: currentCustomer.postalCode || prev.postalCode
      }));
    }
  }, [currentCustomer]);

  if (!isCheckoutOpen) return null;

  const activeItems = cart.filter(item => !item.savedForLater);

  const validateStep = (currentStep: number): boolean => {
    const errors: { [key: string]: string } = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) errors.name = 'Patron name required.';
      if (!formData.email.trim() || !formData.email.includes('@')) errors.email = 'Valid email destination required.';
      if (!formData.phone.trim() || formData.phone.length < 8) errors.phone = 'Valid contact number required.';
    } else if (currentStep === 2) {
      if (!formData.address.trim()) errors.address = 'Physical delivery coordinates required.';
      if (!formData.city.trim()) errors.city = 'City required.';
      if (!formData.postalCode.trim()) errors.postalCode = 'Postal index required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (!validateStep(step)) {
      playClickSound(500);
      return;
    }
    playClickSound(800);
    setStep(prev => Math.min(6, prev + 1) as 1 | 2 | 3 | 4 | 5 | 6);
  };

  const handlePrevStep = () => {
    playClickSound(700);
    setFormErrors({});
    setStep(prev => Math.max(1, prev - 1) as 1 | 2 | 3 | 4 | 5 | 6);
  };

  const handleFinalOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (activeItems.length === 0) {
      addNotification('warning', 'EMPTY MANIFEST', 'Cannot dispatch empty cart.');
      return;
    }

    setIsSubmitting(true);
    playClickSound(1000);

    const courierCarrier = formData.courierOption === 'express' ? 'TCS Leopard Priority Air' : 'Standard Armored Express Cargo';

    const newOrder = createOrder({
      customerId: currentCustomer?.customerId || `CUST-${Date.now()}`,
      customerName: formData.name.trim(),
      customerEmail: formData.email.trim(),
      customerPhone: formData.phone.trim(),
      items: [...activeItems],
      subtotal,
      discount,
      discountCode: discountCode || undefined,
      total,
      paymentMethod: formData.paymentMethod,
      shippingAddress: {
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
        carrier: courierCarrier
      },
      status: 'ORDER PLACED'
    });

    setCreatedOrder(newOrder);
    setStep(6);
    clearCart();
    setIsSubmitting(false);

    setEmailStatus(`Order confirmation automatically dispatched to ${formData.email.trim()}!`);
    addNotification('success', 'ORDER AUTHORIZED', `Dispatch code ${newOrder.orderId} assigned.`);

    // Confetti celebration
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FD8A46', '#F3EDD8', '#202221']
      });
    } catch {
      // ignore
    }
  };

  const handleResendEmail = async () => {
    if (!createdOrder) return;
    setIsSendingEmail(true);
    playClickSound(800);
    const res = await sendOrderConfirmation(
      createdOrder,
      createdOrder.customerEmail,
      'Aapka order confirm ho gaya hai! (Your order confirmation has been re-transmitted).'
    );
    setIsSendingEmail(false);
    setEmailStatus(res.message);
    addNotification(res.success ? 'success' : 'error', 'EMAIL DISPATCH', res.message);
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
      <div className="relative w-full max-w-2xl bg-[#0e0f0f] border border-[#202221] shadow-2xl my-auto text-[#F3EDD8] p-6 md:p-8 font-mono">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#202221] pb-4 mb-6">
          <div>
            <div className="text-xs text-[#FD8A46] tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FD8A46]" />
              <span>PRODUCTION CHECKOUT WIZARD // V2</span>
            </div>
            <div className="text-xl md:text-2xl font-display font-bold text-[#F3EDD8] mt-0.5">
              {step === 6 ? 'DISPATCH CONFIRMED' : 'AUTHORIZE DISPATCH MANIFEST'}
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound(600);
              setIsCheckoutOpen(false);
            }}
            className="p-1 hover:text-[#FD8A46] transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator (Steps 1 to 5) */}
        {step < 6 && (
          <div className="mb-6 pb-4 border-b border-[#202221]">
            <div className="flex items-center justify-between text-[11px] mb-2 text-[#F3EDD8]/60">
              <span className={step >= 1 ? 'text-[#FD8A46] font-bold' : ''}>1. DOSSIER</span>
              <span>❯</span>
              <span className={step >= 2 ? 'text-[#FD8A46] font-bold' : ''}>2. DESTINATION</span>
              <span>❯</span>
              <span className={step >= 3 ? 'text-[#FD8A46] font-bold' : ''}>3. COURIER</span>
              <span>❯</span>
              <span className={step >= 4 ? 'text-[#FD8A46] font-bold' : ''}>4. PAYMENT</span>
              <span>❯</span>
              <span className={step >= 5 ? 'text-[#FD8A46] font-bold' : ''}>5. REVIEW</span>
            </div>
            <div className="w-full bg-[#121313] h-1 relative overflow-hidden">
              <div
                className="bg-[#FD8A46] h-full transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Customer Dossier */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-xs text-[#FD8A46] font-bold flex items-center gap-2">
              <User size={14} />
              <span>STEP 01: PATRON CONTACT INFORMATION</span>
            </div>

            <div>
              <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">FULL NAME *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#121313] border border-[#202221] focus:border-[#FD8A46] px-3.5 py-2.5 text-xs text-[#F3EDD8] outline-none"
                placeholder="Malik Vance"
              />
              {formErrors.name && <p className="text-[10px] text-rose-400 mt-1">{formErrors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">EMAIL DESTINATION *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#121313] border border-[#202221] focus:border-[#FD8A46] px-3.5 py-2.5 text-xs text-[#F3EDD8] outline-none"
                  placeholder="patron@retronova.arch"
                />
                {formErrors.email && <p className="text-[10px] text-rose-400 mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">CONTACT TELEMETRY (PHONE) *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#121313] border border-[#202221] focus:border-[#FD8A46] px-3.5 py-2.5 text-xs text-[#F3EDD8] outline-none"
                  placeholder="+92 300 1234567"
                />
                {formErrors.phone && <p className="text-[10px] text-rose-400 mt-1">{formErrors.phone}</p>}
              </div>
            </div>

            <div className="p-3 bg-[#121313] border border-[#202221] text-[11px] text-[#F3EDD8]/60 flex items-center gap-2">
              <Mail size={13} className="text-[#FD8A46]" />
              <span>An official order confirmation and telemetry tracker will be dispatched to this email.</span>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>CONTINUE TO DESTINATION</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Shipping Destination */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-xs text-[#FD8A46] font-bold flex items-center gap-2">
              <MapPin size={14} />
              <span>STEP 02: PHYSICAL DELIVERY DESTINATION</span>
            </div>

            <div>
              <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">STREET ADDRESS / SANCTUM COORDINATES *</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-[#121313] border border-[#202221] focus:border-[#FD8A46] px-3.5 py-2.5 text-xs text-[#F3EDD8] outline-none"
                placeholder="Sector 4, Cyber-Quarter 9B, DHA Phase 6"
              />
              {formErrors.address && <p className="text-[10px] text-rose-400 mt-1">{formErrors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">CITY *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-[#121313] border border-[#202221] focus:border-[#FD8A46] px-3.5 py-2.5 text-xs text-[#F3EDD8] outline-none"
                  placeholder="Lahore / Islamabad / Karachi"
                />
                {formErrors.city && <p className="text-[10px] text-rose-400 mt-1">{formErrors.city}</p>}
              </div>

              <div>
                <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">POSTAL INDEX *</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full bg-[#121313] border border-[#202221] focus:border-[#FD8A46] px-3.5 py-2.5 text-xs text-[#F3EDD8] outline-none"
                  placeholder="54792"
                />
                {formErrors.postalCode && <p className="text-[10px] text-rose-400 mt-1">{formErrors.postalCode}</p>}
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">DISPATCH INSTRUCTIONS (OPTIONAL)</label>
              <textarea
                rows={2}
                value={formData.deliveryNotes}
                onChange={e => setFormData({ ...formData, deliveryNotes: e.target.value })}
                className="w-full bg-[#121313] border border-[#202221] focus:border-[#FD8A46] px-3.5 py-2 text-xs text-[#F3EDD8] outline-none"
                placeholder="Gate code, landmark notes, or security handover protocols..."
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 bg-[#121313] hover:bg-[#202221] border border-[#202221] text-xs uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>BACK</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>CONTINUE TO COURIER</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Courier Selection */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-xs text-[#FD8A46] font-bold flex items-center gap-2">
              <Truck size={14} />
              <span>STEP 03: DISPATCH CARRIER & SPEED</span>
            </div>

            <div className="space-y-3">
              <label
                onClick={() => setFormData({ ...formData, courierOption: 'standard' })}
                className={`p-3.5 border flex items-center justify-between cursor-pointer transition-colors ${
                  formData.courierOption === 'standard'
                    ? 'border-[#FD8A46] bg-[#121313]'
                    : 'border-[#202221] bg-[#0c0d0d] hover:border-[#F3EDD8]/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="courier"
                    checked={formData.courierOption === 'standard'}
                    onChange={() => {}}
                    className="accent-[#FD8A46]"
                  />
                  <div>
                    <div className="font-bold text-xs text-[#F3EDD8]">EXPRESS ARMORED AIR CARGO (24-48 HRS)</div>
                    <div className="text-[10px] text-[#F3EDD8]/60 mt-0.5">
                      Nationwide delivery via Leopard / TCS Air Wing with tamper-evident seal.
                    </div>
                  </div>
                </div>
                <div className="text-xs text-[#FD8A46] font-bold">
                  {shipping === 0 ? 'FREE' : `PKR ${shipping.toLocaleString()}`}
                </div>
              </label>

              <label
                onClick={() => setFormData({ ...formData, courierOption: 'express' })}
                className={`p-3.5 border flex items-center justify-between cursor-pointer transition-colors ${
                  formData.courierOption === 'express'
                    ? 'border-[#FD8A46] bg-[#121313]'
                    : 'border-[#202221] bg-[#0c0d0d] hover:border-[#F3EDD8]/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="courier"
                    checked={formData.courierOption === 'express'}
                    onChange={() => {}}
                    className="accent-[#FD8A46]"
                  />
                  <div>
                    <div className="font-bold text-xs text-[#F3EDD8]">PRIORITY SUB-ORBITAL FLIGHT (SAME-DAY / OVERNIGHT)</div>
                    <div className="text-[10px] text-[#F3EDD8]/60 mt-0.5">
                      Direct hand-delivered courier dispatch for Lahore, Islamabad, and Karachi metro zones.
                    </div>
                  </div>
                </div>
                <div className="text-xs text-[#FD8A46] font-bold">INCLUDED</div>
              </label>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 bg-[#121313] hover:bg-[#202221] border border-[#202221] text-xs uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>BACK</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>CONTINUE TO PAYMENT</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Payment Protocol */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="text-xs text-[#FD8A46] font-bold flex items-center gap-2">
              <CreditCard size={14} />
              <span>STEP 04: PAYMENT PROTOCOL</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['Cash on Delivery', 'Card', 'Bank Transfer'] as const).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    playClickSound(700);
                    setFormData({ ...formData, paymentMethod: method });
                  }}
                  className={`p-3 border text-xs font-mono tracking-wider transition-colors cursor-pointer text-center ${
                    formData.paymentMethod === method
                      ? 'border-[#FD8A46] bg-[#121313] text-[#FD8A46] font-bold'
                      : 'border-[#202221] bg-[#0c0d0d] text-[#F3EDD8]/60 hover:border-[#F3EDD8]/40'
                  }`}
                >
                  {method === 'Cash on Delivery' && 'CASH ON DELIVERY'}
                  {method === 'Card' && 'CARD PAYMENT'}
                  {method === 'Bank Transfer' && 'BANK WIRE'}
                </button>
              ))}
            </div>

            {formData.paymentMethod === 'Cash on Delivery' && (
              <div className="p-4 bg-[#121313] border border-[#202221] space-y-1.5 text-xs text-[#F3EDD8]/75">
                <div className="text-[#FD8A46] font-bold text-xs">CASH ON DISPATCH PROTOCOL:</div>
                <p>
                  Pay in cash (PKR) directly to the authorized courier officer upon physical inspection of security seals.
                </p>
                <p className="text-[10px] text-[#F3EDD8]/50">
                  Exact amount of PKR {total.toLocaleString()} appreciated for seamless parcel handover.
                </p>
              </div>
            )}

            {formData.paymentMethod === 'Card' && (
              <div className="p-4 bg-[#121313] border border-[#202221] space-y-3 text-xs">
                <div className="text-[#FD8A46] font-bold text-xs flex items-center gap-2">
                  <Lock size={12} />
                  <span>256-BIT ENCRYPTED QUANTUM GATEWAY:</span>
                </div>
                <div>
                  <label className="block text-[10px] text-[#F3EDD8]/60 mb-1">CARD NUMBER</label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={e => setFormData({ ...formData, cardNumber: e.target.value })}
                    className="w-full bg-[#070707] border border-[#202221] px-3 py-2 text-xs text-[#F3EDD8] outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#F3EDD8]/60 mb-1">EXPIRY (MM/YY)</label>
                    <input
                      type="text"
                      value={formData.cardExp}
                      onChange={e => setFormData({ ...formData, cardExp: e.target.value })}
                      className="w-full bg-[#070707] border border-[#202221] px-3 py-2 text-xs text-[#F3EDD8] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#F3EDD8]/60 mb-1">CVC / TELEMETRY</label>
                    <input
                      type="password"
                      value={formData.cardCvc}
                      onChange={e => setFormData({ ...formData, cardCvc: e.target.value })}
                      className="w-full bg-[#070707] border border-[#202221] px-3 py-2 text-xs text-[#F3EDD8] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.paymentMethod === 'Bank Transfer' && (
              <div className="p-4 bg-[#121313] border border-[#202221] space-y-2 text-xs text-[#F3EDD8]/80">
                <div className="text-[#FD8A46] font-bold text-xs flex items-center gap-1.5">
                  <Building size={12} />
                  <span>DIRECT ARCHIVE WIRE INSTRUCTIONS:</span>
                </div>
                <div className="text-[11px] leading-relaxed">
                  <div>BANK: MEEZAN BANK LIMITED</div>
                  <div>ACCOUNT TITLE: NOVA RETRON ARCHIVE (PVT) LTD</div>
                  <div>IBAN: PK64MEZN0001020304050607</div>
                  <div className="text-[#FD8A46] pt-1">
                    Please reference your Order ID in the transfer memo for instantaneous release.
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 bg-[#121313] hover:bg-[#202221] border border-[#202221] text-xs uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>BACK</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>CONTINUE TO REVIEW</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Manifest Review & Final Submission */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="text-xs text-[#FD8A46] font-bold flex items-center gap-2">
              <ShieldCheck size={14} />
              <span>STEP 05: FINAL MANIFEST REVIEW</span>
            </div>

            {/* Line items overview */}
            <div className="max-h-40 overflow-y-auto space-y-2 bg-[#121313] p-3 border border-[#202221]">
              {activeItems.map(item => (
                <div key={`${item.product.id}-${item.size}`} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-8 h-10 object-cover border border-[#202221] shrink-0"
                    />
                    <div className="truncate">
                      <div className="text-[#F3EDD8] truncate font-bold">{item.product.name}</div>
                      <div className="text-[10px] text-[#F3EDD8]/50">
                        {item.size} · {item.color} · QTY: {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="text-[#FD8A46] font-bold tabular-nums shrink-0">
                    PKR {(item.product.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Destination & Payment Summary */}
            <div className="p-3 bg-[#121313] border border-[#202221] text-[11px] space-y-1 text-[#F3EDD8]/75">
              <div className="flex justify-between">
                <span className="text-[#F3EDD8]/50">PATRON:</span>
                <span className="text-[#F3EDD8] font-bold">{formData.name} ({formData.phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F3EDD8]/50">EMAIL CONFIRMATION:</span>
                <span className="text-[#FD8A46] font-bold">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F3EDD8]/50">DESTINATION:</span>
                <span className="text-[#F3EDD8]">{formData.address}, {formData.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F3EDD8]/50">PAYMENT METHOD:</span>
                <span className="text-[#F3EDD8] font-bold">{formData.paymentMethod}</span>
              </div>
            </div>

            {/* Financials Recap */}
            <div className="p-3 bg-[#070707] border border-[#202221] space-y-1.5 text-xs text-[#F3EDD8]/80">
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
                <span>INSURED AIR CARGO:</span>
                <span className="tabular-nums">{shipping === 0 ? 'FREE' : `PKR ${shipping.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#F3EDD8] pt-2 border-t border-[#202221]">
                <span>FINAL ALLOCATION:</span>
                <span className="text-[#FD8A46] tabular-nums">PKR {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 bg-[#121313] hover:bg-[#202221] border border-[#202221] text-xs uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>BACK</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalOrderSubmit}
                className={`px-8 py-3 font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer ${
                  isSubmitting
                    ? 'bg-[#202221] text-[#F3EDD8]/40 cursor-wait'
                    : 'bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] shadow-[0_0_24px_rgba(253,138,70,0.4)]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>AUTHORIZING DISPATCH...</span>
                  </>
                ) : (
                  <>
                    <span>AUTHORIZE DISPATCH NOW</span>
                    <Sparkles size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Confirmation & Success Screen */}
        {step === 6 && createdOrder && (
          <div className="space-y-6 text-center py-4 font-mono">
            <div className="w-16 h-16 rounded-full bg-[#FD8A46]/20 border border-[#FD8A46] text-[#FD8A46] flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <div className="text-xs text-[#FD8A46] tracking-widest">DISPATCH ALLOCATION ASSIGNED</div>
              <div className="text-2xl md:text-3xl font-display font-extrabold text-[#F3EDD8] mt-1">
                {createdOrder.orderId}
              </div>
            </div>

            <div className="bg-[#121313] p-4 border border-[#202221] text-xs text-left space-y-2 text-[#F3EDD8]/80">
              <div className="flex justify-between items-center pb-2 border-b border-[#202221]">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Database size={13} />
                  <span>FIRESTORE LIVE SYNC: `orders/{createdOrder.orderId}`</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400">
                  REAL-TIME SYNCED
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#F3EDD8]/50">RECIPIENT:</span>
                <span className="text-[#F3EDD8] font-bold">{createdOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F3EDD8]/50">CONFIRMATION DESTINATION:</span>
                <span className="text-[#FD8A46] font-bold">{createdOrder.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F3EDD8]/50">DESTINATION:</span>
                <span className="text-[#F3EDD8]">{createdOrder.shippingAddress.address}, {createdOrder.shippingAddress.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F3EDD8]/50">PAYMENT METHOD:</span>
                <span className="text-[#F3EDD8]">{createdOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-[#FD8A46] font-bold pt-2 border-t border-[#202221]">
                <span>TOTAL ALLOCATION:</span>
                <span>PKR {createdOrder.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Email Dispatch Automation Status */}
            <div className="p-3.5 bg-[#070707] border border-[#202221] text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[#FD8A46] shrink-0" />
                <div className="text-[11px] leading-snug">
                  <div className="text-[#FD8A46] font-bold">GMAIL WORKSPACE AUTOMATION</div>
                  <div className="text-[#F3EDD8]/70">
                    {emailStatus || `Receipt dispatched to ${createdOrder.customerEmail}`}
                  </div>
                </div>
              </div>

              <button
                onClick={handleResendEmail}
                disabled={isSendingEmail}
                className="px-3 py-1.5 bg-[#121313] hover:bg-[#202221] border border-[#202221] text-[11px] text-[#FD8A46] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Send size={11} className={isSendingEmail ? 'animate-spin' : ''} />
                <span>{isSendingEmail ? 'TRANSMITTING...' : 'RE-TRANSMIT EMAIL'}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleOpenTracking}
                className="flex-1 py-3 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>OPEN LOGISTICS CONSOLE</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="px-5 py-3 bg-[#121313] hover:bg-[#202221] border border-[#202221] text-xs uppercase cursor-pointer"
              >
                CLOSE MANIFEST
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
