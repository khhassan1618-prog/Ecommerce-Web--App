import express from 'express';
import type { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/live' });

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI server-side with telemetry header per guidelines
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// System instruction for the retro-futuristic fashion house
const DEFAULT_SYSTEM_INSTRUCTION = `
You are the NOVA/RETRON ARCHIVAL INTELLIGENCE SYSTEM (Terminal Unit 01-A).
Brand: NOVA/RETRON — "Fashion from a future that never happened."
Aesthetic: Luxury retro-futuristic cyberpunk, 1984 cassette-futurism meets 2091 deep-orbital tailoring.
Currency: PKR (Pakistani Rupees).
Garments:
- 01 — QUANTUM JACKET (PKR 48,500)
- 02 — CHROME RUNNER (PKR 34,900)
- 03 — SIGNAL HOODIE (PKR 22,800)
- 04 — ORBIT TEE (PKR 14,500)
- 05 — NEON ARCHIVE BAG (PKR 28,000)
- 06 — VECTOR WATCH (PKR 56,000)
Coupons: NOVA10 (10% off), ARCHIVE15 (15% off), FUTURE20 (20% off).
Policies: 14-day archival inspection privilege, nationwide express air cargo across Pakistan. Free dispatch over PKR 25,000.
Logistics & Gmail Automation:
- When a customer asks about tracking their order, where their package is, or requests tracking details via email, state the order status and explain that our automated logistics system can dispatch the complete telemetry report directly to their email via the store owner's verified Gmail (kh.hassan.16.18@gmail.com).
Always maintain a poised, architectural, retro-futuristic voice while providing precise styling and sizing guidance.
`;

// 1. CHAT ENDPOINT (Multi-turn Gemini Chatbot with Model Switching & Google Search Grounding)
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const {
      message,
      history = [],
      model = 'gemini-3.5-flash',
      taskComplexity = 'general', // 'complex' -> gemini-3.1-pro-preview, 'fast' -> gemini-3.1-flash-lite, 'general' -> gemini-3.5-flash
      enableSearch = false,
      productContext = '',
      orderContext = ''
    } = req.body;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(200).json({
        text: `[OFFLINE DEMO MODE] Terminal received: "${message}". Please set GEMINI_API_KEY in Settings > Secrets to activate live neural cognition.`,
        modelUsed: 'demo-fallback',
        groundingSources: []
      });
    }

    // Determine model based on prompt instructions:
    // "Use gemini-3.1-pro-preview for particularly complex tasks, gemini-3.5-flash for general tasks, and gemini-3.1-flash-lite for tasks that should happen fast."
    let selectedModel = 'gemini-3.5-flash';
    if (taskComplexity === 'complex' || model === 'gemini-3.1-pro-preview') {
      selectedModel = 'gemini-3.1-pro-preview';
    } else if (taskComplexity === 'fast' || model === 'gemini-3.1-flash-lite') {
      selectedModel = 'gemini-3.1-flash-lite';
    } else {
      selectedModel = 'gemini-3.5-flash';
    }

    // Format chat history into Gemini contents format
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Add prior conversation turns if provided
    if (Array.isArray(history)) {
      for (const turn of history.slice(-8)) {
        if (turn.sender === 'customer' || turn.role === 'user') {
          contents.push({ role: 'user', parts: [{ text: turn.message || turn.text }] });
        } else if (turn.sender === 'ai' || turn.role === 'model') {
          contents.push({ role: 'model', parts: [{ text: turn.message || turn.text }] });
        }
      }
    }

    // Context metadata
    let enrichedPrompt = message;
    if (productContext) {
      enrichedPrompt = `[CURRENT PRODUCT INSPECTION: ${productContext}]\n${enrichedPrompt}`;
    }
    if (orderContext) {
      enrichedPrompt = `[ACTIVE ORDER CONTEXT: ${orderContext}]\n${enrichedPrompt}`;
    }

    contents.push({ role: 'user', parts: [{ text: enrichedPrompt }] });

    // Config options with system instruction and optional search grounding
    const config: any = {
      systemInstruction: DEFAULT_SYSTEM_INSTRUCTION
    };

    // Google Search Grounding per prompt: "Use gemini-3.5-flash (with googleSearch tool)"
    if (enableSearch) {
      selectedModel = 'gemini-3.5-flash';
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config
    });

    const responseText = response.text || '';

    // Extract search grounding web sources if present
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const groundingSources: Array<{ title: string; uri: string }> = [];

    if (groundingChunks && Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk.web?.uri) {
          groundingSources.push({
            title: chunk.web.title || 'Source Citation',
            uri: chunk.web.uri
          });
        }
      }
    }

    return res.json({
      text: responseText,
      modelUsed: selectedModel,
      groundingSources
    });
  } catch (err: any) {
    const isQuota = err?.status === 'RESOURCE_EXHAUSTED' ||
                    err?.message?.includes('429') ||
                    err?.message?.includes('quota') ||
                    err?.message?.includes('RESOURCE_EXHAUSTED');

    if (isQuota) {
      console.warn('[SERVER GEMINI] Rate limit / quota reached, serving fallback response:', err?.message);
      let fallbackText = `[ARCHIVAL TERMINAL - LOCAL FALLBACK PROTOCOL]\nNeural API bandwidth is temporarily operating under rate limits. Terminal 01-A offline archive active:\n\n`;
      const lower = (req.body.message || '').toLowerCase();
      if (lower.includes('order') || lower.includes('track') || lower.includes('nr-')) {
        fallbackText += `For order telemetry, please check the 'TRACK ORDER' console at the top of the terminal or provide your order code (e.g. NR-2026-00192).`;
      } else if (lower.includes('return') || lower.includes('policy')) {
        fallbackText += `Archival Return Privilege: 14 days from delivery for unworn garments with security tags. Complimentary courier pickups arranged across Pakistan.`;
      } else if (lower.includes('size') || lower.includes('fit')) {
        fallbackText += `Sizing Matrix: Tailored for relaxed, architectural drape. Select your standard size for editorial drape, or size down one increment for close fit.`;
      } else {
        fallbackText += `Terminal Unit 01-A confirms catalog access: 01 Quantum Jacket (PKR 48,500), 02 Chrome Runner (PKR 34,900), 03 Signal Hoodie (PKR 22,800), 06 Vector Watch (PKR 56,000). Express nationwide dispatch across Pakistan. Use promo code NOVA10 for 10% off.`;
      }

      return res.status(200).json({
        text: fallbackText,
        modelUsed: 'archival-offline-cache',
        groundingSources: []
      });
    }

    console.error('[SERVER GEMINI ERROR]', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate AI response',
      text: `[SYSTEM ERROR] Neural link temporarily interrupted: ${err.message || 'Connection failure'}`
    });
  }
});

