import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Printer, 
  FileText, 
  Award, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  ExternalLink
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SiswaPortalPage() {
  // 1. Fetch Ahmad Fauzi (Default demo student)
  const student = await prisma.student.findFirst({
    where: { nisn: "0081234567" },
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
      examSessions: {
        include: {
          exam: {
            include: {
              subject: true,
            },
          },
        },
        orderBy: { startTime: "desc" },
      },
    },
  });

  const currentClass = student?.classRoom;
  const teacher = currentClass?.homeroomTeacher;
  const reportCard = student?.reportCards[0];
  const activeSession = student?.examSessions.find(
    (s: any) => s.status === "IN_PROGRESS" || s.status === "NOT_STARTED"
  );

  // Fetch dynamic learning materials for this student's class
  const materials = await prisma.learningMaterial.findMany({
    where: { classId: student?.classId },
    include: {
      subject: true,
      teacher: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Calculate dynamic attendance percentage
  const sick = reportCard?.sickDays || 0;
  const permission = reportCard?.permissionDays || 0;
  const dispensation = reportCard?.dispensationDays || 0;
  const unexcused = reportCard?.unexcusedDays || 0;
  const totalAbsent = sick + permission + dispensation + unexcused;
  const totalEffectiveDays = 100; // Standar hari efektif semester
  const attendanceRate = Math.max(0, 100 - (totalAbsent / totalEffectiveDays) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-800/80 border border-navy-700 text-gold-400 text-xs font-bold">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Portal Peserta Didik Aktif</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Halo, {student?.user?.name || "Ahmad Fauzi Pratama"}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                NISN: <span className="font-mono text-gold-300 font-bold">{student?.nisn}</span> • 
                Kelas: <span className="font-bold text-white">{currentClass?.name || "X-A"}</span> (Fase E) • 
                Wali Kelas: <span className="text-slate-200">{teacher?.user?.name || "Drs. Budi Santoso, M.Pd."}</span>
              </p>
            </div>

            {/* Quick action: Print Report Card */}
            {student && (
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/raport/cetak/${student.id}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs transition shadow-lg hover:shadow-xl active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Buka E-Raport Resmi A4</span>
                </Link>
              </div>
            )}
          </div>

          {/* Decorative Background Elements */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-gold-500/10 blur-3xl pointer-events-none"></div>
        </div>

        {/* Quick Highlights Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Rata-Rata Nilai</span>
              <Award className="w-4 h-4 text-gold-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-navy-900 font-tabular">89.8</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Predikat A
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Peringkat 1 di Kelas X-A</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Kehadiran Presensi</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-navy-900 font-tabular">{attendanceRate}%</span>
              <span className="text-xs font-bold text-slate-600 font-tabular">
                S:{sick} I:{permission} D:{dispensation} A:{unexcused}
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              {unexcused === 0 ? "Disiplin Sangat Baik (Tanpa Alpa)" : `${unexcused} Kali Alpa`}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Ujian CBT Aktif</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600 font-tabular">
                {activeSession ? "1" : "0"}
              </span>
              <span className="text-xs font-semibold text-slate-600">Sesi Terbuka</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {activeSession ? activeSession.exam.title : "Tidak ada ujian berjalan"}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Verifikasi BSrE</span>
              <ShieldCheck className="w-4 h-4 text-navy-900" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-black text-emerald-600">TERTANDATANGANI</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">QR Hash Valid & Terkunci</p>
          </div>
        </div>

        {/* Active CBT Exam Alert Card */}
        {activeSession && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 text-xs font-black uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-800" />
                  <span>Ujian Komputer Sedang Berlangsung</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-navy-950">
                  {activeSession.exam.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-700">
                  Mata Pelajaran: <strong>{activeSession.exam.subject.name}</strong> • 
                  Durasi: <strong>{activeSession.exam.durationMinutes} Menit</strong> • 
                  Status Pengerjaan: <strong className="text-amber-800 uppercase">{activeSession.status}</strong>
                </p>
              </div>

              <Link
                href={`/cbt/exam/${activeSession.id}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-extrabold text-xs transition shadow-lg hover:shadow-xl active:scale-95"
              >
                <span>Masuk & Lanjutkan Ujian CBT</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </Link>
            </div>
          </div>
        )}

        {/* Academic Grades Table & Schedule Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Nilai Mata Pelajaran (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-navy-900">
                  Ringkasan Nilai Mata Pelajaran
                </h2>
                <p className="text-xs text-slate-500">
                  Semester Ganjil 2026/2027 • Berdasarkan Asesmen Formatif & Sumatif
                </p>
              </div>
              <Link
                href={student ? `/raport/cetak/${student.id}` : "#"}
                className="text-xs font-bold text-navy-800 hover:text-gold-600 flex items-center gap-1 transition"
              >
                <span>Lihat Format A4 Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-3">Mata Pelajaran</th>
                    <th className="py-3 px-3 text-center">KKTP</th>
                    <th className="py-3 px-3 text-center">Nilai Akhir</th>
                    <th className="py-3 px-3 text-center">Predikat</th>
                    <th className="py-3 px-3">Capaian Kompetensi (Narasi)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {student?.subjectGrades && student.subjectGrades.length > 0 ? (
                    student.subjectGrades.map((sg: any) => (
                      <tr key={sg.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-3">
                          <p className="font-bold text-navy-900">{sg.assignment.subject.name}</p>
                          <p className="text-[10px] text-slate-500">Pengampu: {sg.assignment.teacher.user?.name || "Guru Mapel"}</p>
                        </td>
                        <td className="py-3.5 px-3 text-center font-tabular text-slate-600">
                          {sg.assignment.subject.kktp.toFixed(0)}
                        </td>
                        <td className="py-3.5 px-3 text-center font-black font-tabular text-sm text-navy-900">
                          {sg.overallScore?.toFixed(1)}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full font-black text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {sg.predicate || "A"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 text-[11px] leading-relaxed max-w-xs">
                          {sg.description}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 italic">
                        Belum ada nilai yang dipublikasikan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side Column: Jadwal & Materi Belajar */}
          <div className="space-y-6">
            
            {/* Jadwal Pelajaran Hari Ini */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Calendar className="w-4 h-4 text-navy-900" />
                <h3 className="font-black text-navy-900 text-sm">Jadwal Kelas {currentClass?.name || "X-A"} Hari Ini</h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="px-2 py-1 bg-navy-100 text-navy-900 font-mono text-[10px] font-bold rounded">
                    07:30 - 09:00
                  </span>
                  <div>
                    <p className="text-xs font-bold text-navy-900">Matematika Peminatan</p>
                    <p className="text-[11px] text-slate-500">Pak Drs. Budi Santoso, M.Pd. • R.101</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="px-2 py-1 bg-navy-100 text-navy-900 font-mono text-[10px] font-bold rounded">
                    09:15 - 11:30
                  </span>
                  <div>
                    <p className="text-xs font-bold text-navy-900">Fisika Dinamika Gerak</p>
                    <p className="text-[11px] text-slate-500">Pak Irwan Setiawan, M.Si. • Lab Fisika</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="px-2 py-1 bg-navy-100 text-navy-900 font-mono text-[10px] font-bold rounded">
                    12:30 - 14:00
                  </span>
                  <div>
                    <p className="text-xs font-bold text-navy-900">Bahasa Indonesia</p>
                    <p className="text-[11px] text-slate-500">Bu Siti Rahmawati, S.Pd. • R.101</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Unduhan Bahan Ajar & Tugas */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <FileText className="w-4 h-4 text-gold-600" />
                <h3 className="font-black text-navy-900 text-sm">Bahan Ajar & Modul Belajar</h3>
              </div>

              <div className="space-y-2">
                {materials.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Belum ada bahan ajar digital yang dibagikan guru kelas.
                  </p>
                ) : (
                  materials.map((mat) => (
                    <a
                      key={mat.id}
                      href={mat.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-xs text-navy-900 font-semibold"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div>{mat.title}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {mat.subject.name} • {mat.teacher.user.name}
                          </div>
                        </div>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  ))
                )}

                <a
                  href="/templates/template_siswa.xlsx"
                  download
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-xs text-slate-600 font-semibold border-t border-slate-100 mt-2"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Format Biodata Siswa (.xlsx)
                  </span>
                  <span className="text-[10px] text-slate-400">Unduh</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
