import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { sessionId, action } = await req.json();

    if (!sessionId || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (action === "UNLOCK") {
      const updated = await prisma.examSession.update({
        where: { id: sessionId },
        data: {
          status: "IN_PROGRESS",
          tabSwitchCount: 0, // Reset violation counter upon proctor unlock
        },
      });
      return NextResponse.json({ success: true, status: updated.status });
    } else if (action === "FORCE_SUBMIT") {
      const session = await prisma.examSession.findUnique({
        where: { id: sessionId },
        include: { answers: true },
      });
      let total = 0;
      for (const a of session?.answers || []) {
        if (a.scoreEarned) total += a.scoreEarned;
      }
      const updated = await prisma.examSession.update({
        where: { id: sessionId },
        data: {
          status: "SUBMITTED",
          finishTime: new Date(),
          finalScore: Math.min(100, total),
        },
      });
      return NextResponse.json({ success: true, status: updated.status });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Proctor action error:", err);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