// 2. SEARCH GROUNDING STANDALONE ENDPOINT (gemini-3.5-flash with googleSearch)
app.post('/api/gemini/search-grounded', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.json({
        text: `[DEMO SEARCH] Retrieved archival data for: "${query}". Set GEMINI_API_KEY to query real-time Google Search.`,
        sources: []
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Perform up-to-date search analysis for: ${query}. Incorporate the latest facts, trends, and citations. Context: High-fashion, weather, fabric technology, or live cultural trends.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources: Array<{ title: string; uri: string }> = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && Array.isArray(chunks)) {
      for (const c of chunks) {
        if (c.web?.uri) {
          sources.push({ title: c.web.title || 'Web Result', uri: c.web.uri });
        }
      }
    }

    return res.json({
      text: response.text || '',
      sources
    });
  } catch (err: any) {
    console.error('[SEARCH GROUNDING ERROR]', err);
    return res.status(500).json({ error: err.message });
  }
});

// 3. GMAIL API DISPATCH ROUTE (Workspace Integration per skill)
app.post('/api/gmail/send-tracking', async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization Bearer token' });
  }

  const { raw } = req.body;
  if (!raw) {
    return res.status(400).json({ error: 'Missing raw base64 email content' });
  }

  try {
    const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw })
    });

    const data = await gmailRes.json();
    if (!gmailRes.ok) {
      return res.status(gmailRes.status).json(data);
    }
    return res.json(data);
  } catch (err: any) {
    console.error('[GMAIL PROXY ERROR]', err);
    return res.status(500).json({ error: err.message });
  }
});

// 4. LIVE API WEBSOCKET HANDLER (gemini-3.8-live real-time voice conversations)
wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[LIVE API] Client connected to voice communication channel');

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    clientWs.send(JSON.stringify({
      text: '[VOICE LINK OFFLINE] GEMINI_API_KEY required for real-time Live API voice stream.'
    }));
    return;
  }

  try {
    const session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' } // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
          }
        },
        systemInstruction: DEFAULT_SYSTEM_INSTRUCTION + '\nYou are speaking aloud to the user in a short, crisp, luxury retro-futuristic tone. Keep responses conversational and under 2-3 sentences.'
      },
      callbacks: {
        onmessage: (message: any) => {
          // Model audio chunk (24kHz PCM)
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ audio }));
          }
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        }
      }
    });

    clientWs.send(JSON.stringify({
      text: "NOVA/RETRON Terminal 01-A Voice Link synchronized. Speak into your microphone."
    }));

    clientWs.on('message', (data: any) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio) {
          // Send 16kHz PCM audio to Live API session
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' }
          });
        }
      } catch (err) {
        console.error('[LIVE WS INGEST ERROR]', err);
      }
    });

    clientWs.on('close', () => {
      console.log('[LIVE API] Client closed voice session');
    });
  } catch (err: any) {
    console.error('[LIVE SESSION INIT ERROR]', err);
    clientWs.send(JSON.stringify({ error: err.message }));
  }
});

// Start dev or production server
async function startServer() {
  const PORT = process.env.PORT || 3000;

  if (process.env.NODE_ENV !== 'production') {
    // Mount Vite middlewares in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`[NOVA/RETRON SERVER] Running on http://localhost:${PORT}`);
  });
}

startServer();
