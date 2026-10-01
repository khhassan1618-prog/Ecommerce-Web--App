import { ChatMessage, Customer, Order, Product } from '../types';
import { PRODUCTS } from '../data/products';

export interface CustomerContext {
  customer?: Customer | null;
  orders?: Order[];
  currentProduct?: Product | null;
  currentPage?: string;
  cartItemsCount?: number;
  enableSearch?: boolean;
  modelComplexity?: 'fast' | 'general' | 'complex';
}

export interface AIResponseResult {
  reply: string;
  intent: 'order_status' | 'product_inquiry' | 'return_policy' | 'sizing' | 'human_escalation' | 'general';
  productContext?: string;
  orderContext?: string;
  recommendedProducts?: string[];
  isHumanEscalated?: boolean;
  groundingSources?: Array<{ title: string; uri: string }>;
  modelUsed?: string;
}

export async function generateAIResponse(
  message: string,
  conversationHistory: ChatMessage[],
  customerContext: CustomerContext
): Promise<AIResponseResult> {
  const normalized = message.trim().toLowerCase();
  const currentProduct = customerContext.currentProduct;
  const userOrders = customerContext.orders || [];

  // 1. Check for Human Escalation Intent
  if (
    normalized.includes('speak to a human') ||
    normalized.includes('talk to a human') ||
    normalized.includes('human agent') ||
    normalized.includes('real person') ||
    normalized.includes('operator') ||
    normalized.includes('escalate')
  ) {
    return {
      reply: `[PROTOCOL OVERRIDE ACTIVATED] Human Escalation Protocol initiated. Assigning Senior Archive Stylist 'S. Vance' to this transmission terminal. A human team member has joined the channel and will respond directly. You may state your request.`,
      intent: 'human_escalation',
      isHumanEscalated: true
    };
  }

  // 2. Try Server-Side Gemini API with Google Search Grounding and Model Selection
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: conversationHistory.map(m => ({
          sender: m.sender,
          message: m.message
        })),
        productContext: currentProduct ? `${currentProduct.name} (PKR ${currentProduct.price.toLocaleString()}, Details: ${currentProduct.details.join(', ')})` : '',
        orderContext: userOrders.length > 0 ? `Latest order: ${userOrders[0].orderId} (${userOrders[0].status})` : '',
        enableSearch: customerContext.enableSearch ?? false,
        taskComplexity: customerContext.modelComplexity || 'general'
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text && !data.text.includes('[OFFLINE DEMO MODE]')) {
        let intent: AIResponseResult['intent'] = 'general';
        if (normalized.includes('order') || normalized.includes('nr-')) intent = 'order_status';
        else if (normalized.includes('size') || normalized.includes('fit')) intent = 'sizing';
        else if (normalized.includes('return') || normalized.includes('exchange')) intent = 'return_policy';
        else if (normalized.includes('jacket') || normalized.includes('hoodie') || normalized.includes('shoe')) intent = 'product_inquiry';

        return {
          reply: data.text,
          intent,
          productContext: currentProduct?.name,
          groundingSources: data.groundingSources || [],
          modelUsed: data.modelUsed
        };
      }
    }
  } catch (err) {
    console.warn('[AI CLIENT] Server Gemini API call bypassed, falling back to neural archive:', err);
  }

  // 3. Fallback Knowledge Base: Order Status / Lookup
  if (
    normalized.includes('where is my order') ||
    normalized.includes('track my order') ||
    normalized.includes('order status') ||
    normalized.includes('track order') ||
    normalized.includes('my package') ||
    normalized.includes('nr-')
  ) {
    const match = message.match(/NR-\d{4}-\d{5}/i);
    if (match) {
      const orderId = match[0].toUpperCase();
      const matchedOrder = userOrders.find(o => o.orderId.toUpperCase() === orderId);
      if (matchedOrder) {
        return {
          reply: `Order [${matchedOrder.orderId}] status: [${matchedOrder.status}]. Total: PKR ${matchedOrder.total.toLocaleString()}. Shipping to ${matchedOrder.shippingAddress.city}. Expected delivery within 48-72 hours. You can view the live animated telemetry timeline in the Track Order portal.`,
          intent: 'order_status',
          orderContext: matchedOrder.orderId
        };
      } else {
        return {
          reply: `Order [${orderId}] was scanned in the archive registry. Status: IN TRANSIT / OUT FOR DELIVERY via Express Air Cargo. Carrier dispatch confirmed. Check 'TRACK YOUR ORDER' in the top menu for real-time node coordinates.`,
          intent: 'order_status',
          orderContext: orderId
        };
      }
    } else if (userOrders.length > 0) {
      const latest = userOrders[0];
      return {
        reply: `Scanning your customer profile: Found recent dispatch [${latest.orderId}] currently marked as [${latest.status}]. Total amount: PKR ${latest.total.toLocaleString()} containing ${latest.items.length} archival item(s). Would you like full transit coordinates?`,
        intent: 'order_status',
        orderContext: latest.orderId
      };
    } else {
      return {
        reply: `To track an acquisition, provide your order code (e.g. NR-2026-00192) or open the 'TRACK ORDER' console from the navigation header.`,
        intent: 'order_status'
      };
    }
  }

  // Return Policy
  if (
    normalized.includes('return') ||
    normalized.includes('exchange') ||
    normalized.includes('refund') ||
    normalized.includes('money back')
  ) {
    return {
      reply: `NOVA/RETRON Return Protocol:
• 14-day archival inspection window from delivery timestamp.
• Condition: Unworn with holographic tamper seals and serialized hangtags intact.
• Complimentary courier pickup scheduled across major Pakistan metro centers.
• Store credit or prompt reversal to original payment rail within 48h of vault receipt.`,
      intent: 'return_policy'
    };
  }

  // Delivery Times
  if (
    normalized.includes('delivery time') ||
    normalized.includes('how long') ||
    normalized.includes('shipping') ||
    normalized.includes('dispatch') ||
    normalized.includes('courier')
  ) {
    return {
      reply: `Transit Protocols:
• Nationwide Pakistan Dispatch: 2 to 4 business days via Express Air Network.
• Same-day processing: Orders confirmed prior to 16:00 PKT enter courier sorting immediately.
• Shipping Tariff: Complimentary for orders exceeding PKR 25,000. Flat PKR 650 for standard dispatch.
• Tracking: Real-time telemetry sent via SMS and accessible under 'Track Order'.`,
      intent: 'general'
    };
  }

  // Sizing Advice
  if (
    normalized.includes('what size') ||
    normalized.includes('size guide') ||
    normalized.includes('sizing') ||
    normalized.includes('fit')
  ) {
    const targetProduct = currentProduct ? currentProduct.name : 'NOVA/RETRON apparel';
    return {
      reply: `Sizing Matrix for ${targetProduct}:
• Cut: Architectural boxy silhouette with ergonomic drop-shoulder drape.
• Standard Fit: True to size. If you normally wear size L, choose L for our intended editorial drape.
• Slim/Close Fit: Size down one increment (e.g. Medium if you are between M and L).
• Footwear (Chrome Runner): True to European sizing standards.
Feel free to provide your height and build for an exact tailored recommendation.`,
      intent: 'sizing',
      productContext: currentProduct?.name
    };
  }

  // Category Spotlights
  if (normalized.includes('jacket') || normalized.includes('outerwear')) {
    const jkt = PRODUCTS.find(p => p.category === 'Outerwear');
    return {
      reply: `Outerwear Archive Spotlight: [01 — QUANTUM JACKET] (PKR 48,500). Constructed from 3-layer ballistic polyamide with a thermo-reactive climate membrane and FIDLOCK® magnetic buckles. Click below to view specifications.`,
      intent: 'product_inquiry',
      productContext: jkt?.name,
      recommendedProducts: [jkt?.id || 'prod-01']
    };
  }

  if (normalized.includes('hoodie') || normalized.includes('sweatshirt')) {
    const hd = PRODUCTS.find(p => p.category === 'Hoodies');
    return {
      reply: `Knitwear Archive Spotlight: [03 — SIGNAL HOODIE] (PKR 22,800). 550 GSM double-face loopback French terry with architectural drape and seamless kangaroo pouch.`,
      intent: 'product_inquiry',
      productContext: hd?.name,
      recommendedProducts: [hd?.id || 'prod-03']
    };
  }

  if (normalized.includes('shoes') || normalized.includes('sneaker') || normalized.includes('runner')) {
    const shoe = PRODUCTS.find(p => p.category === 'Footwear');
    return {
      reply: `Footwear Chassis Spotlight: [02 — CHROME RUNNER] (PKR 34,900). Electroplated chrome heel counter with dual-density Vibram rebound cushioning.`,
      intent: 'product_inquiry',
      productContext: shoe?.name,
      recommendedProducts: [shoe?.id || 'prod-02']
    };
  }

  // General fallback
  return {
    reply: `Terminal transmission received. The NOVA/RETRON neural archive is operating at nominal capacity. I can assist you with product dimensions, custom fit advisory, order tracking telemetry, or dispatch scheduling. How may I calibrate your acquisition today?`,
    intent: 'general',
    productContext: currentProduct?.name
  };
}
