import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET /api/attendance/subject?assignmentId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json({ error: "Parameter assignmentId wajib disertakan" }, { status: 400 });
    }

    const assignment = await prisma.teachingAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        subject: true,
        classRoom: {
          include: {
            students: {
              where: { status: "ACTIVE" },
              include: { user: true },
              orderBy: { nisn: "asc" },
            },
          },
        },
        subjectAttendanceSessions: {
          orderBy: { date: "desc" },
          include: {
            records: {
              include: {
                student: { include: { user: true } },
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Penugasan mengajar tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      assignment: {
        id: assignment.id,
        subjectName: assignment.subject.name,
        className: assignment.classRoom.name,
        students: assignment.classRoom.students.map((s) => ({
          studentId: s.id,
          name: s.user.name,
          nisn: s.nisn,
        })),
        sessions: assignment.subjectAttendanceSessions.map((session) => ({
          id: session.id,
          date: session.date.toISOString().split("T")[0],
          topic: session.topic || "Materi Pembelajaran",
          totalHadir: session.records.filter((r) => r.status === AttendanceStatus.HADIR).length,
          totalSiswa: session.records.length,
          records: session.records.map((r) => ({
            studentId: r.studentId,
            name: r.student.user.name,
            status: r.status,
            note: r.note,
          })),
        })),
      },
    });
  } catch (err: any) {
    console.error("GET /api/attendance/subject error:", err);
    return NextResponse.json(
      { error: "Gagal memuat sesi presensi mata pelajaran", details: err?.message },
      { status: 500 }
    );
  }
}

// POST /api/attendance/subject
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { assignmentId, date: dateStr, topic, records } = body;

    if (!assignmentId || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: "Payload tidak lengkap" }, { status: 400 });
    }

    const targetDate = dateStr 
      ? new Date(`${dateStr}T00:00:00.000Z`) 
      : new Date(new Date().toISOString().split("T")[0] + "T00:00:00.000Z");

    // 1. Create SubjectAttendanceSession
    const session = await prisma.subjectAttendanceSession.create({
      data: {
        assignmentId,
        date: targetDate,
        topic: topic || "Pertemuan Pembelajaran",
        records: {
          create: records.map((r: any) => ({
            studentId: r.studentId,
            status: Object.values(AttendanceStatus).includes(r.status)
              ? (r.status as AttendanceStatus)
              : AttendanceStatus.HADIR,
            note: r.note || null,
          })),
        },
      },
      include: {
        records: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Presensi sesi mata pelajaran '${topic || "Materi"}' berhasil disimpan.`,
      sessionId: session.id,
      totalRecorded: session.records.length,
    });
  } catch (err: any) {
    console.error("POST /api/attendance/subject error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan sesi presensi mata pelajaran", details: err?.message },
      { status: 500 }
    );
  }
}
