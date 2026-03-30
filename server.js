// server.js — Main chatbot backend
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Validate API key on startup
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY environment variable is missing!');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Chat endpoint ─────────────────────────────────────────────────────────
app.post('/chat', async (req, res) => {
  const { message, customPrompt, targetUrl, history = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Missing message' });
  }

  const systemInstruction = `You are a highly efficient assistant for ${targetUrl ? targetUrl : 'the provided business'}.
${customPrompt ? `\nBUSINESS CONTEXT:\n${customPrompt}\n` : ''}

CRITICAL CONSTRAINTS & TONE:
- Be ultra-concise, professional, and punchy.
- Segment complex replies with bullet points.
- Eliminate all conversational filler (e.g., "Certainly," "I can help with that").
- Ground your answers in reality: if a target website is provided, use Google Search to scrape and learn about its services, contacts, and features.
- Never invent prices or packages—refer the user to contact options if information is unavailable.`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemInstruction,
      tools: [{ googleSearch: {} }],
      generationConfig: {
        maxOutputTokens: 400,  // Keep replies concise
        temperature: 0.5,
      }
    });

    // Convert history to Gemini format (last 10 messages for context)
    const geminiHistory = history.slice(-10).map(h => ({
      role: h.role === 'bot' ? 'model' : 'user',
      parts: [{ text: h.content }]
    }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.json({ reply });

  } catch (err) {
    console.error('Gemini error:', err.message);
    res.status(500).json({ error: 'AI service error. Please try again.' });
  }
});

// ─── Health check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', dynamic_saas_mode: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🤖 Chatbot SaaS backend running on port ${PORT}`);
  console.log(`📋 Ready for dynamic website embeddings.\n`);
});
