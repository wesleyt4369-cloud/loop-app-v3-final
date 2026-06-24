import Twilio from "twilio";
import { db } from "@/lib/db";

let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export async function sendSms(to, body) {
  const optedOutClient = await db.client.findFirst({ where: { phone: to, optedOut: true } });
  if (optedOutClient) {
    console.log(`[SKIPPED — opted out] Would have texted ${to}: "${body}"`);
    return { sid: "skipped-opted-out", skipped: true };
  }

  if (!client) {
    console.log(`[DEV MODE — no Twilio credentials set] Would text ${to}: "${body}"`);
    return { sid: "dev-mode-no-send", devMode: true };
  }
  return client.messages.create({
    to,
    from: process.env.TWILIO_PHONE_NUMBER,
    body,
  });
}
