// server.js — Main chatbot backend
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sites = require('./sites');

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
  const { message, siteId, history = [] } = req.body;

  if (!message || !siteId) {
    return res.status(400).json({ error: 'Missing message or siteId' });
  }

  const site = sites[siteId];
  if (!site) {
    return res.status(404).json({ error: `Site "${siteId}" not configured.` });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: site.systemPrompt,
      generationConfig: {
        maxOutputTokens: 400,  // Keep replies concise
        temperature: 0.7,
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

    res.json({ reply, siteName: site.name });

  } catch (err) {
    console.error('Gemini error:', err.message);
    res.status(500).json({ error: 'AI service error. Please try again.' });
  }
});

// ─── Site config endpoint (so widget can get theme/greeting) ───────────────
app.get('/site-config/:siteId', (req, res) => {
  const site = sites[req.params.siteId];
  if (!site) return res.status(404).json({ error: 'Site not found' });
  res.json({
    name: site.name,
    themeColor: site.themeColor,
    greeting: site.greeting
  });
});

// ─── Health check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', sites: Object.keys(sites) });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🤖 Chatbot backend running on port ${PORT}`);
  console.log(`📋 Configured sites: ${Object.keys(sites).join(', ')}\n`);
});
