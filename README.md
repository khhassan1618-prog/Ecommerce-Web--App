NOVA / RETRON — Fashion From A Future That Never Happened
![Image](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)
![Image](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Image](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)
![Image](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)
![Image](https://img.shields.io/badge/Three.js-WebGL_3D-black?logo=three.js&logoColor=white)
![Image](https://img.shields.io/badge/Firebase-Auth_&_Firestore-FFCA28?logo=firebase&logoColor=black)
![Image](https://img.shields.io/badge/Gemini_API-3.5_Flash_|_3.1_Pro_|_3.8_Live-4285F4?logo=google-gemini&logoColor=white)
NOVA/RETRON is an immersive retro-futuristic luxury fashion house and e-commerce experience. Blending 1984 cassette-futurism with 2091 deep-orbital tailoring, the platform combines speculative cyberpunk aesthetics with production-grade engineering: real-time 3D WebGL garment inspection, Firebase Authentication, Cloud Firestore persistence, Google Workspace Gmail automation, and dual-modality Google Gemini AI assistance (text, search grounding, and real-time voice streaming).
✦ Table of Contents
Key Features
System Architecture & Tech Stack
Speculative Catalog & Eras
AI Archival Intelligence System
Firebase & Database Architecture
Google Workspace Gmail Integration
Project Directory Structure
Getting Started
Environment Configuration
Available Scripts
Security & Firestore Rules
✦ Key Features
1. Interactive 3D WebGL Garment Inspection
Real-time 3D rendering powered by Three.js, @react-three/fiber, and @react-three/drei.
Dynamic wireframe/quantum shader toggles, lighting customization, 360° orbital rotation, and high-definition zoom.
Interactive garment inspection available directly inside product detail modals and the 3D gallery.
2. Archival Catalog & Speculative Timeline Filter
Filter garments across chronological speculative timelines: 1970, 1984, 1999, 2026, and 2091.
Detailed telemetry for every garment: quantum fabric composition, temperature tolerance (-40°C to +85°C), RFID cyber-tagging, and stock status.
Real-time wishlist, size selector, and color matrix.
3. Frictionless Cart & Checkout Flow
Slide-over cart drawer with instant quantity modification and pricing computation in Pakistani Rupees (PKR).
Coupon code engine supporting promotional discounts:
NOVA10 — 10% Off
ARCHIVE15 — 15% Off
FUTURE20 — 20% Off
Multiple payment channels: Cash on Delivery (COD), Card Payment, and Direct Bank Transfer.
Confetti celebration and instant telemetry feedback on order placement.
4. Customer Accounts & Firebase Authentication
Dual authentication methods:
Email & Password: User registration and sign-in with full validation and error diagnostics.
Google OAuth: One-click sign-in via Firebase Google Auth Provider.
Live synchronization of patron profile with the Cloud Firestore customers collection.
Patron dashboard with saved shipping coordinates, past order telemetry, and personal wishlist.
5. Real-Time Order Tracking & Telemetry
6-stage visual timeline tracking:
ORDER PLACED ➔ PROCESSING ➔ PACKED ➔ SHIPPED ➔ OUT FOR DELIVERY ➔ DELIVERED.
Live lookup by Order Code (e.g., NR-2026-XXXXX).
Real-time Firestore sync with automated email re-dispatch.
6. Automated Bilingual Email Dispatch (Gmail API)
Official order confirmation emails with English & Urdu status notifications:
"Aapka order confirm hogya hai! (Your order has been placed and confirmed successfully)"
Dispatched via server-side Google Workspace Gmail API integration (/api/gmail/send-tracking) using the store owner's OAuth token.
Includes complete item breakdown, pricing, shipping address, and tracking deep-links.
7. Staff Admin Command Center
Password-gated administrative console for store operators:
Real-time metrics: gross sales, total orders, active customer accounts.
Order status management with instant timeline state updates.
One-click tracking email re-dispatch.
Customer registry inspection and support escalation monitor.
✦ System Architecture & Tech Stack
code
Code
┌─────────────────────────────────────────────────────────────┐
│                    NOVA/RETRON CLIENT                       │
│  React 19 + TypeScript + Vite + Tailwind CSS v4             │
│  Three.js / React Three Fiber (3D WebGL Inspection)         │
│  Lucide Icons + GSAP / Motion Animations                    │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
        Client SDK / REST              WebSocket (/live)
               │                               │
┌──────────────▼───────────────────────────────▼──────────────┐
│                    EXPRESS BACKEND SERVER                   │
│  (server.ts running on Node.js / tsx runtime)               │
│                                                             │
│  • /api/gemini/chat          (Multi-Turn Reasoning)         │
│  • /api/gemini/search-grounded (Live Web Google Search)     │
│  • /api/gmail/send-tracking  (Workspace Gmail Dispatch)     │
│  • /live WebSocket           (Gemini 3.8 Live Voice Audio)  │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
┌──────────────▼──────────────┐ ┌──────────────▼──────────────┐
│       FIREBASE SUITE        │ │     GOOGLE GEMINI SDK       │
│  • Firebase Authentication  │ │  • gemini-3.5-flash         │
│  • Cloud Firestore          │ │  • gemini-3.1-pro-preview   │
│  • Security Rules (RBAC)    │ │  • gemini-3.1-flash-lite    │
│                             │ │  • gemini-3.8-live (Audio)  │
└─────────────────────────────┘ └─────────────────────────────┘
Layer	Technologies
Frontend Core	React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React
Motion & 3D	Three.js, @react-three/fiber, @react-three/drei, GSAP, Motion
Backend & Routing	Node.js, Express, tsx, WebSockets (ws)
Database & Auth	Firebase Auth (Email/Pass & Google), Cloud Firestore
AI & Neural Engine	Google Gen AI SDK (@google/genai), Gemini 3.5 Flash, 3.1 Pro, 3.8 Live
Workspace Integration	Google Workspace Gmail API v1 (via OAuth Bearer proxy)
✦ Speculative Catalog & Eras
Index	Garment Name	Speculative Era	Category	Base Price (PKR)	Primary Feature
01	Quantum Trench Jacket	1984	Outerwear	48,500	Electro-chromic memory textile
02	Chrome Runner Mk II	2091	Footwear	34,900	Magnetic-levitation pneumatic soles
03	Sub-Zero Signal Hoodie	1999	Hoodies	22,800	Far-infrared thermal insulated knit
04	Orbital Modular Tee	2026	Tops	14,500	Liquid silicone anti-bacterial weave
05	Neon Vault Archive Bag	1970	Bags	28,000	Ballistic Cordura with Faraday lining
06	Vector Temporal Chrono	2091	Accessories	56,000	Tritium-illuminated sapphire quartz
✦ AI Archival Intelligence System
The application incorporates a server-side AI subsystem built with @google/genai with model specialization:
General & Search-Grounded Queries (gemini-3.5-flash):
Responds to styling advice, sizing matrices, and return policies.
Leverages googleSearch grounding tool for live trend verification and external weather contexts.
Deep Fashion Reasoning (gemini-3.1-pro-preview):
Activated for complex customer requests, multi-garment wardrobe layering, and archival backstory inquiries.
High-Velocity Instant Responses (gemini-3.1-flash-lite):
Used for quick navigational cues and immediate status checks.
Real-Time Voice Channel (gemini-3.8-live):
Runs over the bidirectional /live WebSocket.
Client streams 16kHz PCM audio from the user's microphone.
Gemini responds with 24kHz PCM audio using the prebuilt Zephyr voice.
Offline Archival Cache Fallback:
If external API rate limits or quota boundaries are encountered, the system gracefully falls back to an offline archival knowledge base without breaking the UI.
✦ Firebase & Database Architecture
The application connects to a provisioned Google Cloud Firestore database instance:
ai-studio-novaretron-0fc1a0f9-fdee-4a6a-942e-2ce5dc4cfbf7.
Primary Collections:
/customers/{userId}
Stores customer identities, contact info, and preferences:
code
TypeScript
interface Customer {
  customerId: string;      // Firebase Auth UID
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  createdAt: string;
  wishlist: string[];      // Array of Product IDs
}
/orders/{orderId}
Stores completed orders and real-time tracking checkpoints:
code
TypeScript
interface Order {
  orderId: string;         // e.g. "NR-2026-00192"
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash on Delivery' | 'Card' | 'Bank Transfer';
  shippingAddress: { address: string; city: string; postalCode: string };
  status: 'ORDER PLACED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'OUT FOR DELIVERY' | 'DELIVERED';
  createdAt: string;
  timeline: OrderTrackingStep[];
}
✦ Google Workspace Gmail Integration
When an order is created or when a tracking dispatch is triggered from the UI:
The client signs the order payload with HTML styling designed in the brand's cassette-futurism aesthetic.
Sends the request with the authenticated Google OAuth Bearer token to /api/gmail/send-tracking.
The server forwards the base64 RFC 2822 email payload to https://gmail.googleapis.com/gmail/v1/users/me/messages/send.
The customer receives a receipt with full order telemetry and tracking access.
✦ Project Directory Structure
code
Code
├── .env.example                # Template for environment secrets
├── firebase-applet-config.json # Firebase project and database identifier
├── firebase-blueprint.json    # Firestore schema blueprint
├── firestore.rules            # Firestore security and RBAC access rules
├── index.html                 # HTML entry point with metadata & webfonts
├── metadata.json              # Applet capabilities & permissions
├── package.json               # NPM scripts & dependencies
├── server.ts                  # Express backend & WebSocket server
├── tsconfig.json              # TypeScript compiler configuration
├── vite.config.ts             # Vite configuration with React & Tailwind plugins
│
├── public/                    # Static public assets
│
└── src/
    ├── main.tsx               # Client entry point
    ├── App.tsx                # Primary layout & shell
    ├── index.css              # Tailwind CSS directives & global typography
    │
    ├── components/            # UI Modals, Drawers & Interactive Widgets
    │   ├── AISupportChat.tsx        # Terminal Unit 01-A AI chat interface
    │   ├── AdminDashboardModal.tsx  # Store operator command center
    │   ├── CartDrawer.tsx           # Interactive slide-over shopping bag
    │   ├── CheckoutModal.tsx        # Checkout form, order confirmation & dispatch
    │   ├── CustomerAccountModal.tsx # Firebase Auth sign-in / registration
    │   ├── CyberCursor.tsx          # Custom retro-futuristic cursor
    │   ├── Footer.tsx               # Brand manifesto & archival navigation
    │   ├── MarqueeTicker.tsx        # Continuous telemetry stock ticker
    │   ├── Navbar.tsx               # Header with quick telemetry actions
    │   ├── OrderTrackingModal.tsx   # Live order tracking and timeline
    │   ├── Preloader.tsx            # Bootloader sequence
    │   ├── Product3DViewer.tsx      # WebGL 3D garment canvas
    │   └── ProductDetailModal.tsx   # Garment telemetry, specs & purchase
    │
    ├── context/
    │   └── StoreContext.tsx         # Central state store (cart, auth, orders, chat)
    │
    ├── data/
    │   └── products.ts              # Garment catalog & speculative lore
    │
    ├── sections/                    # Page Landing Sections
    │   ├── HeroSection.tsx          # Cinematic headline & primary 3D viewport
    │   ├── CollectionSection.tsx    # Filterable garment gallery
    │   ├── CinematicVideoSection.tsx# Lookbook reel
    │   ├── ArchiveSection.tsx       # Historical timeline showcase
    │   ├── PastFutureSection.tsx    # Philosophy & quantum textile specs
    │   └── StorySection.tsx         # Brand narrative & craftsmanship
    │
    ├── services/                    # Integration & API Services
    │   ├── aiService.ts             # Client-side AI communications wrapper
    │   ├── firebase.ts              # Firebase initialization & Firestore operations
    │   └── gmailService.ts          # Gmail order confirmation & tracking dispatch
    │
    └── types/
        └── index.ts                 # TypeScript interfaces and shared types
✦ Getting Started
Prerequisites
Node.js: v20.x or later recommended
npm or bun / yarn
Installation
Clone or open the repository:
code
Bash
git clone <repository-url>
cd <repository-directory>
Install project dependencies:
code
Bash
npm install
Configure Environment Variables:
Copy .env.example to .env and provide your API keys:
code
Bash
cp .env.example .env
Launch the Development Server:
code
Bash
npm run dev
The application will be accessible at http://localhost:3000.
✦ Environment Configuration
Create a .env file in the root directory:
code
Env
# Required for Gemini AI Chat, Search Grounding, and Live Voice API
GEMINI_API_KEY="your-gemini-api-key"

# Application URL (injected automatically in cloud environments)
APP_URL="http://localhost:3000"

# Optional port override (defaults to 3000)
PORT=3000
✦ Available Scripts
Command	Description
npm run dev	Runs the full-stack Express server with Vite middleware in development mode via tsx server.ts
npm run build	Compiles the production React application with Vite into the dist/ folder
npm run start	Launches the production Node.js Express server to serve compiled static assets
npm run lint	Performs TypeScript typechecking (tsc --noEmit)
npm run clean	Removes the compiled dist/ directory and build artifacts
✦ Security & Firestore Rules
All Firestore data operations are protected via granular rules defined in firestore.rules:
Customers Collection: Patrons can only read and write their own document (request.auth.uid == userId).
Orders Collection: Orders can be created by authenticated users or guest checkout; patrons can view their own orders; admins retain global oversight.
Rule Deployment: Deployed directly to the active Firestore project using the AI Studio deployment toolchain.
✦ Brand Credits
NOVA/RETRON is conceptualized as an exploration of cassette-futurism, archival sci-fi aesthetics, and responsive e-commerce design. Engineered for high-fidelity performance, tactile micro-interactions, and neural computing integration.
