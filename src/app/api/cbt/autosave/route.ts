import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { sessionId, examQuestionId, answerText, isDoubtful, seq } = await req.json();

    if (!sessionId || !examQuestionId || seq === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify session is active
    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Sesi ujian tidak aktif atau telah dikunci oleh proktor" },
        { status: 403 }
      );
    }

    // Check if time expired
    if (new Date() > new Date(session.deadline)) {
      await prisma.examSession.update({
        where: { id: sessionId },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json({ error: "Waktu ujian telah habis" }, { status: 403 });
    }

    // Monotonic sequence check to prevent latency race condition
    const existing = await prisma.studentAnswer.findUnique({
      where: {
        sessionId_examQuestionId: {
          sessionId,
          examQuestionId,
        },
      },
    });

    if (existing && existing.seq >= seq) {
      // Out of order packet, ignore stale write
      return NextResponse.json({ success: true, ignoredStale: true });
    }

    // Check if answer is correct (for Multiple Choice)
    const eq = await prisma.examQuestion.findUnique({
      where: { id: examQuestionId },
      include: { question: true },
    });

    const isCorrect =
      eq?.question.type === "MULTIPLE_CHOICE"
        ? (answerText?.trim().toUpperCase() === eq.overrideCorrectAnswer ||
           answerText?.trim().toUpperCase() === eq.question.correctAnswer)
        : null;

    const scoreEarned = isCorrect === true ? eq?.scoreWeight ?? 1.0 : isCorrect === false ? 0.0 : null;

    const saved = await prisma.studentAnswer.upsert({
      where: {
        sessionId_examQuestionId: {
          sessionId,
          examQuestionId,
        },
      },
      update: {
        answerText,
        isDoubtful: Boolean(isDoubtful),
        isCorrect,
        scoreEarned,
        seq,
      },
      create: {
        sessionId,
        examQuestionId,
        answerText,
        isDoubtful: Boolean(isDoubtful),
        isCorrect,
        scoreEarned,
        seq,
      },
    });

    // Update session heartbeat
    await prisma.examSession.update({
      where: { id: sessionId },
      data: { lastHeartbeatAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      seq: saved.seq,
      updatedAt: saved.updatedAt,
    });
  } catch (err: any) {
    console.error("Autosave error:", err);
    return NextResponse.json({ error: "Gagal menyimpan jawaban atomik" }, { status: 500 });
  }
}
