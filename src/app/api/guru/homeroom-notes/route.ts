import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/guru/homeroom-notes?classId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json({ error: "Parameter classId wajib disertakan" }, { status: 400 });
    }

    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    }) || await prisma.academicYear.findFirst({
      orderBy: { startDate: "desc" },
    });

    if (!academicYear) {
      return NextResponse.json({ error: "Tahun ajaran aktif tidak ditemukan" }, { status: 400 });
    }

    const students = await prisma.student.findMany({
      where: { classId, status: "ACTIVE" },
      include: {
        user: true,
        reportCards: {
          where: { academicYearId: academicYear.id },
        },
      },
      orderBy: { nisn: "asc" },
    });

    const studentReports = students.map((s) => {
      const rc = s.reportCards[0];
      return {
        studentId: s.id,
        name: s.user.name,
        nisn: s.nisn,
        homeroomNotes: rc?.homeroomNotes || "",
        behaviorGrade: rc?.behaviorGrade || "Baik",
        sickDays: rc?.sickDays || 0,
        permissionDays: rc?.permissionDays || 0,
        dispensationDays: rc?.dispensationDays || 0,
        unexcusedDays: rc?.unexcusedDays || 0,
        status: rc?.status || "DRAFT",
        lockedAt: rc?.lockedAt || null,
      };
    });

    return NextResponse.json({
      success: true,
      classId,
      academicYearName: academicYear.name,
      students: studentReports,
    });
  } catch (err: any) {
    console.error("GET /api/guru/homeroom-notes error:", err);
    return NextResponse.json(
      { error: "Gagal memuat catatan rapor wali kelas", details: err?.message },
      { status: 500 }
    );
  }
}

// POST /api/guru/homeroom-notes
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { classId, studentNotes } = body;

    if (!classId || !studentNotes || !Array.isArray(studentNotes)) {
      return NextResponse.json({ error: "Payload tidak lengkap" }, { status: 400 });
    }

    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    }) || await prisma.academicYear.findFirst({
      orderBy: { startDate: "desc" },
    });

    if (!academicYear) {
      return NextResponse.json({ error: "Tahun ajaran aktif tidak ditemukan" }, { status: 400 });
    }

    for (const item of studentNotes) {
      const isLocking = item.status === "LOCKED";
      await prisma.reportCard.upsert({
        where: {
          studentId_academicYearId: {
            studentId: item.studentId,
            academicYearId: academicYear.id,
          },
        },
        update: {
          homeroomNotes: item.homeroomNotes || null,
          behaviorGrade: item.behaviorGrade || "Baik",
          status: item.status || "DRAFT",
          lockedAt: isLocking ? new Date() : null,
        },
        create: {
          studentId: item.studentId,
          classId,
          academicYearId: academicYear.id,
          homeroomNotes: item.homeroomNotes || null,
          behaviorGrade: item.behaviorGrade || "Baik",
          status: item.status || "DRAFT",
          lockedAt: isLocking ? new Date() : null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil memperbarui catatan wali kelas dan status rapor untuk ${studentNotes.length} siswa.`,
    });
  } catch (err: any) {
    console.error("POST /api/guru/homeroom-notes error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan catatan wali kelas", details: err?.message },
      { status: 500 }
    );
  }
}
