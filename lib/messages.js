export function firstName(name) {
  return name.split(" ")[0];
}

export function daysSince(date) {
  return Math.round((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

export function dayLabel(date) {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

export function reminderText(client, bizName) {
  return `Hi ${firstName(client.name)}, reminder: your appointment with ${bizName} is ${dayLabel(client.appointment.date)} at ${client.appointment.time}. Reply C to confirm or R to reschedule.`;
}

export function confirmationText(client, bizName) {
  return `Hi ${firstName(client.name)}, you're booked with ${bizName} for ${dayLabel(client.appointment.date)} at ${client.appointment.time}. We'll text a reminder before your visit.`;
}

export function noShowText(client, bizName) {
  return `Sorry we missed you today, ${firstName(client.name)}! Want to grab another time with ${bizName} this week?`;
}

export function checkInText(client, bizName) {
  const last = client.history?.[client.history.length - 1];
  const since = last ? daysSince(last.date) : null;
  return since != null
    ? `Hi ${firstName(client.name)}, it's been ${since} days since your last visit to ${bizName} — want to grab a spot this week?`
    : `Hi ${firstName(client.name)}, we'd love to see you again at ${bizName} — want to grab a spot this week?`;
}

export function isOverdue(client) {
  const last = client.history?.[client.history.length - 1];
  if (!last) return false;
  return daysSince(last.date) > client.cadenceDays * 1.3;
}
