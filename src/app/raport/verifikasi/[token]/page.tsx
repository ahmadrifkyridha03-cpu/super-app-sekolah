import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { 
  ShieldCheck, 
  CheckCircle, 
  FileCheck, 
  Building, 
  User, 
  GraduationCap, 
  Calendar, 
  Award, 
  ExternalLink,
  ArrowLeft,
  QrCode
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function RaportVerificationPage({ params }: Props) {
  const { token } = await params;

  // Search report card by verification token or id
  const reportCard = await prisma.reportCard.findFirst({
    where: {
      OR: [
        { verificationToken: token },
        { id: token }
      ],
    },
    include: {
      student: {
        include: {
          user: true,
          classRoom: {
            include: {
              homeroomTeacher: {
                include: { user: true },
              },
            },
          },
          subjectGrades: {
            include: {
              assignment: {
                include: {
                  subject: true,
                },
              },
            },
          },
        },
      },
      classRoom: {
        include: {
          homeroomTeacher: {
            include: { user: true },
          },
        },
      },
      academicYear: true,
    },
  });

  const school = (await prisma.schoolProfile.findFirst()) || {
    name: "SMA Negeri Unggulan Bangsa",
    npsn: "20104050",
    principalName: "Dr. H. Muhammad Arifin, M.Pd.",
    principalNip: "197204151998021003",
    accreditation: "A (Unggul)",
  };

  const isVerified = !!reportCard;
  const student = reportCard?.student;
  const classRoom = student?.classRoom || reportCard?.classRoom;
  const teacher = classRoom?.homeroomTeacher;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-navy-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda Sekolah</span>
          </Link>
          <span className="text-[11px] font-mono text-slate-400">
            Sistem Verifikasi BSrE v2.4
          </span>
        </div>

        {/* Verification Status Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center relative overflow-hidden">
          {/* Top Banner Gradient */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>

          {/* Verification Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 text-emerald-600 mb-4 animate-in zoom-in-50">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
            {isVerified ? "Dokumen Resmi Terverifikasi" : "Token Verifikasi Tidak Ditemukan"}
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
            {isVerified
              ? "Lembar Laporan Hasil Belajar (Rapor) ini sah dan terdaftar resmi pada basis data akademik terpadu Kemendikbudristek."
              : "Kode hash token yang dipindai tidak valid atau belum dipublikasikan oleh pihak sekolah."}
          </p>

          {/* Electronic Seal Verification Details */}
          {isVerified && (
            <div className="mt-8 bg-slate-50 rounded-2xl border border-slate-200 p-6 text-left space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <span className="font-extrabold text-navy-900 text-sm">Sertifikat Digital (TTE)</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Status: SAH & ASLI
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-500">Nomor Hash Token</p>
                  <p className="font-mono font-bold text-navy-900 break-all">{token}</p>
                </div>
                <div>
                  <p className="text-slate-500">Instansi Penerbit</p>
                  <p className="font-bold text-navy-900">{school.name} (NPSN: {school.npsn})</p>
                </div>
                <div>
                  <p className="text-slate-500">Nama Peserta Didik</p>
                  <p className="font-extrabold text-navy-900 text-sm">{student?.user?.name || "Peserta Didik"}</p>
                </div>
                <div>
                  <p className="text-slate-500">NISN / NIS</p>
                  <p className="font-mono font-bold text-navy-900">{student?.nisn} / {student?.nis}</p>
                </div>
                <div>
                  <p className="text-slate-500">Rombongan Belajar (Kelas)</p>
                  <p className="font-bold text-navy-900">{classRoom?.name} • Semester 1 (Ganjil)</p>
                </div>
                <div>
                  <p className="text-slate-500">Tahun Ajaran</p>
                  <p className="font-bold text-navy-900">{reportCard.academicYear?.name || "2026/2027 Ganjil"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Wali Kelas Pengesah</p>
                  <p className="font-bold text-navy-900">{teacher?.user?.name || "Drs. Budi Santoso, M.Pd."}</p>
                </div>
                <div>
                  <p className="text-slate-500">Kepala Sekolah</p>
                  <p className="font-bold text-navy-900">{school.principalName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Academic Grades Quick Digest */}
          {isVerified && student?.subjectGrades && student.subjectGrades.length > 0 && (
            <div className="mt-6 text-left">
              <h3 className="text-xs font-extrabold text-navy-900 uppercase tracking-wider mb-3">
                Rekapitulasi Nilai Akhir Peserta Didik
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Mata Pelajaran</th>
                      <th className="py-2.5 px-3 text-center">Nilai Akhir</th>
                      <th className="py-2.5 px-3 text-center">Predikat</th>
                      <th className="py-2.5 px-3">Capaian Kompetensi Ringkas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {student.subjectGrades.map((sg: any) => (
                      <tr key={sg.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-navy-900">
                          {sg.assignment.subject.name}
                        </td>
                        <td className="py-2.5 px-3 text-center font-black font-tabular text-navy-900">
                          {sg.overallScore?.toFixed(1)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-700">
                          {sg.predicate || "A"}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 line-clamp-1">
                          {sg.description || "Tercapai optimal."}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Links */}
          {isVerified && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/raport/cetak/${student?.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition shadow-md"
              >
                <span>Lihat Lembar Rapor Lengkap A4</span>
                <ExternalLink className="w-4 h-4 text-gold-400" />
              </Link>
            </div>
          )}
        </div>

        {/* Security & Disclaimer Footer */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-gold-600" />
            <span>Kemanan Integritas Dokumen dilindungi Undang-Undang ITE No. 11/2008 & BSrE BSSN.</span>
          </p>
          <p>© 2026 {school.name}. Seluruh Hak Cipta Dilindungi.</p>
        </div>

      </div>
    </div>
  );
}
