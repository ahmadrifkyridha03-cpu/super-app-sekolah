import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    if (process.env.ENABLE_DEMO_SWITCHER !== "true") {
      return NextResponse.json({ error: "Demo switcher is disabled" }, { status: 403 });
    }

    const { role, username } = await req.json();

    if (role === "guest") {
      const res = NextResponse.json({ success: true, role: "GUEST" });
      res.cookies.delete(process.env.SESSION_COOKIE_NAME || "school_session_token");
      return res;
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        teacher: true,
        student: {
          include: {
            classRoom: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Akun demo tidak ditemukan" }, { status: 404 });
    }

    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      teacherId: user.teacher?.id,
      studentId: user.student?.id,
      classId: user.student?.classId,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set({
      name: process.env.SESSION_COOKIE_NAME || "school_session_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error("Demo switch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
