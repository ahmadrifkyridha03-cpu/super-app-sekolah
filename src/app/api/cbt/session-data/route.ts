import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        answers: true,
        exam: {
          include: {
            subject: true,
            examQuestions: {
              include: {
                question: true,
              },
              orderBy: { orderNumber: "asc" },
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, session });
  } catch (err: any) {
    console.error("Session data fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
