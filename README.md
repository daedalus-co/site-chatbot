# Site Chatbot — Multi-website AI SaaS Backend by Dan

One backend. Infinite websites. Embedded sites define their own behavior.

---

## 1. Get a Free Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy it — you'll need it in step 2

Free tier: 15 requests/min, 1 million tokens/day. More than enough.

---

## 2. Deploy to Render (Free)

1. Push this folder to a GitHub repo
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - Build command: `npm install`
   - Start command: `node server.js`
   - Instance type: Free
5. Add environment variable:
   - Key: `GEMINI_API_KEY`
   - Value: (your key from step 1)
6. Click Deploy

Your backend URL will be something like:
`https://site-chatbot-abc123.onrender.com`

---

## 3. SaaS Integration / Embedding

This backend operates completely dynamically. It does not store static site configurations. 
Instead, the client website must send its `customPrompt` and `targetUrl` when sending messages to the bot.
The model is equipped with **Google Search Grounding** so providing `targetUrl` will automatically allow the bot to search real-time data from that URL to assist users.

### API Protocol

**POST `/chat`**

**Request Body JSON:**
```json
{
  "message": "User's message here",
  "targetUrl": "https://rideandfire.in",
  "customPrompt": "You are a master guide for Himalayan Motorcycling. Be friendly but direct.",
  "history": []
}
```

The system will automatically inject a master prompt strictly enforcing professional prompting techniques (brevity, no filler, bullet structures) combined with your `customPrompt`.

---

## Local Development

```bash
npm install
GEMINI_API_KEY=your_key_here node server.js
# Visit http://localhost:3000/health to verify
```

---

## File Structure

```
site-chatbot/
├── server.js          ← Main backend logic
├── package.json
├── public/
│   └── widget.js      ← The legacy embed widget (Update it to send customPrompt to match your API call payload)
└── README.md
```
