import os
from tavily import TavilyClient
from dotenv import load_dotenv

load_dotenv()

def tool_signal_harvester(company_name: str) -> dict:
    """
    Deterministic tool - fetches LIVE signals for a company using Tavily search.
    No LLM guessing - only real data from web search.
    """
    client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

    signals = {
        "company": company_name,
        "funding": [],
        "hiring": [],
        "news": [],
        "leadership": [],
        "raw_summary": ""
    }

    # 1. Funding signals
    funding_results = client.search(
        query=f"{company_name} funding round 2024 2025 raised Series",
        search_depth="advanced",
        max_results=3
    )
    for r in funding_results.get("results", []):
        signals["funding"].append({
            "title": r.get("title"),
            "snippet": r.get("content", "")[:200],
            "url": r.get("url")
        })

    # 2. Hiring signals
    hiring_results = client.search(
        query=f"{company_name} hiring jobs engineering 2025 site:linkedin.com OR site:greenhouse.io OR site:lever.co",
        search_depth="advanced",
        max_results=3
    )
    for r in hiring_results.get("results", []):
        signals["hiring"].append({
            "title": r.get("title"),
            "snippet": r.get("content", "")[:200],
            "url": r.get("url")
        })

    # 3. Recent news / growth signals
    news_results = client.search(
        query=f"{company_name} expansion growth product launch 2025",
        search_depth="advanced",
        max_results=3
    )
    for r in news_results.get("results", []):
        signals["news"].append({
            "title": r.get("title"),
            "snippet": r.get("content", "")[:200],
            "url": r.get("url")
        })

    # 4. Leadership changes
    leadership_results = client.search(
        query=f"{company_name} new CTO CISO VP hire appointed 2025",
        search_depth="basic",
        max_results=2
    )
    for r in leadership_results.get("results", []):
        signals["leadership"].append({
            "title": r.get("title"),
            "snippet": r.get("content", "")[:200],
        })

    # Build a raw text summary for the LLM
    signals["raw_summary"] = f"""
COMPANY: {company_name}

FUNDING SIGNALS:
{chr(10).join([f"- {f['title']}: {f['snippet']}" for f in signals['funding']]) or 'No recent funding found'}

HIRING SIGNALS:
{chr(10).join([f"- {h['title']}: {h['snippet']}" for h in signals['hiring']]) or 'No hiring signals found'}

RECENT NEWS:
{chr(10).join([f"- {n['title']}: {n['snippet']}" for n in signals['news']]) or 'No recent news found'}

LEADERSHIP CHANGES:
{chr(10).join([f"- {l['title']}: {l['snippet']}" for l in signals['leadership']]) or 'No leadership changes found'}
    """.strip()

    return signals