import { cookies } from "next/headers";

export function isAuthed() {
  const session = cookies().get("loop_session")?.value;
  return Boolean(session && session === process.env.SESSION_SECRET);
}
