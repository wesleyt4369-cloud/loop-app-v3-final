import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthed } from "@/lib/auth";

export async function POST(req, { params }) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = params;
  const { note } = await req.json();
  if (!note || !note.trim()) {
    return NextResponse.json({ error: "Note can't be empty." }, { status: 400 });
  }
  await db.visit.create({ data: { clientId: id, note: note.trim() } });
  const fresh = await db.client.findUnique({
    where: { id },
    include: { appointment: true, history: { orderBy: { date: "asc" } }, messages: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json(fresh);
}
