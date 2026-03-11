import { useState } from "react";
import axios from "axios";

const STEP_LABELS = {
  tool_signal_harvester: "Signal Harvester",
  tool_research_analyst: "Research Analyst",
  tool_outreach_automated_sender: "Outreach Sender",
};

const STEP_ICONS = {
  tool_signal_harvester: "🔍",
  tool_research_analyst: "🧠",
  tool_outreach_automated_sender: "📤",
};

const STEP_DESC = {
  tool_signal_harvester: "Fetching live funding, hiring & news signals...",
  tool_research_analyst: "Analyzing signals and generating Account Brief...",
  tool_outreach_automated_sender: "Writing personalized email and sending...",
};

export default function App() {
  const [form, setForm] = useState({
    company_name: "",
    icp: "We sell high-end cybersecurity training to Series B startups.",
    recipient_email: "",
  });
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    setError("");
    setActiveStep(1);

    const stepTimer1 = setTimeout(() => setActiveStep(2), 6000);
    const stepTimer2 = setTimeout(() => setActiveStep(3), 13000);

    try {
      const res = await axios.post("http://localhost:8000/run-agent", form);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setActiveStep(0);
      setResult(res.data);
    } catch (e) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setActiveStep(0);
      setError(e.response?.data?.detail || "Something went wrong. Check your backend is running.");
    }
    setLoading(false);
  };

  const isValid = form.company_name.trim() && form.recipient_email.trim() && form.icp.trim();

  return (
    <div style={styles.page}>
      <div style={styles.gridBg} />

      {/* Header - NO BETA badge */}
      <div style={styles.header}>
        <div style={styles.logoRow}>
          <span style={styles.flame}>🔥</span>
          <h1 style={styles.logo}>FireReach</h1>
        </div>
        <p style={styles.tagline}>
          Autonomous Outreach Engine &nbsp;·&nbsp;
          <span style={styles.tagSteps}>Signal</span> →{" "}
          <span style={styles.tagSteps}>Research</span> →{" "}
          <span style={styles.tagSteps}>Send</span>
        </p>
      </div>

      {/* Pipeline */}
      <div style={styles.pipeline}>
        {[
          { icon: "🔍", label: "Signal Harvest", step: 1 },
          { icon: "🧠", label: "AI Research", step: 2 },
          { icon: "📤", label: "Auto Send", step: 3 },
        ].map((s, i) => (
          <div key={i} style={styles.pipelineItem}>
            <div
              style={{
                ...styles.pipelineCircle,
                background: activeStep === s.step ? "#ff4d00" : result ? "#1a3a1a" : "#1a1a1a",
                border: `2px solid ${activeStep === s.step ? "#ff4d00" : result ? "#2d5a2d" : "#2a2a2a"}`,
                boxShadow: activeStep === s.step ? "0 0 20px rgba(255,77,0,0.5)" : "none",
                animation: activeStep === s.step ? "pulse 1.5s infinite" : "none",
              }}
            >
              <span style={{ fontSize: "clamp(14px,3vw,20px)" }}>{result ? "✅" : s.icon}</span>
            </div>
            <span
              style={{
                ...styles.pipelineLabel,
                color: activeStep === s.step ? "#ff4d00" : result ? "#4caf50" : "#555",
              }}
            >
              {s.label}
            </span>
            {i < 2 && (
              <div style={{ ...styles.pipelineArrow, color: activeStep > s.step || result ? "#ff4d00" : "#333" }}>
                ──▶
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>⚙ Campaign Setup</h2>

        <label style={styles.label}>Target Company</label>
        <input
          value={form.company_name}
          onChange={(e) => setForm({ ...form, company_name: e.target.value })}
          placeholder="e.g. Stripe, Notion, Vercel, Scale AI"
          style={styles.input}
          disabled={loading}
        />

        <label style={{ ...styles.label, marginTop: 18 }}>
          Your ICP{" "}
          <span style={{ color: "#555", fontWeight: 400, textTransform: "none" }}>
            (Ideal Customer Profile)
          </span>
        </label>
        <textarea
          value={form.icp}
          onChange={(e) => setForm({ ...form, icp: e.target.value })}
          rows={3}
          style={{ ...styles.input, resize: "vertical", lineHeight: 1.6 }}
          disabled={loading}
        />

        <label style={{ ...styles.label, marginTop: 18 }}>Recipient Email</label>
        <input
          value={form.recipient_email}
          onChange={(e) => setForm({ ...form, recipient_email: e.target.value })}
          placeholder="target@company.com"
          type="email"
          style={styles.input}
          disabled={loading}
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !isValid}
          style={{
            ...styles.button,
            background: loading
              ? "#1a1a1a"
              : !isValid
              ? "#1a1a1a"
              : "linear-gradient(135deg, #ff4d00, #ff7733)",
            cursor: loading || !isValid ? "not-allowed" : "pointer",
            border: loading || !isValid ? "1px solid #333" : "none",
            color: !isValid && !loading ? "#444" : "#fff",
          }}
        >
          {loading ? (
            <span>
              <span style={styles.spinner}>⟳</span>{" "}
              {activeStep === 1
                ? "Harvesting signals..."
                : activeStep === 2
                ? "Generating brief..."
                : activeStep === 3
                ? "Sending email..."
                : "Agent Running..."}
            </span>
          ) : (
            "🚀 Launch FireReach Agent"
          )}
        </button>

        {loading && activeStep > 0 && (
          <div style={styles.liveStep}>
            <span style={styles.liveDot} />
            <span style={{ color: "#ff4d00", fontWeight: 600, fontSize: "clamp(11px,2vw,13px)" }}>
              {STEP_ICONS[Object.keys(STEP_ICONS)[activeStep - 1]]}{" "}
              {STEP_LABELS[Object.keys(STEP_LABELS)[activeStep - 1]]}
            </span>
            <span style={{ color: "#555", fontSize: "clamp(10px,1.8vw,12px)" }}>
              — {STEP_DESC[Object.keys(STEP_DESC)[activeStep - 1]]}
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          {/* Agent Log */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>⚙ Agent Log</h2>
            {result.agent_log
              .filter((l) => l.status === "complete")
              .map((log, i) => (
                <div key={i} style={styles.logRow}>
                  <div style={styles.logNum}>{log.step}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.logTool}>
                      {STEP_ICONS[log.tool]} {STEP_LABELS[log.tool]}
                    </div>
                    <div style={styles.logMsg}>{log.message}</div>
                  </div>
                  <div style={styles.logCheck}>✅</div>
                </div>
              ))}
          </div>

          {/* Signals */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📡 Live Signals Captured</h2>
            <div style={styles.signalGrid}>
              {[
                { n: result.signals.funding.length, l: "Funding" },
                { n: result.signals.hiring.length, l: "Hiring" },
                { n: result.signals.news.length, l: "News" },
                { n: result.signals.leadership.length, l: "Leadership" },
              ].map((s, i) => (
                <div key={i} style={styles.signalBox}>
                  <div style={styles.signalNum}>{s.n}</div>
                  <div style={styles.signalLbl}>{s.l}</div>
                </div>
              ))}
            </div>
            {[
              { tag: "💰 Funding", data: result.signals.funding[0] },
              { tag: "👥 Hiring", data: result.signals.hiring[0] },
              { tag: "📰 News", data: result.signals.news[0] },
            ]
              .filter((s) => s.data)
              .map((s, i) => (
                <div key={i} style={styles.signalItem}>
                  <span style={styles.signalTag}>{s.tag}</span>
                  <span style={styles.signalText}>{s.data.title}</span>
                </div>
              ))}
          </div>

          {/* Account Brief */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📋 Account Brief</h2>
            <p style={styles.briefText}>{result.account_brief}</p>
          </div>

          {/* Email Sent */}
          <div style={{ ...styles.card, border: "1px solid #ff4d00" }}>
            <h2 style={styles.cardTitle}>📧 Email Sent</h2>
            <div style={styles.emailBox}>
              <div style={styles.emailMeta}>
                <span style={styles.emailMetaLabel}>TO</span>
                <span style={styles.emailMetaVal}>{result.recipient}</span>
              </div>
              <div style={{ ...styles.emailMeta, marginTop: 10 }}>
                <span style={styles.emailMetaLabel}>SUBJECT</span>
                <span style={{ ...styles.emailMetaVal, color: "#ff4d00", fontWeight: 700 }}>
                  {result.final_email.subject}
                </span>
              </div>
              <hr style={{ border: "none", borderTop: "1px solid #1e1e1e", margin: "16px 0" }} />
              <div style={styles.emailBody}>{result.final_email.body}</div>
            </div>
            <div style={styles.sentBadge}>
              ✅ Delivered to <strong style={{ marginLeft: 4 }}>{result.recipient}</strong>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:0.85} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        input:focus, textarea:focus { border-color: #ff4d00 !important; outline: none; }
        input::placeholder, textarea::placeholder { color: #333; }
        * { box-sizing: border-box; }
        body { margin: 0; background: #080808; }
        @media (max-width: 420px) {
          .pipeline-label { display: none; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'Courier New', monospace",
    maxWidth: 820,
    margin: "0 auto",
    padding: "clamp(20px,5vw,40px) clamp(14px,4vw,24px) 80px",
    background: "#080808",
    minHeight: "100vh",
    color: "#f0f0f0",
    position: "relative",
  },
  gridBg: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage:
      "linear-gradient(rgba(255,77,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,77,0,0.03) 1px,transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: { marginBottom: 24, position: "relative", zIndex: 1 },
  logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6 },
  flame: { fontSize: "clamp(24px,5vw,36px)" },
  logo: {
    fontSize: "clamp(24px,6vw,38px)",
    fontWeight: 900,
    color: "#ff4d00",
    margin: 0,
    letterSpacing: "-1px",
    fontFamily: "'Courier New', monospace",
  },
  tagline: { color: "#555", fontSize: "clamp(11px,2vw,13px)", margin: 0, letterSpacing: 0.5 },
  tagSteps: { color: "#ff4d00", fontWeight: 700 },
  pipeline: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 20,
    position: "relative",
    zIndex: 1,
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: 12,
    padding: "16px clamp(10px,3vw,24px)",
  },
  pipelineItem: { display: "flex", alignItems: "center", gap: 6 },
  pipelineCircle: {
    width: "clamp(34px,6vw,46px)",
    height: "clamp(34px,6vw,46px)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    flexShrink: 0,
  },
  pipelineLabel: {
    fontSize: "clamp(10px,1.8vw,12px)",
    fontWeight: 600,
    letterSpacing: 0.5,
    transition: "color 0.3s",
    whiteSpace: "nowrap",
  },
  pipelineArrow: {
    fontSize: "clamp(10px,2vw,13px)",
    margin: "0 clamp(4px,1.5vw,10px)",
    transition: "color 0.3s",
  },
  card: {
    background: "#111",
    borderRadius: 12,
    padding: "clamp(16px,4vw,28px)",
    marginBottom: 16,
    border: "1px solid #1e1e1e",
    position: "relative",
    zIndex: 1,
  },
  cardTitle: {
    color: "#fff",
    fontSize: "clamp(13px,2.5vw,15px)",
    fontWeight: 700,
    marginTop: 0,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  label: {
    display: "block",
    color: "#666",
    fontSize: "clamp(9px,1.5vw,11px)",
    marginBottom: 6,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: "clamp(9px,2vw,11px) 14px",
    background: "#0a0a0a",
    border: "1px solid #222",
    borderRadius: 8,
    color: "#fff",
    fontSize: "clamp(13px,2vw,14px)",
    fontFamily: "'Courier New', monospace",
    transition: "border-color 0.2s",
  },
  button: {
    marginTop: 20,
    width: "100%",
    padding: "clamp(12px,3vw,15px)",
    borderRadius: 8,
    fontSize: "clamp(13px,2.5vw,15px)",
    fontWeight: 700,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 0.5,
    transition: "all 0.2s",
  },
  spinner: { display: "inline-block", animation: "spin 1s linear infinite", marginRight: 6 },
  liveStep: {
    marginTop: 12,
    display: "flex",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 6,
    padding: "10px 14px",
    background: "#0a0a0a",
    borderRadius: 8,
    border: "1px solid #1e1e1e",
  },
  liveDot: {
    width: 8, height: 8,
    borderRadius: "50%",
    background: "#ff4d00",
    animation: "pulse 1s infinite",
    flexShrink: 0,
    marginTop: 4,
  },
  errorBox: {
    background: "#1a0808",
    border: "1px solid #ff4d00",
    borderRadius: 8,
    padding: "14px 18px",
    color: "#ff6b6b",
    marginBottom: 16,
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    fontSize: "clamp(12px,2vw,14px)",
    position: "relative",
    zIndex: 1,
  },
  logRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
    padding: "12px 14px",
    background: "#0a0a0a",
    borderRadius: 8,
  },
  logNum: {
    background: "#ff4d00",
    color: "#fff",
    borderRadius: "50%",
    width: 26, height: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  logTool: { color: "#ff4d00", fontSize: "clamp(12px,2vw,13px)", fontWeight: 700, marginBottom: 2 },
  logMsg: { color: "#666", fontSize: "clamp(11px,1.8vw,12px)" },
  logCheck: { marginLeft: "auto", fontSize: 16 },
  signalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
    gap: 10,
    marginBottom: 16,
  },
  signalBox: {
    background: "#0a0a0a",
    border: "1px solid #1e1e1e",
    borderRadius: 8,
    padding: "clamp(10px,2vw,14px) 8px",
    textAlign: "center",
  },
  signalNum: { fontSize: "clamp(20px,4vw,28px)", fontWeight: 900, color: "#ff4d00", lineHeight: 1 },
  signalLbl: { fontSize: "clamp(9px,1.5vw,11px)", color: "#555", marginTop: 4, fontWeight: 600 },
  signalItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "10px 0",
    borderTop: "1px solid #1a1a1a",
    flexWrap: "wrap",
  },
  signalTag: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    color: "#777",
    fontSize: 11,
    padding: "3px 8px",
    borderRadius: 4,
    flexShrink: 0,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  signalText: { color: "#bbb", fontSize: "clamp(12px,1.8vw,13px)", lineHeight: 1.4 },
  briefText: {
    color: "#bbb",
    lineHeight: 1.8,
    fontSize: "clamp(13px,2vw,14px)",
    margin: 0,
    padding: 16,
    background: "#0a0a0a",
    borderRadius: 8,
    borderLeft: "3px solid #ff4d00",
  },
  emailBox: { background: "#0a0a0a", borderRadius: 8, padding: "clamp(14px,3vw,20px)" },
  emailMeta: { display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" },
  emailMetaLabel: { color: "#444", fontSize: 11, fontWeight: 700, letterSpacing: 1, minWidth: 55, paddingTop: 2 },
  emailMetaVal: { color: "#ccc", fontSize: "clamp(13px,2vw,14px)", flex: 1, wordBreak: "break-word" },
  emailBody: {
    color: "#ddd",
    lineHeight: 1.9,
    fontSize: "clamp(13px,2vw,14px)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  sentBadge: {
    marginTop: 14,
    color: "#4caf50",
    fontSize: "clamp(12px,1.8vw,13px)",
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
};
