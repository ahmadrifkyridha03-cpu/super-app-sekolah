import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { 
  GraduationCap, 
  Printer, 
  CheckCircle, 
  Clock, 
  Search, 
  QrCode, 
  Award, 
  FileSpreadsheet, 
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  User,
  School
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RaportDashboardPage() {
  const academicYear = await prisma.academicYear.findFirst({
    where: { isActive: true },
  });

  const classXA = await prisma.classRoom.findFirst({
    where: { name: "X-A" },
    include: {
      homeroomTeacher: {
        include: { user: true },
      },
      students: {
        include: {
          user: true,
          reportCards: true,
          subjectGrades: true,
        },
      },
    },
  });

  // Fetch all students in class X-A
  const students = (classXA?.students || []).map((st: any) => ({
    ...st,
    name: st.user?.name || "Peserta Didik",
  }));

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb & Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gold-600 uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                <span>Modul E-Raport Kurikulum Merdeka</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                Rekapitulasi & Penerbitan Rapor Siswa
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl">
                Tahun Ajaran <span className="font-semibold text-navy-800">{academicYear?.name || "2026/2027 Ganjil"}</span> • 
                Kelas <span className="font-semibold text-navy-800">X-A</span> • 
                Wali Kelas: <span className="font-semibold text-navy-800">{classXA?.homeroomTeacher?.user?.name || "Drs. Budi Santoso, M.Pd."}</span>
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/templates/template_siswa.xlsx"
                download
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Unduh Leger Nilai</span>
              </a>
              <Link
                href={students[0] ? `/raport/cetak/${students[0].id}` : "#"}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 transition shadow-md hover:shadow-lg"
              >
                <Printer className="w-4 h-4 text-gold-400" />
                <span>Cetak Rapor A4 (Contoh Ahmad)</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Peserta Didik</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-navy-900 font-tabular">{students.length}</span>
                <span className="text-xs text-slate-600 font-medium">Siswa di Rombel</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rata-Rata Kelas</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-navy-900 font-tabular">87.8</span>
                <span className="text-xs text-emerald-600 font-bold flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Di atas KKTP
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanda Tangan Elektronik</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-600 font-tabular">2 / {students.length}</span>
                <span className="text-xs text-slate-600 font-medium">Telah Terkunci</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verifikasi BSrE</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xs font-extrabold text-navy-900 bg-gold-100 px-2 py-1 rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-700" /> QR Code Aktif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Table & Rapor Generation List */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-navy-900">
                Daftar Hasil Belajar Peserta Didik
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih siswa untuk melihat pratinjau halaman rapor, narasi capaian pembelajaran, atau cetak A4
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama / NISN..."
                  className="pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-600 w-48 sm:w-64"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Nama Siswa & Identitas</th>
                  <th className="py-3.5 px-4 text-center">Peringkat</th>
                  <th className="py-3.5 px-4 text-center">Rata-Rata</th>
                  <th className="py-3.5 px-4 text-center">Presensi (S/I/D/A)</th>
                  <th className="py-3.5 px-4 text-center">Status Rapor</th>
                  <th className="py-3.5 px-4 text-right">Aksi Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {students.map((st: any, idx: number) => {
                  const report = st.reportCards[0];
                  const isPublished = report?.status === "PUBLISHED";
                  const rank = report?.rankInClass || idx + 1;
                  const avgScore = idx === 0 ? "89.8" : idx === 1 ? "87.5" : idx === 2 ? "84.2" : "82.5";
                  const attendanceStr = report 
                    ? `${report.sickDays} / ${report.permissionDays} / ${report.dispensationDays} / ${report.unexcusedDays}`
                    : "0 / 0 / 0 / 0";

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-4 text-center text-xs font-bold text-slate-400 font-tabular">
                        {idx + 1}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-navy-100 text-navy-800 font-black text-xs flex items-center justify-center shrink-0">
                            {st.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-navy-900 hover:text-gold-600 transition">
                              {st.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              NISN: <span className="font-mono">{st.nisn}</span> • NIS: <span className="font-mono">{st.nis}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-navy-50 text-navy-800 border border-navy-200">
                          <Award className="w-3.5 h-3.5 text-gold-500" />
                          #{rank}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm font-extrabold text-navy-900 font-tabular">
                          {avgScore}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-xs font-mono text-slate-600 font-tabular">
                        {attendanceStr}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Diterbitkan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" /> Draft Verifikasi
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        {report?.verificationToken && (
                          <Link
                            href={`/raport/verifikasi/${report.verificationToken}`}
                            title="Verifikasi QR Keaslian"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-navy-900 hover:bg-slate-100 text-xs font-semibold transition"
                          >
                            <QrCode className="w-3.5 h-3.5 text-navy-700" />
                            <span className="hidden sm:inline">QR Hash</span>
                          </Link>
                        )}
                        <Link
                          href={`/raport/cetak/${st.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition shadow-sm"
                        >
                          <Printer className="w-3.5 h-3.5 text-gold-400" />
                          <span>Cetak A4</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Instructions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Rapor dengan status <strong>Diterbitkan</strong> telah dibubuhi QR Code TTE resmi Kemendikbudristek.</span>
            </div>
            <p className="font-semibold text-navy-900">
              Standar Format: Permendikbudristek No. 12 Tahun 2024 (Kurikulum Merdeka)
            </p>
          </div>
        </div>

        {/* Kurikulum Merdeka Principles Info Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-extrabold text-navy-900 text-base">Deskripsi Ketercapaian TP</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nilai angka wajib disertai narasi deskriptif yang menggambarkan kompetensi tertinggi yang tercapai serta indikator yang masih memerlukan bimbingan khusus.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-extrabold text-navy-900 text-base">Projek Kokurikuler (P5)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Penilaian dimensi Profil Pelajar Pancasila dinilai secara holistik dengan predikat (MB, SB, BSH, SAB) terpisah dari penilaian mata pelajaran intrakurikuler.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-extrabold text-navy-900 text-base">Autentikasi Digital QR Code</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Setiap lembar rapor dilengkapi QR Code bertanda tangan elektronik digital hash yang dapat dipindai oleh universitas atau dinas untuk memverifikasi keaslian nilai.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
