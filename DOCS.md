# 📄 FireReach — Documentation

> Autonomous B2B Outreach Engine | Rabbitt AI Challenge

## 🔗 Live Links
- **🌐 Live App:** https://fire-reach.vercel.app
- **⚙️ Backend API:** https://firereach-backend-oms9.onrender.com
- **📁 GitHub:** https://github.com/Prabhrehmat/FireReach

---

## What is FireReach?

FireReach is an autonomous outreach engine that researches a target company
in real-time and sends a hyper-personalized cold email — all without any
human input beyond the company name and ICP.

**Zero templates. Zero manual research. Just signal → insight → send.**

---

## Architecture
```
User Input (Company + ICP + Email)
        ↓
  Agent Orchestrator
        ↓
┌─────────────────────┐
│ Tool 1              │
│ Signal Harvester    │ ← Tavily Search API
│ (funding/hiring/    │   4 parallel searches
│  news/leadership)   │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ Tool 2              │
│ Research Analyst    │ ← Groq LLM
│ (Account Brief)     │   llama-3.3-70b
└─────────────────────┘
        ↓
┌─────────────────────┐
│ Tool 3              │
│ Outreach Sender     │ ← Groq LLM + Resend API
│ (Write & Send Email)│
└─────────────────────┘
        ↓
  Result returned to UI
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| LLM | Groq — llama-3.3-70b-versatile |
| Signal Data | Tavily Search API |
| Email Delivery | Resend API |
| Backend | FastAPI (Python) |
| Frontend | React.js |
| Backend Deploy | Render (free tier) |
| Frontend Deploy | Vercel (free tier) |

---

## The 3 Tools

### Tool 1 — Signal Harvester
- Runs 4 Tavily searches: funding, hiring, news, leadership
- Returns structured JSON with real-time company signals
- Fully deterministic — no LLM hallucination

### Tool 2 — Research Analyst
- Takes signals + ICP as input
- Uses Groq LLM to generate a 2-paragraph Account Brief
- Identifies why THIS company needs YOUR product RIGHT NOW

### Tool 3 — Outreach Automated Sender
- Uses Groq LLM to write a unique personalized email
- Zero-template policy — every email is written from scratch
- Sends via Resend API and returns subject + body

---

## API Reference

### POST /run-agent

**Request:**
```json
{
  "company_name": "Stripe",
  "icp": "We sell cybersecurity training to Series B startups",
  "recipient_email": "you@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "company": "Stripe",
  "recipient": "you@example.com",
  "agent_log": [...],
  "signals": {
    "funding": [...],
    "hiring": [...],
    "news": [...],
    "leadership": [...]
  },
  "account_brief": "...",
  "final_email": {
    "subject": "...",
    "body": "..."
  }
}
```

---

## Local Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file:
```
GROQ_API_KEY=your_key
TAVILY_API_KEY=your_key
RESEND_API_KEY=your_key
RESEND_FROM_EMAIL=onboarding@resend.dev
```

Run:
```bash
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key for LLM |
| `TAVILY_API_KEY` | Tavily for web search signals |
| `RESEND_API_KEY` | Resend for email delivery |
| `RESEND_FROM_EMAIL` | Sender email address |
| `REACT_APP_BACKEND_URL` | Backend URL (frontend env) |