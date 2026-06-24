"use client";
import { useState } from "react";
import { Plus, Check, X, MessageCircle, Clock, ArrowRight, History, FileText, RotateCcw, CalendarClock, Trash2 } from "lucide-react";
import { C } from "@/lib/theme";

function daysSince(date) {
  return Math.round((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}
function lastVisit(c) {
  return c.history && c.history.length ? c.history[c.history.length - 1] : null;
}
function isOverdue(c) {
  const last = lastVisit(c);
  if (!last) return false;
  return daysSince(last.date) > c.cadenceDays * 1.3;
}
const apptStatusMeta = {
  upcoming: { label: "Upcoming", color: C.inkSoft, bg: "#EFEDE7" },
  "reminder-sent": { label: "Reminder sent", color: C.primary, bg: C.primaryLight },
  confirmed: { label: "Confirmed", color: C.primary, bg: C.primaryLight },
  "no-show": { label: "No-show — recovery sent", color: C.warn, bg: C.warnLight },
  rebooked: { label: "Rebooked", color: C.primary, bg: C.primaryLight },
};

export default function Dashboard({ initialClients, bizName }) {
  const [clients, setClients] = useState(initialClients);
  const [tab, setTab] = useState("upcoming");
  const [selectedId, setSelectedId] = useState(initialClients.find((c) => c.appointment)?.id || initialClients[0]?.id || null);
  const [showForm, setShowForm] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "", cadenceDays: "14", autoTexts: true, sendConfirmation: true });

  const selected = clients.find((c) => c.id === selectedId) || null;
  const replaceClient = (updated) => setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  const removeClient = (id) => setClients((prev) => prev.filter((c) => c.id !== id));

  const call = async (url, opts) => {
    setBusy(true);
    setErrorMsg("");
    try {
      const res = await fetch(url, opts);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      return data;
    } catch (e) {
      setErrorMsg(e.message);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const send = async (id, type) => {
    const updated = await call(`/api/clients/${id}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    if (updated) replaceClient(updated);
  };

  const toggleAutoTexts = async (id, value) => {
    const updated = await call(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autoTexts: value }),
    });
    if (updated) replaceClient(updated);
  };

  const addNote = async (id) => {
    if (!noteText.trim()) return;
    const updated = await call(`/api/clients/${id}/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: noteText.trim() }),
    });
    if (updated) {
      replaceClient(updated);
      setNoteText("");
    }
  };

  const deleteAppointment = async (id) => {
    const updated = await call(`/api/clients/${id}`, { method: "DELETE" });
    if (updated) {
      removeClient(id);
      if (selectedId === id) setSelectedId(null);
    }
  };

  const addAppointment = async () => {
    if (!form.name || !form.phone || !form.date || !form.time) {
      setErrorMsg("Name, phone, date, and time are required.");
      return;
    }
    const newClient = await call("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (newClient) {
      setClients((prev) => [newClient, ...prev]);
      setSelectedId(newClient.id);
      setTab("upcoming");
      setForm({ name: "", phone: "", date: "", time: "", cadenceDays: "14", autoTexts: true, sendConfirmation: true });
      setShowForm(false);
    }
  };

  const upcomingClients = clients.filter((c) => c.appointment);
  const lapsedClients = [...clients.filter((c) => !c.appointment)].sort(
    (a, b) => (lastVisit(b) ? daysSince(lastVisit(b).date) : 0) - (lastVisit(a) ? daysSince(lastVisit(a).date) : 0)
  );
  const list = tab === "upcoming" ? upcomingClients : lapsedClients;

  return (
    <div style={{ background: C.bg, color: C.ink, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ borderBottom: `1px solid ${C.line}`, padding: "20px 24px" }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Dashboard</div>
        <div style={{ color: C.inkSoft, fontSize: 13 }}>Reminders, win-backs, and client history</div>
      </div>

      {errorMsg && (
        <div style={{ margin: "12px 24px", background: C.dangerLight, color: C.danger, padding: "8px 14px", borderRadius: 8, fontSize: 14 }}>
          {errorMsg}
        </div>
      )}

      <div style={{ padding: "16px 24px 4px", display: "flex", gap: 8 }}>
        <button
          onClick={() => { setTab("upcoming"); setSelectedId(upcomingClients[0]?.id || null); }}
          style={{ background: tab === "upcoming" ? C.primary : "transparent", color: tab === "upcoming" ? "#fff" : C.inkSoft, border: `1px solid ${tab === "upcoming" ? C.primary : C.line}`, borderRadius: 6, padding: "8px 16px", fontSize: 14, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
        >
          <CalendarClock size={14} /> Upcoming ({upcomingClients.length})
        </button>
        <button
          onClick={() => { setTab("reengage"); setSelectedId(lapsedClients[0]?.id || null); }}
          style={{ background: tab === "reengage" ? C.warn : "transparent", color: tab === "reengage" ? "#fff" : C.inkSoft, border: `1px solid ${tab === "reengage" ? C.warn : C.line}`, borderRadius: 6, padding: "8px 16px", fontSize: 14, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
        >
          <RotateCcw size={14} /> Re-engagement ({lapsedClients.filter(isOverdue).length} overdue)
        </button>
      </div>

      <div style={{ padding: "16px 24px 40px", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 24 }} className="loop-grid">
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 17, fontWeight: 600 }}>{tab === "upcoming" ? "Booked appointments" : "Clients who've gone quiet"}</div>
            {tab === "upcoming" && (
              <button onClick={() => setShowForm((s) => !s)} style={{ border: `1px solid ${C.primary}`, color: C.primary, background: "transparent", borderRadius: 6, padding: "6px 12px", fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <Plus size={14} /> Add appointment
              </button>
            )}
          </div>

          {showForm && tab === "upcoming" && (
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: 16, marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input placeholder="Client name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              <input placeholder="Phone, e.g. +14155550182" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputStyle} />
              <input placeholder="Time, e.g. 3:30 PM" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} style={inputStyle} />
              <input placeholder="Usual days between visits" value={form.cadenceDays} onChange={(e) => setForm({ ...form, cadenceDays: e.target.value })} style={{ ...inputStyle, gridColumn: "span 2" }} />
              <label style={{ ...checkboxLabel }}><input type="checkbox" checked={form.autoTexts} onChange={(e) => setForm({ ...form, autoTexts: e.target.checked })} /> Automated texts on</label>
              <label style={{ ...checkboxLabel }}><input type="checkbox" checked={form.sendConfirmation} onChange={(e) => setForm({ ...form, sendConfirmation: e.target.checked })} /> Send confirmation text now</label>
              <button disabled={busy} onClick={addAppointment} style={{ gridColumn: "span 2", background: C.primary, color: "#fff", border: "none", borderRadius: 6, padding: "10px", fontSize: 14, cursor: "pointer" }}>
                {busy ? "Saving…" : "Save appointment"}
              </button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {list.length === 0 && <div style={{ color: C.inkSoft, border: `1px dashed ${C.line}`, borderRadius: 8, padding: 24, textAlign: "center", fontSize: 14 }}>Nothing here right now.</div>}
            {list.map((c) => {
              const last = lastVisit(c);
              const since = last ? daysSince(last.date) : null;
              const overdue = tab === "reengage" && isOverdue(c);
              const isSelected = c.id === selectedId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  style={{ border: `1px solid ${isSelected ? C.primary : C.line}`, background: "#fff", borderRadius: 8, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, cursor: "pointer" }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{c.name}</div>
                    {tab === "upcoming" ? (
                      <div style={{ color: C.inkSoft, fontSize: 12, display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <Clock size={12} /> {new Date(c.appointment.date).toLocaleDateString()} at {c.appointment.time} · {c.phone}
                      </div>
                    ) : (
                      <div style={{ color: C.inkSoft, fontSize: 12, display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <History size={12} /> {since != null ? `Last visit ${since}d ago` : "No visits yet"} · usually every {c.cadenceDays}d
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {tab === "upcoming" ? (
                      <span style={{ color: apptStatusMeta[c.appointment.status].color, background: apptStatusMeta[c.appointment.status].bg, fontSize: 12, padding: "4px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>
                        {apptStatusMeta[c.appointment.status].label}
                      </span>
                    ) : (
                      <span style={{ color: c.reengageStatus === "rebooked" ? C.primary : overdue ? C.danger : C.inkSoft, background: c.reengageStatus === "rebooked" ? C.primaryLight : overdue ? C.dangerLight : "#EFEDE7", fontSize: 12, padding: "4px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>
                        {c.reengageStatus === "rebooked" ? "Rebooked" : c.reengageStatus === "sent" ? "Check-in sent" : overdue ? "Overdue" : "On track"}
                      </span>
                    )}
                    <span onClick={(e) => { e.stopPropagation(); deleteAppointment(c.id); }} style={{ color: C.inkSoft, cursor: "pointer", padding: 4 }} aria-label={`Delete ${c.name}`}>
                      <Trash2 size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          {!selected ? (
            <div style={{ color: C.inkSoft, border: `1px dashed ${C.line}`, borderRadius: 8, padding: 40, textAlign: "center", fontSize: 14 }}>Nothing selected.</div>
          ) : (
            <>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>Message thread with {selected.name.split(" ")[0]}</div>

              <div style={{ border: `8px solid ${C.ink}`, borderRadius: 28, background: "#fff", maxWidth: 320, margin: "0 auto", overflow: "hidden" }}>
                <div style={{ background: "#F1F1EF", padding: "8px 16px", textAlign: "center", fontSize: 12 }}>{bizName}</div>
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8, minHeight: 200 }}>
                  {selected.messages.length === 0 && <div style={{ color: C.inkSoft, textAlign: "center", marginTop: 50, fontSize: 14 }}>No messages yet.</div>}
                  {selected.messages.map((m) => (
                    <div key={m.id} style={{ alignSelf: m.from === "business" ? "flex-end" : "flex-start", background: m.from === "business" ? C.primary : "#EFEDE7", color: m.from === "business" ? "#fff" : C.ink, borderRadius: 16, padding: "8px 12px", fontSize: 14, maxWidth: "85%" }}>
                      {m.text}
                    </div>
                  ))}
                </div>
              </div>

              {tab === "upcoming" && (
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8, maxWidth: 320, margin: "20px auto 0" }}>
                  {!selected.autoTexts && selected.appointment.status === "upcoming" && (
                    <div style={{ color: C.inkSoft, background: "#EFEDE7", fontSize: 12, borderRadius: 6, padding: "8px 12px", textAlign: "center" }}>Automated texts are off for this client.</div>
                  )}
                  {selected.appointment.status === "upcoming" && (
                    <button disabled={busy} onClick={() => send(selected.id, "reminder")} style={primaryBtn}>
                      <MessageCircle size={14} /> Send reminder text
                    </button>
                  )}
                  {selected.appointment.status === "reminder-sent" && (
                    <button disabled={busy} onClick={() => send(selected.id, "no-show")} style={{ ...outlineBtn(C.danger) }}>
                      <X size={14} /> Mark as no-show
                    </button>
                  )}
                  {selected.appointment.status === "no-show" && (
                    <div style={{ color: C.inkSoft, fontSize: 13, textAlign: "center" }}>Recovery text sent. Waiting on their reply.</div>
                  )}
                  {(selected.appointment.status === "confirmed" || selected.appointment.status === "rebooked") && (
                    <div style={{ color: C.inkSoft, fontSize: 13, textAlign: "center" }}>Nothing left to do here.</div>
                  )}
                  <button disabled={busy} onClick={() => deleteAppointment(selected.id)} style={{ ...outlineBtn(C.danger), marginTop: 4 }}>
                    <Trash2 size={14} /> Delete appointment
                  </button>
                </div>
              )}

              {tab === "reengage" && (
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8, maxWidth: 320, margin: "20px auto 0" }}>
                  {selected.reengageStatus === "none" && (
                    <button disabled={busy} onClick={() => send(selected.id, "check-in")} style={{ ...primaryBtn, background: C.warn }}>
                      <MessageCircle size={14} /> Send check-in text
                    </button>
                  )}
                  {selected.reengageStatus === "sent" && <div style={{ color: C.inkSoft, fontSize: 13, textAlign: "center" }}>Check-in sent. Waiting on their reply.</div>}
                  <button disabled={busy} onClick={() => deleteAppointment(selected.id)} style={{ ...outlineBtn(C.danger), marginTop: 4 }}>
                    <Trash2 size={14} /> Delete client
                  </button>
                </div>
              )}

              <div style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: 16, maxWidth: 320, margin: "24px auto 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ color: C.inkSoft, fontSize: 12 }}>AUTOMATED TEXTS</span>
                  <button onClick={() => toggleAutoTexts(selected.id, !selected.autoTexts)} style={{ background: selected.autoTexts ? C.primary : C.line, width: 36, height: 20, borderRadius: 999, border: "none", position: "relative", cursor: "pointer" }}>
                    <span style={{ background: "#fff", width: 16, height: 16, borderRadius: "50%", position: "absolute", top: 2, left: selected.autoTexts ? 18 : 2, transition: "left 0.15s" }} />
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: C.inkSoft, fontSize: 12 }}>
                  <FileText size={13} /> CLIENT BRIEF
                </div>
                <div style={{ fontSize: 14, marginBottom: 12 }}>
                  {lastVisit(selected) ? (
                    <>Last seen {daysSince(lastVisit(selected).date)} days ago. Usually returns every {selected.cadenceDays} days. Most recent note: "{lastVisit(selected).note}"</>
                  ) : (
                    <span style={{ color: C.inkSoft }}>No visits logged yet. Usually returns every {selected.cadenceDays} days once a pattern starts.</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: C.inkSoft, fontSize: 12 }}>
                  <History size={13} /> VISIT HISTORY
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 140, overflowY: "auto", marginBottom: 12 }}>
                  {selected.history.length === 0 && <div style={{ color: C.inkSoft, fontSize: 12 }}>No visits logged yet.</div>}
                  {[...selected.history].reverse().map((h) => (
                    <div key={h.id} style={{ fontSize: 12 }}>
                      <span style={{ color: C.primary }}>{new Date(h.date).toLocaleDateString()}</span>
                      <span style={{ color: C.inkSoft }}> — {h.note}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Log today's visit note…" style={{ ...inputStyle, flex: 1, fontSize: 12 }} />
                  <button disabled={busy} onClick={() => addNote(selected.id)} style={{ background: C.ink, color: "#fff", border: "none", borderRadius: 6, padding: "0 12px", fontSize: 12, cursor: "pointer" }}>Log</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .loop-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const inputStyle = { border: "1px solid #DEDAD0", borderRadius: 6, padding: "8px 10px", fontSize: 14, boxSizing: "border-box" };
const checkboxLabel = { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#5B6B68" };
const primaryBtn = { background: "#2F6F62", color: "#fff", border: "none", borderRadius: 6, padding: "10px", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" };
const outlineBtn = (color) => ({ background: "transparent", color, border: `1px solid ${color}`, borderRadius: 6, padding: "10px", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" });
