"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Send } from "lucide-react";
import { C } from "@/lib/theme";

export default function SettingsPage() {
  const [status, setStatus] = useState(null);
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setStatus);
  }, []);

  const sendTest = async () => {
    if (!phone) return;
    setBusy(true);
    setResult("");
    try {
      const res = await fetch("/api/settings/test-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      setResult(data.message || data.error);
    } catch (e) {
      setResult("Something went wrong sending the test text.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: C.bg, color: C.ink, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ borderBottom: `1px solid ${C.line}`, padding: "20px 24px" }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Settings</div>
        <div style={{ color: C.inkSoft, fontSize: 13 }}>Connection status and business info</div>
      </div>

      <div style={{ padding: "24px", maxWidth: 560, display: "flex", flexDirection: "column", gap: 20 }}>
        <Card title="Business name">
          <div style={{ fontSize: 15 }}>{status?.bizName || "Loading…"}</div>
          <div style={{ color: C.inkSoft, fontSize: 13, marginTop: 6 }}>
            To change this, edit the <code>BUSINESS_NAME</code> environment variable in Vercel (Settings → Environment Variables), then redeploy.
          </div>
        </Card>

        <Card title="Database">
          <StatusRow ok={status?.databaseConfigured} okLabel="Connected" badLabel="Not connected" />
          {!status?.databaseConfigured && (
            <div style={{ color: C.inkSoft, fontSize: 13, marginTop: 6 }}>
              Go to Vercel → Storage → Create Database to connect one. Without this, client data can't be saved.
            </div>
          )}
        </Card>

        <Card title="Twilio (text messaging)">
          <StatusRow ok={status?.twilioConfigured} okLabel={`Connected — sending from ${status?.twilioPhoneNumber || ""}`} badLabel="Not connected — texts will be logged, not sent" />
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 6 }}>Send yourself a test text to confirm it's working:</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+14155551234"
                style={{ flex: 1, border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 10px", fontSize: 14, boxSizing: "border-box" }}
              />
              <button
                disabled={busy}
                onClick={sendTest}
                style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", fontSize: 14, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
              >
                <Send size={14} /> {busy ? "Sending…" : "Send test"}
              </button>
            </div>
            {result && <div style={{ marginTop: 10, fontSize: 13, color: C.inkSoft }}>{result}</div>}
          </div>
        </Card>

        <Card title="Automated daily job">
          <div style={{ fontSize: 14 }}>
            Runs automatically once a day to send tomorrow's reminders and check-in texts for overdue clients. No action needed as long as <code>CRON_SECRET</code> is set in Vercel.
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 18, background: "#fff" }}>
      <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>{title}</div>
      {children}
    </div>
  );
}

function StatusRow({ ok, okLabel, badLabel }) {
  if (ok === undefined || ok === null) return <div style={{ color: C.inkSoft, fontSize: 14 }}>Checking…</div>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: ok ? C.primary : C.danger }}>
      {ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      {ok ? okLabel : badLabel}
    </div>
  );
}
