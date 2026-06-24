import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendSms } from "@/lib/twilio";
import { reminderText, checkInText, isOverdue } from "@/lib/messages";

const BIZ = () => process.env.BUSINESS_NAME || "your business";

// Vercel Cron calls this once a day. It checks a header so randoms on the
// internet can't trigger your texts.
export async function GET(req) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  let remindersSent = 0;
  let checkInsSent = 0;

  // 1. Reminder texts for tomorrow's appointments
  const upcoming = await db.client.findMany({
    where: {
      autoTexts: true,
      appointment: { status: "upcoming", date: { gte: tomorrow, lt: dayAfter } },
    },
    include: { appointment: true },
  });

  for (const client of upcoming) {
    const text = reminderText(client, BIZ());
    await sendSms(client.phone, text);
    await db.message.create({ data: { clientId: client.id, from: "business", text } });
    await db.appointment.update({ where: { clientId: client.id }, data: { status: "reminder-sent" } });
    remindersSent++;
  }

  // 2. Check-in texts for lapsed clients who are overdue and haven't been messaged yet
  const lapsed = await db.client.findMany({
    where: { autoTexts: true, appointment: null, reengageStatus: "none" },
    include: { history: { orderBy: { date: "asc" } } },
  });

  for (const client of lapsed) {
    if (!isOverdue(client)) continue;
    const text = checkInText(client, BIZ());
    await sendSms(client.phone, text);
    await db.message.create({ data: { clientId: client.id, from: "business", text } });
    await db.client.update({ where: { id: client.id }, data: { reengageStatus: "sent" } });
    checkInsSent++;
  }

  return NextResponse.json({ ok: true, remindersSent, checkInsSent });
}
