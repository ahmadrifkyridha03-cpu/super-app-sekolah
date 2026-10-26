import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding extra P5 and Extracurricular data for E-Raport...");

  const academicYear = await prisma.academicYear.findFirst({
    where: { isActive: true },
  });

  if (!academicYear) {
    console.error("No active academic year found");
    return;
  }

  const ahmad = await prisma.student.findFirst({
    where: { nisn: "0081234567" },
  });

  const classXA = await prisma.classRoom.findFirst({
    where: { name: "X-A" },
  });

  const teacher1 = await prisma.teacher.findFirst();

  if (!ahmad || !classXA) {
    console.error("Student Ahmad or Class X-A not found");
    return;
  }

  // 1. P5 Co-Curricular Project
  const project1 = await prisma.coCurricularProject.upsert({
    where: { id: "p5-sampah-organik" },
    update: {},
    create: {
      id: "p5-sampah-organik",
      academicYearId: academicYear.id,
      title: "Gaya Hidup Berkelanjutan: Pengolahan Sampah Organik Menjadi Eco-Enzyme",
      theme: "Gaya Hidup Berkelanjutan",
      description: "Peserta didik mengidentifikasi permasalahan limbah organik di lingkungan sekolah dan merancang solusi biokonversi eco-enzyme.",
    },
  });

  const dim1 = await prisma.coCurricularDimension.upsert({
    where: { id: "dim-gotong-royong" },
    update: {},
    create: {
      id: "dim-gotong-royong",
      projectId: project1.id,
      name: "Gotong Royong & Kolaborasi",
    },
  });

  const dim2 = await prisma.coCurricularDimension.upsert({
    where: { id: "dim-kreatif" },
    update: {},
    create: {
      id: "dim-kreatif",
      projectId: project1.id,
      name: "Kreativitas & Bernalar Kritis",
    },
  });

  await prisma.coCurricularStudentScore.upsert({
    where: {
      projectId_dimensionId_studentId: {
        projectId: project1.id,
        dimensionId: dim1.id,
        studentId: ahmad.id,
      },
    },
    update: {},
    create: {
      projectId: project1.id,
      dimensionId: dim1.id,
      studentId: ahmad.id,
      score: "SAB", // Sangat Berkembang
      notes: "Menunjukkan inisiatif tinggi dalam memimpin kelompok kerja dan pembagian tugas lapangan.",
    },
  });

  await prisma.coCurricularStudentScore.upsert({
    where: {
      projectId_dimensionId_studentId: {
        projectId: project1.id,
        dimensionId: dim2.id,
        studentId: ahmad.id,
      },
    },
    update: {},
    create: {
      projectId: project1.id,
      dimensionId: dim2.id,
      studentId: ahmad.id,
      score: "BSH", // Berkembang Sesuai Harapan
      notes: "Mampu memformulasikan rasio fermentasi molase dan sisa buah dengan presisi ilmiah.",
    },
  });

  // 2. Extracurriculars
  const extraPramuka = await prisma.extracurricular.upsert({
    where: { id: "extra-pramuka" },
    update: {},
    create: {
      id: "extra-pramuka",
      name: "Praja Muda Karana (Pramuka Wajib)",
      advisorId: teacher1?.id,
    },
  });

  const extraRobotika = await prisma.extracurricular.upsert({
    where: { id: "extra-robotika" },
    update: {},
    create: {
      id: "extra-robotika",
      name: "KIR & Robotika Unggulan",
      advisorId: teacher1?.id,
    },
  });

  await prisma.extracurricularMember.upsert({
    where: {
      extracurricularId_studentId: {
        extracurricularId: extraPramuka.id,
        studentId: ahmad.id,
      },
    },
    update: {},
    create: {
      extracurricularId: extraPramuka.id,
      studentId: ahmad.id,
      grade: "Sangat Baik",
      notes: "Aktif mengikuti penjelajahan tapak kemah dan menunjukkan keteladanan kedisiplinan Dasa Darma.",
    },
  });

  await prisma.extracurricularMember.upsert({
    where: {
      extracurricularId_studentId: {
        extracurricularId: extraRobotika.id,
        studentId: ahmad.id,
      },
    },
    update: {},
    create: {
      extracurricularId: extraRobotika.id,
      studentId: ahmad.id,
      grade: "Sangat Baik",
      notes: "Memimpin tim mikro-kontroler Arduino dan meraih Juara 1 Lomba Inovasi Teknologi tingkat provinsi.",
    },
  });

  // Ensure Bahasa Indonesia and Fisika also have subject grades for Ahmad
  const subBin = await prisma.subject.findFirst({ where: { code: "BIN-10" } });
  const subFis = await prisma.subject.findFirst({ where: { code: "FIS-10" } });
  const teacher2 = await prisma.teacher.findFirst({ where: { nip: "198506122009022003" } }); // Bu Siti
  const teacher3 = await prisma.teacher.findFirst({ where: { nip: "197811042003121002" } }); // Pak Irwan

  if (subBin && teacher2) {
    const assignBin = await prisma.teachingAssignment.upsert({
      where: {
        academicYearId_teacherId_subjectId_classId: {
          academicYearId: academicYear.id,
          teacherId: teacher2.id,
          subjectId: subBin.id,
          classId: classXA.id,
        },
      },
      update: {},
      create: {
        academicYearId: academicYear.id,
        teacherId: teacher2.id,
        subjectId: subBin.id,
        classId: classXA.id,
        weightTask: 30,
        weightCbt: 20,
        weightMidterm: 25,
        weightFinal: 25,
      },
    });

    await prisma.subjectGrade.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: assignBin.id,
          studentId: ahmad.id,
        },
      },
      update: {},
      create: {
        assignmentId: assignBin.id,
        studentId: ahmad.id,
        overallScore: 88.0,
        predicate: "A",
        description: "Sangat terampil dalam menganalisis struktur teks laporan hasil observasi dan menyusun teks eksposisi secara koheren.",
        isLocked: true,
      },
    });
  }

  if (subFis && teacher3) {
    const assignFis = await prisma.teachingAssignment.upsert({
      where: {
        academicYearId_teacherId_subjectId_classId: {
          academicYearId: academicYear.id,
          teacherId: teacher3.id,
          subjectId: subFis.id,
          classId: classXA.id,
        },
      },
      update: {},
      create: {
        academicYearId: academicYear.id,
        teacherId: teacher3.id,
        subjectId: subFis.id,
        classId: classXA.id,
        weightTask: 30,
        weightCbt: 20,
        weightMidterm: 25,
        weightFinal: 25,
      },
    });

    await prisma.subjectGrade.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: assignFis.id,
          studentId: ahmad.id,
        },
      },
      update: {},
      create: {
        assignmentId: assignFis.id,
        studentId: ahmad.id,
        overallScore: 91.5,
        predicate: "A",
        description: "Menunjukkan pemahaman mendalam tentang konsep pengukuran besaran fisis dan dinamika gerak lurus beraturan.",
        isLocked: true,
      },
    });
  }

  console.log("✅ P5 and Extracurricular data successfully seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
