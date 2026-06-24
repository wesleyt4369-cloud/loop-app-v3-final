"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Wrong password.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAF7", fontFamily: "system-ui, sans-serif" }}>
      <form onSubmit={submit} style={{ background: "#fff", border: "1px solid #DEDAD0", borderRadius: 12, padding: 32, width: 300 }}>
        <h1 style={{ fontSize: 22, marginBottom: 16, color: "#1C2B2D" }}>Loop</h1>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, border: "1px solid #DEDAD0", borderRadius: 8, marginBottom: 12, boxSizing: "border-box" }}
        />
        {error && <div style={{ color: "#A8453D", fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: "100%", padding: 10, background: "#2F6F62", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
          Log in
        </button>
      </form>
    </div>
  );
}
