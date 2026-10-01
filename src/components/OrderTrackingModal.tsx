import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Search, CheckCircle2, Clock, Truck, Package, ShieldCheck, MapPin, Mail, Send } from 'lucide-react';
import { OrderTrackingStep } from '../types';
import { getOrderFromFirestore } from '../services/firebase';

export const OrderTrackingModal: React.FC = () => {
  const {
    isTrackingOpen,
    setIsTrackingOpen,
    trackingQueryId,
    setTrackingQueryId,
    getOrderById,
    playClickSound,
    setIsAISupportOpen,
    sendTrackingEmail,
    ownerGmail,
    currentCustomer
  } = useStore();

  const [inputVal, setInputVal] = useState(trackingQueryId || 'NR-2026-00192');
  const [activeOrder, setActiveOrder] = useState(() => getOrderById(inputVal));
  const [isSearching, setIsSearching] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Sync active order email when order changes
  useEffect(() => {
    if (activeOrder) {
      setEmailInput(activeOrder.customerEmail || currentCustomer?.email || '');
      setEmailFeedback(null);
    }
  }, [activeOrder, currentCustomer]);

  if (!isTrackingOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound(800);
    setIsSearching(true);
    let found = getOrderById(inputVal);
    if (!found) {
      found = (await getOrderFromFirestore(inputVal.trim().toUpperCase())) || undefined;
    }
    setActiveOrder(found);
    setIsSearching(false);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder || !emailInput.trim() || isSendingEmail) return;

    playClickSound(900);
    setIsSendingEmail(true);
    setEmailFeedback(null);

    try {
      const res = await sendTrackingEmail(
        activeOrder.orderId,
        emailInput.trim(),
        `Customer requested order telemetry report via Logistics Console.`
      );
      setEmailFeedback({
        success: res.success,
        message: res.success
          ? `Dispatched! Check ${emailInput.trim()} for full telemetry report (Sent from ${ownerGmail}).`
          : res.message
      });
    } catch (err: any) {
      setEmailFeedback({
        success: false,
        message: err.message || 'Failed to dispatch email'
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getStepIcon = (status: OrderTrackingStep['status'], completed: boolean) => {
    if (completed) return <CheckCircle2 size={16} className="text-[#FD8A46]" />;
    if (status === 'OUT FOR DELIVERY') return <Truck size={16} className="text-[#F3EDD8]/40" />;
    if (status === 'PACKED' || status === 'PROCESSING') return <Package size={16} className="text-[#F3EDD8]/40" />;
    return <Clock size={16} className="text-[#F3EDD8]/40" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#070707]/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0e0f0f] border border-[#202221] shadow-2xl my-auto text-[#F3EDD8] p-6 md:p-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#202221] pb-4 mb-6 font-mono">
          <div>
            <div className="text-xs text-[#FD8A46] tracking-widest uppercase">LOGISTICS TELEMETRY</div>
            <div className="text-xl font-display font-bold text-[#F3EDD8]">
              TRACK YOUR ORDER
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound(600);
              setIsTrackingOpen(false);
            }}
            className="p-1 hover:text-[#FD8A46] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-3 text-[#FD8A46]" size={16} />
            <input
              type="text"
              placeholder="ENTER ORDER ID (e.g. NR-2026-00192)"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              className="w-full bg-[#121313] border border-[#202221] pl-10 pr-4 py-2.5 font-mono text-xs text-[#F3EDD8] uppercase placeholder-[#F3EDD8]/30 focus:border-[#FD8A46] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            SCAN
          </button>
        </form>

        {activeOrder ? (
          <div className="space-y-6">
            {/* Active order summary */}
            <div className="p-4 bg-[#121313] border border-[#202221] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
              <div>
                <div className="text-[#FD8A46] font-bold text-sm">{activeOrder.orderId}</div>
                <div className="text-[#F3EDD8]/60 mt-0.5">
                  RECIPIENT: {activeOrder.customerName} ({activeOrder.shippingAddress.city})
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 bg-[#FD8A46]/20 border border-[#FD8A46] text-[#FD8A46] font-bold tracking-wider uppercase text-[10px]">
                  ● {activeOrder.status}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4 pl-2 font-mono">
              <div className="text-[11px] text-[#F3EDD8]/50 uppercase tracking-widest mb-4">
                NODE DISPATCH TELEMETRY TIMELINE
              </div>

              {activeOrder.timeline.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Vertical connecting line */}
                  {idx < activeOrder.timeline.length - 1 && (
                    <div
                      className={`absolute left-2.5 top-6 bottom-0 w-0.5 -mb-4 ${
                        step.completed ? 'bg-[#FD8A46]' : 'bg-[#202221]'
                      }`}
                    />
                  )}

                  <div className="mt-0.5 shrink-0 z-10 bg-[#0e0f0f]">
                    {getStepIcon(step.status, step.completed)}
                  </div>

                  <div className="flex-grow pb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-bold ${
                          step.completed ? 'text-[#F3EDD8]' : 'text-[#F3EDD8]/40'
                        }`}
                      >
                        {step.status}
                      </span>
                      <span className="text-[10px] text-[#F3EDD8]/50">
                        {step.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#F3EDD8]/60 mt-1">
                      <MapPin size={11} className={step.completed ? 'text-[#FD8A46]' : 'text-[#F3EDD8]/30'} />
                      <span>{step.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Items manifest */}
            <div className="pt-4 border-t border-[#202221]">
              <div className="text-[11px] font-mono text-[#F3EDD8]/50 uppercase tracking-widest mb-3">
                ARCHIVAL CARGO MANIFEST
              </div>
              <div className="space-y-2">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-[#121313] border border-[#202221] font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-8 h-8 object-cover border border-[#202221]"
                      />
                      <span>{item.product.name} ({item.size})</span>
                    </div>
                    <span className="text-[#FD8A46]">QTY: {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Automated Gmail Telemetry Dispatch */}
            <div className="p-4 bg-[#121413] border border-[#FD8A46]/30 font-mono text-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2 text-[#FD8A46] font-bold text-xs">
                  <Mail size={14} />
                  <span>AUTOMATED GMAIL DISPATCH</span>
                </div>
                <span className="text-[10px] text-[#F3EDD8]/50">
                  Sender: <strong className="text-[#FD8A46]">{ownerGmail}</strong>
                </span>
              </div>

              <p className="text-[11px] text-[#F3EDD8]/70 leading-relaxed">
                Dispatch this entire cargo telemetry report, tracking checkpoints, and carrier coordinates directly to the customer's email address via verified store owner Gmail.
              </p>

              <form onSubmit={handleSendEmail} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="RECIPIENT EMAIL ADDRESS"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="flex-grow bg-[#070707] border border-[#202221] px-3 py-2 text-xs text-[#F3EDD8] placeholder-[#F3EDD8]/30 focus:border-[#FD8A46] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-4 py-2 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Send size={12} className={isSendingEmail ? 'animate-bounce' : ''} />
                  <span>{isSendingEmail ? 'DISPATCHING...' : 'DISPATCH GMAIL ➔'}</span>
                </button>
              </form>

              {emailFeedback && (
                <div
                  className={`p-2 text-[11px] flex items-center gap-2 ${
                    emailFeedback.success
                      ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/40 border border-red-500/40 text-red-300'
                  }`}
                >
                  {emailFeedback.success ? (
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  ) : (
                    <X size={13} className="text-red-400 shrink-0" />
                  )}
                  <span>{emailFeedback.message}</span>
                </div>
              )}
            </div>

            {/* Inquiries */}
            <div className="p-3 bg-[#070707] border border-[#202221] flex items-center justify-between font-mono text-xs">
              <span className="text-[#F3EDD8]/60">Require courier assistance?</span>
              <button
                onClick={() => {
                  playClickSound(800);
                  setIsTrackingOpen(false);
                  setIsAISupportOpen(true);
                }}
                className="text-[#FD8A46] hover:underline cursor-pointer"
              >
                ASK AI SUPPORT ➔
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center font-mono space-y-2 text-[#F3EDD8]/60 text-xs">
            <div className="text-[#FD8A46]">NO ARCHIVAL RECORD FOUND</div>
            <div>Please verify your Order ID or try the reference ID: <strong>NR-2026-00192</strong></div>
          </div>
        )}
      </div>
    </div>
  );
};
