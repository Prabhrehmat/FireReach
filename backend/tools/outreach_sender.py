import os
import resend
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def tool_outreach_automated_sender(
    signals: dict,
    account_brief: str,
    icp: str,
    recipient_email: str,
    sender_name: str = "Alex from FireReach"
) -> dict:
    """
    AI tool - generates a hyper-personalized email using signals + brief, then sends it.
    Zero-template policy: email must reference actual captured signals.
    """
    groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    # Step 1: Generate the personalized email
    email_prompt = f"""You are an expert B2B sales copywriter. Write a cold outreach email that feels human, warm, and intelligent.

STRICT RULES:
- Subject line must reference a SPECIFIC signal (funding amount, number of hires, product name, etc.)
- First sentence must reference a SPECIFIC live signal — not a generic opener
- Must mention at least 2 specific signals from the data
- Keep it under 150 words (body only)
- End with a soft CTA (15 min call, not "buy now")
- NO generic phrases like "I hope this finds you well" or "I wanted to reach out"
- Sound like a smart human, not a robot

SELLER ICP: {icp}
COMPANY: {signals['company']}

ACCOUNT BRIEF:
{account_brief}

LIVE SIGNALS:
{signals['raw_summary']}

OUTPUT FORMAT (exactly):
SUBJECT: [subject line here]
BODY:
[email body here]"""

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": email_prompt}],
        temperature=0.6,
        max_tokens=500
    )

    raw_output = response.choices[0].message.content.strip()

    # Parse subject and body
    subject = ""
    body = ""
    if "SUBJECT:" in raw_output and "BODY:" in raw_output:
        parts = raw_output.split("BODY:")
        subject = parts[0].replace("SUBJECT:", "").strip()
        body = parts[1].strip()
    else:
        lines = raw_output.split("\n")
        subject = lines[0].replace("Subject:", "").strip()
        body = "\n".join(lines[1:]).strip()

    # Step 2: Send via Resend
    resend.api_key = os.getenv("RESEND_API_KEY")

    send_result = resend.Emails.send({
        "from": f"{sender_name} <{os.getenv('RESEND_FROM_EMAIL')}>",
        "to": [recipient_email],
        "subject": subject,
        "html": f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <p style="color: #333; line-height: 1.6;">{body.replace(chr(10), '<br>')}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Sent via FireReach · Autonomous Outreach Engine</p>
        </div>
        """,
        "text": body
    })

    return {
        "status": "sent",
        "email_id": send_result.get("id"),
        "recipient": recipient_email,
        "subject": subject,
        "body": body
    }