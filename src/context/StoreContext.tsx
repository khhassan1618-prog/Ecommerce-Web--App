import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem, Order, Customer, ChatMessage, Conversation, SupportRequest } from '../types';
import { PRODUCTS } from '../data/products';
import { soundEngine } from '../utils/audioEngine';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  onAuthStateChanged,
  testFirestoreConnection,
  saveCustomerProfile,
  getCustomerProfile,
  saveOrderToFirestore,
  updateOrderStatusInFirestore,
  getOrdersByCustomerFromFirestore,
  getAllOrdersFromFirestore,
  getAllCustomersFromFirestore,
  getAllConversationsFromFirestore,
  subscribeToOrders,
  subscribeToCustomers,
  subscribeToConversations,
  saveConversationToFirestore,
  seedInitialFirestoreData,
  getCachedAccessToken,
  requestGmailAccessToken
} from '../services/firebase';
import { sendOrderTrackingEmail, OWNER_EMAIL } from '../services/gmailService';

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  discount: number;
  discountCode: string;
  shipping: number;
  total: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;

  // Active customer & Firebase Auth
  currentCustomer: Customer | null;
  customers: Customer[];
  loginCustomer: (email: string, name?: string) => void;
  loginWithGoogle: () => Promise<void>;
  logoutCustomer: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;

  // Orders & Tracking
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'orderId' | 'createdAt' | 'timeline'>) => Order;
  getOrderById: (orderId: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Chat & AI Support
  conversations: Conversation[];
  activeConversation: Conversation;
  addChatMessage: (msg: Omit<ChatMessage, 'messageId' | 'timestamp' | 'conversationId'>) => void;
  clearChatHistory: () => void;
  supportRequests: SupportRequest[];
  createSupportRequest: (issue: string) => void;

  // Cloud Firestore Sync State
  isFirestoreConnected: boolean;
  forceSyncFirestore: () => Promise<void>;

  // Voice Interaction Trigger
  openVoiceChatWithMic: () => void;

  // UI state
  isPreloaderFinished: boolean;
  setIsPreloaderFinished: (finished: boolean) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isPDPModalOpen: boolean;
  setIsPDPModalOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isTrackingOpen: boolean;
  setIsTrackingOpen: (open: boolean) => void;
  trackingQueryId: string;
  setTrackingQueryId: (id: string) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isAISupportOpen: boolean;
  setIsAISupportOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;

  // Audio
  isAudioOn: boolean;
  toggleAudio: () => void;
  playClickSound: (freq?: number) => void;

  // Analytics
  analytics: {
    totalSales: number;
    activeChats: number;
    escalatedChats: number;
    totalOrders: number;
    totalCustomers: number;
    popularQuestions: { question: string; count: number }[];
    topProducts: { name: string; views: number }[];
  };
  recordProductView: (productId: string) => void;
  recordQuestionAsked: (question: string) => void;

  // Gmail Order Tracking Automation (Google Workspace integration)
  isGmailConnected: boolean;
  ownerGmail: string;
  connectGmailAccount: () => Promise<boolean>;
  sendTrackingEmail: (orderId: string, recipientEmail: string, note?: string) => Promise<{ success: boolean; message: string }>;
  emailDispatchLogs: Array<{
    id: string;
    orderId: string;
    recipient: string;
    sender: string;
    timestamp: string;
    status: 'SENT' | 'FAILED';
    messageId?: string;
  }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Initial real customers for database seeding
const INITIAL_DEMO_CUSTOMER: Customer = {
  customerId: 'CUST-8821',
  name: 'Malik Vance',
  email: 'malik.vance@retronova.arch',
  phone: '+92 300 8472910',
  address: 'Sector 4, Cyber-Quarter 9B, DHA Phase 6',
  city: 'Lahore',
  postalCode: '54792',
  createdAt: '2026-03-12T10:14:00Z',
  wishlist: ['prod-01', 'prod-06']
};

const INITIAL_CUSTOMERS: Customer[] = [
  INITIAL_DEMO_CUSTOMER,
  {
    customerId: 'CUST-4109',
    name: 'Zainab Tariq',
    email: 'zainab.t@cyberloom.pk',
    phone: '+92 321 9901423',
    address: 'House 14, Street 9, F-7/2',
    city: 'Islamabad',
    postalCode: '44000',
    createdAt: '2026-05-18T12:00:00Z',
    wishlist: ['prod-02', 'prod-03']
  },
  {
    customerId: 'CUST-1940',
    name: 'Omar Farooq',
    email: 'omar.f@orbitalwave.net',
    phone: '+92 333 4519280',
    address: 'Apartment 402, Clifton Block 4',
    city: 'Karachi',
    postalCode: '75600',
    createdAt: '2026-06-20T16:20:00Z',
    wishlist: ['prod-01']
  },
  {
    customerId: 'CUST-5210',
    name: 'Ayesha Khan',
    email: 'ayesha.k@matrixforge.io',
    phone: '+92 301 5567891',
    address: 'Bungalow 78, Gulberg III',
    city: 'Lahore',
    postalCode: '54660',
    createdAt: '2026-08-05T09:45:00Z',
    wishlist: ['prod-04', 'prod-05']
  }
];

// Initial demo orders for database seeding
const INITIAL_ORDERS: Order[] = [
  {
    orderId: 'NR-2026-00192',
    customerId: 'CUST-8821',
    customerName: 'Malik Vance',
    customerEmail: 'malik.vance@retronova.arch',
    customerPhone: '+92 300 8472910',
    items: [
      {
        product: PRODUCTS[0], // Quantum Jacket
        size: 'L',
        color: 'Basalt Black',
        quantity: 1
      },
      {
        product: PRODUCTS[5], // Vector Watch
        size: 'One Size',
        color: 'Titanium Raw',
        quantity: 1
      }
    ],
    subtotal: 104500,
    discount: 10450,
    discountCode: 'NOVA10',
    total: 94050,
    paymentMethod: 'Cash on Delivery',
    shippingAddress: {
      address: 'Sector 4, Cyber-Quarter 9B, DHA Phase 6',
      city: 'Lahore',
      postalCode: '54792'
    },
    status: 'SHIPPED',
    createdAt: '2026-09-22T14:32:00Z',
    timeline: [
      { status: 'ORDER PLACED', timestamp: '2026-09-22 14:32 PKT', location: 'Terminal 01-A (Lahore Node)', completed: true },
      { status: 'PROCESSING', timestamp: '2026-09-22 16:00 PKT', location: 'NOVA/RETRON Central Vault QA', completed: true },
      { status: 'PACKED', timestamp: '2026-09-22 18:45 PKT', location: 'Sealed with Holographic Tamper Film', completed: true },
      { status: 'SHIPPED', timestamp: '2026-09-23 09:20 PKT', location: 'Air Cargo Flight NR-401', completed: true },
      { status: 'OUT FOR DELIVERY', timestamp: 'Pending Dispatch', location: 'Local Courier Fleet', completed: false },
      { status: 'DELIVERED', timestamp: 'Pending Verification', location: 'Final Destination', completed: false }
    ]
  },
  {
    orderId: 'NR-2026-00188',
    customerId: 'CUST-4109',
    customerName: 'Zainab Tariq',
    customerEmail: 'zainab.t@cyberloom.pk',
    customerPhone: '+92 321 9901423',
    items: [
      {
        product: PRODUCTS[1], // Chrome Runner
        size: '42',
        color: 'Chrome Liquid',
        quantity: 1
      }
    ],
    subtotal: 34900,
    discount: 0,
    total: 34900,
    paymentMethod: 'Card',
    shippingAddress: {
      address: 'House 14, Street 9, F-7/2',
      city: 'Islamabad',
      postalCode: '44000'
    },
    status: 'PROCESSING',
    createdAt: '2026-09-23T11:15:00Z',
    timeline: [
      { status: 'ORDER PLACED', timestamp: '2026-09-23 11:15 PKT', location: 'Terminal 01-A', completed: true },
      { status: 'PROCESSING', timestamp: '2026-09-23 12:00 PKT', location: 'Central Vault QA', completed: true },
      { status: 'PACKED', timestamp: 'Pending', location: 'Sealing Station', completed: false },
      { status: 'SHIPPED', timestamp: 'Pending', location: 'Air Cargo', completed: false },
      { status: 'OUT FOR DELIVERY', timestamp: 'Pending', location: 'Ground Dispatch', completed: false },
      { status: 'DELIVERED', timestamp: 'Pending', location: 'Recipient Address', completed: false }
    ]
  },
  {
    orderId: 'NR-2026-00174',
    customerId: 'CUST-1940',
    customerName: 'Omar Farooq',
    customerEmail: 'omar.f@orbitalwave.net',
    customerPhone: '+92 333 4519280',
    items: [
      {
        product: PRODUCTS[2], // Signal Hoodie
        size: 'XL',
        color: 'Signal Amber',
        quantity: 1
      },
      {
        product: PRODUCTS[4], // Archive Bag
        size: 'One Size',
        color: 'Cyber Silver',
        quantity: 1
      }
    ],
    subtotal: 50800,
    discount: 7620,
    discountCode: 'ARCHIVE15',
    total: 43180,
    paymentMethod: 'Bank Transfer',
    shippingAddress: {
      address: 'Apartment 402, Clifton Block 4',
      city: 'Karachi',
      postalCode: '75600'
    },
    status: 'DELIVERED',
    createdAt: '2026-09-20T09:40:00Z',
    timeline: [
      { status: 'ORDER PLACED', timestamp: '2026-09-20 09:40 PKT', location: 'Terminal 01-A', completed: true },
      { status: 'PROCESSING', timestamp: '2026-09-20 10:15 PKT', location: 'Vault QA', completed: true },
      { status: 'PACKED', timestamp: '2026-09-20 12:00 PKT', location: 'Sealed', completed: true },
      { status: 'SHIPPED', timestamp: '2026-09-20 16:30 PKT', location: 'Express Flight', completed: true },
      { status: 'OUT FOR DELIVERY', timestamp: '2026-09-21 10:00 PKT', location: 'Ground Fleet', completed: true },
      { status: 'DELIVERED', timestamp: '2026-09-21 14:10 PKT', location: 'Recipient Signed', completed: true }
    ]
  }
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products
  const [products] = useState<Product[]>(PRODUCTS);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('nr_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Customer & Auth
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(() => {
    try {
      const saved = localStorage.getItem('nr_customer');
      return saved ? JSON.parse(saved) : INITIAL_DEMO_CUSTOMER;
    } catch {
      return INITIAL_DEMO_CUSTOMER;
    }
  });

  // All Customers directory (synced from Firestore)
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('nr_customers');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    return currentCustomer?.wishlist || ['prod-01'];
  });

  // Orders (synced in real-time from Firestore)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('nr_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // UI state
  const [isPreloaderFinished, setIsPreloaderFinished] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isPDPModalOpen, setIsPDPModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState<boolean>(false);
  const [trackingQueryId, setTrackingQueryId] = useState<string>('NR-2026-00192');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAISupportOpen, setIsAISupportOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(false);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(false);

  // Gmail Order Tracking Integration (Google Workspace OAuth)
  const [isGmailConnected, setIsGmailConnected] = useState<boolean>(() => !!getCachedAccessToken());
  const [emailDispatchLogs, setEmailDispatchLogs] = useState<Array<{
    id: string;
    orderId: string;
    recipient: string;
    sender: string;
    timestamp: string;
    status: 'SENT' | 'FAILED';
    messageId?: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('nr_email_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('nr_email_logs', JSON.stringify(emailDispatchLogs));
  }, [emailDispatchLogs]);

  // Conversations (synced in real-time from Firestore)
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('nr_conversations');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const initialConv: Conversation = {
      conversationId: 'CONV-2026-904',
      customerId: currentCustomer?.customerId || 'CUST-8821',
      customerName: currentCustomer?.name || 'Malik Vance',
      startedAt: '2026-09-24T13:00:00Z',
      lastMessageAt: '2026-09-24T13:02:00Z',
      status: 'active',
      currentPage: 'INDEX',
      messages: [
        {
          messageId: 'msg-01',
          conversationId: 'CONV-2026-904',
          customerId: 'CUST-8821',
          sender: 'ai',
          message: 'NOVA/RETRON Voice Terminal 01-A synchronized. Archives active. Speak or transmit inquiry regarding sizing, garment specs, return policy, or dispatch tracking.',
          timestamp: '13:00 PKT',
          intent: 'general'
        }
      ]
    };
    return [initialConv];
  });

  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([
    {
      requestId: 'REQ-019',
      customerId: 'CUST-8821',
      customerName: 'Malik Vance',
      conversationId: 'CONV-2026-904',
      issue: 'Quantum Jacket size adjustment inquiry',
      status: 'assigned',
      createdAt: '2026-09-24T12:45:00Z'
    }
  ]);

  // Analytics tracking
  const [popularQuestions, setPopularQuestions] = useState<{ question: string; count: number }[]>([
    { question: 'WHERE IS MY ORDER?', count: 48 },
    { question: 'WHAT IS YOUR RETURN POLICY?', count: 35 },
    { question: 'WHAT SIZE SHOULD I GET?', count: 29 },
    { question: 'SHOW ME JACKETS', count: 24 },
    { question: 'DELIVERY TIMES?', count: 18 }
  ]);

  const [productViews, setProductViews] = useState<{ name: string; views: number }[]>([
    { name: '01 — QUANTUM JACKET', views: 342 },
    { name: '02 — CHROME RUNNER', views: 280 },
    { name: '06 — VECTOR WATCH', views: 195 },
    { name: '03 — SIGNAL HOODIE', views: 160 },
    { name: '05 — NEON ARCHIVE BAG', views: 140 },
    { name: '04 — ORBIT TEE', views: 98 }
  ]);

  // Manual or automatic seed / sync function
  const forceSyncFirestore = useCallback(async () => {
    console.log('[FIREBASE] Executing full Firestore synchronization...');
    try {
      await testFirestoreConnection();
      await seedInitialFirestoreData(INITIAL_ORDERS, INITIAL_CUSTOMERS, conversations);
      const [remoteOrders, remoteCustomers, remoteConvs] = await Promise.all([
        getAllOrdersFromFirestore(),
        getAllCustomersFromFirestore(),
        getAllConversationsFromFirestore()
      ]);
      if (remoteOrders.length > 0) setOrders(remoteOrders);
      if (remoteCustomers.length > 0) setCustomers(remoteCustomers);
      if (remoteConvs.length > 0) setConversations(remoteConvs);
      setIsFirestoreConnected(true);
      console.log('[FIREBASE] Full Firestore sync completed.');
    } catch (e) {
      console.warn('[FIREBASE SYNC ERROR]', e);
    }
  }, [conversations]);

  // Firebase Boot & Real-time Live Subscriptions
  useEffect(() => {
    testFirestoreConnection().then(connected => {
      setIsFirestoreConnected(Boolean(connected));
      if (connected) {
        seedInitialFirestoreData(INITIAL_ORDERS, INITIAL_CUSTOMERS, conversations).catch(console.warn);
      }
    });

    // 1. Live Orders Subscription
    const unsubscribeOrders = subscribeToOrders(remoteOrders => {
      if (remoteOrders && remoteOrders.length > 0) {
        setOrders(remoteOrders);
      }
    });

    // 2. Live Customers Subscription
    const unsubscribeCustomers = subscribeToCustomers(remoteCustomers => {
      if (remoteCustomers && remoteCustomers.length > 0) {
        setCustomers(remoteCustomers);
      }
    });

    // 3. Live Conversations Subscription
    const unsubscribeConvs = subscribeToConversations(remoteConvs => {
      if (remoteConvs && remoteConvs.length > 0) {
        setConversations(remoteConvs);
      }
    });

    // 4. Live Auth State
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('[FIREBASE AUTH] Patron authenticated:', firebaseUser.email);
        const profile = await getCustomerProfile(firebaseUser.uid);
        if (profile) {
          setCurrentCustomer(profile);
          setWishlist(profile.wishlist || []);
        } else {
          const newProfile: Customer = {
            customerId: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Authorized Patron',
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || '+92 300 0000000',
            createdAt: new Date().toISOString(),
            wishlist: ['prod-01']
          };
          setCurrentCustomer(newProfile);
          await saveCustomerProfile(newProfile);
        }
      }
    });

    return () => {
      unsubscribeOrders();
      unsubscribeCustomers();
      unsubscribeConvs();
      unsubscribeAuth();
    };
  }, []);

  // Sync state to LocalStorage as cache
  useEffect(() => {
    localStorage.setItem('nr_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('nr_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('nr_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('nr_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (currentCustomer) {
      localStorage.setItem('nr_customer', JSON.stringify(currentCustomer));
    }
  }, [currentCustomer]);

  // Audio toggle
  const toggleAudio = () => {
    if (isAudioOn) {
      soundEngine.stopAmbient();
      setIsAudioOn(false);
    } else {
      soundEngine.startAmbient();
      setIsAudioOn(true);
    }
  };

  const playClickSound = (freq = 780) => {
    soundEngine.playClick(freq);
  };

  // Open Voice Chat directly with user gesture
  const openVoiceChatWithMic = useCallback(() => {
    playClickSound(880);
    setIsAISupportOpen(true);
    // Dispatch event to activate mic on this user gesture
    window.dispatchEvent(new CustomEvent('activate-mic-gesture'));
  }, []);

  // Cart operations
  const addToCart = (product: Product, size: string, color: string, quantity = 1) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(
        item => item.product.id === product.id && item.size === size && item.color === color
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      }
      return [...prev, { product, size, color, quantity }];
    });
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCart(prev =>
      prev.filter(
        item => !(item.product.id === productId && item.size === size && item.color === color)
      )
    );
  };

  const updateQuantity = (productId: string, size: string, color: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId && item.size === size && item.color === color
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  // Discount Coupons
  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'NOVA10') {
      setDiscountCode('NOVA10');
      setDiscountPercent(10);
      return { success: true, message: 'COUPON APPLIED: 10% ARCHIVAL CREDIT' };
    } else if (clean === 'ARCHIVE15') {
      setDiscountCode('ARCHIVE15');
      setDiscountPercent(15);
      return { success: true, message: 'COUPON APPLIED: 15% VIP PRIVILEGE' };
    } else if (clean === 'FUTURE20') {
      setDiscountCode('FUTURE20');
      setDiscountPercent(20);
      return { success: true, message: 'COUPON APPLIED: 20% SPECULATIVE BONUS' };
    }
    return { success: false, message: 'INVALID PROTOCOL CODE' };
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const discount = Math.round((subtotal * discountPercent) / 100);
  const shipping = subtotal > 25000 || subtotal === 0 ? 0 : 650;
  const total = Math.max(0, subtotal - discount + shipping);

  // Customer Management
  const loginCustomer = (email: string, name?: string) => {
    const customerId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const cust: Customer = {
      customerId,
      name: name || email.split('@')[0],
      email,
      phone: '+92 300 1234567',
      createdAt: new Date().toISOString(),
      wishlist: ['prod-01']
    };
    setCurrentCustomer(cust);
    saveCustomerProfile(cust);
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithGoogle();
      if (res?.user) {
        const user = res.user;
        if (res.accessToken) {
          setIsGmailConnected(true);
        }
        const cust: Customer = {
          customerId: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Patron',
          email: user.email || '',
          phone: user.phoneNumber || '+92 300 0000000',
          createdAt: new Date().toISOString(),
          wishlist: ['prod-01']
        };
        setCurrentCustomer(cust);
        await saveCustomerProfile(cust);
      }
    } catch (err) {
      console.error('[GOOGLE AUTH ERROR]', err);
    }
  };

  const logoutCustomer = () => {
    signOutUser();
    setCurrentCustomer(null);
    setIsGmailConnected(false);
  };

  // Gmail Workspace connection and automated order tracking dispatch
  const connectGmailAccount = async (): Promise<boolean> => {
    try {
      const token = await requestGmailAccessToken();
      if (token) {
        setIsGmailConnected(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[GMAIL CONNECT ERROR]', err);
      return false;
    }
  };

  const sendTrackingEmail = async (
    orderId: string,
    recipientEmail: string,
    note?: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanId = orderId.trim().toUpperCase();
    const order = getOrderById(cleanId) || orders.find(o => o.orderId.toUpperCase() === cleanId);
    if (!order) {
      return { success: false, message: `Order ${orderId} not found in database.` };
    }

    try {
      const result = await sendOrderTrackingEmail(order, recipientEmail, note);
      const logEntry = {
        id: `LOG-${Date.now()}`,
        orderId: order.orderId,
        recipient: recipientEmail,
        sender: OWNER_EMAIL,
        timestamp: new Date().toISOString(),
        status: (result.success ? 'SENT' : 'FAILED') as 'SENT' | 'FAILED',
        messageId: result.messageId
      };
      setEmailDispatchLogs(prev => [logEntry, ...prev.slice(0, 49)]);

      if (result.success) {
        setIsGmailConnected(true);
        return {
          success: true,
          message: `Order tracking telemetry sent to ${recipientEmail} from ${OWNER_EMAIL}`
        };
      } else {
        return { success: false, message: result.error || 'Failed to dispatch email' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Dispatch error' };
    }
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
      if (currentCustomer) {
        const updated = { ...currentCustomer, wishlist: next };
        setCurrentCustomer(updated);
        saveCustomerProfile(updated);
      }
      return next;
    });
  };

  // Orders
  const createOrder = (orderData: Omit<Order, 'orderId' | 'createdAt' | 'timeline'>): Order => {
    const timestampStr = new Date().toISOString();
    const orderNum = Math.floor(10000 + Math.random() * 90000);
    const newOrderId = `NR-2026-${orderNum}`;

    const newOrder: Order = {
      ...orderData,
      orderId: newOrderId,
      createdAt: timestampStr,
      timeline: [
        { status: 'ORDER PLACED', timestamp: 'Just Now', location: 'Neural Archive Terminal', completed: true },
        { status: 'PROCESSING', timestamp: 'Queued', location: 'Central Vault QA', completed: false },
        { status: 'PACKED', timestamp: 'Pending', location: 'Vacuum Seal Facility', completed: false },
        { status: 'SHIPPED', timestamp: 'Pending', location: 'Express Air Cargo', completed: false },
        { status: 'OUT FOR DELIVERY', timestamp: 'Pending', location: 'Ground Dispatch', completed: false },
        { status: 'DELIVERED', timestamp: 'Pending', location: 'Recipient Address', completed: false }
      ]
    };

    // Update local state immediately
    setOrders(prev => [newOrder, ...prev]);

    // Save to Firestore in real time
    saveOrderToFirestore(newOrder);

    // Also update/sync customer profile in Firestore
    const custProfile: Customer = {
      customerId: orderData.customerId,
      name: orderData.customerName,
      email: orderData.customerEmail,
      phone: orderData.customerPhone,
      address: orderData.shippingAddress.address,
      city: orderData.shippingAddress.city,
      postalCode: orderData.shippingAddress.postalCode,
      createdAt: timestampStr,
      wishlist: []
    };
    saveCustomerProfile(custProfile);

    clearCart();
    return newOrder;
  };

  const getOrderById = (orderId: string): Order | undefined => {
    const clean = orderId.trim().toUpperCase();
    return orders.find(o => o.orderId.toUpperCase() === clean);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.orderId === orderId) {
          const statuses: Order['status'][] = [
            'ORDER PLACED',
            'PROCESSING',
            'PACKED',
            'SHIPPED',
            'OUT FOR DELIVERY',
            'DELIVERED'
          ];
          const currIdx = statuses.indexOf(status);
          const updatedTimeline = ord.timeline.map((step, idx) => ({
            ...step,
            completed: idx <= currIdx
          }));
          const updatedOrder = {
            ...ord,
            status,
            timeline: updatedTimeline
          };

          // Persist directly to Cloud Firestore!
          updateOrderStatusInFirestore(orderId, status, updatedTimeline);
          return updatedOrder;
        }
        return ord;
      })
    );
  };

  // Chat
  const activeConversation = conversations[0];

  const addChatMessage = (msg: Omit<ChatMessage, 'messageId' | 'timestamp' | 'conversationId'>) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    const timestamp = `${hours}:${mins} PKT`;
    const messageId = `msg-${Date.now()}`;

    const fullMessage: ChatMessage = {
      ...msg,
      messageId,
      conversationId: activeConversation.conversationId,
      timestamp
    };

    setConversations(prev => {
      const next = [...prev];
      const target = { ...next[0] };
      target.messages = [...target.messages, fullMessage];
      target.lastMessageAt = now.toISOString();
      if (msg.intent === 'human_escalation') {
        target.status = 'escalated';
      }
      next[0] = target;

      // Persist conversation to Firestore in real-time!
      saveConversationToFirestore(target);
      return next;
    });

    if (msg.intent === 'human_escalation') {
      createSupportRequest(`Customer requested human escalation in conversation ${activeConversation.conversationId}`);
    }
  };

  const clearChatHistory = () => {
    const freshConv: Conversation = {
      ...conversations[0],
      messages: [
        {
          messageId: `msg-${Date.now()}`,
          conversationId: conversations[0].conversationId,
          customerId: currentCustomer?.customerId || 'CUST-8821',
          sender: 'ai',
          message: 'Archive session initialized. Terminal ready for voice inquiries.',
          timestamp: 'Just Now',
          intent: 'general'
        }
      ]
    };
    setConversations([freshConv]);
    saveConversationToFirestore(freshConv);
  };

  const createSupportRequest = (issue: string) => {
    const newReq: SupportRequest = {
      requestId: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      customerId: currentCustomer?.customerId || 'CUST-8821',
      customerName: currentCustomer?.name || 'Authorized Patron',
      conversationId: activeConversation.conversationId,
      issue,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    setSupportRequests(prev => [newReq, ...prev]);
  };

  // Analytics logging
  const recordProductView = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    setProductViews(prev =>
      prev.map(item => (item.name === prod.name ? { ...item, views: item.views + 1 } : item))
    );
  };

  const recordQuestionAsked = (question: string) => {
    setPopularQuestions(prev => {
      const existing = prev.find(p => p.question.toLowerCase() === question.toLowerCase());
      if (existing) {
        return prev.map(p =>
          p.question.toLowerCase() === question.toLowerCase() ? { ...p, count: p.count + 1 } : p
        );
      }
      return [...prev, { question, count: 1 }];
    });
  };

  // Real live aggregated calculations based on Firestore collections
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const activeChats = conversations.filter(c => c.status === 'active').length;
  const escalatedChats = conversations.filter(c => c.status === 'escalated' || c.messages.some(m => m.intent === 'human_escalation')).length;

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        cartCount,
        subtotal,
        discount,
        discountCode,
        shipping,
        total,
        applyCoupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        currentCustomer,
        customers,
        loginCustomer,
        loginWithGoogle,
        logoutCustomer,
        wishlist,
        toggleWishlist,
        orders,
        createOrder,
        getOrderById,
        updateOrderStatus,
        conversations,
        activeConversation,
        addChatMessage,
        clearChatHistory,
        supportRequests,
        createSupportRequest,
        isFirestoreConnected,
        forceSyncFirestore,
        openVoiceChatWithMic,
        isPreloaderFinished,
        setIsPreloaderFinished,
        isCartOpen,
        setIsCartOpen,
        isPDPModalOpen,
        setIsPDPModalOpen,
        selectedProduct,
        setSelectedProduct,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isTrackingOpen,
        setIsTrackingOpen,
        trackingQueryId,
        setTrackingQueryId,
        isAuthOpen,
        setIsAuthOpen,
        isAISupportOpen,
        setIsAISupportOpen,
        isAdminOpen,
        setIsAdminOpen,
        isAudioOn,
        toggleAudio,
        playClickSound,
        analytics: {
          totalSales,
          activeChats,
          escalatedChats,
          totalOrders: orders.length,
          totalCustomers: customers.length,
          popularQuestions,
          topProducts: productViews
        },
        recordProductView,
        recordQuestionAsked,
        isGmailConnected,
        ownerGmail: OWNER_EMAIL,
        connectGmailAccount,
        sendTrackingEmail,
        emailDispatchLogs
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
