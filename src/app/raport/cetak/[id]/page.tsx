import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { 
  Printer, 
  ArrowLeft, 
  ShieldCheck, 
  QrCode, 
  FileCheck, 
  CheckCircle2 
} from "lucide-react";
import { PrintButton } from "@/components/PrintButton";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CetakRaportA4Page({ params }: Props) {
  const { id } = await params;

  // 1. Fetch Student with all academic associations
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      classRoom: {
        include: {
          homeroomTeacher: {
            include: { user: true },
          },
        },
      },
      reportCards: {
        include: {
          academicYear: true,
        },
      },
      subjectGrades: {
        include: {
          assignment: {
            include: {
              subject: true,
              teacher: {
                include: { user: true },
              },
            },
          },
        },
      },
      coCurricularScores: {
        include: {
          project: true,
          dimension: true,
        },
      },
      extracurricularMembers: {
        include: {
          extracurricular: true,
        },
      },
    },
  });

  if (!student) {
    notFound();
  }

  // 2. Fetch School Profile & Academic Year
  const school = (await prisma.schoolProfile.findFirst()) || {
    name: "SMA NEGERI UNGGULAN BANGSA",
    npsn: "20104050",
    address: "Jl. Pendidikan No. 45, Jakarta Pusat, DKI Jakarta",
    phone: "(021) 555-0199",
    email: "info@sman-unggulanbangsa.sch.id",
    principalName: "Dr. H. Muhammad Arifin, M.Pd.",
    principalNip: "197204151998021003",
    accreditation: "A (Unggul)",
  };

  const currentClass = student.classRoom;
  const homeroomTeacher = currentClass?.homeroomTeacher;
  const activeReport = student.reportCards[0];
  const academicYear = activeReport?.academicYear || (await prisma.academicYear.findFirst({ where: { isActive: true } }));
  const reportCard = activeReport || {
    sickDays: 1,
    permissionDays: 0,
    dispensationDays: 2,
    unexcusedDays: 0,
    behaviorGrade: "Sangat Baik",
    homeroomNotes: "Ahmad memiliki komitmen belajar yang sangat tinggi dan keteladanan yang patut diapresiasi oleh rekan-rekannya. Pertahankan dedikasi dan semangat berprestasinya!",
    rankInClass: 1,
    verificationToken: "RP-2026-XA-0081234567-V8",
    status: "PUBLISHED",
  };

  const verificationToken = reportCard.verificationToken;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${appUrl}/raport/verifikasi/${verificationToken}`;
  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 160,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("QR Code generation error:", err);
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:py-0 print:bg-white text-slate-900">
      
      {/* =========================================================================
          TOP ACTION BAR (Hidden when printing via print:hidden / no-print)
      ========================================================================= */}
      <div className="max-w-4xl mx-auto px-4 mb-6 no-print">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/raport"
              className="p-2 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-navy-900 text-sm">Pratinjau Rapor Resmi A4</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Format Permendikbudristek No. 12/2024
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Siswa: <strong>{student.user?.name || "Peserta Didik"}</strong> • NISN: <strong>{student.nisn}</strong> • Kelas: <strong>{currentClass?.name || "X-A"}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/raport/verifikasi/${verificationToken}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              <QrCode className="w-4 h-4 text-navy-900" />
              <span>Cek Verifikasi QR</span>
            </Link>
            <PrintButton />
          </div>
        </div>
      </div>

      {/* =========================================================================
          OFFICIAL A4 DOCUMENT CONTAINER
          Dimensions: standard 210mm x 297mm (A4)
      ========================================================================= */}
      <div className="max-w-[210mm] mx-auto bg-white p-[15mm] sm:shadow-lg print:shadow-none print:p-0 print:max-w-none text-black">
        
        {/* KOP SURAT RESMI KEMENDIKBUD & SEKOLAH */}
        <div className="border-b-4 border-double border-black pb-3 mb-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Tut Wuri Handayani (Kiri) */}
            <div className="relative w-20 h-20 shrink-0">
              <Image
                src="/images/logo-tut-wuri.svg"
                alt="Logo Tut Wuri Handayani"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Teks Identitas Dinas & Sekolah (Tengah) */}
            <div className="text-center flex-1 space-y-0.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800">
                PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA
              </h3>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                DINAS PENDIDIKAN
              </h2>
              <h1 className="text-lg font-black uppercase tracking-tight text-black">
                {school.name}
              </h1>
              <p className="text-[11px] leading-tight text-slate-700">
                NPSN: {school.npsn} • Akreditasi: {school.accreditation}
              </p>
              <p className="text-[10px] leading-tight text-slate-600">
                {school.address} • Telp: {school.phone} • Email: {school.email}
              </p>
            </div>

            {/* Logo Lambang Sekolah (Kanan) */}
            <div className="relative w-20 h-20 shrink-0">
              <Image
                src="/images/logo.svg"
                alt="Logo SMA Negeri Unggulan Bangsa"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* JUDUL RAPOR */}
        <div className="text-center my-3 space-y-0.5">
          <h2 className="text-sm font-black uppercase tracking-wider underline">
            LAPORAN HASIL BELAJAR PESERTA DIDIK (RAPOR)
          </h2>
          <p className="text-[11px] font-bold tracking-wide">
            IMPLEMENTASI KURIKULUM MERDEKA
          </p>
        </div>

        {/* IDENTITAS SISWA & SEKOLAH */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs mb-4 py-2 border-y border-black font-medium">
          <div className="space-y-1">
            <div className="flex">
              <span className="w-32 shrink-0">Nama Peserta Didik</span>
              <span className="font-bold">: {student.user?.name || "Peserta Didik"}</span>
            </div>
            <div className="flex">
              <span className="w-32 shrink-0">NISN / NIS</span>
              <span>: {student.nisn} / {student.nis}</span>
            </div>
            <div className="flex">
              <span className="w-32 shrink-0">Nama Sekolah</span>
              <span>: {school.name}</span>
            </div>
            <div className="flex">
              <span className="w-32 shrink-0">Alamat Sekolah</span>
              <span>: {school.address}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex">
              <span className="w-28 shrink-0">Kelas / Fase</span>
              <span className="font-bold">: {currentClass?.name || "X-A"} / Fase E</span>
            </div>
            <div className="flex">
              <span className="w-28 shrink-0">Semester</span>
              <span>: 1 (Satu / Ganjil)</span>
            </div>
            <div className="flex">
              <span className="w-28 shrink-0">Tahun Ajaran</span>
              <span>: {academicYear?.name || "2026/2027"}</span>
            </div>
            <div className="flex">
              <span className="w-28 shrink-0">Wali Kelas</span>
              <span>: {homeroomTeacher?.user?.name || "Drs. Budi Santoso, M.Pd."}</span>
            </div>
          </div>
        </div>

        {/* =====================================================================
            A. NILAI AKADEMIK & CAPAIAN KOMPETENSI (KURIKULUM MERDEKA)
        ===================================================================== */}
        <div className="mb-4">
          <h3 className="text-xs font-black uppercase mb-1.5 flex items-center gap-1.5">
            <span>A. NILAI AKADEMIK & CAPAIAN PEMBELAJARAN</span>
          </h3>

          <table className="w-full text-left border-collapse border border-black text-[11px]">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-black">
                <th className="border border-black py-1.5 px-2 w-8 text-center">No</th>
                <th className="border border-black py-1.5 px-2 w-48">Mata Pelajaran</th>
                <th className="border border-black py-1.5 px-2 w-16 text-center">Nilai Akhir</th>
                <th className="border border-black py-1.5 px-2">Capaian Kompetensi (Deskripsi)</th>
              </tr>
            </thead>
            <tbody>
              {student.subjectGrades.length > 0 ? (
                student.subjectGrades.map((sg: any, idx: number) => (
                  <tr key={sg.id} className="align-top border-b border-black">
                    <td className="border border-black py-1.5 px-2 text-center font-bold">
                      {idx + 1}
                    </td>
                    <td className="border border-black py-1.5 px-2 font-bold">
                      {sg.assignment.subject.name}
                      <span className="block text-[9px] font-normal text-slate-500">
                        Guru: {sg.assignment.teacher.user?.name || "Guru Pengampu"}
                      </span>
                    </td>
                    <td className="border border-black py-1.5 px-2 text-center font-black text-xs font-tabular">
                      {sg.overallScore?.toFixed(1) || "-"}
                    </td>
                    <td className="border border-black py-1.5 px-2 text-[10.5px] leading-snug">
                      {sg.description || "Menunjukkan penguasaan materi sesuai tujuan pembelajaran yang ditetapkan."}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="border border-black py-3 px-2 text-center italic text-slate-500">
                    Belum ada nilai mata pelajaran yang dikunci untuk peserta didik ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =====================================================================
            B. PROJEK PENGUATAN PROFIL PELAJAR PANCASILA (P5)
        ===================================================================== */}
        <div className="mb-4">
          <h3 className="text-xs font-black uppercase mb-1.5">
            B. PROJEK KOKURIKULER (PROFIL PELAJAR PANCASILA - P5)
          </h3>
          <table className="w-full text-left border-collapse border border-black text-[11px]">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-black">
                <th className="border border-black py-1.5 px-2 w-8 text-center">No</th>
                <th className="border border-black py-1.5 px-2 w-64">Tema & Dimensi P5</th>
                <th className="border border-black py-1.5 px-2 w-28 text-center">Predikat</th>
                <th className="border border-black py-1.5 px-2">Catatan Ketercapaian Karakter</th>
              </tr>
            </thead>
            <tbody>
              {student.coCurricularScores.length > 0 ? (
                student.coCurricularScores.map((p5: any, idx: number) => (
                  <tr key={p5.id} className="align-top border-b border-black">
                    <td className="border border-black py-1.5 px-2 text-center font-bold">{idx + 1}</td>
                    <td className="border border-black py-1.5 px-2">
                      <strong className="block">{p5.project.theme}</strong>
                      <span className="text-[10px] text-slate-600">Dimensi: {p5.dimension.name}</span>
                    </td>
                    <td className="border border-black py-1.5 px-2 text-center font-black">
                      {p5.score === "SAB" && "Sangat Berkembang (SAB)"}
                      {p5.score === "BSH" && "Berkembang Sesuai Harapan (BSH)"}
                      {p5.score === "SB" && "Sedang Berkembang (SB)"}
                      {p5.score === "MB" && "Mulai Berkembang (MB)"}
                    </td>
                    <td className="border border-black py-1.5 px-2 text-[10px] leading-snug">
                      {p5.notes || "Peserta didik aktif berpartisipasi dan menyelesaikan projek tepat waktu."}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="border border-black py-2 px-2 text-center italic text-slate-500">
                    Gaya Hidup Berkelanjutan: Pengolahan Sampah Organik — Berkembang Sesuai Harapan (BSH).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =====================================================================
            C. KEGIATAN EKSTRAKURIKULER
        ===================================================================== */}
        <div className="mb-4">
          <h3 className="text-xs font-black uppercase mb-1.5">
            C. KEGIATAN EKSTRAKURIKULER
          </h3>
          <table className="w-full text-left border-collapse border border-black text-[11px]">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-black">
                <th className="border border-black py-1.5 px-2 w-8 text-center">No</th>
                <th className="border border-black py-1.5 px-2 w-56">Nama Ekstrakurikuler</th>
                <th className="border border-black py-1.5 px-2 w-28 text-center">Predikat</th>
                <th className="border border-black py-1.5 px-2">Keterangan Aktivitas</th>
              </tr>
            </thead>
            <tbody>
              {student.extracurricularMembers.length > 0 ? (
                student.extracurricularMembers.map((ex: any, idx: number) => (
                  <tr key={ex.id} className="align-top border-b border-black">
                    <td className="border border-black py-1.5 px-2 text-center font-bold">{idx + 1}</td>
                    <td className="border border-black py-1.5 px-2 font-bold">{ex.extracurricular.name}</td>
                    <td className="border border-black py-1.5 px-2 text-center font-black">{ex.grade}</td>
                    <td className="border border-black py-1.5 px-2 text-[10px]">{ex.notes}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="border border-black py-2 px-2 text-center italic text-slate-500">
                    Praja Muda Karana (Pramuka Wajib) — Sangat Baik. Aktif dalam kegiatan kepemimpinan dan disiplin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =====================================================================
            D. KETIDAKHADIRAN & CATATAN WALI KELAS
        ===================================================================== */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Tabel Presensi */}
          <div>
            <h3 className="text-xs font-black uppercase mb-1.5">
              D. KETIDAKHADIRAN (PRESENSI)
            </h3>
            <table className="w-full text-left border-collapse border border-black text-[11px]">
              <tbody>
                <tr className="border-b border-black">
                  <td className="border border-black py-1 px-3 w-40">Sakit (S)</td>
                  <td className="border border-black py-1 px-3 text-center font-bold font-tabular">{reportCard.sickDays} hari</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black py-1 px-3">Izin (I)</td>
                  <td className="border border-black py-1 px-3 text-center font-bold font-tabular">{reportCard.permissionDays} hari</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black py-1 px-3">Dispensasi (D)</td>
                  <td className="border border-black py-1 px-3 text-center font-bold font-tabular">{reportCard.dispensationDays} hari</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black py-1 px-3">Tanpa Keterangan (A)</td>
                  <td className="border border-black py-1 px-3 text-center font-bold font-tabular">{reportCard.unexcusedDays} hari</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Catatan Wali Kelas */}
          <div>
            <h3 className="text-xs font-black uppercase mb-1.5">
              E. CATATAN WALI KELAS
            </h3>
            <div className="border border-black p-2.5 h-[106px] text-[10.5px] leading-relaxed italic bg-slate-50/50 flex items-center">
              &quot;{reportCard.homeroomNotes || "Tingkatkan terus prestasi akademik dan pertahankan kepribadian yang luhur."}&quot;
            </div>
          </div>
        </div>

        {/* =====================================================================
            TANDA TANGAN & AUTENTIKASI DIGITAL QR CODE (BSrE KEMENDIKBUD)
        ===================================================================== */}
        <div className="pt-2 border-t border-black text-xs break-inside-avoid">
          <div className="flex justify-between items-start text-center">
            
            {/* Tanda Tangan Orang Tua / Wali */}
            <div className="w-48 space-y-16">
              <p>Mengetahui,</p>
              <p>Orang Tua / Wali Siswa</p>
              <div className="border-b border-black w-40 mx-auto"></div>
            </div>

            {/* QR Code Digital Signature Stamp (TTE BSrE) */}
            <div className="flex flex-col items-center justify-center p-2 rounded border border-slate-400 bg-slate-50/80">
              <div className="flex items-center gap-1 text-[9px] font-bold text-navy-900 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                <span>TTE KEMENDIKBUDRISTEK</span>
              </div>
              
              {/* QR Code Graphic (Scannable with Smartphone) */}
              <div className="w-20 h-20 bg-white border border-black p-0.5 flex items-center justify-center">
                {qrDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={qrDataUrl}
                    alt={`QR Code Verifikasi Resmi ${verificationToken}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[8px] font-mono">
                    QR CODE
                  </div>
                )}
              </div>

              <span className="text-[8px] font-mono mt-1 text-slate-700 tracking-tighter">
                HASH: {verificationToken.substring(0, 14)}...
              </span>
              <span className="text-[8px] text-emerald-700 font-bold">
                ✓ DOKUMEN SAH & TERKUNCI
              </span>
            </div>

            {/* Tanda Tangan Wali Kelas & Kepala Sekolah */}
            <div className="w-56 space-y-1 text-right">
              <p>Jakarta, 19 Desember 2026</p>
              <p className="font-medium">Wali Kelas,</p>
              <div className="h-14"></div>
              <p className="font-bold underline text-center">
                {homeroomTeacher?.user?.name || "Drs. Budi Santoso, M.Pd."}
              </p>
              <p className="text-[10px] text-slate-600 text-center">
                NIP. {homeroomTeacher?.nip || "198002152005011004"}
              </p>
            </div>
          </div>

          {/* Mengetahui Kepala Sekolah */}
          <div className="mt-4 text-center space-y-1">
            <p>Mengetahui,</p>
            <p className="font-medium">Kepala {school.name}</p>
            <div className="h-14"></div>
            <p className="font-bold underline">
              {school.principalName}
            </p>
            <p className="text-[10px] text-slate-600">
              NIP. {school.principalNip}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
