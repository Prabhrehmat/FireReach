import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def tool_research_analyst(signals: dict, icp: str) -> str:
    """
    AI tool - takes harvested signals + ICP and generates a 2-paragraph Account Brief.
    """
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    prompt = f"""You are a senior B2B sales analyst. Based on the live signals below and the seller's ICP, 
write a concise 2-paragraph Account Brief.

Paragraph 1: Summarize what's happening at {signals['company']} right now (growth signals, hiring, funding, leadership changes).
Paragraph 2: Explain the specific pain points this creates and why the seller's ICP is a strategic fit RIGHT NOW.

Be specific. Reference actual signals. No fluff.

---
SELLER'S ICP:
{icp}

---
LIVE SIGNALS FOR {signals['company']}:
{signals['raw_summary']}
---

Write only the 2-paragraph Account Brief. No headers, no bullet points."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=400
    )

    return response.choices[0].message.content.strip()