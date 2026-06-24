import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    bizName: process.env.BUSINESS_NAME || "Your Business",
    twilioConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || null,
    databaseConfigured: Boolean(process.env.DATABASE_URL),
  });
}
