import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  Eye,
  Key,
  Calendar
} from "lucide-react";

export const revalidate = 0;

export default async function CbtHubPage() {
  const exams = await prisma.exam.findMany({
    include: {
      subject: true,
      teacher: { include: { user: true } },
      _count: { select: { examQuestions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get active demo student session
  const student = await prisma.student.findFirst({
    where: { nisn: "0081234567" },
    include: { user: true, classRoom: true },
  });

  const session = await prisma.examSession.findFirst({
    where: { studentId: student?.id },
    include: { exam: true },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">
            Computer Based Test (CBT) Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight mt-1">
            Pusat Pelaksanaan Ujian Berbasis Komputer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dilengkapi sistem anti-curang, rendering formula LaTeX KaTeX, autosave atomik, dan monitoring proktor real-time.
          </p>
        </div>

        <Link
          href="/cbt/proctor"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition shadow-sm"
        >
          <Eye className="w-4 h-4 text-gold-400" />
          <span>Ruang Pengawas / Proktor Monitor</span>
        </Link>
      </div>

      {/* Student Active Session Card */}
      {session && (
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-gold-500 text-navy-950 uppercase tracking-wider">
              Sesi Ujian Siswa Aktif
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">{session.exam.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gold-400" />
                Durasi: {session.exam.durationMinutes} Menit
              </span>
              <span className="flex items-center gap-1.5">
                <Key className="w-4 h-4 text-gold-400" />
                Token: <strong className="font-mono text-white font-bold">{session.exam.token}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Peringatan Pindah Tab: {session.tabSwitchCount}/3
              </span>
            </div>
          </div>

          <Link
            href={`/cbt/exam/${session.id}`}
            className="px-6 py-3.5 rounded-xl bg-gold-600 hover:bg-gold-500 text-white font-extrabold text-sm transition shadow-lg shrink-0 flex items-center gap-2"
          >
            <span>Lanjutkan Mengerjakan Ujian</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Available Exam Packages */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-navy-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-gold-600" />
          <span>Daftar Paket Ujian Terjadwal</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-navy-50 text-navy-900 border border-navy-200">
                    {exam.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Key className="w-3.5 h-3.5 text-gold-600" />
                    <span>TOKEN: {exam.token}</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-navy-900">{exam.title}</h3>

                <div className="space-y-1 text-xs text-slate-600">
                  <p>Mata Pelajaran: <strong>{exam.subject.name}</strong></p>
                  <p>Guru Penguji: <strong>{exam.teacher.user.name}</strong></p>
                  <p>Jumlah Soal: <strong>{exam._count.examQuestions} Butir Soal</strong></p>
                  <p>Durasi Pengerjaan: <strong>{exam.durationMinutes} Menit</strong></p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Siap Dikerjakan
                </span>
                {session ? (
                  <Link
                    href={`/cbt/exam/${session.id}`}
                    className="px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition"
                  >
                    Buka Sesi Ujian
                  </Link>
                ) : (
                  <button className="px-4 py-2 rounded-lg bg-slate-200 text-slate-600 font-bold text-xs cursor-not-allowed">
                    Belum Dimulai
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CBT Anti-Cheat Guide Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-xs text-amber-900 space-y-2">
        <h4 className="font-bold flex items-center gap-2 text-sm text-amber-950">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Tata Tertib Ujian Berbasis Komputer (CBT Anti-Cheat Rules)</span>
        </h4>
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          <li>Dilarang membuka tab, jendela baru, atau aplikasi lain selama ujian berlangsung.</li>
          <li>Setiap perpindahan tab/jendela dicatat secara otomatis oleh sistem proktor.</li>
          <li>Pelanggaran sebanyak 3 kali akan mengunci sesi pengerjaan ujian secara otomatis (*LOCKED*).</li>
          <li>Ujian yang terkunci hanya dapat dibuka kembali atas izin guru pengawas/proktor.</li>
        </ul>
      </div>
    </div>
  );
}
