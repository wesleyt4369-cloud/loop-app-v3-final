import { NextResponse } from "next/server";

export async function POST(req) {
  const { password } = await req.json();
  if (password && password === process.env.APP_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("loop_session", process.env.SESSION_SECRET, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }
  return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 401 });
}
