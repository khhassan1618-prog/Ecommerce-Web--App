import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, User, Package, Heart, LogOut, MessageSquare, ExternalLink } from 'lucide-react';

export const CustomerAccountModal: React.FC = () => {
  const {
    isAuthOpen,
    setIsAuthOpen,
    currentCustomer,
    loginCustomer,
    loginWithGoogle,
    logoutCustomer,
    orders,
    wishlist,
    products,
    setSelectedProduct,
    setIsPDPModalOpen,
    setIsTrackingOpen,
    setTrackingQueryId,
    setIsAISupportOpen,
    conversations,
    playClickSound
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'wishlist' | 'support'>('orders');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');

  if (!isAuthOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;
    playClickSound(900);
    loginCustomer(loginEmail, loginName);
  };

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#070707]/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0e0f0f] border border-[#202221] shadow-2xl my-auto text-[#F3EDD8] p-6 md:p-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#202221] pb-4 mb-6 font-mono">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-[#FD8A46]" />
            <div>
              <div className="text-xs text-[#FD8A46] tracking-widest uppercase">CUSTOMER PORTAL</div>
              <div className="text-xl font-display font-bold text-[#F3EDD8]">
                {currentCustomer ? currentCustomer.name : 'AUTHENTICATE ACCESS'}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound(600);
              setIsAuthOpen(false);
            }}
            className="p-1 hover:text-[#FD8A46] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {currentCustomer ? (
          <div className="flex flex-col flex-grow overflow-hidden">
            {/* Nav Tabs */}
            <div className="flex border-b border-[#202221] font-mono text-xs gap-2 mb-6">
              <button
                onClick={() => {
                  playClickSound(700);
                  setActiveTab('orders');
                }}
                className={`px-4 py-2 border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'orders'
                    ? 'border-[#FD8A46] text-[#FD8A46] font-bold'
                    : 'border-transparent text-[#F3EDD8]/60 hover:text-[#F3EDD8]'
                }`}
              >
                ORDERS [{orders.length}]
              </button>
              <button
                onClick={() => {
                  playClickSound(700);
                  setActiveTab('wishlist');
                }}
                className={`px-4 py-2 border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'wishlist'
                    ? 'border-[#FD8A46] text-[#FD8A46] font-bold'
                    : 'border-transparent text-[#F3EDD8]/60 hover:text-[#F3EDD8]'
                }`}
              >
                WISHLIST [{wishlist.length}]
              </button>
              <button
                onClick={() => {
                  playClickSound(700);
                  setActiveTab('support');
                }}
                className={`px-4 py-2 border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'support'
                    ? 'border-[#FD8A46] text-[#FD8A46] font-bold'
                    : 'border-transparent text-[#F3EDD8]/60 hover:text-[#F3EDD8]'
                }`}
              >
                SUPPORT LOGS
              </button>
              <button
                onClick={() => {
                  playClickSound(700);
                  setActiveTab('profile');
                }}
                className={`px-4 py-2 border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'profile'
                    ? 'border-[#FD8A46] text-[#FD8A46] font-bold'
                    : 'border-transparent text-[#F3EDD8]/60 hover:text-[#F3EDD8]'
                }`}
              >
                PROFILE
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 font-mono text-xs">
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  {orders.length === 0 ? (
                    <div className="py-8 text-center text-[#F3EDD8]/40">NO PREVIOUS DISPATCHES RECORDED</div>
                  ) : (
                    orders.map(order => (
                      <div key={order.orderId} className="p-4 bg-[#121313] border border-[#202221] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#FD8A46] text-sm">{order.orderId}</span>
                          <span className="px-2 py-0.5 bg-[#FD8A46]/20 border border-[#FD8A46] text-[#FD8A46] text-[10px]">
                            {order.status}
                          </span>
                        </div>
                        <div className="text-[#F3EDD8]/70">
                          {order.items.map(i => `${i.product.name} (${i.size})`).join(', ')}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-[#202221] text-[11px]">
                          <span className="text-[#F3EDD8]/50">
                            PKR {order.total.toLocaleString()} · {order.paymentMethod}
                          </span>
                          <button
                            onClick={() => {
                              playClickSound(800);
                              setTrackingQueryId(order.orderId);
                              setIsAuthOpen(false);
                              setIsTrackingOpen(true);
                            }}
                            className="text-[#FD8A46] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>LIVE TELEMETRY</span>
                            <ExternalLink size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wishlistedProducts.length === 0 ? (
                    <div className="col-span-2 py-8 text-center text-[#F3EDD8]/40">
                      NO ITEMS SAVED TO ARCHIVE WISHLIST
                    </div>
                  ) : (
                    wishlistedProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          playClickSound(800);
                          setSelectedProduct(p);
                          setIsAuthOpen(false);
                          setIsPDPModalOpen(true);
                        }}
                        className="p-3 bg-[#121313] border border-[#202221] hover:border-[#FD8A46] flex gap-3 cursor-pointer"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-16 h-20 object-cover border border-[#202221]"
                        />
                        <div className="flex flex-col justify-between">
                          <div>
                            <div className="font-display font-bold text-sm text-[#F3EDD8]">{p.name}</div>
                            <div className="text-[10px] text-[#F3EDD8]/50">{p.sku}</div>
                          </div>
                          <div className="text-[#FD8A46] font-bold">
                            PKR {p.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'support' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-[#F3EDD8]/60">
                    HISTORICAL SESSIONS WITH NOVA/RETRON AI SUPPORT SYSTEM
                  </div>
                  {conversations.map(conv => (
                    <div key={conv.conversationId} className="p-4 bg-[#121313] border border-[#202221] space-y-2">
                      <div className="flex justify-between">
                        <span className="font-bold text-[#F3EDD8]">{conv.conversationId}</span>
                        <span className={`text-[10px] uppercase ${conv.status === 'escalated' ? 'text-[#FD8A46]' : 'text-emerald-400'}`}>
                          ● {conv.status}
                        </span>
                      </div>
                      <div className="text-[#F3EDD8]/60">
                        {conv.messages.length} transmission(s) logged. Started: {conv.startedAt.slice(0, 10)}
                      </div>
                      <button
                        onClick={() => {
                          playClickSound(800);
                          setIsAuthOpen(false);
                          setIsAISupportOpen(true);
                        }}
                        className="text-[#FD8A46] hover:underline"
                      >
                        RE-OPEN ACTIVE TERMINAL ➔
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="p-4 bg-[#121313] border border-[#202221] space-y-3">
                  <div className="flex justify-between border-b border-[#202221] pb-2">
                    <span className="text-[#F3EDD8]/50">CUSTOMER ID:</span>
                    <span className="font-bold">{currentCustomer.customerId}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#202221] pb-2">
                    <span className="text-[#F3EDD8]/50">EMAIL:</span>
                    <span>{currentCustomer.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#202221] pb-2">
                    <span className="text-[#F3EDD8]/50">PHONE:</span>
                    <span>{currentCustomer.phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#202221] pb-2">
                    <span className="text-[#F3EDD8]/50">CITY:</span>
                    <span>{currentCustomer.city || 'Lahore'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#F3EDD8]/50">ADDRESS:</span>
                    <span className="truncate max-w-xs">{currentCustomer.address || 'Central Sector'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Footer */}
            <div className="pt-4 border-t border-[#202221] flex justify-between items-center font-mono text-xs">
              <span className="text-[#F3EDD8]/40">AUTHENTICATED PROFILE</span>
              <button
                onClick={() => {
                  playClickSound(600);
                  logoutCustomer();
                }}
                className="text-red-400 hover:text-red-300 flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut size={13} />
                <span>TERMINATE SESSION</span>
              </button>
            </div>
          </div>
        ) : (
          /* Login Form */
          <div className="space-y-4 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                playClickSound(950);
                loginWithGoogle();
              }}
              className="w-full py-3.5 bg-[#171918] hover:bg-[#202221] border border-[#FD8A46]/60 text-[#F3EDD8] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:border-[#FD8A46]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>SIGN IN WITH GOOGLE (FIREBASE AUTH)</span>
            </button>

            <div className="flex items-center gap-3 my-2 text-[10px] text-[#F3EDD8]/40">
              <div className="flex-grow border-t border-[#202221]" />
              <span>OR AUTHENTICATE WITH MANUAL PROFILE</span>
              <div className="flex-grow border-t border-[#202221]" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">CUSTOMER NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Malik Vance"
                  value={loginName}
                  onChange={e => setLoginName(e.target.value)}
                  className="w-full bg-[#121313] border border-[#202221] px-3 py-2 text-xs text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. customer@retronova.arch"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-[#121313] border border-[#202221] px-3 py-2 text-xs text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                AUTHENTICATE MANUAL ACCOUNT ➔
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
