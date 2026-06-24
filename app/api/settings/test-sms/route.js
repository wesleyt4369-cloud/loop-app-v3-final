import { NextResponse } from "next/server";
import { sendSms } from "@/lib/twilio";
import { isAuthed } from "@/lib/auth";

export async function POST(req) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: "Enter a phone number." }, { status: 400 });

  const bizName = process.env.BUSINESS_NAME || "your business";
  const result = await sendSms(phone, `This is a test message from Loop — your Twilio setup for ${bizName} is working!`);

  if (result.devMode) {
    return NextResponse.json({ ok: true, devMode: true, message: "Twilio isn't connected yet, so no real text was sent. Check the server logs to see what would have been sent." });
  }
  return NextResponse.json({ ok: true, devMode: false, message: `Real text sent to ${phone}.` });
}
