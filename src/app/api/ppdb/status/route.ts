import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { registrationNo, birthDate } = await req.json();

    if (!registrationNo || !birthDate) {
      return NextResponse.json(
        { error: "Nomor Registrasi dan Tanggal Lahir wajib diisi" },
        { status: 400 }
      );
    }

    const reg = await prisma.ppdbRegistration.findUnique({
      where: { registrationNo },
    });

    if (!reg) {
      return NextResponse.json(
        { error: "Data pendaftaran tidak ditemukan. Periksa kembali nomor registrasi Anda." },
        { status: 404 }
      );
    }

    // Verify 2FA birth date
    const inputDate = new Date(birthDate).toISOString().split("T")[0];
    const storedDate = new Date(reg.birthDate).toISOString().split("T")[0];

    if (inputDate !== storedDate) {
      return NextResponse.json(
        { error: "Tanggal lahir tidak sesuai dengan nomor registrasi." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        registrationNo: reg.registrationNo,
        fullName: reg.fullName,
        nisn: reg.nisn,
        originSchool: reg.originSchool,
        targetMajor: reg.targetMajor,
        status: reg.status,
        notes: reg.notes,
        createdAt: reg.createdAt,
      },
    });
  } catch (err: any) {
    console.error("PPDB Status check error:", err);
    return NextResponse.json({ error: "Gagal memeriksa status" }, { status: 500 });
  }
}
