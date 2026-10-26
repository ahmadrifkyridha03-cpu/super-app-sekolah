import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET /api/attendance/daily?classId=...&date=YYYY-MM-DD
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const dateStr = searchParams.get("date");

    if (!classId) {
      return NextResponse.json({ error: "Parameter classId wajib disertakan" }, { status: 400 });
    }

    const targetDate = dateStr 
      ? new Date(`${dateStr}T00:00:00.000Z`) 
      : new Date(new Date().toISOString().split("T")[0] + "T00:00:00.000Z");

    // Fetch existing attendance header & records
    const attendance = await prisma.dailyAttendance.findUnique({
      where: {
        classId_date: {
          classId,
          date: targetDate,
        },
      },
      include: {
        records: {
          include: {
            student: {
              include: { user: true },
            },
          },
        },
      },
    });

    // Fetch all active students in this classroom
    const students = await prisma.student.findMany({
      where: { classId, status: "ACTIVE" },
      include: { user: true },
      orderBy: { nisn: "asc" },
    });

    // Map records or provide default HADIR for each student
    const recordMap = new Map(attendance?.records.map((r) => [r.studentId, r]) || []);

    const studentAttendance = students.map((s) => {
      const rec = recordMap.get(s.id);
      return {
        studentId: s.id,
        name: s.user.name,
        nisn: s.nisn,
        status: (rec?.status as AttendanceStatus) || AttendanceStatus.HADIR,
        note: rec?.note || "",
      };
    });

    return NextResponse.json({
      success: true,
      classId,
      date: targetDate.toISOString().split("T")[0],
      isRecorded: Boolean(attendance),
      attendanceId: attendance?.id || null,
      students: studentAttendance,
    });
  } catch (err: any) {
    console.error("GET /api/attendance/daily error:", err);
    return NextResponse.json(
      { error: "Gagal memuat data presensi harian", details: err?.message },
      { status: 500 }
    );
  }
}

// POST /api/attendance/daily
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { classId, date: dateStr, recordedById, records } = body;

    if (!classId || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: "Payload tidak lengkap" }, { status: 400 });
    }

    const targetDate = dateStr 
      ? new Date(`${dateStr}T00:00:00.000Z`) 
      : new Date(new Date().toISOString().split("T")[0] + "T00:00:00.000Z");

    // 1. Get active academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    }) || await prisma.academicYear.findFirst({
      orderBy: { startDate: "desc" },
    });

    if (!academicYear) {
      return NextResponse.json({ error: "Tahun ajaran aktif tidak ditemukan" }, { status: 400 });
    }

    // Resolve recorder user
    let actualRecordedById = recordedById;
    if (!actualRecordedById) {
      const defaultUser = await prisma.user.findFirst({
        where: { role: { in: ["GURU", "SUPER_ADMIN", "ADMIN_TU"] } },
      });
      actualRecordedById = defaultUser?.id;
    }

    if (!actualRecordedById) {
      return NextResponse.json({ error: "User pencatat tidak valid" }, { status: 400 });
    }

    // 2. Upsert DailyAttendance header
    const attendance = await prisma.dailyAttendance.upsert({
      where: {
        classId_date: {
          classId,
          date: targetDate,
        },
      },
      update: {
        recordedById: actualRecordedById,
        academicYearId: academicYear.id,
      },
      create: {
        classId,
        date: targetDate,
        academicYearId: academicYear.id,
        recordedById: actualRecordedById,
      },
    });

    // 3. Upsert each student record
    for (const item of records) {
      const validStatus: AttendanceStatus = Object.values(AttendanceStatus).includes(item.status)
        ? (item.status as AttendanceStatus)
        : AttendanceStatus.HADIR;

      await prisma.dailyAttendanceRecord.upsert({
        where: {
          attendanceId_studentId: {
            attendanceId: attendance.id,
            studentId: item.studentId,
          },
        },
        update: {
          status: validStatus,
          note: item.note || null,
        },
        create: {
          attendanceId: attendance.id,
          studentId: item.studentId,
          status: validStatus,
          note: item.note || null,
        },
      });
    }

    // 4. Auto-Sync to ReportCard (Modul 5 & 9 PRD Integration)
    // Recalculate semester aggregate absences for all students in this class
    const studentIds = records.map((r: any) => r.studentId);
    
    for (const studentId of studentIds) {
      const statusCounts = await prisma.dailyAttendanceRecord.groupBy({
        by: ["status"],
        where: {
          studentId,
          attendance: {
            academicYearId: academicYear.id,
            classId,
          },
        },
        _count: { status: true },
      });

      const countMap: Record<string, number> = {};
      for (const sc of statusCounts) {
        countMap[sc.status] = sc._count.status;
      }

      const sickDays = countMap[AttendanceStatus.SAKIT] || 0;
      const permissionDays = countMap[AttendanceStatus.IZIN] || 0;
      const dispensationDays = countMap[AttendanceStatus.DISPENSASI] || 0;
      const unexcusedDays = countMap[AttendanceStatus.ALPA] || 0;

      await prisma.reportCard.upsert({
        where: {
          studentId_academicYearId: {
            studentId,
            academicYearId: academicYear.id,
          },
        },
        update: {
          sickDays,
          permissionDays,
          dispensationDays,
          unexcusedDays,
        },
        create: {
          studentId,
          classId,
          academicYearId: academicYear.id,
          sickDays,
          permissionDays,
          dispensationDays,
          unexcusedDays,
          behaviorGrade: "Baik",
          status: "DRAFT",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Presensi harian tanggal ${targetDate.toISOString().split("T")[0]} berhasil disimpan dan disinkronkan ke E-Raport.`,
      attendanceId: attendance.id,
      totalStudents: records.length,
    });
  } catch (err: any) {
    console.error("POST /api/attendance/daily error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan data presensi harian", details: err?.message },
      { status: 500 }
    );
  }
}
