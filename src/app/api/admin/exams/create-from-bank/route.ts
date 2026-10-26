import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateExamToken } from "@/lib/utils";
import { ExamCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET /api/admin/exams/create-from-bank
// Menampilkan daftar Bank Soal yang siap digunakan oleh Admin untuk merilis ujian
export async function GET() {
  try {
    const banks = await prisma.questionBank.findMany({
      include: {
        subject: true,
        teacher: { include: { user: true } },
        questions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const classes = await prisma.classRoom.findMany({
      where: { isArchived: false },
      orderBy: { name: "asc" },
    });

    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    }) || await prisma.academicYear.findFirst({
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({
      success: true,
      academicYear,
      classes: classes.map((c) => ({ id: c.id, name: c.name, grade: c.grade })),
      banks: banks.map((b) => ({
        id: b.id,
        title: b.title,
        subjectId: b.subjectId,
        subjectName: b.subject.name,
        teacherName: b.teacher.user.name,
        totalQuestions: b.questions.length,
        createdAt: b.createdAt.toISOString(),
      })),
    });
  } catch (err: any) {
    console.error("GET /api/admin/exams/create-from-bank error:", err);
    return NextResponse.json(
      { error: "Gagal memuat bank soal untuk admin", details: err?.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/exams/create-from-bank
// Admin merilis ujian CBT baru dengan memilih Bank Soal dari guru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      bankId,
      category = "HARIAN",
      durationMinutes = 60,
      startTime: startTimeStr,
      endTime: endTimeStr,
      classIds,
      token: customToken,
    } = body;

    if (!title || !bankId || !classIds || !Array.isArray(classIds) || classIds.length === 0) {
      return NextResponse.json(
        { error: "Nama ujian, bank soal, dan minimal satu kelas wajib dipilih" },
        { status: 400 }
      );
    }

    // 1. Fetch QuestionBank along with its questions
    const bank = await prisma.questionBank.findUnique({
      where: { id: bankId },
      include: {
        subject: true,
        teacher: true,
        questions: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!bank) {
      return NextResponse.json({ error: "Bank soal tidak ditemukan" }, { status: 404 });
    }

    if (bank.questions.length === 0) {
      return NextResponse.json(
        { error: "Bank soal ini belum memiliki butir soal" },
        { status: 400 }
      );
    }

    // 2. Resolve Academic Year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    }) || await prisma.academicYear.findFirst({
      orderBy: { startDate: "desc" },
    });

    if (!academicYear) {
      return NextResponse.json({ error: "Tahun ajaran aktif tidak ditemukan" }, { status: 400 });
    }

    // 3. Resolve times and token
    const now = new Date();
    const startTime = startTimeStr ? new Date(startTimeStr) : now;
    const endTime = endTimeStr 
      ? new Date(endTimeStr) 
      : new Date(startTime.getTime() + durationMinutes * 60 * 1000 + 24 * 60 * 60 * 1000); // Default open 24h

    const token = (customToken?.trim().toUpperCase()) || generateExamToken(6);

    const validCategory = Object.values(ExamCategory).includes(category)
      ? (category as ExamCategory)
      : ExamCategory.HARIAN;

    // 4. Create Exam & Link ExamQuestions & ExamClasses in a transaction
    const exam = await prisma.exam.create({
      data: {
        title,
        category: validCategory,
        token,
        subjectId: bank.subjectId,
        teacherId: bank.teacherId,
        academicYearId: academicYear.id,
        durationMinutes: Number(durationMinutes) || 60,
        startTime,
        endTime,
        shuffleQuestions: true,
        shuffleOptions: true,
        isLocked: false,
        examQuestions: {
          create: bank.questions.map((q, idx) => ({
            questionId: q.id,
            orderNumber: idx + 1,
            scoreWeight: q.defaultWeight || 1.0,
          })),
        },
        examClasses: {
          create: classIds.map((cid: string) => ({
            classId: cid,
          })),
        },
      },
      include: {
        examQuestions: true,
        examClasses: true,
        subject: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Ujian '${exam.title}' berhasil dirilis dengan token '${exam.token}'. ${bank.questions.length} butir soal telah siap dikerjakan oleh siswa.`,
      examId: exam.id,
      token: exam.token,
      totalQuestions: exam.examQuestions.length,
      assignedClasses: exam.examClasses.length,
    });
  } catch (err: any) {
    console.error("POST /api/admin/exams/create-from-bank error:", err);
    return NextResponse.json(
      { error: "Gagal merilis ujian dari bank soal", details: err?.message },
      { status: 500 }
    );
  }
}
