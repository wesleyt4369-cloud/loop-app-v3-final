import { db } from "@/lib/db";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const clients = await db.client.findMany({
    include: { appointment: true, history: { orderBy: { date: "asc" } }, messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return <Dashboard initialClients={clients} bizName={process.env.BUSINESS_NAME || "Your Business"} />;
}
