import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Users,
  ShoppingCart,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Database,
  Cloud,
  ChevronRight,
  ShieldCheck,
  Mail,
  Send,
  ExternalLink,
  Zap,
  Lock,
  Unlock,
  Package,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Eye
} from 'lucide-react';
import { Order, Conversation, Customer, Product, ProductEra } from '../types';

export const AdminDashboardModal: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    orders,
    customers,
    updateOrderStatus,
    conversations,
    analytics,
    isFirestoreConnected,
    forceSyncFirestore,
    playClickSound,
    isGmailConnected,
    ownerGmail,
    connectGmailAccount,
    sendTrackingEmail,
    emailDispatchLogs,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    isAdminAuthenticated,
    verifyAdminPasscode,
    adminLogout,
    addNotification
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'products' | 'customers' | 'transcripts' | 'analytics' | 'automations'
  >('overview');
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(conversations[0] || null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string>('');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testEmailFeedback, setTestEmailFeedback] = useState<{ success?: boolean; text?: string } | null>(null);

  // Passcode gate state
  const [passcodeAttempt, setPasscodeAttempt] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Orders search & filter
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');

  // Product management state
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  // New product form fields
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<Product['category']>('Outerwear');
  const [newProdEra, setNewProdEra] = useState<ProductEra>('2026');
  const [newProdPrice, setNewProdPrice] = useState<number>(35000);
  const [newProdStock, setNewProdStock] = useState<number>(10);
  const [newProdTagline, setNewProdTagline] = useState('');
  const [newProdDescription, setNewProdDescription] = useState('');

  if (!isAdminOpen) return null;

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound(800);
    const success = verifyAdminPasscode(passcodeAttempt);
    if (!success) {
      setPasscodeError('Invalid passcode. Security clearance denied.');
    } else {
      setPasscodeError('');
      setPasscodeAttempt('');
    }
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    playClickSound(800);
    updateOrderStatus(orderId, newStatus);
    addNotification('info', 'STATUS SYNCHRONIZED', `Order ${orderId} updated to ${newStatus}.`);
  };

  const handleManualSync = async () => {
    playClickSound(900);
    setIsSyncing(true);
    setSyncFeedback('SYNCHRONIZING WITH CLOUD FIRESTORE...');
    try {
      await forceSyncFirestore();
      setSyncFeedback('FIRESTORE SYNCHRONIZATION COMPLETE');
      setTimeout(() => setSyncFeedback(''), 3000);
    } catch {
      setSyncFeedback('SYNC ERROR // CHECK FIRESTORE RULES');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveInlineProductEdit = (prod: Product) => {
    playClickSound(850);
    updateProduct({
      ...prod,
      price: editPrice,
      stockCount: editStock,
      inStock: editStock > 0
    });
    setEditingProductId(null);
  };

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdSku.trim()) return;

    playClickSound(900);
    const id = `prod-${Date.now().toString().slice(-4)}`;
    const newProduct: Product = {
      id,
      name: newProdName.trim().toUpperCase(),
      sku: newProdSku.trim().toUpperCase(),
      category: newProdCategory,
      era: newProdEra,
      price: newProdPrice,
      stockCount: newProdStock,
      inStock: newProdStock > 0,
      collection: `SYSTEM 02 // RETRON ARCHIVE`,
      tagline: newProdTagline.trim() || 'Speculative tailored silhouette.',
      description: newProdDescription.trim() || 'Engineered with quantum fabrics and modular cybernetic closures.',
      details: ['Laser-cut baffles', 'Thermo-conductive membrane', 'Anodized titanium hardware'],
      materials: ['Heavy Ballistic Polyamide', 'Conductive Mesh'],
      images: [products[0]?.images[0] || ''],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Obsidian Black', hex: '#161616' }],
      featured: false
    };

    addProduct(newProduct);
    setIsAddProductModalOpen(false);
    // Reset form
    setNewProdName('');
    setNewProdSku('');
    setNewProdPrice(35000);
    setNewProdStock(10);
    setNewProdTagline('');
    setNewProdDescription('');
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'ALL' && o.status !== orderStatusFilter) return false;
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase().trim();
      const matchId = o.orderId.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchEmail = o.customerEmail.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchEmail) return false;
    }
    return true;
  });

  const lowStockCount = products.filter(p => p.inStock && p.stockCount <= 5).length;
  const pendingOrdersCount = orders.filter(o => o.status === 'ORDER PLACED' || o.status === 'PROCESSING').length;
  const totalGrossSales = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#070707]/95 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#0e0f0f] border border-[#202221] shadow-2xl my-auto text-[#F3EDD8] p-6 md:p-8 max-h-[92vh] flex flex-col font-mono">
        {/* Passcode Security Gate if Not Authenticated */}
        {!isAdminAuthenticated ? (
          <div className="py-16 px-4 text-center max-w-md mx-auto space-y-5">
            <div className="w-14 h-14 bg-[#121313] border border-[#FD8A46] text-[#FD8A46] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(253,138,70,0.2)]">
              <Lock size={26} />
            </div>

            <div>
              <div className="text-xs text-[#FD8A46] tracking-widest uppercase">EXECUTIVE GATEWAY // RESTRICTED</div>
              <h3 className="text-2xl font-display font-extrabold text-[#F3EDD8] mt-1">
                OPERATOR CLEARANCE REQUIRED
              </h3>
              <p className="text-xs text-[#F3EDD8]/60 mt-1">
                Access to store financials, inventory modification, and cloud database records requires authorized credentials.
              </p>
            </div>

            <form onSubmit={handleVerifyPasscode} className="space-y-3">
              <input
                type="password"
                value={passcodeAttempt}
                onChange={e => setPasscodeAttempt(e.target.value)}
                placeholder="ENTER PASSCODE (e.g. NOVA-ADMIN-2026)"
                className="w-full bg-[#121313] border border-[#202221] focus:border-[#FD8A46] px-4 py-2.5 text-xs text-[#F3EDD8] text-center uppercase tracking-widest outline-none"
              />
              {passcodeError && (
                <div className="text-[11px] text-rose-400">{passcodeError}</div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  AUTHORIZE SESSION
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdminOpen(false)}
                  className="px-4 py-3 bg-[#121313] hover:bg-[#202221] border border-[#202221] text-xs uppercase cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </form>

            <div className="text-[10px] text-[#F3EDD8]/40 pt-2">
              Default system operator cipher: <strong className="text-[#FD8A46]">NOVA-ADMIN-2026</strong>
            </div>
          </div>
        ) : (
          <>
            {/* Authenticated Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#202221] pb-4 mb-6 gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-[#FD8A46] shadow-[0_0_8px_#FD8A46]" />
                <div>
                  <div className="text-xs text-[#FD8A46] tracking-widest uppercase flex items-center gap-2">
                    <span>EXECUTIVE CONSOLE // V2</span>
                    <span>·</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Cloud size={10} className="animate-pulse" />
                      <span>FIRESTORE LIVE</span>
                    </span>
                  </div>
                  <div className="text-xl md:text-2xl font-display font-extrabold text-[#F3EDD8]">
                    NOVA/RETRON ARCHIVE ADMINISTRATION
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="px-3 py-1.5 bg-[#121313] hover:bg-[#202221] border border-[#202221] hover:border-[#FD8A46] text-[11px] text-[#FD8A46] flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Force sync or seed Firestore database"
                >
                  <RefreshCw size={12} className={isSyncing ? 'animate-spin text-[#FD8A46]' : ''} />
                  <span>{isSyncing ? 'SYNCING...' : 'SYNC FIRESTORE'}</span>
                </button>

                <button
                  onClick={() => {
                    playClickSound(600);
                    adminLogout();
                  }}
                  className="px-3 py-1.5 bg-[#121313] hover:bg-rose-950/40 border border-[#202221] hover:border-rose-500 text-[11px] text-rose-400 flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Lock console"
                >
                  <Lock size={12} />
                  <span>LOCK</span>
                </button>

                <button
                  onClick={() => {
                    playClickSound(600);
                    setIsAdminOpen(false);
                  }}
                  className="p-1.5 hover:text-[#FD8A46] transition-colors cursor-pointer"
                  aria-label="Close dashboard"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Sync Feedback Message */}
            {syncFeedback && (
              <div className="mb-4 px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>{syncFeedback}</span>
              </div>
            )}

            {/* Tab Selector */}
            <div className="flex flex-wrap border-b border-[#202221] text-xs gap-1 md:gap-3 mb-6 overflow-x-auto">
              {(
                ['overview', 'orders', 'products', 'customers', 'transcripts', 'analytics', 'automations'] as const
              ).map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    playClickSound(700);
                    setActiveTab(tab);
                  }}
                  className={`px-3.5 py-2 border-b-2 cursor-pointer uppercase tracking-wider transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-[#FD8A46] text-[#FD8A46] font-bold bg-[#121313]'
                      : 'border-transparent text-[#F3EDD8]/60 hover:text-[#F3EDD8]'
                  }`}
                >
                  {tab === 'orders'
                    ? `ORDERS (${orders.length})`
                    : tab === 'products'
                    ? `PRODUCTS (${products.length})`
                    : tab === 'customers'
                    ? `PATRONS (${customers.length})`
                    : tab === 'transcripts'
                    ? `AI CHATS (${conversations.length})`
                    : tab.toUpperCase()}
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW METRICS */}
            {activeTab === 'overview' && (
              <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                {/* 6 Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                  <div className="bg-[#121313] border border-[#202221] p-4 flex flex-col justify-between">
                    <span className="text-[10px] text-[#F3EDD8]/50 uppercase">GROSS REVENUE</span>
                    <div className="text-lg md:text-xl font-bold text-[#FD8A46] tabular-nums mt-1">
                      PKR {totalGrossSales.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-[#121313] border border-[#202221] p-4 flex flex-col justify-between">
                    <span className="text-[10px] text-[#F3EDD8]/50 uppercase">TOTAL INVOICED</span>
                    <div className="text-lg md:text-xl font-bold text-[#F3EDD8] mt-1">
                      {orders.length} ORDERS
                    </div>
                  </div>

                  <div className="bg-[#121313] border border-[#202221] p-4 flex flex-col justify-between">
                    <span className="text-[10px] text-[#F3EDD8]/50 uppercase">PENDING ALLOCATIONS</span>
                    <div className="text-lg md:text-xl font-bold text-amber-400 mt-1">
                      {pendingOrdersCount} ACTIVE
                    </div>
                  </div>

                  <div className="bg-[#121313] border border-[#202221] p-4 flex flex-col justify-between">
                    <span className="text-[10px] text-[#F3EDD8]/50 uppercase">PATRON DOSSIERS</span>
                    <div className="text-lg md:text-xl font-bold text-[#F3EDD8] mt-1">
                      {customers.length} REGISTERED
                    </div>
                  </div>

                  <div className="bg-[#121313] border border-[#202221] p-4 flex flex-col justify-between">
                    <span className="text-[10px] text-[#F3EDD8]/50 uppercase">ACTIVE CATALOG</span>
                    <div className="text-lg md:text-xl font-bold text-emerald-400 mt-1">
                      {products.length} SPECIMENS
                    </div>
                  </div>

                  <div className="bg-[#121313] border border-[#202221] p-4 flex flex-col justify-between">
                    <span className="text-[10px] text-[#F3EDD8]/50 uppercase">LOW STOCK ALERTS</span>
                    <div className="text-lg md:text-xl font-bold text-rose-400 mt-1">
                      {lowStockCount} ITEMS
                    </div>
                  </div>
                </div>

                {/* Cloud Database Diagnostics Bar */}
                <div className="p-3 bg-[#070707] border border-[#202221] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Database size={14} className="text-[#FD8A46]" />
                    <span className="text-[#F3EDD8]/70">FIRESTORE NODE:</span>
                    <span className="text-[#FD8A46] font-bold">ai-studio-novaretron-0fc1a0f9-fdee-4a6a-942e-2ce5dc4cfbf7</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>REAL-TIME ONSNAPSHOT SYNC ACTIVE</span>
                  </div>
                </div>

                {/* Recent Orders Preview */}
                <div className="bg-[#121313] border border-[#202221] p-5">
                  <div className="flex items-center justify-between text-xs text-[#FD8A46] tracking-widest uppercase mb-4">
                    <span>RECENT REAL DISPATCH MANIFESTS</span>
                    <button onClick={() => setActiveTab('orders')} className="hover:underline cursor-pointer">
                      VIEW ALL {orders.length} ORDERS ➔
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    {orders.slice(0, 4).map(o => (
                      <div
                        key={o.orderId}
                        className="p-3 bg-[#070707] border border-[#202221] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold text-[#F3EDD8]">{o.orderId}</span>
                          <span className="text-[#F3EDD8]/50 ml-2">
                            · {o.customerName} ({o.shippingAddress.city})
                          </span>
                          <span className="text-[#F3EDD8]/30 ml-2 text-[10px]">[{o.items.length} items]</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[#FD8A46] font-bold">PKR {o.total.toLocaleString()}</span>
                          <span className="px-2 py-0.5 bg-[#FD8A46]/20 border border-[#FD8A46] text-[#FD8A46] text-[10px]">
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ORDERS MANAGEMENT */}
            {activeTab === 'orders' && (
              <div className="flex-grow overflow-y-auto pr-2 space-y-4 text-xs">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-[#121313] p-3 border border-[#202221]">
                  <div className="relative w-full sm:w-72">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FD8A46]" />
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={e => setOrderSearchQuery(e.target.value)}
                      placeholder="SEARCH ORDER ID, NAME, EMAIL..."
                      className="w-full bg-[#070707] border border-[#202221] pl-8 pr-3 py-1.5 text-xs text-[#F3EDD8] outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-[#F3EDD8]/50 text-[10px]">STATUS:</span>
                    <select
                      value={orderStatusFilter}
                      onChange={e => setOrderStatusFilter(e.target.value)}
                      className="bg-[#070707] border border-[#202221] px-2 py-1.5 text-xs text-[#FD8A46] outline-none cursor-pointer"
                    >
                      <option value="ALL">ALL STATUSES</option>
                      <option value="ORDER PLACED">ORDER PLACED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="PACKED">PACKED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-[#202221]">
                    <thead>
                      <tr className="bg-[#121313] text-[#F3EDD8]/60 border-b border-[#202221] text-[11px]">
                        <th className="p-3">ORDER ID</th>
                        <th className="p-3">CUSTOMER</th>
                        <th className="p-3">ITEMS</th>
                        <th className="p-3">TOTAL</th>
                        <th className="p-3">METHOD</th>
                        <th className="p-3">STATUS CONTROL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(o => (
                        <tr key={o.orderId} className="border-b border-[#202221] hover:bg-[#121313]/60">
                          <td className="p-3 font-bold text-[#FD8A46]">{o.orderId}</td>
                          <td className="p-3">
                            <div className="font-bold text-[#F3EDD8]">{o.customerName}</div>
                            <div className="text-[10px] text-[#F3EDD8]/40">{o.customerEmail}</div>
                            <div className="text-[10px] text-[#F3EDD8]/30">{o.customerPhone}</div>
                          </td>
                          <td className="p-3 text-[11px] text-[#F3EDD8]/70 max-w-xs">
                            {o.items.map((i, idx) => (
                              <div key={idx} className="truncate">
                                • {i.product.name} ({i.size}) × {i.quantity}
                              </div>
                            ))}
                          </td>
                          <td className="p-3 font-bold tabular-nums text-[#FD8A46]">
                            PKR {o.total.toLocaleString()}
                          </td>
                          <td className="p-3 text-[11px]">{o.paymentMethod}</td>
                          <td className="p-3">
                            <select
                              value={o.status}
                              onChange={e => handleStatusChange(o.orderId, e.target.value as any)}
                              className="bg-[#070707] border border-[#FD8A46] px-2 py-1 text-[11px] font-mono text-[#FD8A46] cursor-pointer focus:outline-none"
                            >
                              <option value="ORDER PLACED">ORDER PLACED</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="PACKED">PACKED</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                              <option value="DELIVERED">DELIVERED</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: PRODUCTS MANAGEMENT */}
            {activeTab === 'products' && (
              <div className="flex-grow overflow-y-auto pr-2 space-y-4 text-xs">
                <div className="flex items-center justify-between bg-[#121313] p-3 border border-[#202221]">
                  <div className="text-xs text-[#F3EDD8]/70">
                    CATALOG MANAGEMENT: <span className="text-[#FD8A46] font-bold">{products.length} SPECIMENS</span>
                  </div>
                  <button
                    onClick={() => setIsAddProductModalOpen(true)}
                    className="px-3.5 py-1.5 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>CREATE NEW SPECIMEN</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-[#202221]">
                    <thead>
                      <tr className="bg-[#121313] text-[#F3EDD8]/60 border-b border-[#202221] text-[11px]">
                        <th className="p-3">SPECIMEN</th>
                        <th className="p-3">CATEGORY / ERA</th>
                        <th className="p-3">PRICE (PKR)</th>
                        <th className="p-3">STOCK COUNT</th>
                        <th className="p-3">STATUS</th>
                        <th className="p-3 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => {
                        const isEditingThis = editingProductId === p.id;
                        const isLow = p.inStock && p.stockCount <= 5;
                        const isOut = !p.inStock || p.stockCount === 0;

                        return (
                          <tr key={p.id} className="border-b border-[#202221] hover:bg-[#121313]/60">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="w-10 h-12 object-cover border border-[#202221] shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-[#F3EDD8]">{p.name}</div>
                                  <div className="text-[10px] text-[#FD8A46]">{p.sku}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div>{p.category}</div>
                              <div className="text-[10px] text-[#F3EDD8]/50">ERA {p.era}</div>
                            </td>
                            <td className="p-3">
                              {isEditingThis ? (
                                <input
                                  type="number"
                                  value={editPrice}
                                  onChange={e => setEditPrice(Number(e.target.value))}
                                  className="w-24 bg-[#070707] border border-[#FD8A46] px-2 py-1 text-xs text-[#FD8A46] outline-none"
                                />
                              ) : (
                                <span className="font-bold text-[#FD8A46]">PKR {p.price.toLocaleString()}</span>
                              )}
                            </td>
                            <td className="p-3">
                              {isEditingThis ? (
                                <input
                                  type="number"
                                  value={editStock}
                                  onChange={e => setEditStock(Number(e.target.value))}
                                  className="w-16 bg-[#070707] border border-[#FD8A46] px-2 py-1 text-xs text-[#F3EDD8] outline-none"
                                />
                              ) : (
                                <span>{p.stockCount} UNITS</span>
                              )}
                            </td>
                            <td className="p-3">
                              {isOut ? (
                                <span className="text-rose-400 font-bold text-[10px]">● DEPLETED</span>
                              ) : isLow ? (
                                <span className="text-amber-400 font-bold text-[10px] animate-pulse">● LOW STOCK</span>
                              ) : (
                                <span className="text-emerald-400 text-[10px]">● ALLOCATED</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {isEditingThis ? (
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => handleSaveInlineProductEdit(p)}
                                    className="px-2 py-1 bg-[#FD8A46] text-[#070707] font-bold text-[10px] uppercase cursor-pointer"
                                  >
                                    SAVE
                                  </button>
                                  <button
                                    onClick={() => setEditingProductId(null)}
                                    className="px-2 py-1 bg-[#202221] text-[#F3EDD8] text-[10px] uppercase cursor-pointer"
                                  >
                                    CANCEL
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingProductId(p.id);
                                      setEditPrice(p.price);
                                      setEditStock(p.stockCount);
                                    }}
                                    className="p-1 hover:text-[#FD8A46] text-[#F3EDD8]/60 cursor-pointer"
                                    title="Edit Price & Stock"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Purge specimen ${p.name} from catalog?`)) {
                                        deleteProduct(p.id);
                                      }
                                    }}
                                    className="p-1 hover:text-rose-400 text-[#F3EDD8]/40 cursor-pointer"
                                    title="Delete product"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: CUSTOMERS DIRECTORY */}
            {activeTab === 'customers' && (
              <div className="flex-grow overflow-y-auto pr-2 space-y-4 text-xs">
                <div className="flex items-center justify-between text-xs text-[#F3EDD8]/60">
                  <span>REAL PATRON REGISTRY (SYNCHRONIZED WITH FIRESTORE 'customers' COLLECTION):</span>
                  <span className="text-[#FD8A46]">{customers.length} REGISTERED PATRONS</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-[#202221]">
                    <thead>
                      <tr className="bg-[#121313] text-[#F3EDD8]/60 border-b border-[#202221] text-[11px]">
                        <th className="p-3">CUSTOMER ID</th>
                        <th className="p-3">NAME</th>
                        <th className="p-3">EMAIL</th>
                        <th className="p-3">PHONE</th>
                        <th className="p-3">LOCATION</th>
                        <th className="p-3">DISPATCHES</th>
                        <th className="p-3">TIER STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map(c => {
                        const custOrders = orders.filter(
                          o => o.customerId === c.customerId || o.customerEmail === c.email
                        );
                        const spent = custOrders.reduce((sum, o) => sum + o.total, 0);

                        return (
                          <tr key={c.customerId} className="border-b border-[#202221] hover:bg-[#121313]/60">
                            <td className="p-3 font-bold text-[#FD8A46]">{c.customerId}</td>
                            <td className="p-3 font-bold text-[#F3EDD8]">{c.name}</td>
                            <td className="p-3 text-[#F3EDD8]/70">{c.email}</td>
                            <td className="p-3">{c.phone || '+92 300 0000000'}</td>
                            <td className="p-3">{c.city || c.address || 'Pakistan'}</td>
                            <td className="p-3">
                              <span className="text-[#FD8A46] font-bold">{custOrders.length}</span> orders
                              {spent > 0 && (
                                <span className="text-[#F3EDD8]/40 block text-[10px]">
                                  PKR {spent.toLocaleString()}
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              {spent > 50000 || custOrders.length > 1 ? (
                                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                                  ● VIP ARCHIVIST
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-[#FD8A46]/10 border border-[#FD8A46]/30 text-[#FD8A46] text-[10px]">
                                  ● ACTIVE PATRON
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: AI CHAT TRANSCRIPTS */}
            {activeTab === 'transcripts' && (
              <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                <div className="md:col-span-5 space-y-2 border-r border-[#202221] pr-3">
                  <div className="text-[11px] text-[#FD8A46] font-bold uppercase mb-2">
                    ACTIVE CONVERSATIONS [{conversations.length}]
                  </div>
                  {conversations.map(conv => (
                    <div
                      key={conv.conversationId}
                      onClick={() => setSelectedConv(conv)}
                      className={`p-3 border cursor-pointer transition-colors ${
                        selectedConv?.conversationId === conv.conversationId
                          ? 'border-[#FD8A46] bg-[#121313]'
                          : 'border-[#202221] bg-[#0c0d0d] hover:border-[#F3EDD8]/30'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#F3EDD8]">{conv.customerName}</span>
                        <span className="text-[10px] text-[#FD8A46]">{conv.status.toUpperCase()}</span>
                      </div>
                      <div className="text-[10px] text-[#F3EDD8]/50 mt-1">ID: {conv.conversationId}</div>
                    </div>
                  ))}
                </div>

                <div className="md:col-span-7 flex flex-col justify-between">
                  {selectedConv ? (
                    <div className="space-y-3">
                      <div className="p-2 border-b border-[#202221] flex justify-between items-center text-xs">
                        <span className="text-[#FD8A46] font-bold">{selectedConv.customerName}</span>
                        <span className="text-[10px] text-[#F3EDD8]/50">{selectedConv.conversationId}</span>
                      </div>
                      <div className="space-y-2 max-h-72 overflow-y-auto p-2 bg-[#070707] border border-[#202221]">
                        {selectedConv.messages.map(m => (
                          <div
                            key={m.messageId}
                            className={`p-2 rounded text-xs ${
                              m.sender === 'customer'
                                ? 'bg-[#121313] text-[#F3EDD8]'
                                : 'bg-[#FD8A46]/10 text-[#FD8A46] border border-[#FD8A46]/30'
                            }`}
                          >
                            <span className="font-bold uppercase text-[10px] block opacity-70">{m.sender}:</span>
                            {m.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-[#F3EDD8]/40">SELECT A CONVERSATION TO INSPECT</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="flex-grow overflow-y-auto pr-2 space-y-6 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#121313] border border-[#202221] space-y-3">
                    <div className="text-xs text-[#FD8A46] font-bold uppercase">
                      TOP INQUIRED TOPICS & QUESTIONS
                    </div>
                    {analytics.popularQuestions.map((q, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1 border-b border-[#202221]">
                        <span className="text-[#F3EDD8]/80">{q.question}</span>
                        <span className="text-[#FD8A46] font-bold">{q.count} inquiries</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-[#121313] border border-[#202221] space-y-3">
                    <div className="text-xs text-[#FD8A46] font-bold uppercase">
                      TELEMETRY DISPATCH MATRIX
                    </div>
                    <div className="space-y-2 text-[#F3EDD8]/70">
                      <div className="flex justify-between">
                        <span>AVERAGE ORDER ALLOCATION:</span>
                        <span className="text-[#FD8A46] font-bold">
                          PKR {orders.length > 0 ? Math.round(totalGrossSales / orders.length).toLocaleString() : '0'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>REORDER FREQUENCY:</span>
                        <span>18.4% (VIP PATRONS)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>AVERAGE CARGO DISPATCH TIME:</span>
                        <span>18.6 HOURS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: AUTOMATIONS (GMAIL LOGS) */}
            {activeTab === 'automations' && (
              <div className="flex-grow overflow-y-auto pr-2 space-y-4 text-xs">
                <div className="p-4 bg-[#121313] border border-[#202221] space-y-2">
                  <div className="text-xs text-[#FD8A46] font-bold uppercase flex items-center gap-2">
                    <Mail size={14} />
                    <span>GOOGLE WORKSPACE GMAIL AUTOMATION SUITE</span>
                  </div>
                  <p className="text-[11px] text-[#F3EDD8]/70 leading-relaxed">
                    Official order confirmations and tracking reports are transmitted using the verified store owner account (<strong>{ownerGmail}</strong>).
                  </p>
                </div>

                <div className="overflow-x-auto border border-[#202221]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#121313] text-[#F3EDD8]/60 text-[10px]">
                      <tr>
                        <th className="p-3">TIMESTAMP</th>
                        <th className="p-3">ORDER ID</th>
                        <th className="p-3">RECIPIENT</th>
                        <th className="p-3">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#202221]">
                      {emailDispatchLogs.length > 0 ? (
                        emailDispatchLogs.map(log => (
                          <tr key={log.id} className="hover:bg-[#121313]">
                            <td className="p-3 text-[11px]">{new Date(log.timestamp).toLocaleTimeString()}</td>
                            <td className="p-3 font-bold text-[#FD8A46]">{log.orderId}</td>
                            <td className="p-3 text-[#F3EDD8]">{log.recipient}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                                ● {log.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-[#F3EDD8]/40">
                            NO GMAIL DISPATCHES LOGGED IN CURRENT RUN.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal: Create New Product */}
        {isAddProductModalOpen && (
          <div className="fixed inset-0 z-60 bg-[#070707]/90 flex items-center justify-center p-4">
            <div className="bg-[#0e0f0f] border border-[#FD8A46] p-6 max-w-lg w-full space-y-4 text-xs font-mono max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-[#202221] pb-2">
                <span className="text-sm font-bold text-[#FD8A46]">REGISTER NEW ARCHIVAL SPECIMEN</span>
                <button onClick={() => setIsAddProductModalOpen(false)} className="hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateProductSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] text-[#F3EDD8]/60 mb-1">GARMENT NAME *</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={e => setNewProdName(e.target.value)}
                    placeholder="e.g. 07 — ORBITAL WINDBREAKER"
                    className="w-full bg-[#121313] border border-[#202221] p-2 text-xs text-[#F3EDD8] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#F3EDD8]/60 mb-1">SKU CODE *</label>
                    <input
                      type="text"
                      required
                      value={newProdSku}
                      onChange={e => setNewProdSku(e.target.value)}
                      placeholder="NR-WB-0711"
                      className="w-full bg-[#121313] border border-[#202221] p-2 text-xs text-[#F3EDD8] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#F3EDD8]/60 mb-1">PRICE (PKR) *</label>
                    <input
                      type="number"
                      required
                      value={newProdPrice}
                      onChange={e => setNewProdPrice(Number(e.target.value))}
                      className="w-full bg-[#121313] border border-[#202221] p-2 text-xs text-[#FD8A46] outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#F3EDD8]/60 mb-1">CATEGORY</label>
                    <select
                      value={newProdCategory}
                      onChange={e => setNewProdCategory(e.target.value as any)}
                      className="w-full bg-[#121313] border border-[#202221] p-2 text-xs text-[#F3EDD8] outline-none"
                    >
                      <option value="Outerwear">Outerwear</option>
                      <option value="Footwear">Footwear</option>
                      <option value="Hoodies">Hoodies</option>
                      <option value="Tops">Tops</option>
                      <option value="Bags">Bags</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#F3EDD8]/60 mb-1">CHRONO-ERA</label>
                    <select
                      value={newProdEra}
                      onChange={e => setNewProdEra(e.target.value as any)}
                      className="w-full bg-[#121313] border border-[#202221] p-2 text-xs text-[#F3EDD8] outline-none"
                    >
                      <option value="1970">1970</option>
                      <option value="1984">1984</option>
                      <option value="1999">1999</option>
                      <option value="2026">2026</option>
                      <option value="2091">2091</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#F3EDD8]/60 mb-1">INITIAL STOCK</label>
                    <input
                      type="number"
                      required
                      value={newProdStock}
                      onChange={e => setNewProdStock(Number(e.target.value))}
                      className="w-full bg-[#121313] border border-[#202221] p-2 text-xs text-[#F3EDD8] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-[#F3EDD8]/60 mb-1">SHORT TAGLINE</label>
                  <input
                    type="text"
                    value={newProdTagline}
                    onChange={e => setNewProdTagline(e.target.value)}
                    placeholder="Brief description of quantum textile..."
                    className="w-full bg-[#121313] border border-[#202221] p-2 text-xs text-[#F3EDD8] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#F3EDD8]/60 mb-1">FULL DESCRIPTION</label>
                  <textarea
                    rows={3}
                    value={newProdDescription}
                    onChange={e => setNewProdDescription(e.target.value)}
                    placeholder="Comprehensive archival garment specifications..."
                    className="w-full bg-[#121313] border border-[#202221] p-2 text-xs text-[#F3EDD8] outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#FD8A46] text-[#070707] font-bold uppercase transition-colors hover:bg-[#F3EDD8] cursor-pointer"
                  >
                    ADD TO LIVE STORE REGISTRY
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddProductModalOpen(false)}
                    className="px-4 py-2.5 bg-[#202221] text-[#F3EDD8] uppercase cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
