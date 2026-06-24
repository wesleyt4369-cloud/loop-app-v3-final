import { db } from "@/lib/db";

const STOP_WORDS = ["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"];
const START_WORDS = ["START", "YES", "UNSTOP"];

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function twiml(message) {
  const body = message
    ? `<Response><Message>${escapeXml(message)}</Message></Response>`
    : `<Response></Response>`;
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>${body}`, {
    headers: { "Content-Type": "text/xml" },
  });
}

export async function POST(req) {
  const form = await req.formData();
  const bodyText = (form.get("Body") || "").toString().trim().toUpperCase();
  const from = (form.get("From") || "").toString();
  const bizName = process.env.BUSINESS_NAME || "us";

  if (!from) return twiml(null);

  if (STOP_WORDS.includes(bodyText)) {
    await db.client.updateMany({ where: { phone: from }, data: { optedOut: true } });
    return twiml(`You're unsubscribed and won't receive any more texts from ${bizName}. Reply START to opt back in.`);
  }

  if (START_WORDS.includes(bodyText)) {
    await db.client.updateMany({ where: { phone: from }, data: { optedOut: false } });
    return twiml(`You're resubscribed to texts from ${bizName}.`);
  }

  return twiml(null);
}
