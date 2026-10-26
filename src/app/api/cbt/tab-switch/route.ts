import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const newCount = session.tabSwitchCount + 1;
    const maxWarning = Number(process.env.CBT_MAX_TAB_SWITCH_WARNING) || 3;
    const isLocked = newCount >= maxWarning;

    const updated = await prisma.examSession.update({
      where: { id: sessionId },
      data: {
        tabSwitchCount: newCount,
        status: isLocked ? "LOCKED" : session.status,
      },
    });

    return NextResponse.json({
      success: true,
      tabSwitchCount: updated.tabSwitchCount,
      isLocked,
    });
  } catch (err: any) {
    console.error("Tab switch log error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
