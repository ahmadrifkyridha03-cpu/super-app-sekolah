import { PrismaClient, Role, StudentStatus, QuestionType, ExamCategory, SessionStatus, AttendanceStatus, AssessmentType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding database Super-App Sekolah...");

  // 1. Password Hashing
  const passwordAdmin = await bcrypt.hash("admin123", 10);
  const passwordGuru = await bcrypt.hash("guru123", 10);
  const passwordSiswa = await bcrypt.hash("siswa123", 10);

  // 2. School Profile
  await prisma.schoolProfile.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "SMA Negeri Unggulan Bangsa",
      tagline: "Berakhlak, Unggul, Berprestasi",
      npsn: "20104050",
      address: "Jl. Pendidikan No. 45, Menteng, Jakarta Pusat",
      phone: "(021) 555-0199",
      email: "info@sekolah.sch.id",
      website: "https://sekolah.sch.id",
      principalName: "Dr. H. Muhammad Arifin, M.Pd.",
      principalNip: "197204151998021003",
      accreditation: "A (Unggul)",
      logoUrl: "/images/logo.svg",
      heroImageUrl: "/images/hero-school.jpg",
    },
  });

  // 3. Academic Year 2026/2027 Ganjil
  const academicYear = await prisma.academicYear.upsert({
    where: {
      name_semester: {
        name: "2026/2027",
        semester: 1,
      },
    },
    update: { isActive: true },
    create: {
      name: "2026/2027",
      semester: 1,
      isActive: true,
      startDate: new Date("2026-07-15T00:00:00Z"),
      endDate: new Date("2026-12-22T23:59:59Z"),
      reportDate: new Date("2026-12-20T00:00:00Z"),
    },
  });

  // 4. Admin Users
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: passwordAdmin,
      name: "Administrator Utama",
      email: "admin@sekolah.sch.id",
      role: Role.SUPER_ADMIN,
      mustChangePassword: false,
    },
  });

  await prisma.user.upsert({
    where: { username: "tu" },
    update: {},
    create: {
      username: "tu",
      password: passwordAdmin,
      name: "Hendra Wijaya, S.Kom. (Staf TU)",
      email: "tu@sekolah.sch.id",
      role: Role.ADMIN_TU,
      mustChangePassword: false,
    },
  });

  await prisma.user.upsert({
    where: { username: "kepsek" },
    update: {},
    create: {
      username: "kepsek",
      password: passwordAdmin,
      name: "Dr. H. Muhammad Arifin, M.Pd.",
      email: "kepsek@sekolah.sch.id",
      role: Role.KEPALA_SEKOLAH,
      mustChangePassword: false,
    },
  });

  // 5. Teachers
  const userGuru1 = await prisma.user.upsert({
    where: { username: "198002152005011004" },
    update: {},
    create: {
      username: "198002152005011004", // NIP
      password: passwordGuru,
      name: "Drs. Budi Santoso, M.Pd.",
      email: "budi.santoso@sekolah.sch.id",
      role: Role.GURU,
      mustChangePassword: false,
    },
  });

  const teacher1 = await prisma.teacher.upsert({
    where: { userId: userGuru1.id },
    update: {},
    create: {
      userId: userGuru1.id,
      nip: "198002152005011004",
      specialty: "Matematika",
    },
  });

  const userGuru2 = await prisma.user.upsert({
    where: { username: "198406122008012009" },
    update: {},
    create: {
      username: "198406122008012009",
      password: passwordGuru,
      name: "Siti Aminah, S.Pd., M.Si.",
      email: "siti.aminah@sekolah.sch.id",
      role: Role.GURU,
      mustChangePassword: false,
    },
  });

  const teacher2 = await prisma.teacher.upsert({
    where: { userId: userGuru2.id },
    update: {},
    create: {
      userId: userGuru2.id,
      nip: "198406122008012009",
      specialty: "Bahasa Indonesia",
    },
  });

  const userGuru3 = await prisma.user.upsert({
    where: { username: "197811032003121002" },
    update: {},
    create: {
      username: "197811032003121002",
      password: passwordGuru,
      name: "Dr. Irwan Setiawan, M.Kom.",
      email: "irwan.setiawan@sekolah.sch.id",
      role: Role.GURU,
      mustChangePassword: false,
    },
  });

  const teacher3 = await prisma.teacher.upsert({
    where: { userId: userGuru3.id },
    update: {},
    create: {
      userId: userGuru3.id,
      nip: "197811032003121002",
      specialty: "Informatika & Fisika",
    },
  });

  // 6. Classes (Rombel)
  const classXA = await prisma.classRoom.upsert({
    where: { id: "class-x-a" },
    update: { homeroomTeacherId: teacher1.id },
    create: {
      id: "class-x-a",
      name: "X-A",
      grade: 10,
      homeroomTeacherId: teacher1.id,
    },
  });

  const classXB = await prisma.classRoom.upsert({
    where: { id: "class-x-b" },
    update: { homeroomTeacherId: teacher2.id },
    create: {
      id: "class-x-b",
      name: "X-B",
      grade: 10,
      homeroomTeacherId: teacher2.id,
    },
  });

  await prisma.classRoom.upsert({
    where: { id: "class-xi-ipa-1" },
    update: {},
    create: {
      id: "class-xi-ipa-1",
      name: "XI-IPA-1",
      grade: 11,
    },
  });

  // 7. Subjects
  const subMat = await prisma.subject.upsert({
    where: { code: "MAT-10" },
    update: {},
    create: {
      code: "MAT-10",
      name: "Matematika",
      kktp: 75.0,
    },
  });

  const subBin = await prisma.subject.upsert({
    where: { code: "BIN-10" },
    update: {},
    create: {
      code: "BIN-10",
      name: "Bahasa Indonesia",
      kktp: 75.0,
    },
  });

  const subFis = await prisma.subject.upsert({
    where: { code: "FIS-10" },
    update: {},
    create: {
      code: "FIS-10",
      name: "Fisika",
      kktp: 75.0,
    },
  });

  // 8. Teaching Assignment (Pak Budi mengajar Matematika di X-A)
  const assignmentMatXA = await prisma.teachingAssignment.upsert({
    where: {
      academicYearId_teacherId_subjectId_classId: {
        academicYearId: academicYear.id,
        teacherId: teacher1.id,
        subjectId: subMat.id,
        classId: classXA.id,
      },
    },
    update: {},
    create: {
      academicYearId: academicYear.id,
      teacherId: teacher1.id,
      subjectId: subMat.id,
      classId: classXA.id,
      weightTask: 30.0,
      weightCbt: 20.0,
      weightMidterm: 25.0,
      weightFinal: 25.0,
    },
  });

  // 9. Learning Objectives (TP Kurikulum Merdeka)
  const tp1 = await prisma.learningObjective.create({
    data: {
      academicYearId: academicYear.id,
      subjectId: subMat.id,
      grade: 10,
      code: "TP-1",
      description: "Memahami konsep eksponen dan logaritma serta menerapkannya dalam model matematika",
    },
  });

  const tp2 = await prisma.learningObjective.create({
    data: {
      academicYearId: academicYear.id,
      subjectId: subMat.id,
      grade: 10,
      code: "TP-2",
      description: "Menganalisis barisan dan deret aritmetika serta geometri untuk pemecahan masalah",
    },
  });

  // 10. Students
  const studentsData = [
    { nis: "24251001", nisn: "0081234567", name: "Ahmad Fauzi Pratama", gender: "L", birthPlace: "Jakarta", birthDate: "2008-04-12", classId: classXA.id, parentName: "Bambang Pratama", parentPhone: "081234567890" },
    { nis: "24251002", nisn: "0082345678", name: "Annisa Putri Maharani", gender: "P", birthPlace: "Bandung", birthDate: "2008-07-25", classId: classXA.id, parentName: "Dedi Kurniawan", parentPhone: "081234567891" },
    { nis: "24251003", nisn: "0083456789", name: "Bagas Danendra", gender: "L", birthPlace: "Surabaya", birthDate: "2008-01-30", classId: classXA.id, parentName: "Gunawan Prasetyo", parentPhone: "081234567892" },
    { nis: "24251004", nisn: "0084567890", name: "Cantika Aulia Azzahra", gender: "P", birthPlace: "Semarang", birthDate: "2008-09-18", classId: classXB.id, parentName: "Hendra Wijaya", parentPhone: "081234567893" },
  ];

  const createdStudents = [];
  for (const s of studentsData) {
    const userSiswa = await prisma.user.upsert({
      where: { username: s.nisn },
      update: {},
      create: {
        username: s.nisn,
        password: passwordSiswa,
        name: s.name,
        role: Role.SISWA,
        mustChangePassword: false,
      },
    });

    const student = await prisma.student.upsert({
      where: { nisn: s.nisn },
      update: { classId: s.classId },
      create: {
        userId: userSiswa.id,
        nis: s.nis,
        nisn: s.nisn,
        birthPlace: s.birthPlace,
        birthDate: new Date(s.birthDate),
        gender: s.gender,
        classId: s.classId,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        status: StudentStatus.ACTIVE,
      },
    });

    createdStudents.push(student);

    // Track Class History
    await prisma.studentClassHistory.upsert({
      where: {
        studentId_academicYearId: {
          studentId: student.id,
          academicYearId: academicYear.id,
        },
      },
      update: {},
      create: {
        studentId: student.id,
        classId: s.classId,
        academicYearId: academicYear.id,
        status: "IN_PROGRESS",
      },
    });
  }

  // 11. Assessments & Grade Aggregations
  const assessmentTugas = await prisma.assessment.create({
    data: {
      assignmentId: assignmentMatXA.id,
      objectiveId: tp1.id,
      title: "Tugas Mandiri 1: Eksponen & Logaritma",
      type: AssessmentType.FORMATIF_TUGAS,
      maxScore: 100.0,
    },
  });

  const assessmentUTS = await prisma.assessment.create({
    data: {
      assignmentId: assignmentMatXA.id,
      title: "Sumatif Tengah Semester (STS) Matematika",
      type: AssessmentType.SUMATIF_TENGAH_SEMESTER,
      maxScore: 100.0,
    },
  });

  // Assign scores for Ahmad Fauzi (Siswa 1)
  const ahmad = createdStudents[0];
  if (!ahmad) {
    throw new Error("Student 0 (Ahmad) was not created");
  }
  await prisma.assessmentScore.create({
    data: {
      assessmentId: assessmentTugas.id,
      studentId: ahmad.id,
      rawScore: 92.0,
      finalScore: 92.0,
    },
  });

  await prisma.assessmentScore.create({
    data: {
      assessmentId: assessmentUTS.id,
      studentId: ahmad.id,
      rawScore: 88.0,
      finalScore: 88.0,
    },
  });

  // Create Subject Grade record with auto-narrative
  await prisma.subjectGrade.create({
    data: {
      assignmentId: assignmentMatXA.id,
      studentId: ahmad.id,
      overallScore: 90.0,
      predicate: "A",
      description: "Menunjukkan penguasaan sangat baik dalam memahami konsep eksponen dan logaritma serta analisis barisan aritmetika.",
      isLocked: false,
    },
  });

  // 12. Question Bank & Questions (with KaTeX!)
  const qBank = await prisma.questionBank.create({
    data: {
      title: "Bank Soal Matematika Eksponen & Barisan (Kelas 10)",
      subjectId: subMat.id,
      teacherId: teacher1.id,
    },
  });

  const q1 = await prisma.question.create({
    data: {
      bankId: qBank.id,
      type: QuestionType.MULTIPLE_CHOICE,
      content: "Hasil perhitungan dari $\\sqrt{144} + 2^3 \\times 5$ adalah...",
      options: JSON.stringify([
        "A. 42",
        "B. 48",
        "C. 52",
        "D. 56",
        "E. 60"
      ]),
      correctAnswer: "C",
      explanation: "$\\sqrt{144} = 12$, $2^3 \\times 5 = 8 \\times 5 = 40$. Maka $12 + 40 = 52$.",
      defaultWeight: 1.0,
    },
  });

  const q2 = await prisma.question.create({
    data: {
      bankId: qBank.id,
      type: QuestionType.MULTIPLE_CHOICE,
      content: "Diketahui rumus suku ke-$n$ barisan aritmetika adalah $U_n = 4n - 1$. Nilai dari suku ke-$15$ ($U_{15}$) adalah...",
      options: JSON.stringify([
        "A. 55",
        "B. 59",
        "C. 60",
        "D. 63",
        "E. 67"
      ]),
      correctAnswer: "B",
      explanation: "$U_{15} = 4(15) - 1 = 60 - 1 = 59$.",
      defaultWeight: 1.0,
    },
  });

  const q3 = await prisma.question.create({
    data: {
      bankId: qBank.id,
      type: QuestionType.MULTIPLE_CHOICE,
      content: "Bentuk sederhana dari perpangkatan $\\frac{x^5 y^{-2}}{x^2 y^3}$ adalah...",
      options: JSON.stringify([
        "A. $x^3 y^{-5}$",
        "B. $x^7 y$",
        "C. $x^3 y^5$",
        "D. $x^2 y$",
        "E. $x^5 y^{-5}$"
      ]),
      correctAnswer: "A",
      explanation: "Gunakan sifat pembagian pangkat: $x^{5-2} y^{-2-3} = x^3 y^{-5}$.",
      defaultWeight: 1.0,
    },
  });

  const q4 = await prisma.question.create({
    data: {
      bankId: qBank.id,
      type: QuestionType.ESSAY,
      content: "Tentukan himpunan penyelesaian dari persamaan kuadrat $2x^2 + 5x - 3 = 0$ menggunakan metode faktorisasi!",
      options: null,
      correctAnswer: null,
      scoringRubric: "Maksimal 10 poin: Menulis bentuk $(2x - 1)(x + 3) = 0$ (5 poin), menemukan $x_1 = 1/2$ dan $x_2 = -3$ (5 poin).",
      explanation: "$(2x - 1)(x + 3) = 0 \\implies x = 1/2 \\text{ atau } x = -3$.",
      defaultWeight: 2.0,
    },
  });

  // 13. CBT Exam Setup
  const examMat = await prisma.exam.create({
    data: {
      title: "Penilaian Harian Matematika: Eksponen & Barisan",
      category: ExamCategory.HARIAN,
      token: "EXAM26",
      subjectId: subMat.id,
      teacherId: teacher1.id,
      assignmentId: assignmentMatXA.id,
      academicYearId: academicYear.id,
      durationMinutes: 45,
      startTime: new Date("2026-10-01T07:30:00Z"),
      endTime: new Date("2026-12-31T23:59:59Z"),
      shuffleQuestions: true,
      shuffleOptions: true,
      isLocked: false,
    },
  });

  // Connect exam to class X-A
  await prisma.examClass.create({
    data: {
      examId: examMat.id,
      classId: classXA.id,
    },
  });

  // Add questions to exam
  const eq1 = await prisma.examQuestion.create({
    data: { examId: examMat.id, questionId: q1.id, orderNumber: 1, scoreWeight: 25.0 },
  });
  const eq2 = await prisma.examQuestion.create({
    data: { examId: examMat.id, questionId: q2.id, orderNumber: 2, scoreWeight: 25.0 },
  });
  const eq3 = await prisma.examQuestion.create({
    data: { examId: examMat.id, questionId: q3.id, orderNumber: 3, scoreWeight: 25.0 },
  });
  const eq4 = await prisma.examQuestion.create({
    data: { examId: examMat.id, questionId: q4.id, orderNumber: 4, scoreWeight: 25.0 },
  });

  // 14. Sample CBT Session for Student 1 (Ahmad)
  const sessionAhmad = await prisma.examSession.create({
    data: {
      examId: examMat.id,
      studentId: ahmad.id,
      attemptNumber: 1,
      startTime: new Date(),
      deadline: new Date(Date.now() + 45 * 60 * 1000),
      status: SessionStatus.IN_PROGRESS,
      tabSwitchCount: 0,
      questionOrder: JSON.stringify([eq1.id, eq2.id, eq3.id, eq4.id]),
    },
  });

  // Seed sample autosaved answers for CBT demo
  await prisma.studentAnswer.create({
    data: {
      sessionId: sessionAhmad.id,
      examQuestionId: eq1.id,
      answerText: "C",
      isCorrect: true,
      scoreEarned: 25.0,
      seq: 1,
    },
  });

  // 15. Report Card for Student 1 (Ahmad)
  await prisma.reportCard.create({
    data: {
      studentId: ahmad.id,
      classId: classXA.id,
      academicYearId: academicYear.id,
      sickDays: 1,
      permissionDays: 0,
      dispensationDays: 2,
      unexcusedDays: 0,
      behaviorGrade: "Sangat Baik",
      homeroomNotes: "Ahmad memiliki integritas dan kepemimpinan yang luar biasa. Tingkatkan terus prestasi dalam bidang sains!",
      rankInClass: 1,
      status: "PUBLISHED",
    },
  });

  // 16. Articles / School News for Landing Page
  const articlesData = [
    {
      title: "Tim Robotika SMA Negeri Unggulan Bangsa Raih Medali Emas WRO 2026",
      slug: "tim-robotika-raih-emas-wro-2026",
      content: "Prestasi membanggakan kembali diukir oleh perwakilan siswa SMA Negeri Unggulan Bangsa di kancah World Robot Olympiad (WRO) 2026...",
      category: "Prestasi",
      authorName: "Humas & Kesiswaan",
    },
    {
      title: "Pembukaan Pendaftaran Peserta Didik Baru (PPDB) Tahun Ajaran 2026/2027",
      slug: "ppdb-online-2026-2027",
      content: "Penerimaan Peserta Didik Baru (PPDB) SMA Negeri Unggulan Bangsa resmi dibuka melalui jalur Prestasi, Afirmasi, dan Zonasi...",
      category: "Pengumuman",
      authorName: "Panitia PPDB",
    },
    {
      title: "Penerapan Ujian Berbasis Komputer (CBT) dengan Sistem Anti-Curang Terpadu",
      slug: "cbt-anti-curang-terpadu",
      content: "Mulai semester ini sekolah memberlakukan sistem CBT berstandar nasional yang dilengkapi fitur penguncian layar otomatis...",
      category: "Berita",
      authorName: "Tim Kurikulum & IT",
    },
  ];

  for (const art of articlesData) {
    await prisma.article.upsert({
      where: { slug: art.slug },
      update: {},
      create: art,
    });
  }

  // 17. Sample PPDB Registrations
  await prisma.ppdbRegistration.upsert({
    where: { registrationNo: "PPDB-2026-001" },
    update: {},
    create: {
      registrationNo: "PPDB-2026-001",
      fullName: "Raihan Aditya Pratama",
      nisn: "0091122334",
      birthDate: new Date("2011-03-10"),
      originSchool: "SMP Negeri 1 Jakarta",
      targetMajor: "MIPA",
      parentName: "Agus Pratama",
      parentPhone: "081234567899",
      status: "ACCEPTED",
      notes: "Memenuhi kriteria jalur prestasi akademik.",
    },
  });

  console.log("✅ Seeding selesai! Database siap digunakan.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
