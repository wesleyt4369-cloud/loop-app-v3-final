import Twilio from "twilio";

let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

/**
 * Sends a real text message via Twilio.
 * If Twilio credentials aren't configured yet, logs to the server console
 * instead of sending — so you can build and test before paying for anything.
 */
export async function sendSms(to, body) {
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
