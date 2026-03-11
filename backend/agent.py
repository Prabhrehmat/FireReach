from tools import (
    tool_signal_harvester,
    tool_research_analyst,
    tool_outreach_automated_sender
)

def run_firereach_agent(
    company_name: str,
    icp: str,
    recipient_email: str
) -> dict:
    """
    Orchestrates the full agentic loop:
    Signal Capture → Contextual Research → Automated Delivery
    """

    log = []

    # ── STEP 1: Signal Harvester ──────────────────────────────
    log.append({
        "step": 1,
        "tool": "tool_signal_harvester",
        "status": "running",
        "message": f"Fetching live signals for {company_name}..."
    })

    signals = tool_signal_harvester(company_name)

    log.append({
        "step": 1,
        "tool": "tool_signal_harvester",
        "status": "complete",
        "message": f"Captured {len(signals['funding'])} funding, {len(signals['hiring'])} hiring, {len(signals['news'])} news signals.",
        "data": signals
    })

    # ── STEP 2: Research Analyst ──────────────────────────────
    log.append({
        "step": 2,
        "tool": "tool_research_analyst",
        "status": "running",
        "message": "Generating Account Brief from signals + ICP..."
    })

    account_brief = tool_research_analyst(signals, icp)

    log.append({
        "step": 2,
        "tool": "tool_research_analyst",
        "status": "complete",
        "message": "Account Brief generated.",
        "data": account_brief
    })

    # ── STEP 3: Outreach Sender ───────────────────────────────
    log.append({
        "step": 3,
        "tool": "tool_outreach_automated_sender",
        "status": "running",
        "message": f"Writing personalized email and sending to {recipient_email}..."
    })

    send_result = tool_outreach_automated_sender(
        signals=signals,
        account_brief=account_brief,
        icp=icp,
        recipient_email=recipient_email
    )

    log.append({
        "step": 3,
        "tool": "tool_outreach_automated_sender",
        "status": "complete",
        "message": f"Email sent! ID: {send_result.get('email_id')}",
        "data": send_result
    })

    return {
        "success": True,
        "company": company_name,
        "recipient": recipient_email,
        "agent_log": log,
        "final_email": {
            "subject": send_result["subject"],
            "body": send_result["body"]
        },
        "account_brief": account_brief,
        "signals": signals
    }