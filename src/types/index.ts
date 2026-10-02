export type ProductEra = '1970' | '1984' | '1999' | '2026' | '2091';

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number; // In PKR
  originalPrice?: number; // Pre-discount price if on archive sale
  rating?: number; // 1-5 archive quality index
  reviewCount?: number;
  category: 'Outerwear' | 'Footwear' | 'Hoodies' | 'Tops' | 'Bags' | 'Accessories';
  collection: string;
  era: ProductEra;
  tagline: string;
  description: string;
  details: string[];
  materials: string[];
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  inStock: boolean;
  stockCount: number;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
  savedForLater?: boolean;
}

export interface OrderTrackingStep {
  status: 'ORDER PLACED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'OUT FOR DELIVERY' | 'DELIVERED';
  timestamp: string;
  location: string;
  completed: boolean;
}

export interface Order {
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  total: number;
  paymentMethod: 'Cash on Delivery' | 'Card' | 'Bank Transfer';
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    carrier?: string;
  };
  status: 'ORDER PLACED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'OUT FOR DELIVERY' | 'DELIVERED';
  createdAt: string;
  timeline: OrderTrackingStep[];
}

export interface Customer {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  createdAt: string;
  wishlist: string[]; // product IDs
}

export interface ChatMessage {
  messageId: string;
  conversationId: string;
  customerId: string;
  sender: 'customer' | 'ai' | 'human_agent';
  message: string;
  timestamp: string;
  intent?: 'order_status' | 'product_inquiry' | 'return_policy' | 'sizing' | 'human_escalation' | 'general';
  productContext?: string;
  orderContext?: string;
  recommendedProducts?: string[];
}

export interface Conversation {
  conversationId: string;
  customerId: string;
  customerName: string;
  startedAt: string;
  lastMessageAt: string;
  status: 'active' | 'escalated' | 'resolved';
  currentPage: string;
  currentProductId?: string;
  messages: ChatMessage[];
}

export interface SupportRequest {
  requestId: string;
  customerId: string;
  customerName: string;
  conversationId: string;
  issue: string;
  status: 'open' | 'assigned' | 'resolved';
  createdAt: string;
}

export interface ArchiveRecord {
  year: ProductEra;
  title: string;
  collectionId: string;
  style: string;
  status: string;
  description: string;
  image: string;
  materials: string;
}

export interface NotificationToast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
}

export interface CustomerPreferences {
  audioEnabled: boolean;
  orderEmailUpdates: boolean;
  newsletterSubscribed: boolean;
}

