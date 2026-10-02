import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  User,
  Package,
  Heart,
  LogOut,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  Mail,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Save
} from 'lucide-react';

export const CustomerAccountModal: React.FC = () => {
  const {
    isAuthOpen,
    setIsAuthOpen,
    currentCustomer,
    loginWithGoogle,
    loginWithEmailPassword,
    registerWithEmailPassword,
    updateCustomerProfile,
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
    isFirestoreConnected,
    isGmailConnected,
    playClickSound,
    addToCart,
    addNotification,
    isAudioOn,
    toggleAudio
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'wishlist' | 'support' | 'preferences'>('orders');
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('+92 300 1234567');
  const [authCity, setAuthCity] = useState('Lahore');
  const [authAddress, setAuthAddress] = useState('Sector 4, Phase 6, DHA');
  
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);

  if (!isAuthOpen) return null;

  const handleStartEditProfile = () => {
    if (!currentCustomer) return;
    setEditName(currentCustomer.name || '');
    setEditPhone(currentCustomer.phone || '');
    setEditCity(currentCustomer.city || 'Lahore');
    setEditAddress(currentCustomer.address || '');
    setIsEditingProfile(true);
    setProfileSavedMsg(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound(850);
    setIsLoading(true);
    try {
      await updateCustomerProfile({
        name: editName,
        phone: editPhone,
        city: editCity,
        address: editAddress
      });
      setIsEditingProfile(false);
      setProfileSavedMsg('Profile successfully synchronized to Firestore customers collection.');
      setTimeout(() => setProfileSavedMsg(null), 4000);
    } catch (err: any) {
      console.error('[PROFILE SAVE ERROR]', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please fill in email and passcode.');
      return;
    }

    setAuthError(null);
    setAuthSuccessMsg(null);
    setIsLoading(true);
    playClickSound(900);

    if (authMode === 'signin') {
      const res = await loginWithEmailPassword(authEmail.trim(), authPassword);
      setIsLoading(false);
      if (res.success) {
        setAuthSuccessMsg('Authenticated successfully. Profile loaded from Firestore.');
        setTimeout(() => setAuthSuccessMsg(null), 3000);
      } else {
        setAuthError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } else {
      // Registration mode
      if (authPassword.length < 6) {
        setIsLoading(false);
        setAuthError('Security passcode must be at least 6 characters.');
        return;
      }
      const res = await registerWithEmailPassword(
        authEmail.trim(),
        authPassword,
        authName.trim() || undefined,
        authPhone.trim() || undefined,
        authAddress.trim() || undefined,
        authCity.trim() || undefined
      );
      setIsLoading(false);
      if (res.success) {
        setAuthSuccessMsg('Patron account created! Profile synchronized to Firestore.');
        setTimeout(() => setAuthSuccessMsg(null), 3000);
      } else {
        setAuthError(res.error || 'Registration failed.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthSuccessMsg(null);
    setIsLoading(true);
    playClickSound(950);
    try {
      await loginWithGoogle();
      setAuthSuccessMsg('Authenticated with Google. Synced with Firestore & Gmail.');
      setTimeout(() => setAuthSuccessMsg(null), 3000);
    } catch (err: any) {
      setAuthError(err?.message || 'Google authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#070707]/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0e0f0f] border border-[#202221] shadow-2xl my-auto text-[#F3EDD8] p-6 md:p-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#202221] pb-4 mb-6 font-mono">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#FD8A46] animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#FD8A46] tracking-widest uppercase">FIREBASE AUTH PORTAL</span>
                <span className="text-[10px] px-2 py-0.5 border border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                  FIRESTORE {isFirestoreConnected ? 'ONLINE' : 'CONNECTING'}
                </span>
                {isGmailConnected && (
                  <span className="text-[10px] px-2 py-0.5 border border-sky-500/50 text-sky-400 bg-sky-500/10 hidden sm:inline">
                    GMAIL ACTIVE
                  </span>
                )}
              </div>
              <div className="text-xl font-display font-bold text-[#F3EDD8]">
                {currentCustomer ? currentCustomer.name : 'PATRON AUTHENTICATION'}
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
            <div className="flex border-b border-[#202221] font-mono text-xs gap-2 mb-6 overflow-x-auto">
              <button
                onClick={() => {
                  playClickSound(700);
                  setActiveTab('orders');
                }}
                className={`px-4 py-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
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
                className={`px-4 py-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
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
                className={`px-4 py-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'support'
                    ? 'border-[#FD8A46] text-[#FD8A46] font-bold'
                    : 'border-transparent text-[#F3EDD8]/60 hover:text-[#F3EDD8]'
                }`}
              >
                SUPPORT LOGS [{conversations.length}]
              </button>
              <button
                onClick={() => {
                  playClickSound(700);
                  setActiveTab('profile');
                }}
                className={`px-4 py-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-[#FD8A46] text-[#FD8A46] font-bold'
                    : 'border-transparent text-[#F3EDD8]/60 hover:text-[#F3EDD8]'
                }`}
              >
                PROFILE & SYNC
              </button>
              <button
                onClick={() => {
                  playClickSound(700);
                  setActiveTab('preferences');
                }}
                className={`px-4 py-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'preferences'
                    ? 'border-[#FD8A46] text-[#FD8A46] font-bold'
                    : 'border-transparent text-[#F3EDD8]/60 hover:text-[#F3EDD8]'
                }`}
              >
                PREFERENCES
              </button>
            </div>

            {/* Notification Banner */}
            {profileSavedMsg && (
              <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>{profileSavedMsg}</span>
              </div>
            )}

            {/* Tab Contents */}
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 font-mono text-xs">
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  {orders.length === 0 ? (
                    <div className="py-8 text-center text-[#F3EDD8]/40 border border-dashed border-[#202221] p-6">
                      NO DISPATCH ALLOCATIONS RECORDED YET. EXPLORE ARCHIVE CATALOG.
                    </div>
                  ) : (
                    orders.map(order => (
                      <div key={order.orderId} className="p-4 bg-[#121313] border border-[#202221] space-y-2 hover:border-[#FD8A46]/60 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#FD8A46] text-sm">{order.orderId}</span>
                          <span className="px-2 py-0.5 bg-[#FD8A46]/20 border border-[#FD8A46] text-[#FD8A46] text-[10px]">
                            {order.status}
                          </span>
                        </div>
                        <div className="text-[#F3EDD8]/70">
                          {order.items.map(i => `${i.product.name} (${i.size}) x${i.quantity}`).join(' · ')}
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
                            <span>LIVE TRACKING</span>
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
                    <div className="col-span-2 py-8 text-center text-[#F3EDD8]/40 border border-dashed border-[#202221] p-6">
                      WISHLIST EMPTY. CLICK HEART ICON ON CATALOG ITEMS TO BOOKMARK.
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
                        className="p-3 bg-[#121313] border border-[#202221] hover:border-[#FD8A46] flex gap-3 cursor-pointer transition-colors"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-16 h-20 object-cover border border-[#202221]"
                        />
                        <div className="flex flex-col justify-between flex-grow min-w-0">
                          <div>
                            <div className="font-display font-bold text-sm text-[#F3EDD8] truncate">{p.name}</div>
                            <div className="text-[10px] text-[#F3EDD8]/50">{p.sku}</div>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-[#FD8A46] font-bold">
                              PKR {p.price.toLocaleString()}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playClickSound(880);
                                addToCart(p, p.sizes[0], p.colors[0].name, 1);
                                addNotification('success', 'ALLOCATED', `${p.name} added to cart from wishlist.`);
                              }}
                              className="px-2.5 py-1 bg-[#202221] hover:bg-[#FD8A46] hover:text-[#070707] text-[#F3EDD8] text-[10px] uppercase font-bold transition-colors cursor-pointer"
                            >
                              ALLOCATE
                            </button>
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
                    REAL-TIME LOGS FROM FIRESTORE `conversations` COLLECTION:
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
                        {conv.messages.length} message(s) logged. Started: {conv.startedAt.slice(0, 10)}
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
                <div>
                  {isEditingProfile ? (
                    <form onSubmit={handleSaveProfile} className="p-4 bg-[#121313] border border-[#FD8A46]/60 space-y-4">
                      <div className="text-xs text-[#FD8A46] font-bold tracking-wider uppercase mb-2 flex items-center gap-1.5">
                        <Edit3 size={13} />
                        <span>MODIFY & SYNC FIRESTORE PROFILE</span>
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">PATRON NAME</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full bg-[#0e0f0f] border border-[#202221] px-3 py-2 text-xs text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">PHONE NUMBER</label>
                        <input
                          type="tel"
                          required
                          value={editPhone}
                          onChange={e => setEditPhone(e.target.value)}
                          className="w-full bg-[#0e0f0f] border border-[#202221] px-3 py-2 text-xs text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">CITY</label>
                          <input
                            type="text"
                            required
                            value={editCity}
                            onChange={e => setEditCity(e.target.value)}
                            className="w-full bg-[#0e0f0f] border border-[#202221] px-3 py-2 text-xs text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">POSTAL / SECTOR</label>
                          <input
                            type="text"
                            defaultValue={currentCustomer.postalCode || '54000'}
                            className="w-full bg-[#0e0f0f] border border-[#202221] px-3 py-2 text-xs text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">DELIVERY ADDRESS</label>
                        <input
                          type="text"
                          required
                          value={editAddress}
                          onChange={e => setEditAddress(e.target.value)}
                          className="w-full bg-[#0e0f0f] border border-[#202221] px-3 py-2 text-xs text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 py-2.5 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Save size={13} />
                          <span>{isLoading ? 'SAVING TO CLOUD...' : 'SAVE & SYNC TO FIRESTORE'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="py-2.5 px-4 bg-[#202221] hover:bg-[#1a1b1b] text-[#F3EDD8] cursor-pointer"
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-4 bg-[#121313] border border-[#202221] space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-[#202221]">
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                          <ShieldCheck size={14} />
                          <span>SYNCHRONIZED WITH `customers/{currentCustomer.customerId}`</span>
                        </span>
                        <button
                          onClick={handleStartEditProfile}
                          className="text-[#FD8A46] hover:text-[#F3EDD8] flex items-center gap-1 text-[11px] cursor-pointer"
                        >
                          <Edit3 size={12} />
                          <span>EDIT PROFILE</span>
                        </button>
                      </div>

                      <div className="flex justify-between border-b border-[#202221] pb-2">
                        <span className="text-[#F3EDD8]/50">FIREBASE UID:</span>
                        <span className="font-mono text-[11px] text-[#FD8A46]">{currentCustomer.customerId}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#202221] pb-2">
                        <span className="text-[#F3EDD8]/50">PATRON NAME:</span>
                        <span className="font-bold">{currentCustomer.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#202221] pb-2">
                        <span className="text-[#F3EDD8]/50">EMAIL ADDRESS:</span>
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
                        <span className="text-[#F3EDD8]/50">DELIVERY ADDRESS:</span>
                        <span className="truncate max-w-xs">{currentCustomer.address || 'Central Sector'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="p-4 bg-[#121313] border border-[#202221] space-y-4">
                  <div className="text-xs text-[#FD8A46] font-bold tracking-wider uppercase mb-2">
                    TELEMETRY & ARCHIVE PREFERENCES
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-[#202221]">
                    <div>
                      <div className="text-xs font-bold text-[#F3EDD8]">AMBIENT SOUND ENGINE</div>
                      <div className="text-[10px] text-[#F3EDD8]/50">
                        Synthesizer micro-clicks and ambient low-frequency drones.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound(800);
                        toggleAudio();
                        addNotification('info', 'AUDIO SETTINGS', isAudioOn ? 'Ambient sound muted.' : 'Ambient sound activated.');
                      }}
                      className={`px-3 py-1 border text-xs font-bold transition-colors cursor-pointer ${
                        isAudioOn
                          ? 'border-[#FD8A46] bg-[#FD8A46] text-[#070707]'
                          : 'border-[#202221] bg-[#070707] text-[#F3EDD8]/60'
                      }`}
                    >
                      {isAudioOn ? 'ENABLED' : 'MUTED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-[#202221]">
                    <div>
                      <div className="text-xs font-bold text-[#F3EDD8]">GMAIL DISPATCH ALERTS</div>
                      <div className="text-[10px] text-[#F3EDD8]/50">
                        Automated order confirmation and timeline checkpoint emails to {currentCustomer.email}.
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 border border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                      ACTIVE
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-xs font-bold text-[#F3EDD8]">ARCHIVAL DECLASSIFICATION BULLETIN</div>
                      <div className="text-[10px] text-[#F3EDD8]/50">
                        Receive priority notices when limited speculative garment allocations open.
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 border border-[#FD8A46]/50 text-[#FD8A46] bg-[#FD8A46]/10">
                      SUBSCRIBED
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Footer */}
            <div className="pt-4 border-t border-[#202221] flex justify-between items-center font-mono text-xs mt-4">
              <span className="text-[#F3EDD8]/40">AUTHENTICATED PROFILE · REAL-TIME FIREBASE LINK</span>
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
          /* Firebase Auth Portal: Sign-in / Registration */
          <div className="space-y-4 font-mono text-xs">
            {/* Google Firebase Auth Option */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 bg-[#171918] hover:bg-[#202221] border border-[#FD8A46]/60 text-[#F3EDD8] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:border-[#FD8A46]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>SIGN IN WITH GOOGLE (FIREBASE + GMAIL OAUTH)</span>
            </button>

            {/* Mode Switcher */}
            <div className="flex border border-[#202221] bg-[#121313] p-1 gap-1">
              <button
                type="button"
                onClick={() => {
                  playClickSound(700);
                  setAuthMode('signin');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  authMode === 'signin'
                    ? 'bg-[#FD8A46] text-[#070707]'
                    : 'text-[#F3EDD8]/60 hover:text-[#F3EDD8]'
                }`}
              >
                <LogIn size={13} />
                <span>SIGN IN</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playClickSound(700);
                  setAuthMode('register');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  authMode === 'register'
                    ? 'bg-[#FD8A46] text-[#070707]'
                    : 'text-[#F3EDD8]/60 hover:text-[#F3EDD8]'
                }`}
              >
                <UserPlus size={13} />
                <span>REGISTER NEW PATRON</span>
              </button>
            </div>

            {/* Error & Success Alerts */}
            {authError && (
              <div className="p-3 bg-red-950/40 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}
            {authSuccessMsg && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>{authSuccessMsg}</span>
              </div>
            )}

            {/* Email & Password Form */}
            <form onSubmit={handleEmailAuthSubmit} className="space-y-3.5 bg-[#121313] p-4 border border-[#202221]">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">FULL NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Malik Vance"
                      value={authName}
                      onChange={e => setAuthName(e.target.value)}
                      className="w-full bg-[#0e0f0f] border border-[#202221] px-3 py-2 text-xs text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">PHONE NUMBER</label>
                      <input
                        type="tel"
                        required
                        value={authPhone}
                        onChange={e => setAuthPhone(e.target.value)}
                        className="w-full bg-[#0e0f0f] border border-[#202221] px-3 py-2 text-xs text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">CITY</label>
                      <input
                        type="text"
                        required
                        value={authCity}
                        onChange={e => setAuthCity(e.target.value)}
                        className="w-full bg-[#0e0f0f] border border-[#202221] px-3 py-2 text-xs text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">SHIPPING ADDRESS</label>
                    <input
                      type="text"
                      required
                      value={authAddress}
                      onChange={e => setAuthAddress(e.target.value)}
                      className="w-full bg-[#0e0f0f] border border-[#202221] px-3 py-2 text-xs text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">EMAIL ADDRESS</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="patron@retronova.arch"
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    className="w-full bg-[#0e0f0f] border border-[#202221] px-3 py-2 text-xs text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none pl-8"
                  />
                  <Mail size={13} className="absolute left-2.5 top-2.5 text-[#F3EDD8]/40" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#F3EDD8]/70 mb-1">
                  SECURITY PASSCODE {authMode === 'register' && '(MIN 6 CHARACTERS)'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    className="w-full bg-[#0e0f0f] border border-[#202221] px-3 py-2 text-xs text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none pl-8"
                  />
                  <KeyRound size={13} className="absolute left-2.5 top-2.5 text-[#F3EDD8]/40" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <span>CONNECTING FIREBASE AUTH...</span>
                ) : authMode === 'signin' ? (
                  <span>AUTHENTICATE VIA FIREBASE AUTH ➔</span>
                ) : (
                  <span>REGISTER PATRON IN FIRESTORE ➔</span>
                )}
              </button>
            </form>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#F3EDD8]/40 text-center">
              <ShieldCheck size={12} className="text-[#FD8A46]" />
              <span>PASSWORDS SECURED VIA GOOGLE FIREBASE AUTHENTICATION</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
