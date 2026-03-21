# Site Chatbot — Multi-website AI Bot by Dan

One backend. Multiple websites. Each bot knows its own site.

---

## 1. Get a Free Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy it — you'll need it in step 3

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

## 3. Embed on Any Website

Add these 2 lines before `</body>` on each website:

### Ride and Fire:
```html
<script>
  window.chatbotSiteId = "rideandfire";
  window.chatbotEndpoint = "https://YOUR-BACKEND.onrender.com";
</script>
<script src="https://YOUR-BACKEND.onrender.com/widget.js"></script>
```

### Panna Resort:
```html
<script>
  window.chatbotSiteId = "panna-resort";
  window.chatbotEndpoint = "https://YOUR-BACKEND.onrender.com";
</script>
<script src="https://YOUR-BACKEND.onrender.com/widget.js"></script>
```

### Ladakh Wood Works:
```html
<script>
  window.chatbotSiteId = "ladakh-wood-works";
  window.chatbotEndpoint = "https://YOUR-BACKEND.onrender.com";
</script>
<script src="https://YOUR-BACKEND.onrender.com/widget.js"></script>
```

---

## 4. WordPress Embedding

Option A — Theme editor (Appearance → Theme File Editor → footer.php):
Paste the 2 script lines above just before `</body>`.

Option B — Plugin (easiest):
Install "Insert Headers and Footers" plugin → paste into Footer section.

---

## 5. Adding New Client Sites

Open `sites.js` and add a new entry:

```js
'new-client': {
  name: 'Client Business Name',
  themeColor: '#your-hex-color',
  greeting: "Welcome! How can I help?",
  systemPrompt: `You are a helpful assistant for [Business Name].
  They do [what they do]. Help visitors with [common questions].
  Goal: [what you want the bot to achieve].`
},
```

Then redeploy. That's it.

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
├── server.js          ← Main backend
├── sites.js           ← All your site configs (edit this!)
├── package.json
├── public/
│   └── widget.js      ← The embed widget
└── README.md
```

---

## Troubleshooting

- Backend not responding? Check Render logs for errors
- Wrong bot personality? Edit the systemPrompt in sites.js and redeploy
- Render free tier sleeps after 15min inactivity — first message may take 30sec to wake up
  → Fix: Use https://cron-job.org to ping /health every 10 minutes (free)
