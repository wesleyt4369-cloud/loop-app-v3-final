"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, LayoutGrid, Settings as SettingsIcon, LogOut } from "lucide-react";
import { C } from "@/lib/theme";

export default function Sidebar({ bizName }) {
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    { href: "/", label: "Dashboard", icon: LayoutGrid },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="loop-sidebar" style={{ width: 220, minHeight: "100vh", borderRight: `1px solid ${C.line}`, background: "#fff", display: "flex", flexDirection: "column", padding: "20px 16px", boxSizing: "border-box", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <div style={{ background: C.primary, width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
          <MessageCircle size={16} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16, color: C.ink }}>Loop</div>
          <div style={{ fontSize: 11, color: C.inkSoft }}>{bizName}</div>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8,
                textDecoration: "none", color: active ? C.primary : C.inkSoft,
                background: active ? C.primaryLight : "transparent", fontSize: 14,
              }}
            >
              <Icon size={16} /> {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", border: "none", background: "transparent", color: C.inkSoft, fontSize: 14, cursor: "pointer", borderTop: `1px solid ${C.line}`, marginTop: 12, paddingTop: 16 }}
      >
        <LogOut size={16} /> Log out
      </button>

      <style>{`
        @media (max-width: 760px) {
          .loop-sidebar { width: 100% !important; min-height: auto !important; flex-direction: row !important; align-items: center; border-right: none !important; border-bottom: 1px solid ${C.line}; padding: 12px 16px !important; }
          .loop-sidebar nav { flex-direction: row !important; flex: none !important; }
          .loop-sidebar > button { border-top: none !important; margin-top: 0 !important; padding-top: 9px !important; }
        }
      `}</style>
    </div>
  );
}
