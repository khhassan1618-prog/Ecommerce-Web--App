# NOVA / RETRON

# Retro-Futuristic Fashion E-Commerce Platform

A modern full-stack fashion e-commerce experience combining immersive 3D product visualization, smooth animations, Firebase authentication, cloud data, real-time order tracking, and AI-powered customer support.

---

## ✨ Features

- 🛍️ Modern fashion e-commerce experience
- 🧊 Interactive 3D product visualization
- 🔎 Product browsing and filtering
- ❤️ Wishlist functionality
- 🛒 Shopping cart
- 💳 Checkout system
- 🎟️ Discount and coupon support
- 👤 Customer accounts
- 🔐 Email & password authentication
- 🔵 Google authentication
- 📦 Order management
- 🚚 Real-time order tracking
- 🤖 AI-powered customer support
- 📧 Automated order and tracking emails
- 🛠️ Admin dashboard
- 📱 Responsive design
- 🎬 Smooth animations and transitions

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React

### 3D & Animation

- Three.js
- React Three Fiber
- React Three Drei
- GSAP
- Motion

### Backend

- Node.js
- Express
- WebSockets
- TypeScript

### Database & Authentication

- Firebase Authentication
- Cloud Firestore
- Firestore Security Rules

### AI & Integrations

- Google Gemini API
- Google Workspace Gmail API

---

## 🛍️ E-Commerce

The platform provides a complete shopping experience including:

- Product catalog
- Product details
- Size selection
- Color selection
- Wishlist
- Shopping cart
- Quantity management
- Coupon codes
- Checkout
- Order creation
- Order history
- Order tracking

### Payment Methods

- Cash on Delivery
- Card Payment
- Direct Bank Transfer

---

## 👤 Customer Accounts

Customers can create and manage their accounts using Firebase Authentication.

### Authentication

- Email & Password
- Google Sign-In

### Customer Features

- Account profile
- Saved information
- Wishlist
- Previous orders
- Order tracking

---

## 📦 Order Tracking

Orders can be tracked through a visual delivery timeline:

```text
ORDER PLACED
     ↓
PROCESSING
     ↓
PACKED
     ↓
SHIPPED
     ↓
OUT FOR DELIVERY
     ↓
DELIVERED
🤖 AI Customer Support

The application includes an AI-powered support assistant using the Google Gemini API.

The assistant can help with:

Product information
Styling questions
Sizing guidance
Store information
Shopping assistance
General customer questions
🧊 3D Product Experience

The product experience uses Three.js and React Three Fiber to provide an interactive 3D environment.

Features include:

3D product viewing
360° product inspection
Product rotation
Interactive viewing
Zoom interaction
Immersive product presentation
🛠️ Admin Dashboard

The application includes an administrative interface for managing the store.

Admin functionality includes:

Order management
Order status updates
Customer information
Sales information
Tracking notifications
📧 Email Integration

The application supports automated email communication through the Google Workspace Gmail API.

Email functionality can be used for:

Order confirmations
Order status updates
Shipping notifications
Tracking notifications
📁 Project Structure
ecommerce-web-app/
│
├── public/
│
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── sections/
│   ├── services/
│   └── types/
│
├── .env.example
├── firestore.rules
├── index.html
├── package.json
├── server.ts
├── tsconfig.json
└── vite.config.ts
🚀 Getting Started
Prerequisites

Make sure you have installed:

Node.js 20+
npm
1. Clone the Repository
git clone https://github.com/khhassan1618-prog/ecommerce-web-app.git
2. Open the Project
cd ecommerce-web-app
3. Install Dependencies
npm install
4. Configure Environment Variables

Create a .env file in the project root.

Example:

GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
PORT=3000
5. Start the Development Server
npm run dev

Open the application at:

http://localhost:3000
📜 Available Scripts
Command	Description
npm run dev	Start the development server
npm run build	Build the application for production
npm run start	Start the production server
npm run lint	Run TypeScript checks
npm run clean	Remove build artifacts
🔐 Security

The project uses Firebase Authentication and Firestore Security Rules.

For production deployment:

Keep API keys private
Do not commit .env files
Protect Firebase credentials
Review Firestore security rules
Restrict API access
Protect administrative functionality
🎨 Design

NOVA / RETRON follows a retro-futuristic visual direction inspired by:

Cinematic interfaces
Dark visual design
Futuristic typography
Interactive 3D elements
Smooth animations
Digital fashion experiences
Immersive product presentation
📱 Responsive Design

The application is designed to work across:

Desktop
Laptop
Tablet
Mobile
🗺️ Roadmap
 Production payment gateway
 Advanced inventory management
 Customer reviews
 Product ratings
 Advanced product search
 Shipping provider integration
 Advanced analytics
 Expanded 3D product catalog
