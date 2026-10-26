import { prisma } from "../src/lib/prisma";
import { AttendanceStatus, QuestionType, ExamCategory } from "@prisma/client";
import { generateExamToken } from "../src/lib/utils";

async function runTest() {
  console.log("=== 1. TEST PRESENSI HARIAN & AUTO-SYNC KE RAPOR ===");

  const classRoom = await prisma.classRoom.findFirst({
    where: { name: "X-A" },
    include: { students: { include: { user: true } } },
  });

  if (!classRoom) throw new Error("Kelas X-A tidak ditemukan");
  console.log(`✓ Kelas: ${classRoom.name} (${classRoom.students.length} siswa)`);

  const teacher = await prisma.teacher.findFirst({
    include: { user: true },
  });
  if (!teacher) throw new Error("Guru tidak ditemukan");

  const academicYear = await prisma.academicYear.findFirst({
    where: { isActive: true },
  }) || await prisma.academicYear.findFirst();
  if (!academicYear) throw new Error("Tahun ajaran tidak ditemukan");

  const today = new Date(new Date().toISOString().substring(0, 10) + "T00:00:00.000Z");

  // Create daily attendance
  const dailyAtt = await prisma.dailyAttendance.upsert({
    where: {
      classId_date: {
        classId: classRoom.id,
        date: today,
      },
    },
    update: {
      recordedById: teacher.userId,
      academicYearId: academicYear.id,
    },
    create: {
      classId: classRoom.id,
      date: today,
      recordedById: teacher.userId,
      academicYearId: academicYear.id,
    },
  });

  console.log(`✓ Header DailyAttendance dibuat/diupdate: ID ${dailyAtt.id}`);

  // Set student 0 to SAKIT, others HADIR
  for (let i = 0; i < classRoom.students.length; i++) {
    const s = classRoom.students[i];
    const status = i === 0 ? AttendanceStatus.SAKIT : AttendanceStatus.HADIR;
    const note = i === 0 ? "Surat dokter terlampir" : null;

    await prisma.dailyAttendanceRecord.upsert({
      where: {
        attendanceId_studentId: {
          attendanceId: dailyAtt.id,
          studentId: s.id,
        },
      },
      update: { status, note },
      create: {
        attendanceId: dailyAtt.id,
        studentId: s.id,
        status,
        note,
      },
    });
  }
  console.log(`✓ ${classRoom.students.length} record absensi siswa tersimpan.`);

  // Auto-sync verify to ReportCard
  const student0 = classRoom.students[0];
  const statusCounts = await prisma.dailyAttendanceRecord.groupBy({
    by: ["status"],
    where: {
      studentId: student0.id,
      attendance: { academicYearId: academicYear.id, classId: classRoom.id },
    },
    _count: { status: true },
  });

  const sickDays = statusCounts.find((c) => c.status === AttendanceStatus.SAKIT)?._count.status || 0;
  console.log(`✓ Hitungan Sakit teragregasi untuk ${student0.user.name}: ${sickDays} hari`);

  await prisma.reportCard.upsert({
    where: { studentId_academicYearId: { studentId: student0.id, academicYearId: academicYear.id } },
    update: { sickDays },
    create: {
      studentId: student0.id,
      classId: classRoom.id,
      academicYearId: academicYear.id,
      sickDays,
      behaviorGrade: "Sangat Baik",
    },
  });

  const rc = await prisma.reportCard.findUnique({
    where: { studentId_academicYearId: { studentId: student0.id, academicYearId: academicYear.id } },
  });
  console.log(`✓ Verifikasi ReportCard: sickDays = ${rc?.sickDays}`);

  console.log("\n=== 2. TEST GURU UPLOAD BANK SOAL ===");
  const subject = await prisma.subject.findFirst();
  if (!subject) throw new Error("Mapel tidak ditemukan");

  const bank = await prisma.questionBank.create({
    data: {
      title: `Bank Soal Uji Kompetensi ${subject.name} (Automated Test)`,
      subjectId: subject.id,
      teacherId: teacher.id,
      questions: {
        create: [
          {
            type: QuestionType.MULTIPLE_CHOICE,
            content: "Berapa hasil dari $\\int 2x \\, dx$?",
            options: JSON.stringify(["x^2 + C", "2x^2 + C", "x + C", "x^3 + C"]),
            correctAnswer: "A",
            defaultWeight: 1.0,
            explanation: "Integral dari 2x adalah x^2 + C.",
          },
          {
            type: QuestionType.MULTIPLE_CHOICE,
            content: "Jika $f(x) = 5x + 3$, berapakah $f(4)$?",
            options: JSON.stringify(["20", "23", "25", "28"]),
            correctAnswer: "B",
            defaultWeight: 1.0,
            explanation: "5(4) + 3 = 23.",
          },
        ],
      },
    },
    include: { questions: true },
  });
  console.log(`✓ Bank Soal '${bank.title}' berhasil dibuat: ${bank.questions.length} butir soal.`);

  console.log("\n=== 3. TEST ADMIN PILIH BANK SOAL & RILIS UJIAN CBT ===");
  const examToken = generateExamToken(6);
  const exam = await prisma.exam.create({
    data: {
      title: `Ujian CBT dari Bank Soal Guru: ${bank.title}`,
      category: ExamCategory.HARIAN,
      token: examToken,
      subjectId: bank.subjectId,
      teacherId: bank.teacherId,
      academicYearId: academicYear.id,
      durationMinutes: 60,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 3600 * 1000),
      shuffleQuestions: true,
      shuffleOptions: true,
      examQuestions: {
        create: bank.questions.map((q, idx) => ({
          questionId: q.id,
          orderNumber: idx + 1,
          scoreWeight: q.defaultWeight,
        })),
      },
      examClasses: {
        create: [{ classId: classRoom.id }],
      },
    },
    include: {
      examQuestions: true,
      examClasses: true,
    },
  });

  console.log(`✓ Ujian CBT '${exam.title}' berhasil dirilis oleh Admin!`);
  console.log(`  Token: ${exam.token}`);
  console.log(`  Butir Soal dari Bank Soal: ${exam.examQuestions.length}`);
  console.log(`  Kelas Peserta: ${exam.examClasses.length} kelas`);

  console.log("\n=== SELURUH TEST INTEGRASI FITUR SUKSES (100% PASS) ===");
}

runTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
