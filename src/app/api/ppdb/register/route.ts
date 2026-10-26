import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, nisn, birthDate, originSchool, targetMajor, parentName, parentPhone } = body;

    if (!fullName || !nisn || !birthDate || !originSchool || !parentName || !parentPhone) {
      return NextResponse.json({ error: "Seluruh kolom wajib diisi lengkap" }, { status: 400 });
    }

    // Generate Registration Number
    const count = await prisma.ppdbRegistration.count();
    const regNo = `PPDB-2026-${(count + 1).toString().padStart(4, "0")}`;

    const registration = await prisma.ppdbRegistration.create({
      data: {
        registrationNo: regNo,
        fullName,
        nisn,
        birthDate: new Date(birthDate),
        originSchool,
        targetMajor: targetMajor || "MIPA",
        parentName,
        parentPhone,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      registrationNo: registration.registrationNo,
      fullName: registration.fullName,
      createdAt: registration.createdAt,
    });
  } catch (err: any) {
    console.error("PPDB Error:", err);
    return NextResponse.json({ error: "Gagal memproses pendaftaran PPDB" }, { status: 500 });
  }
}
