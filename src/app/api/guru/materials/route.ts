import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/guru/materials?classId=...&subjectId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");
    const teacherId = searchParams.get("teacherId");

    const whereClause: any = {};
    if (classId) whereClause.classId = classId;
    if (subjectId) whereClause.subjectId = subjectId;
    if (teacherId) whereClause.teacherId = teacherId;

    const materials = await prisma.learningMaterial.findMany({
      where: whereClause,
      include: {
        classRoom: true,
        subject: true,
        teacher: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      materials: materials.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        fileUrl: m.fileUrl,
        className: m.classRoom.name,
        subjectName: m.subject.name,
        teacherName: m.teacher.user.name,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (err: any) {
    console.error("GET /api/guru/materials error:", err);
    return NextResponse.json(
      { error: "Gagal memuat bahan ajar", details: err?.message },
      { status: 500 }
    );
  }
}

// POST /api/guru/materials
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, fileUrl, classId, subjectId, teacherId } = body;

    if (!title || !fileUrl || !classId || !subjectId) {
      return NextResponse.json({ error: "Kolom wajib belum diisi lengkap" }, { status: 400 });
    }

    // Resolve teacher if not provided
    let actualTeacherId = teacherId;
    if (!actualTeacherId) {
      const defaultTeacher = await prisma.teacher.findFirst();
      actualTeacherId = defaultTeacher?.id;
    }

    if (!actualTeacherId) {
      return NextResponse.json({ error: "Data guru pengampu tidak valid" }, { status: 400 });
    }

    const material = await prisma.learningMaterial.create({
      data: {
        title,
        description: description || null,
        fileUrl,
        classId,
        subjectId,
        teacherId: actualTeacherId,
      },
      include: {
        classRoom: true,
        subject: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Bahan ajar '${material.title}' berhasil diunggah.`,
      materialId: material.id,
    });
  } catch (err: any) {
    console.error("POST /api/guru/materials error:", err);
    return NextResponse.json(
      { error: "Gagal mengunggah bahan ajar", details: err?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/guru/materials?id=...
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID materi wajib disertakan" }, { status: 400 });
    }

    await prisma.learningMaterial.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Bahan ajar berhasil dihapus.",
    });
  } catch (err: any) {
    console.error("DELETE /api/guru/materials error:", err);
    return NextResponse.json(
      { error: "Gagal menghapus bahan ajar", details: err?.message },
      { status: 500 }
    );
  }
}
