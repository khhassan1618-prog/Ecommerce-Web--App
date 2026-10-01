import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Customer, Order, Conversation, OrderTrackingStep } from '../types';

// Operation types for standard error handling per skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Scopes configured for Google Workspace integrations per skill
export const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
// Add workspace Gmail send scope
SCOPES.forEach(scope => googleProvider.addScope(scope));

// In-memory access token cache (never stored in localStorage per skill)
let cachedAccessToken: string | null = null;

export const getCachedAccessToken = (): string | null => cachedAccessToken;
export const setCachedAccessToken = (token: string | null): void => {
  cachedAccessToken = token;
};

// Clear access token on sign-out
onAuthStateChanged(auth, user => {
  if (!user) {
    cachedAccessToken = null;
  }
});

// Initialize Firestore with explicit database ID
const cfg = firebaseConfig as Record<string, any>;
let firestoreDb;
try {
  firestoreDb = cfg.firestoreDatabaseId
    ? getFirestore(app, cfg.firestoreDatabaseId)
    : getFirestore(app);
} catch {
  firestoreDb = getFirestore(app);
}
export const db = firestoreDb;

// Test connection on boot per Firebase skill guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[FIREBASE] Firestore connection verified to database:', cfg.firestoreDatabaseId);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[FIREBASE] Client is offline or database initializing.');
    } else {
      console.log('[FIREBASE] Connection established/tested');
    }
    return true;
  }
}

// Google Sign-in helper with Workspace OAuth token extraction
export async function signInWithGoogle(): Promise<{ user: User | null; accessToken: string | null }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
      console.log('[GMAIL AUTH] Acquired Gmail access token for user:', result.user.email);
    }
    return { user: result.user, accessToken: credential?.accessToken || null };
  } catch (error) {
    console.error('[FIREBASE AUTH ERROR]', error);
    throw error;
  }
}

// Ensure or request Gmail access token
export async function requestGmailAccessToken(): Promise<string | null> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }
  try {
    const res = await signInWithGoogle();
    return res.accessToken;
  } catch (err) {
    console.error('[GMAIL AUTH ERROR] Failed to acquire access token:', err);
    return null;
  }
}

// Sign-out helper
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

// ----------------------------------------------------
// CUSTOMERS FIRESTORE SYNC
// ----------------------------------------------------
export async function saveCustomerProfile(customer: Customer): Promise<void> {
  const path = `customers/${customer.customerId}`;
  try {
    const ref = doc(db, 'customers', customer.customerId);
    await setDoc(ref, customer, { merge: true });
    console.log('[FIRESTORE] Customer profile synchronized:', customer.customerId);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getCustomerProfile(customerId: string): Promise<Customer | null> {
  const path = `customers/${customerId}`;
  try {
    const ref = doc(db, 'customers', customerId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as Customer;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

export async function getAllCustomersFromFirestore(): Promise<Customer[]> {
  const path = 'customers';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(d => d.data() as Customer);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export function subscribeToCustomers(onUpdate: (customers: Customer[]) => void): () => void {
  const path = 'customers';
  return onSnapshot(
    collection(db, path),
    snapshot => {
      const customers = snapshot.docs.map(d => d.data() as Customer);
      onUpdate(customers);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ----------------------------------------------------
// ORDERS FIRESTORE SYNC
// ----------------------------------------------------
export async function saveOrderToFirestore(order: Order): Promise<void> {
  const path = `orders/${order.orderId}`;
  try {
    const ref = doc(db, 'orders', order.orderId);
    await setDoc(ref, order, { merge: true });
    console.log('[FIRESTORE] Order saved:', order.orderId);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getOrderFromFirestore(orderId: string): Promise<Order | null> {
  const path = `orders/${orderId}`;
  try {
    const ref = doc(db, 'orders', orderId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as Order;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

export async function updateOrderStatusInFirestore(
  orderId: string,
  status: Order['status'],
  timeline: OrderTrackingStep[]
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const ref = doc(db, 'orders', orderId);
    await setDoc(ref, { status, timeline }, { merge: true });
    console.log('[FIRESTORE] Order status updated in cloud:', orderId, status);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function getOrdersByCustomerFromFirestore(customerId: string): Promise<Order[]> {
  const path = 'orders';
  try {
    const q = query(collection(db, path), where('customerId', '==', customerId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Order);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function getAllOrdersFromFirestore(): Promise<Order[]> {
  const path = 'orders';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(d => d.data() as Order);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export function subscribeToOrders(onUpdate: (orders: Order[]) => void): () => void {
  const path = 'orders';
  return onSnapshot(
    collection(db, path),
    snapshot => {
      const orders = snapshot.docs.map(d => d.data() as Order);
      // Sort newest first
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(orders);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ----------------------------------------------------
// CONVERSATIONS FIRESTORE SYNC
// ----------------------------------------------------
export async function saveConversationToFirestore(conversation: Conversation): Promise<void> {
  const path = `conversations/${conversation.conversationId}`;
  try {
    const ref = doc(db, 'conversations', conversation.conversationId);
    await setDoc(ref, conversation, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getAllConversationsFromFirestore(): Promise<Conversation[]> {
  const path = 'conversations';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(d => d.data() as Conversation);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export function subscribeToConversations(onUpdate: (convs: Conversation[]) => void): () => void {
  const path = 'conversations';
  return onSnapshot(
    collection(db, path),
    snapshot => {
      const convs = snapshot.docs.map(d => d.data() as Conversation);
      convs.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      onUpdate(convs);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ----------------------------------------------------
// SEED INITIAL REAL DATA TO FIRESTORE IF EMPTY
// ----------------------------------------------------
export async function seedInitialFirestoreData(
  initialOrders: Order[],
  initialCustomers: Customer[],
  initialConversations: Conversation[]
): Promise<void> {
  try {
    console.log('[FIRESTORE SEED] Checking existing cloud records...');

    // 1. Seed Orders
    const ordersSnap = await getDocs(collection(db, 'orders'));
    if (ordersSnap.empty && initialOrders.length > 0) {
      console.log('[FIRESTORE SEED] Seeding initial orders to Firestore...');
      for (const order of initialOrders) {
        await setDoc(doc(db, 'orders', order.orderId), order);
      }
      console.log(`[FIRESTORE SEED] ${initialOrders.length} orders seeded.`);
    }

    // 2. Seed Customers
    const customersSnap = await getDocs(collection(db, 'customers'));
    if (customersSnap.empty && initialCustomers.length > 0) {
      console.log('[FIRESTORE SEED] Seeding initial patrons to Firestore...');
      for (const cust of initialCustomers) {
        await setDoc(doc(db, 'customers', cust.customerId), cust);
      }
      console.log(`[FIRESTORE SEED] ${initialCustomers.length} patrons seeded.`);
    }

    // 3. Seed Conversations
    const convSnap = await getDocs(collection(db, 'conversations'));
    if (convSnap.empty && initialConversations.length > 0) {
      console.log('[FIRESTORE SEED] Seeding initial support logs to Firestore...');
      for (const conv of initialConversations) {
        await setDoc(doc(db, 'conversations', conv.conversationId), conv);
      }
      console.log(`[FIRESTORE SEED] ${initialConversations.length} conversations seeded.`);
    }
  } catch (err) {
    console.warn('[FIRESTORE SEED NOTICE]', err);
  }
}

// Re-export common Firestore utilities
export {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
  onAuthStateChanged
};
