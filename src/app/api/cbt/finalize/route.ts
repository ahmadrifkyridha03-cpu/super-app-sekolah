import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: true,
        exam: {
          include: {
            examQuestions: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
    }

    // Calculate total score
    let totalScore = 0;
    for (const ans of session.answers) {
      if (ans.scoreEarned) {
        totalScore += ans.scoreEarned;
      }
    }

    // Cap at 100
    const finalScore = Math.min(100, Math.round(totalScore * 10) / 10);

    const updated = await prisma.examSession.update({
      where: { id: sessionId },
      data: {
        status: "SUBMITTED",
        finishTime: new Date(),
        finalScore,
      },
    });

    return NextResponse.json({
      success: true,
      finalScore: updated.finalScore,
      status: updated.status,
    });
  } catch (err: any) {
    console.error("Finalize error:", err);
    return NextResponse.json({ error: "Gagal menyelesaikan ujian" }, { status: 500 });
  }
}
