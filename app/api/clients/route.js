import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendSms } from "@/lib/twilio";
import { confirmationText } from "@/lib/messages";
import { isAuthed } from "@/lib/auth";

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clients = await db.client.findMany({
    include: { appointment: true, history: { orderBy: { date: "asc" } }, messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clients);
}

export async function POST(req) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { name, phone, date, time, cadenceDays, autoTexts, sendConfirmation } = body;

  if (!name || !phone || !date || !time) {
    return NextResponse.json({ error: "Name, phone, date, and time are required." }, { status: 400 });
  }

  const client = await db.client.create({
    data: {
      name,
      phone,
      cadenceDays: cadenceDays ? Number(cadenceDays) : 14,
      autoTexts: autoTexts !== false,
      appointment: {
        create: {
          date: new Date(date),
          time,
          status: "upcoming",
        },
      },
    },
    include: { appointment: true, history: true, messages: true },
  });

  if (sendConfirmation) {
    const bizName = process.env.BUSINESS_NAME || "your business";
    const text = confirmationText(client, bizName);
    await sendSms(client.phone, text);
    await db.message.create({ data: { clientId: client.id, from: "business", text } });
    await db.appointment.update({ where: { clientId: client.id }, data: { status: "confirmed" } });
  }

  const fresh = await db.client.findUnique({
    where: { id: client.id },
    include: { appointment: true, history: true, messages: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json(fresh);
}
