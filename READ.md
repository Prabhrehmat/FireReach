# 🔥 FireReach — Autonomous Outreach Engine

> Built for Rabbitt AI · Agentic Developer Challenge

FireReach is a lightweight autonomous outreach engine that eliminates 
the manual "stitching" bottleneck for SDR and GTM teams.

## How it works
Signal Harvest → AI Research → Auto Send

## Tech Stack
- **LLM:** Groq (Llama 3.3-70b)
- **Signals:** Tavily Search API
- **Email:** Resend API
- **Backend:** FastAPI (Python)
- **Frontend:** React.js

## Live Demo
🔗 [Live URL here]

## Setup
See [DOCS.md](./DOCS.md) for full documentation.

## The 3 Tools
1. `tool_signal_harvester` — fetches live funding, hiring, news signals
2. `tool_research_analyst` — generates Account Brief from signals + ICP
3. `tool_outreach_automated_sender` — writes & sends personalized email