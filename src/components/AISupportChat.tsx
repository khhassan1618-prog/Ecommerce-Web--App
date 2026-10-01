import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import { generateAIResponse } from '../services/aiService';
import { useLiveVoiceAgent } from '../utils/useLiveVoiceAgent';
import {
  X,
  Send,
  Bot,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Globe,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Cpu,
  Radio,
  AlertCircle,
  Sparkles,
  Mail,
  Truck,
  CheckCircle2
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'WHERE IS MY ORDER?',
  'WHAT IS YOUR RETURN POLICY?',
  'SHOW ME JACKETS',
  'WHAT SIZE SHOULD I GET?',
  'WHAT ARE YOUR DELIVERY TIMES?',
  'I WANT TO SPEAK TO A HUMAN'
];

export const AISupportChat: React.FC = () => {
  const {
    isAISupportOpen,
    setIsAISupportOpen,
    activeConversation,
    addChatMessage,
    clearChatHistory,
    currentCustomer,
    orders,
    selectedProduct,
    products,
    setSelectedProduct,
    setIsPDPModalOpen,
    playClickSound,
    recordQuestionAsked,
    sendTrackingEmail,
    ownerGmail,
    isGmailConnected,
    getOrderById,
    setIsTrackingOpen,
    setTrackingQueryId
  } = useStore();

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);
  const [modelComplexity, setModelComplexity] = useState<'fast' | 'general' | 'complex'>('general');
  const [activeEmailOrder, setActiveEmailOrder] = useState<string | null>(null);
  const [manualEmailInput, setManualEmailInput] = useState<string>('');
  const [dispatchStatus, setDispatchStatus] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Send message handler ref to break circular dependency
  const handleSendMessageRef = useRef<(textToSend?: string) => Promise<void>>(async () => {});

  // Automatic voice agent hook with speech-to-text auto-send
  const voiceAgent = useLiveVoiceAgent({
    autoStart: false,
    onSpeechFinal: (spokenText: string) => {
      if (spokenText && !isTyping) {
        handleSendMessageRef.current(spokenText);
      }
    }
  });

  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const message = (textToSend || inputText).trim();
      if (!message || isTyping) return;

      playClickSound(880);
      recordQuestionAsked(message);

      // Add user message to active conversation (synced to Firestore)
      addChatMessage({
        customerId: currentCustomer?.customerId || 'CUST-GUEST',
        sender: 'customer',
        message,
        productContext: selectedProduct?.name,
        orderContext: orders[0]?.orderId
      });

      if (!textToSend) {
        setInputText('');
      }

      setIsTyping(true);

      try {
        // Check for order tracking inquiries
        const lower = message.toLowerCase();
        const isTrackingInquiry =
          lower.includes('track') ||
          lower.includes('order') ||
          lower.includes('package') ||
          lower.includes('nr-') ||
          lower.includes('status') ||
          lower.includes('courier') ||
          lower.includes('shipping') ||
          lower.includes('email');

        const idMatch = message.match(/NR-\d{4}-\d{5}/i);
        const targetOrderId = idMatch ? idMatch[0].toUpperCase() : (orders[0]?.orderId || 'NR-2026-00192');
        const targetOrder = getOrderById(targetOrderId) || orders.find(o => o.orderId.toUpperCase() === targetOrderId) || orders[0];

        // Recipient email extraction
        const emailInMsg = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0];
        const targetEmail = emailInMsg || currentCustomer?.email || (emailInMsg ? undefined : targetOrder?.customerEmail);

        let emailDispatchedNotice = '';
        if (isTrackingInquiry && targetOrder && targetEmail) {
          try {
            const dispatchRes = await sendTrackingEmail(
              targetOrder.orderId,
              targetEmail,
              `Customer order tracking inquiry automated via NOVA/RETRON AI Agent.`
            );
            if (dispatchRes.success) {
              emailDispatchedNotice = `\n\n✉️ [GMAIL AUTOMATION DISPATCHED]\nOfficial order telemetry report for #${targetOrder.orderId} was dispatched directly to ${targetEmail} from store owner (${ownerGmail}).`;
            }
          } catch (mailErr) {
            console.error('[AUTO EMAIL DISPATCH ERROR]', mailErr);
          }
        }

        const response = await generateAIResponse(
          message,
          activeConversation.messages,
          {
            customer: currentCustomer,
            orders,
            currentProduct: selectedProduct,
            enableSearch,
            modelComplexity
          }
        );

        // Simulated cognitive synthesis latency
        setTimeout(() => {
          playClickSound(950);
          const finalReply = response.reply + emailDispatchedNotice;

          addChatMessage({
            customerId: currentCustomer?.customerId || 'CUST-GUEST',
            sender: response.isHumanEscalated ? 'human_agent' : 'ai',
            message: finalReply,
            intent: response.intent,
            productContext: response.productContext,
            orderContext: targetOrder?.orderId || response.orderContext,
            recommendedProducts: response.recommendedProducts
          });
          setIsTyping(false);

          // Automatically speak the response aloud via voice synthesis!
          const speechSummary = response.reply + (emailDispatchedNotice ? ' A detailed shipment report has also been dispatched to your email directly from the store owner.' : '');
          voiceAgent.speakText(speechSummary);
        }, 400);
      } catch {
        setIsTyping(false);
      }
    },
    [
      inputText,
      isTyping,
      playClickSound,
      recordQuestionAsked,
      addChatMessage,
      currentCustomer,
      selectedProduct,
      orders,
      activeConversation.messages,
      enableSearch,
      modelComplexity,
      voiceAgent,
      sendTrackingEmail,
      getOrderById,
      ownerGmail
    ]
  );

  handleSendMessageRef.current = handleSendMessage;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openRecommendedProduct = (productId: string) => {
    playClickSound(800);
    const prod = products.find(p => p.id === productId);
    if (prod) {
      setSelectedProduct(prod);
      setIsPDPModalOpen(true);
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isAISupportOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation.messages, isTyping, isAISupportOpen]);

  // Listen for user click gesture that requested voice agent
  useEffect(() => {
    const handleGesture = () => {
      voiceAgent.startMic();
    };
    window.addEventListener('activate-mic-gesture', handleGesture);
    return () => window.removeEventListener('activate-mic-gesture', handleGesture);
  }, [voiceAgent]);

  // Listen for custom trigger from other components
  useEffect(() => {
    const handleCustomPrompt = (e: CustomEvent) => {
      if (e.detail) {
        setIsAISupportOpen(true);
        setTimeout(() => {
          handleSendMessage(e.detail);
        }, 200);
      }
    };
    window.addEventListener('open-ai-chat-prompt' as any, handleCustomPrompt);
    return () => window.removeEventListener('open-ai-chat-prompt' as any, handleCustomPrompt);
  }, [handleSendMessage, setIsAISupportOpen]);

  if (!isAISupportOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[95vw] sm:w-[450px] max-w-[480px] h-[660px] max-h-[90vh] bg-[#0c0d0d] border border-[#202221] shadow-2xl flex flex-col justify-between text-[#F3EDD8] font-mono animate-in slide-in-from-bottom-6 duration-300 overflow-hidden">
      {/* Top Header */}
      <div className="p-3.5 bg-[#070707] border-b border-[#202221] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FD8A46]/10 border border-[#FD8A46] text-[#FD8A46] flex items-center justify-center relative">
            <Bot size={16} />
            {voiceAgent.isMicActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            )}
          </div>
          <div>
            <div className="font-display font-bold text-sm text-[#F3EDD8] flex items-center gap-1.5">
              <span>NOVA/RETRON</span>
              <span className="text-[9px] px-1 bg-[#202221] text-[#FD8A46] border border-[#202221]">
                VOICE AGENT 01-A
              </span>
            </div>
            <div className="text-[10px] flex items-center gap-1.5">
              {voiceAgent.isSpeaking ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FD8A46] animate-pulse" />
                  <span className="text-[#FD8A46] font-bold">AGENT SPEAKING...</span>
                </>
              ) : voiceAgent.isMicActive ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-emerald-400 font-bold">MIC ACTIVE // SPEAK FREELY</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  <span className="text-[#F3EDD8]/60">VOICE STANDBY</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Automatic Mic Toggle */}
          <button
            onClick={() => {
              playClickSound(800);
              voiceAgent.toggleMic();
            }}
            title={voiceAgent.isMicActive ? 'Mute microphone' : 'Activate automatic microphone'}
            className={`px-2.5 py-1 border transition-colors cursor-pointer flex items-center gap-1 text-[10px] ${
              voiceAgent.isMicActive
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold'
                : 'border-[#202221] text-[#F3EDD8]/50 hover:border-[#FD8A46] hover:text-[#FD8A46]'
            }`}
          >
            {voiceAgent.isMicActive ? <Mic size={12} className="animate-pulse text-emerald-400" /> : <MicOff size={12} />}
            <span>{voiceAgent.isMicActive ? 'MIC LIVE' : 'ENABLE MIC'}</span>
          </button>

          {/* Voice Speech Synthesis Toggle */}
          <button
            onClick={() => {
              playClickSound(800);
              voiceAgent.setVoiceOutputEnabled(!voiceAgent.voiceOutputEnabled);
            }}
            title={voiceAgent.voiceOutputEnabled ? 'Voice responses active (Click to mute)' : 'Voice responses muted (Click to unmute)'}
            className={`p-1.5 border transition-colors cursor-pointer text-[10px] ${
              voiceAgent.voiceOutputEnabled
                ? 'border-[#FD8A46]/60 bg-[#FD8A46]/10 text-[#FD8A46]'
                : 'border-[#202221] text-[#F3EDD8]/40'
            }`}
          >
            {voiceAgent.voiceOutputEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>

          <button
            onClick={() => {
              playClickSound(600);
              voiceAgent.stopSpeaking();
              clearChatHistory();
            }}
            title="Clear conversation"
            className="p-1.5 text-[#F3EDD8]/40 hover:text-[#FD8A46] transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => {
              playClickSound(600);
              voiceAgent.stopSpeaking();
              voiceAgent.stopMic();
              setIsAISupportOpen(false);
            }}
            className="p-1.5 text-[#F3EDD8]/60 hover:text-[#FD8A46] transition-colors cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Real-time Voice HUD Bar */}
      <div className="px-3.5 py-2 bg-[#080d0b] border-b border-[#202221] flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-2 truncate text-emerald-400">
          <Radio size={13} className={`shrink-0 ${voiceAgent.isMicActive ? 'animate-pulse text-emerald-400' : 'text-[#F3EDD8]/30'}`} />
          <span className="truncate text-[10px] tracking-wider">
            {voiceAgent.statusText || 'AUTOMATIC VOICE LINK READY'}
          </span>
        </div>

        {/* Live Audio Visualizer Equalizer (reacts to user microphone volume) */}
        <div className="flex items-center gap-1 h-3.5 shrink-0 ml-2">
          {[15, 45, 80, 50, 95, 70, 35].map((baseHeight, i) => {
            const dynamicHeight = voiceAgent.isMicActive
              ? Math.max(3, Math.min(14, Math.round((baseHeight * Math.max(15, voiceAgent.volumeLevel)) / 50)))
              : 3;
            return (
              <span
                key={i}
                className={`w-1 transition-all duration-75 ${
                  voiceAgent.isSpeaking
                    ? 'bg-[#FD8A46]'
                    : voiceAgent.isMicActive
                    ? 'bg-emerald-400'
                    : 'bg-[#202221]'
                }`}
                style={{ height: `${dynamicHeight}px` }}
              />
            );
          })}
        </div>
      </div>

      {/* Primary 1-Click Microphone Activation Banner if not active */}
      {!voiceAgent.isMicActive && (
        <div className="p-3 bg-[#FD8A46]/10 border-b border-[#FD8A46]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#FD8A46]">
            <Mic size={16} className="animate-pulse shrink-0" />
            <div>
              <div className="font-bold text-[11px] uppercase">ACTIVATE MICROPHONE VOICE ACCESS</div>
              <div className="text-[10px] text-[#F3EDD8]/70">Talk directly to NOVA/RETRON Agent 01-A hands-free</div>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound(900);
              voiceAgent.startMic();
            }}
            className="px-3.5 py-1.5 bg-[#FD8A46] hover:bg-[#F3EDD8] text-[#070707] font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors shadow-[0_0_15px_rgba(253,138,70,0.4)] flex items-center justify-center gap-1.5 shrink-0"
          >
            <Mic size={13} />
            <span>CLICK TO ENABLE MIC</span>
          </button>
        </div>
      )}

      {/* Error Troubleshooting Alert if microphone permission was blocked */}
      {voiceAgent.errorMessage && (
        <div className="p-2.5 bg-red-950/40 border-b border-red-500/40 text-red-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px]">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <span>{voiceAgent.errorMessage}</span>
          </div>
          <button
            onClick={() => voiceAgent.startMic()}
            className="px-2 py-0.5 bg-red-500 text-black text-[10px] font-bold uppercase cursor-pointer hover:bg-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Control bar: Grounding & Model Selection */}
      <div className="px-3 py-1.5 bg-[#0f1010] border-b border-[#202221] flex items-center justify-between text-[10px]">
        {/* Google Search Grounding toggle */}
        <button
          onClick={() => {
            playClickSound(700);
            setEnableSearch(!enableSearch);
          }}
          className={`flex items-center gap-1 px-2 py-0.5 border transition-colors cursor-pointer ${
            enableSearch
              ? 'border-[#FD8A46] bg-[#FD8A46]/20 text-[#FD8A46] font-bold'
              : 'border-[#202221] text-[#F3EDD8]/50 hover:text-[#F3EDD8]'
          }`}
        >
          <Globe size={11} />
          <span>SEARCH GROUNDING: {enableSearch ? 'ACTIVE' : 'OFF'}</span>
        </button>

        {/* Model complexity selector */}
        <div className="flex items-center gap-1">
          <Cpu size={11} className="text-[#FD8A46]" />
          <select
            value={modelComplexity}
            onChange={e => setModelComplexity(e.target.value as any)}
            className="bg-[#121313] border border-[#202221] text-[10px] text-[#F3EDD8] px-1 py-0.5 focus:outline-none"
          >
            <option value="fast">gemini-3.1-flash-lite (Fast)</option>
            <option value="general">gemini-3.5-flash (General)</option>
            <option value="complex">gemini-3.1-pro-preview (Complex)</option>
          </select>
        </div>
      </div>

      {/* Active Context Banner */}
      {selectedProduct && (
        <div className="px-4 py-1.5 bg-[#121313] border-b border-[#202221] text-[10px] text-[#F3EDD8]/70 flex items-center justify-between">
          <span className="truncate">
            ACTIVE INSPECTION: <strong className="text-[#FD8A46]">{selectedProduct.name}</strong>
          </span>
          <span className="text-[#F3EDD8]/40">PKR {selectedProduct.price.toLocaleString()}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 text-xs">
        {activeConversation.messages.map(msg => {
          const isUser = msg.sender === 'customer';
          const isHuman = msg.sender === 'human_agent';

          return (
            <div
              key={msg.messageId}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-2 text-[10px] text-[#F3EDD8]/40 px-1">
                <span>{isUser ? 'CUSTOMER (VOICE/TEXT)' : isHuman ? 'SENIOR STYLIST (HUMAN)' : 'AI VOICE AGENT'}</span>
                <span>·</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[88%] p-3 border whitespace-pre-line leading-relaxed ${
                  isUser
                    ? 'bg-[#202221] border-[#202221] text-[#F3EDD8]'
                    : isHuman
                    ? 'bg-[#FD8A46]/10 border-[#FD8A46] text-[#F3EDD8]'
                    : 'bg-[#121313] border-[#202221] text-[#F3EDD8]/90'
                }`}
              >
                {isHuman && (
                  <div className="flex items-center gap-1.5 text-[10px] text-[#FD8A46] font-bold mb-1">
                    <ShieldAlert size={12} />
                    <span>HUMAN ESCALATION CHANNEL</span>
                  </div>
                )}
                {msg.message}

                {/* Order tracking telemetry & Gmail dispatch card */}
                {msg.orderContext && !isUser && (
                  <div className="mt-3 p-2.5 bg-[#0a0c0b] border border-[#FD8A46]/40 text-xs font-mono space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[#FD8A46] font-bold">
                      <div className="flex items-center gap-1.5">
                        <Truck size={13} />
                        <span>LOGISTICS TELEMETRY: {msg.orderContext}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#FD8A46]/20 border border-[#FD8A46]/40 uppercase">
                        ACTIVE RECORD
                      </span>
                    </div>

                    {msg.message.includes('[GMAIL AUTOMATION DISPATCHED]') ? (
                      <div className="p-2 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-[10px] flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                        <span>Dispatched to inbox from verified store owner ({ownerGmail})</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              playClickSound(800);
                              setTrackingQueryId(msg.orderContext || 'NR-2026-00192');
                              setIsTrackingOpen(true);
                            }}
                            className="px-2.5 py-1 bg-[#171918] hover:bg-[#202221] border border-[#202221] text-[10px] text-[#F3EDD8] hover:text-[#FD8A46] transition-colors cursor-pointer"
                          >
                            OPEN FULL TRACKER ➔
                          </button>

                          <button
                            onClick={() => {
                              playClickSound(800);
                              setActiveEmailOrder(activeEmailOrder === msg.orderContext ? null : msg.orderContext || null);
                              setManualEmailInput(currentCustomer?.email || '');
                            }}
                            className="px-2.5 py-1 bg-[#FD8A46]/10 hover:bg-[#FD8A46]/20 border border-[#FD8A46]/50 text-[10px] text-[#FD8A46] flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Mail size={11} />
                            <span>EMAIL ME TELEMETRY</span>
                          </button>
                        </div>

                        {/* Expandable Email Dispatch Form */}
                        {activeEmailOrder === msg.orderContext && (
                          <div className="p-2 bg-[#121313] border border-[#202221] space-y-2 mt-2">
                            <div className="text-[10px] text-[#F3EDD8]/70">
                              Send official dispatch report via owner's Gmail (<span className="text-[#FD8A46]">{ownerGmail}</span>):
                            </div>
                            <div className="flex gap-1.5">
                              <input
                                type="email"
                                placeholder="ENTER YOUR EMAIL"
                                value={manualEmailInput}
                                onChange={e => setManualEmailInput(e.target.value)}
                                className="flex-grow bg-[#070707] border border-[#202221] px-2 py-1 text-[10px] text-[#F3EDD8] focus:border-[#FD8A46] focus:outline-none"
                              />
                              <button
                                onClick={async () => {
                                  if (!manualEmailInput.trim()) return;
                                  playClickSound(900);
                                  setDispatchStatus('DISPATCHING GMAIL REPORT...');
                                  const res = await sendTrackingEmail(
                                    msg.orderContext || 'NR-2026-00192',
                                    manualEmailInput.trim(),
                                    'Requested via AI Support Assistant interactive prompt.'
                                  );
                                  if (res.success) {
                                    setDispatchStatus(`SENT TO ${manualEmailInput.trim()}!`);
                                    setTimeout(() => {
                                      setActiveEmailOrder(null);
                                      setDispatchStatus('');
                                    }, 3000);
                                  } else {
                                    setDispatchStatus(res.message || 'DISPATCH FAILED');
                                  }
                                }}
                                className="px-3 py-1 bg-[#FD8A46] text-[#070707] font-bold text-[10px] uppercase hover:bg-[#F3EDD8] cursor-pointer transition-colors"
                              >
                                SEND ➔
                              </button>
                            </div>
                            {dispatchStatus && (
                              <div className="text-[10px] text-[#FD8A46] font-bold animate-pulse">
                                {dispatchStatus}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Product recommendation card */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#202221]/80 space-y-2">
                    {msg.recommendedProducts.map(id => {
                      const p = products.find(prod => prod.id === id);
                      if (!p) return null;
                      return (
                        <div
                          key={p.id}
                          onClick={() => openRecommendedProduct(p.id)}
                          className="flex items-center gap-2 p-2 bg-[#070707] border border-[#202221] hover:border-[#FD8A46] cursor-pointer"
                        >
                          <img src={p.images[0]} alt={p.name} className="w-8 h-8 object-cover" />
                          <div className="flex-grow">
                            <div className="font-bold text-[11px] text-[#F3EDD8]">{p.name}</div>
                            <div className="text-[10px] text-[#FD8A46]">PKR {p.price.toLocaleString()}</div>
                          </div>
                          <ArrowRight size={12} className="text-[#FD8A46]" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Repeat voice button for AI messages */}
              {!isUser && (
                <button
                  onClick={() => {
                    playClickSound(750);
                    voiceAgent.speakText(msg.message);
                  }}
                  className="text-[9px] text-[#F3EDD8]/40 hover:text-[#FD8A46] px-1 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Volume2 size={10} />
                  <span>REPEAT VOICE RESPONSE</span>
                </button>
              )}
            </div>
          );
        })}

        {/* Live speech transcription preview */}
        {voiceAgent.transcript && (
          <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-pulse">
            <Mic size={14} className="text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-emerald-400/70 uppercase mr-1">[HEARING]:</span>
              "{voiceAgent.transcript}"
            </div>
          </div>
        )}

        {/* Cognitive processing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-[#FD8A46] p-2">
            <span className="w-1.5 h-1.5 bg-[#FD8A46] rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-[#FD8A46] rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 bg-[#FD8A46] rounded-full animate-bounce [animation-delay:0.4s]" />
            <span className="text-[10px] text-[#F3EDD8]/50 ml-1">AI AGENT COGNITIVE PROCESSING...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-[#202221] bg-[#070707] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 bg-[#121313] hover:bg-[#202221] border border-[#202221] hover:border-[#FD8A46] text-[10px] text-[#F3EDD8]/70 hover:text-[#FD8A46] transition-colors cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form with Dedicated Live Mic Button */}
      <div className="p-3 bg-[#070707] border-t border-[#202221] flex items-center gap-2">
        {/* Click-to-Speak Mic Button */}
        <button
          type="button"
          onClick={() => {
            playClickSound(800);
            voiceAgent.toggleMic();
          }}
          title={voiceAgent.isMicActive ? 'Microphone listening (Click to mute)' : 'Click to activate microphone voice input'}
          className={`p-2.5 border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
            voiceAgent.isMicActive
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
              : 'border-[#202221] bg-[#121313] text-[#F3EDD8]/60 hover:border-[#FD8A46] hover:text-[#FD8A46]'
          }`}
        >
          {voiceAgent.isMicActive ? (
            <Mic size={16} className="animate-pulse text-emerald-400" />
          ) : (
            <MicOff size={16} />
          )}
        </button>

        <div className="relative flex-grow">
          <input
            type="text"
            placeholder={
              voiceAgent.isMicActive
                ? '🎙️ Speak now (or type inquiry)...'
                : 'Transmit inquiry or click mic to speak...'
            }
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-[#121313] border border-[#202221] pl-3 pr-8 py-2 text-xs text-[#F3EDD8] placeholder-[#F3EDD8]/30 focus:border-[#FD8A46] focus:outline-none"
          />
          {voiceAgent.isMicActive && (
            <div className="absolute right-2.5 top-2.5 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
            </div>
          )}
        </div>

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isTyping}
          className="px-4 py-2 bg-[#FD8A46] hover:bg-[#F3EDD8] disabled:opacity-30 text-[#070707] font-bold text-xs uppercase cursor-pointer transition-colors"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};
