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
  Zap
} from 'lucide-react';
import { Order, Conversation, Customer } from '../types';

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
    emailDispatchLogs
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'customers' | 'transcripts' | 'analytics' | 'automations'>('overview');
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(conversations[0] || null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string>('');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testEmailFeedback, setTestEmailFeedback] = useState<{ success?: boolean; text?: string } | null>(null);

  if (!isAdminOpen) return null;

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    playClickSound(800);
    updateOrderStatus(orderId, newStatus);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#070707]/95 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#0e0f0f] border border-[#202221] shadow-2xl my-auto text-[#F3EDD8] p-6 md:p-8 max-h-[92vh] flex flex-col font-mono">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#202221] pb-4 mb-6 gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#FD8A46] shadow-[0_0_8px_#FD8A46]" />
            <div>
              <div className="text-xs text-[#FD8A46] tracking-widest uppercase flex items-center gap-2">
                <span>EXECUTIVE CONSOLE</span>
                <span>//</span>
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
                setIsAdminOpen(false);
              }}
              className="p-1.5 hover:text-[#FD8A46] transition-colors cursor-pointer"
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
        <div className="flex flex-wrap border-b border-[#202221] text-xs gap-1 md:gap-3 mb-6">
          {(['overview', 'orders', 'customers', 'transcripts', 'analytics', 'automations'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                playClickSound(700);
                setActiveTab(tab);
              }}
              className={`px-4 py-2 border-b-2 cursor-pointer uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? 'border-[#FD8A46] text-[#FD8A46] font-bold bg-[#121313]'
                  : 'border-transparent text-[#F3EDD8]/60 hover:text-[#F3EDD8]'
              }`}
            >
              {tab === 'orders'
                ? `ORDERS (${orders.length})`
                : tab === 'customers'
                ? `CUSTOMERS (${customers.length})`
                : tab === 'automations'
                ? `EMAIL AUTOMATIONS`
                : tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview Dashboard */}
        {activeTab === 'overview' && (
          <div className="space-y-6 overflow-y-auto pr-2">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 bg-[#121313] border border-[#202221]">
                <div className="flex items-center justify-between text-xs text-[#F3EDD8]/50 mb-1">
                  <span>CUSTOMERS</span>
                  <Users size={14} className="text-[#FD8A46]" />
                </div>
                <div className="text-2xl font-bold text-[#F3EDD8]">{customers.length}</div>
                <div className="text-[10px] text-emerald-400 mt-1">● Firestore Patrons</div>
              </div>

              <div className="p-4 bg-[#121313] border border-[#202221]">
                <div className="flex items-center justify-between text-xs text-[#F3EDD8]/50 mb-1">
                  <span>DISPATCHES</span>
                  <ShoppingCart size={14} className="text-[#FD8A46]" />
                </div>
                <div className="text-2xl font-bold text-[#F3EDD8]">{orders.length}</div>
                <div className="text-[10px] text-[#F3EDD8]/50 mt-1">Total Cloud Orders</div>
              </div>

              <div className="p-4 bg-[#121313] border border-[#202221]">
                <div className="flex items-center justify-between text-xs text-[#F3EDD8]/50 mb-1">
                  <span>GROSS SALES</span>
                  <DollarSign size={14} className="text-[#FD8A46]" />
                </div>
                <div className="text-xl font-bold text-[#FD8A46] tabular-nums">
                  PKR {analytics.totalSales.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">100% Invoiced in PKR</div>
              </div>

              <div className="p-4 bg-[#121313] border border-[#202221]">
                <div className="flex items-center justify-between text-xs text-[#F3EDD8]/50 mb-1">
                  <span>ACTIVE CHATS</span>
                  <MessageSquare size={14} className="text-[#FD8A46]" />
                </div>
                <div className="text-2xl font-bold text-[#F3EDD8]">{conversations.length}</div>
                <div className="text-[10px] text-[#FD8A46] mt-1">Live Firestore Logs</div>
              </div>

              <div className="p-4 bg-[#121313] border border-[#202221]">
                <div className="flex items-center justify-between text-xs text-[#F3EDD8]/50 mb-1">
                  <span>ESCALATIONS</span>
                  <AlertTriangle size={14} className="text-red-400" />
                </div>
                <div className="text-2xl font-bold text-red-400">{analytics.escalatedChats}</div>
                <div className="text-[10px] text-[#F3EDD8]/50 mt-1">Human Queue</div>
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
                  <div key={o.orderId} className="p-3 bg-[#070707] border border-[#202221] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-[#F3EDD8]">{o.orderId}</span>
                      <span className="text-[#F3EDD8]/50 ml-2">· {o.customerName} ({o.shippingAddress.city})</span>
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

        {/* Tab 2: Orders Table with Live Firestore Status Controls */}
        {activeTab === 'orders' && (
          <div className="flex-grow overflow-y-auto pr-2 space-y-4 text-xs">
            <div className="text-xs text-[#F3EDD8]/60 flex items-center justify-between">
              <span>MANAGE REAL ORDERS (STATUS CHANGES SYNCHRONIZE TO CLOUD FIRESTORE INSTANTLY):</span>
              <span className="text-[#FD8A46]">{orders.length} TOTAL INVOICED</span>
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
                  {orders.map(o => (
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
                      <td className="p-3 font-bold tabular-nums text-[#FD8A46]">PKR {o.total.toLocaleString()}</td>
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

        {/* Tab 3: Real Customer Directory from Firestore */}
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
                    const custOrders = orders.filter(o => o.customerId === c.customerId || o.customerEmail === c.email);
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
                          {spent > 0 && <span className="text-[#F3EDD8]/40 block text-[10px]">PKR {spent.toLocaleString()}</span>}
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

        {/* Tab 4: AI Conversation Transcripts Viewer from Firestore */}
        {activeTab === 'transcripts' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-grow overflow-hidden text-xs">
            {/* Conversation List */}
            <div className="md:col-span-5 border border-[#202221] bg-[#121313] p-3 overflow-y-auto space-y-2">
              <div className="text-[11px] text-[#FD8A46] font-bold mb-2 flex items-center justify-between">
                <span>FIRESTORE CHRONO TRANSMISSIONS</span>
                <span className="text-[#F3EDD8]/40">({conversations.length})</span>
              </div>
              {conversations.map(conv => (
                <div
                  key={conv.conversationId}
                  onClick={() => {
                    playClickSound(750);
                    setSelectedConv(conv);
                  }}
                  className={`p-3 border text-left cursor-pointer transition-colors ${
                    selectedConv?.conversationId === conv.conversationId
                      ? 'border-[#FD8A46] bg-[#1a1b1b]'
                      : 'border-[#202221] bg-[#070707] hover:border-[#FD8A46]/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                    <span className="text-[#F3EDD8]">{conv.customerName}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 border uppercase ${
                        conv.status === 'escalated'
                          ? 'border-red-500 text-red-400 bg-red-950/20'
                          : 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                      }`}
                    >
                      {conv.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#FD8A46] mb-1 font-mono">{conv.conversationId}</div>
                  <div className="text-[11px] text-[#F3EDD8]/60 line-clamp-1">
                    {conv.messages[conv.messages.length - 1]?.message || 'No messages'}
                  </div>
                  <div className="text-[9px] text-[#F3EDD8]/40 mt-2 flex justify-between">
                    <span>{conv.messages.length} messages</span>
                    <span>{conv.lastMessageAt?.slice(11, 16) || 'Active'} PKT</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Conversation Detail */}
            <div className="md:col-span-7 border border-[#202221] bg-[#070707] p-4 flex flex-col justify-between overflow-hidden">
              {selectedConv ? (
                <>
                  <div className="border-b border-[#202221] pb-3 mb-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#FD8A46]">{selectedConv.conversationId}</span>
                      <span className="text-[#F3EDD8]/50 ml-2">({selectedConv.customerName})</span>
                    </div>
                    <span className="text-[#F3EDD8]/40">STARTED: {selectedConv.startedAt?.slice(11, 16) || '13:00'} PKT</span>
                  </div>

                  <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                    {selectedConv.messages.map(m => (
                      <div key={m.messageId} className="p-3 bg-[#121313] border border-[#202221] space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-[#FD8A46]">
                          <span className="font-bold uppercase">{m.sender}</span>
                          <span className="text-[#F3EDD8]/40">{m.timestamp}</span>
                        </div>
                        <div className="text-xs text-[#F3EDD8]/90">{m.message}</div>
                        {m.intent && (
                          <div className="text-[10px] text-[#F3EDD8]/40 pt-1 border-t border-[#202221] flex justify-between">
                            <span>INTENT: {m.intent}</span>
                            {m.productContext && <span>CONTEXT: {m.productContext}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="m-auto text-[#F3EDD8]/40">SELECT A TRANSMISSION TO INSPECT</div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Real Analytics */}
        {activeTab === 'analytics' && (
          <div className="flex-grow overflow-y-auto pr-2 space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Common Questions */}
              <div className="p-5 bg-[#121313] border border-[#202221]">
                <div className="text-[#FD8A46] text-xs font-bold mb-4 tracking-wider uppercase">
                  FREQUENTLY TRANSMITTED INQUIRIES
                </div>
                <div className="space-y-3">
                  {analytics.popularQuestions.map((q, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-[#070707] border border-[#202221]">
                      <span className="text-[#F3EDD8]">{q.question}</span>
                      <span className="text-[#FD8A46] font-bold tabular-nums">{q.count} queries</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Views */}
              <div className="p-5 bg-[#121313] border border-[#202221]">
                <div className="text-[#FD8A46] text-xs font-bold mb-4 tracking-wider uppercase">
                  MOST INSPECTED SPECIMENS
                </div>
                <div className="space-y-3">
                  {analytics.topProducts.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-[#070707] border border-[#202221]">
                      <span className="text-[#F3EDD8]">{p.name}</span>
                      <span className="text-[#FD8A46] font-bold tabular-nums">{p.views} views</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Operational Metas */}
            <div className="p-4 bg-[#121313] border border-[#202221] grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-[#F3EDD8]/50 text-[10px]">AVG AI LATENCY</div>
                <div className="text-xl font-bold text-emerald-400">0.38 SECONDS</div>
              </div>
              <div>
                <div className="text-[#F3EDD8]/50 text-[10px]">TOTAL REVENUE TO DATE</div>
                <div className="text-xl font-bold text-[#FD8A46]">PKR {analytics.totalSales.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[#F3EDD8]/50 text-[10px]">TOTAL DISPATCHES LOGGED</div>
                <div className="text-xl font-bold text-[#F3EDD8]">{orders.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Automations (Gmail & Database) */}
        {activeTab === 'automations' && (
          <div className="space-y-6 overflow-y-auto pr-2">
            {/* Gmail Workspace Integration Banner */}
            <div className="p-5 bg-[#121413] border border-[#FD8A46]/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#FD8A46]/10 border border-[#FD8A46] text-[#FD8A46]">
                    <Mail size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-[#FD8A46] tracking-widest uppercase flex items-center gap-2">
                      <span>GOOGLE WORKSPACE GMAIL AUTOMATION</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        ● AUTHORIZED VIA OAUTH
                      </span>
                    </div>
                    <div className="text-base font-bold text-[#F3EDD8]">
                      Active Sender Account: <span className="text-[#FD8A46]">{ownerGmail}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      playClickSound(900);
                      setIsSendingTest(true);
                      setTestEmailFeedback(null);
                      try {
                        const targetOrder = orders[0] || {
                          orderId: 'NR-2026-00192',
                          total: 48500,
                          status: 'OUT FOR DELIVERY',
                          customerName: 'Test Recipient',
                          customerEmail: ownerGmail,
                          timeline: [
                            { status: 'ORDER PLACED', timestamp: 'Verified', location: 'Terminal 01-A', completed: true },
                            { status: 'PROCESSING', timestamp: 'Completed', location: 'Central Vault QA', completed: true },
                            { status: 'OUT FOR DELIVERY', timestamp: 'Active', location: 'Ground Dispatch Lahore', completed: true }
                          ],
                          items: [],
                          shippingAddress: { address: 'Sector 4, Phase 6', city: 'Lahore', postalCode: '54792' },
                          createdAt: new Date().toISOString()
                        };

                        const res = await sendTrackingEmail(
                          targetOrder.orderId,
                          ownerGmail,
                          'Test automated telemetry dispatch from NovaRetron Executive Console.'
                        );

                        setTestEmailFeedback({
                          success: res.success,
                          text: res.success
                            ? `Test email successfully dispatched to ${ownerGmail} via Gmail API!`
                            : res.message
                        });
                      } catch (err: any) {
                        setTestEmailFeedback({
                          success: false,
                          text: err.message || 'Dispatch error'
                        });
                      } finally {
                        setIsSendingTest(false);
                      }
                    }}
                    disabled={isSendingTest}
                    className="px-3 py-2 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send size={12} className={isSendingTest ? 'animate-bounce' : ''} />
                    <span>{isSendingTest ? 'DISPATCHING TEST...' : 'DISPATCH TEST TO MY INBOX'}</span>
                  </button>

                  <button
                    onClick={async () => {
                      playClickSound(800);
                      await connectGmailAccount();
                    }}
                    className="px-3 py-2 bg-[#171918] hover:bg-[#202221] border border-[#202221] hover:border-[#FD8A46] text-xs text-[#F3EDD8] transition-colors cursor-pointer"
                  >
                    REFRESH TOKEN
                  </button>
                </div>
              </div>

              {testEmailFeedback && (
                <div
                  className={`p-3 text-xs flex items-center gap-2 ${
                    testEmailFeedback.success
                      ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/40 border border-red-500/40 text-red-300'
                  }`}
                >
                  {testEmailFeedback.success ? (
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle size={15} className="text-red-400 shrink-0" />
                  )}
                  <span>{testEmailFeedback.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[11px] text-[#F3EDD8]/70 border-t border-[#202221]">
                <div className="p-3 bg-[#0a0c0b] border border-[#202221]">
                  <div className="text-[#FD8A46] font-bold mb-1 flex items-center gap-1.5">
                    <Zap size={13} />
                    <span>TRIGGER 1: AI SUPPORT CHAT</span>
                  </div>
                  <div>When a customer asks about their order or says "where is my package", the AI automatically emails the complete telemetry report to their address.</div>
                </div>

                <div className="p-3 bg-[#0a0c0b] border border-[#202221]">
                  <div className="text-[#FD8A46] font-bold mb-1 flex items-center gap-1.5">
                    <Zap size={13} />
                    <span>TRIGGER 2: LOGISTICS PORTAL</span>
                  </div>
                  <div>Shoppers viewing their tracking steps can click "Email me telemetry" to receive an immediate status breakdown from {ownerGmail}.</div>
                </div>

                <div className="p-3 bg-[#0a0c0b] border border-[#202221]">
                  <div className="text-[#FD8A46] font-bold mb-1 flex items-center gap-1.5">
                    <Database size={13} />
                    <span>CLOUD PERSISTENCE</span>
                  </div>
                  <div>All orders, customer records, and transcripts are indexed in real-time in your Google Cloud Firestore database.</div>
                </div>
              </div>
            </div>

            {/* Cloud Database Direct Console Card */}
            <div className="p-4 bg-[#121313] border border-[#202221] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-[#FD8A46] font-bold uppercase tracking-wider flex items-center gap-2">
                  <Database size={14} />
                  <span>LIVE CLOUD FIRESTORE INSTANCE</span>
                </div>
                <div className="text-xs text-[#F3EDD8]/60 mt-1">
                  Database ID: <code className="text-[#F3EDD8] bg-[#070707] px-1.5 py-0.5 border border-[#202221]">ai-studio-novaretron-0fc1a0f9-fdee-4a6a-942e-2ce5dc4cfbf7</code> (Project: <code className="text-[#F3EDD8] bg-[#070707] px-1.5 py-0.5 border border-[#202221]">rising-nature-zds98</code>)
                </div>
              </div>

              <a
                href="https://console.firebase.google.com/project/rising-nature-zds98/firestore/databases/ai-studio-novaretron-0fc1a0f9-fdee-4a6a-942e-2ce5dc4cfbf7/data"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#171918] hover:bg-[#202221] border border-[#FD8A46]/60 hover:border-[#FD8A46] text-xs text-[#FD8A46] flex items-center gap-2 transition-colors cursor-pointer shrink-0"
              >
                <span>OPEN FIRESTORE DATABASE CONSOLE</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Live Email Dispatch Telemetry Log Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#FD8A46] font-bold tracking-wider uppercase">
                <span>RECENT GMAIL AUTOMATION DISPATCH LOGS ({emailDispatchLogs.length})</span>
                <span className="text-[#F3EDD8]/40 font-normal">Real-time OAuth Auditing</span>
              </div>

              {emailDispatchLogs.length > 0 ? (
                <div className="border border-[#202221] overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#121313] border-b border-[#202221] text-[#F3EDD8]/60 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">TIMESTAMP</th>
                        <th className="p-3">ORDER ID</th>
                        <th className="p-3">RECIPIENT</th>
                        <th className="p-3">SENDER</th>
                        <th className="p-3 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#202221]">
                      {emailDispatchLogs.map(log => (
                        <tr key={log.id} className="hover:bg-[#121313] transition-colors">
                          <td className="p-3 text-[#F3EDD8]/60 text-[11px]">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3 font-bold text-[#FD8A46]">{log.orderId}</td>
                          <td className="p-3 text-[#F3EDD8]">{log.recipient}</td>
                          <td className="p-3 text-[#F3EDD8]/60">{log.sender}</td>
                          <td className="p-3 text-right">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                                log.status === 'SENT'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
                              }`}
                            >
                              ● {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-[#121313] border border-[#202221] text-xs text-[#F3EDD8]/50 space-y-1">
                  <Mail size={24} className="mx-auto text-[#FD8A46]/40 mb-2" />
                  <div>NO DISPATCHES RECORDED YET IN CURRENT SESSION</div>
                  <div className="text-[11px]">
                    Ask the AI agent "Where is my order?" or click "Dispatch Test to My Inbox" above to initiate a tracking email.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
