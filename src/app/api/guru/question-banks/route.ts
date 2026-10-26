import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QuestionType } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET /api/guru/question-banks?teacherId=...&subjectId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const subjectId = searchParams.get("subjectId");

    const whereClause: any = {};
    if (teacherId) whereClause.teacherId = teacherId;
    if (subjectId) whereClause.subjectId = subjectId;

    const banks = await prisma.questionBank.findMany({
      where: whereClause,
      include: {
        subject: true,
        teacher: { include: { user: true } },
        questions: {
          orderBy: { id: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      banks: banks.map((b) => ({
        id: b.id,
        title: b.title,
        subjectId: b.subjectId,
        subjectName: b.subject.name,
        teacherId: b.teacherId,
        teacherName: b.teacher.user.name,
        createdAt: b.createdAt.toISOString(),
        totalQuestions: b.questions.length,
        multipleChoiceCount: b.questions.filter((q) => q.type === QuestionType.MULTIPLE_CHOICE).length,
        essayCount: b.questions.filter((q) => q.type === QuestionType.ESSAY).length,
        questions: b.questions.map((q) => ({
          id: q.id,
          type: q.type,
          content: q.content,
          options: q.options ? JSON.parse(q.options) : [],
          correctAnswer: q.correctAnswer,
          defaultWeight: q.defaultWeight,
          explanation: q.explanation,
        })),
      })),
    });
  } catch (err: any) {
    console.error("GET /api/guru/question-banks error:", err);
    return NextResponse.json(
      { error: "Gagal memuat bank soal", details: err?.message },
      { status: 500 }
    );
  }
}

// POST /api/guru/question-banks
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, subjectId, teacherId, questions } = body;

    if (!title || !subjectId) {
      return NextResponse.json({ error: "Judul dan Mata Pelajaran wajib diisi" }, { status: 400 });
    }

    // Resolve teacher
    let actualTeacherId = teacherId;
    if (!actualTeacherId) {
      const defaultTeacher = await prisma.teacher.findFirst();
      actualTeacherId = defaultTeacher?.id;
    }

    if (!actualTeacherId) {
      return NextResponse.json({ error: "Data guru pengampu tidak valid" }, { status: 400 });
    }

    // Process questions list
    const questionsCreate = Array.isArray(questions)
      ? questions.map((q: any) => ({
          type: q.type === "ESSAY" ? QuestionType.ESSAY : QuestionType.MULTIPLE_CHOICE,
          content: q.content || "Butir soal baru",
          options: q.options ? (typeof q.options === "string" ? q.options : JSON.stringify(q.options)) : null,
          correctAnswer: q.correctAnswer?.toUpperCase() || null,
          scoringRubric: q.scoringRubric || null,
          explanation: q.explanation || null,
          defaultWeight: Number(q.defaultWeight) || 1.0,
        }))
      : [];

    const bank = await prisma.questionBank.create({
      data: {
        title,
        subjectId,
        teacherId: actualTeacherId,
        questions: {
          create: questionsCreate,
        },
      },
      include: {
        subject: true,
        questions: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Bank soal '${bank.title}' berhasil dibuat dengan ${bank.questions.length} butir soal.`,
      bankId: bank.id,
      totalQuestions: bank.questions.length,
    });
  } catch (err: any) {
    console.error("POST /api/guru/question-banks error:", err);
    return NextResponse.json(
      { error: "Gagal membuat bank soal", details: err?.message },
      { status: 500 }
    );
  }
}
