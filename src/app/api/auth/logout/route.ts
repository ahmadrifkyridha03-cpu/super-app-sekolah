import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  response.cookies.delete(process.env.SESSION_COOKIE_NAME || "school_session_token");
  return response;
}
