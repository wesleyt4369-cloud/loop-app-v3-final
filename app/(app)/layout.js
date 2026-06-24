import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import Sidebar from "../Sidebar";

export default function AppLayout({ children }) {
  if (!isAuthed()) redirect("/login");

  return (
    <div style={{ display: "flex" }} className="loop-app-shell">
      <Sidebar bizName={process.env.BUSINESS_NAME || "Your Business"} />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      <style>{`
        @media (max-width: 760px) {
          .loop-app-shell { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
