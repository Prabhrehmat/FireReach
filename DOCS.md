# 🔥 FireReach — Agent Documentation

> Autonomous Outreach Engine · Built for Rabbitt AI · Powered by Groq (Llama 3.3) + Tavily + Resend

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Logic Flow](#logic-flow)
3. [Tool Schemas](#tool-schemas)
4. [System Prompt](#system-prompt)
5. [Tech Stack](#tech-stack)
6. [How to Run Locally](#how-to-run-locally)
7. [Environment Variables](#environment-variables)

---

## Project Overview

FireReach is a lightweight autonomous outreach engine that eliminates the manual "stitching" bottleneck faced by SDR and GTM teams. Instead of spending 20+ minutes finding a lead, researching them, and drafting an email — FireReach does it in under 30 seconds.

**The user provides:**
- A target company name
- Their ICP (Ideal Customer Profile)
- A recipient email

**FireReach automatically:**
1. Harvests live buyer signals (funding, hiring, news, leadership changes)
2. Generates an AI-powered Account Brief grounded in those signals
3. Writes a hyper-personalized email referencing the real signals and sends it

---

## Logic Flow

### How the Agent Ensures Outreach is Grounded in Harvested Signals

The agent follows a strict **sequential reasoning pipeline**. No step can be skipped or reordered.

```
User Input (company + ICP + email)
          │
          ▼
┌─────────────────────────┐
│  tool_signal_harvester  │  ← DETERMINISTIC (Tavily API, no LLM guessing)
│  Fetches LIVE data:     │
│  • Funding rounds       │
│  • Hiring trends        │
│  • Recent news          │
│  • Leadership changes   │
└────────────┬────────────┘
             │  Returns: structured signals JSON + raw_summary text
             ▼
┌─────────────────────────┐
│  tool_research_analyst  │  ← AI-POWERED (Groq Llama 3.3-70b)
│  Input: signals +ICP    │
│  Output: 2-paragraph    │
│  Account Brief          │
└────────────┬────────────┘
             │  Returns: account_brief string
             ▼
┌──────────────────────────────────┐
│  tool_outreach_automated_sender  │  ← AI + EXECUTION (Groq + Resend API)
│  Input: signals + brief + ICP    │
│  • LLM writes personalized email │
│  • Resend API sends it           │
└──────────────────────────────────┘
             │
             ▼
      Email Delivered ✅
```

### Zero-Template Policy Enforcement

The email generation prompt explicitly enforces signal-grounding with these rules:

- Subject line **must** reference a specific signal (funding amount, number of hires, etc.)
- First sentence **must** reference a specific live signal — no generic openers allowed
- Email body **must** mention at least 2 specific signals from the harvested data
- Phrases like "I hope this finds you well" are explicitly banned

The LLM receives the actual `raw_summary` of signals as context, making it impossible to write a generic email without referencing the real data.

### Why This is Deterministic at Step 1

`tool_signal_harvester` uses the **Tavily Search API** — a real-time web search API. It performs 4 separate searches:

1. `{company} funding round 2024 2025 raised Series`
2. `{company} hiring jobs engineering 2025 site:linkedin.com OR site:greenhouse.io`
3. `{company} expansion growth product launch 2025`
4. `{company} new CTO CISO VP hire appointed 2025`

The results are structured into a JSON object and passed directly to the next tool. **The LLM never invents or guesses signals** — it only receives and reasons over real search results.

---

## Tool Schemas

### Tool 1: `tool_signal_harvester`

**Type:** Deterministic (API-based, no LLM)  
**Purpose:** Fetch live buyer intent signals for a target company

**Input Schema:**
```json
{
  "name": "tool_signal_harvester",
  "description": "Fetches live signals for a company using real-time web search. Returns structured data on funding, hiring, news, and leadership changes. This tool is deterministic — all data comes from live APIs, not LLM inference.",
  "parameters": {
    "type": "object",
    "properties": {
      "company_name": {
        "type": "string",
        "description": "The name of the target company to research (e.g., 'Scale AI', 'Vercel')"
      }
    },
    "required": ["company_name"]
  }
}
```

**Output Schema:**
```json
{
  "company": "string",
  "funding": [
    {
      "title": "string",
      "snippet": "string (200 chars max)",
      "url": "string"
    }
  ],
  "hiring": [
    {
      "title": "string",
      "snippet": "string",
      "url": "string"
    }
  ],
  "news": [
    {
      "title": "string",
      "snippet": "string",
      "url": "string"
    }
  ],
  "leadership": [
    {
      "title": "string",
      "snippet": "string"
    }
  ],
  "raw_summary": "string (formatted text summary of all signals, passed to downstream tools)"
}
```

**Example Output:**
```json
{
  "company": "Scale AI",
  "funding": [
    {
      "title": "Scale AI raises $1B as valuation doubles to $13.8B",
      "snippet": "The fundraise is a mix of primary and secondary funding...",
      "url": "https://techcrunch.com/..."
    }
  ],
  "hiring": [
    {
      "title": "Director, Applied AI Engineering - Greenhouse",
      "snippet": "Following a record-breaking Q4 2025 — our strongest revenue quarter to date...",
      "url": "https://job-boards.greenhouse.io/scaleai/..."
    }
  ]
}
```

---

### Tool 2: `tool_research_analyst`

**Type:** AI-powered (Groq Llama 3.3-70b)  
**Purpose:** Transform raw signals + ICP into a structured Account Brief

**Input Schema:**
```json
{
  "name": "tool_research_analyst",
  "description": "Takes harvested signals and the seller's ICP, then generates a 2-paragraph Account Brief. Paragraph 1 summarizes what is happening at the company. Paragraph 2 explains why the seller's ICP is a strategic fit right now.",
  "parameters": {
    "type": "object",
    "properties": {
      "signals": {
        "type": "object",
        "description": "The full signals object returned by tool_signal_harvester"
      },
      "icp": {
        "type": "string",
        "description": "The seller's Ideal Customer Profile (e.g., 'We sell high-end cybersecurity training to Series B startups')"
      }
    },
    "required": ["signals", "icp"]
  }
}
```

**Output Schema:**
```json
{
  "account_brief": "string (2 paragraphs of analysis)"
}
```

**Example Output:**
```
Scale AI is currently experiencing significant growth, having announced a record-breaking 
funding round of nearly $129M in December 2025, in addition to a $1B fundraise that doubled 
their valuation. This influx of capital is driving further expansion, evidenced by their 
recent office expansions across four global hubs and over 71,000 open engineering roles.

This rapid growth creates specific cybersecurity pain points. As a Series B-equivalent in 
the AI space, Scale AI faces increased security threats due to their growing profile and 
valuable data assets. With aggressive hiring and expansion, ensuring new employees are 
equipped to handle the latest security threats makes the seller's training a timely and 
strategic offering.
```

---

### Tool 3: `tool_outreach_automated_sender`

**Type:** AI-powered (Groq) + Execution (Resend API)  
**Purpose:** Generate a hyper-personalized email and automatically send it

**Input Schema:**
```json
{
  "name": "tool_outreach_automated_sender",
  "description": "Generates a personalized outreach email that explicitly references the harvested signals, then automatically sends it via the Resend email API. Zero-template policy: every email must reference specific data points from the signals.",
  "parameters": {
    "type": "object",
    "properties": {
      "signals": {
        "type": "object",
        "description": "The full signals object from tool_signal_harvester"
      },
      "account_brief": {
        "type": "string",
        "description": "The 2-paragraph brief from tool_research_analyst"
      },
      "icp": {
        "type": "string",
        "description": "The seller's Ideal Customer Profile"
      },
      "recipient_email": {
        "type": "string",
        "description": "The email address to send the outreach to"
      },
      "sender_name": {
        "type": "string",
        "description": "The sender's display name (default: 'Alex from FireReach')"
      }
    },
    "required": ["signals", "account_brief", "icp", "recipient_email"]
  }
}
```

**Output Schema:**
```json
{
  "status": "sent",
  "email_id": "string (Resend delivery ID)",
  "recipient": "string",
  "subject": "string",
  "body": "string"
}
```

**Example Output:**
```json
{
  "status": "sent",
  "email_id": "0674e2cc-3764-41f2-905a-50d84bc1fc53",
  "recipient": "target@company.com",
  "subject": "$129M Funding Round and 71,000+ Open Jobs - Is Scale AI's Cybersecurity Ready?",
  "body": "With Scale AI's recent $129M funding round and over 71,000 open jobs for engineers, I noticed the company is experiencing rapid growth. This expansion, combined with the $1B fundraise that doubled your valuation, likely creates new cybersecurity challenges. As you scale, ensuring your new employees are equipped to handle the latest security threats is crucial. I'd love to discuss how our high-end cybersecurity training can support Scale AI's growth. Let's schedule a 15-minute call to explore further."
}
```

---

## System Prompt

### Agent Persona

```
You are FireReach, an autonomous B2B outreach agent built for GTM and SDR teams.

Your job is to research target companies using live data signals and execute 
hyper-personalized outreach — without any human intervention.

You are precise, data-driven, and direct. You never make up information. 
Every claim in your outreach must be grounded in real, harvested signals.
```

### Research Analyst Constraint Prompt

```
You are a senior B2B sales analyst. Based on the live signals below and the 
seller's ICP, write a concise 2-paragraph Account Brief.

Paragraph 1: Summarize what's happening at {company} right now 
             (growth signals, hiring, funding, leadership changes).
Paragraph 2: Explain the specific pain points this creates and why the 
             seller's ICP is a strategic fit RIGHT NOW.

Be specific. Reference actual signals. No fluff.
```

### Email Generation Constraint Prompt

```
You are an expert B2B sales copywriter. Write a cold outreach email that 
feels human, warm, and intelligent.

STRICT RULES:
- Subject line must reference a SPECIFIC signal (funding amount, number 
  of hires, product name, etc.)
- First sentence must reference a SPECIFIC live signal — not a generic opener
- Must mention at least 2 specific signals from the data
- Keep it under 150 words (body only)
- End with a soft CTA (15 min call, not "buy now")
- NO generic phrases like "I hope this finds you well" or 
  "I wanted to reach out"
- Sound like a smart human, not a robot

OUTPUT FORMAT (exactly):
SUBJECT: [subject line here]
BODY:
[email body here]
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| LLM | Groq (Llama 3.3-70b-versatile) | Research analysis + email generation |
| Signal Data | Tavily Search API | Live web search for real signals |
| Email Delivery | Resend API | Automated email sending |
| Backend | FastAPI (Python) | REST API + agent orchestration |
| Frontend | React.js | Dashboard UI |
| Deployment | Render (backend) + Vercel (frontend) | Live hosting |

---

## How to Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- API Keys: Groq, Tavily, Resend

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install fastapi uvicorn groq resend tavily-python python-dotenv httpx

# Add your API keys to .env (see below)

uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Open **http://localhost:3000**

---

## Environment Variables

Create `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
```

| Variable | Where to get it | Free tier |
|---|---|---|
| `GROQ_API_KEY` | console.groq.com | ✅ Yes |
| `TAVILY_API_KEY` | app.tavily.com | ✅ Yes |
| `RESEND_API_KEY` | resend.com | ✅ Yes (100 emails/day) |

---

## The Rabbitt Challenge — Live Demo

**Input:**
```
Company: Scale AI
ICP: We sell high-end cybersecurity training to Series B startups.
```

**Signals Captured:**
- 💰 Funding: $129M round (Dec 2025) + $1B raise doubling valuation to $13.8B
- 👥 Hiring: 71,000+ open engineering roles, Director of Applied AI Engineering posting
- 📰 News: Global office expansion across 4 hubs (London HQ), strongest financial year ever ($1B+ new business)
- 👔 Leadership: New VP of Sales appointed to accelerate AI adoption

**Email Sent:**

> **Subject:** $129M Funding Round and 71,000+ Open Jobs - Is Scale AI's Cybersecurity Ready?
>
> With Scale AI's recent $129M funding round and over 71,000 open jobs for engineers, I noticed the company is experiencing rapid growth. This expansion, combined with the $1B fundraise that doubled your valuation, likely creates new cybersecurity challenges. As you scale, ensuring your new employees are equipped to handle the latest security threats is crucial. I'd love to discuss how our high-end cybersecurity training can support Scale AI's growth. Let's schedule a 15-minute call to explore further.

---

*Built with ❤️ for the Rabbitt AI Agentic Developer Challenge*
