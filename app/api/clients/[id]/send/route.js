import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendSms } from "@/lib/twilio";
import { reminderText, noShowText, checkInText } from "@/lib/messages";
import { isAuthed } from "@/lib/auth";

const BIZ = () => process.env.BUSINESS_NAME || "your business";

export async function POST(req, { params }) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = params;
  const { type } = await req.json(); // "reminder" | "no-show" | "check-in"

  const client = await db.client.findUnique({
    where: { id },
    include: { appointment: true, history: { orderBy: { date: "asc" } } },
  });
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  let text, newApptStatus, newReengageStatus;

  if (type === "reminder") {
    if (!client.appointment) return NextResponse.json({ error: "No appointment to remind about." }, { status: 400 });
    text = reminderText(client, BIZ());
    newApptStatus = "reminder-sent";
  } else if (type === "no-show") {
    if (!client.appointment) return NextResponse.json({ error: "No appointment found." }, { status: 400 });
    text = noShowText(client, BIZ());
    newApptStatus = "no-show";
  } else if (type === "check-in") {
    text = checkInText(client, BIZ());
    newReengageStatus = "sent";
  } else {
    return NextResponse.json({ error: "Unknown message type." }, { status: 400 });
  }

  await sendSms(client.phone, text);
  await db.message.create({ data: { clientId: client.id, from: "business", text } });
  if (newApptStatus) await db.appointment.update({ where: { clientId: client.id }, data: { status: newApptStatus } });
  if (newReengageStatus) await db.client.update({ where: { id: client.id }, data: { reengageStatus: newReengageStatus } });

  const fresh = await db.client.findUnique({
    where: { id },
    include: { appointment: true, history: { orderBy: { date: "asc" } }, messages: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json(fresh);
}
