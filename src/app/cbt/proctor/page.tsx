import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { 
  Eye, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Users, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  ArrowLeft,
  Key,
  RefreshCw
} from "lucide-react";
import ProctorClientActions from "./ProctorClientActions";

export const revalidate = 0;

export default async function ProctorMonitorPage() {
  const exam = await prisma.exam.findFirst({
    include: {
      subject: true,
      teacher: { include: { user: true } },
      _count: { select: { examQuestions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const sessions = await prisma.examSession.findMany({
    where: { examId: exam?.id },
    include: {
      student: {
        include: {
          user: true,
          classRoom: true,
        },
      },
      answers: true,
    },
    orderBy: { startTime: "asc" },
  });

  const totalSessions = sessions.length;
  const activeSessions = sessions.filter((s) => s.status === "IN_PROGRESS").length;
  const lockedSessions = sessions.filter((s) => s.status === "LOCKED").length;
  const submittedSessions = sessions.filter((s) => s.status === "SUBMITTED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <Link
            href="/cbt"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-navy-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Menu CBT</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Ruang Monitor Pengawas & Proktor
            </h1>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Paket Ujian: <strong className="text-navy-900">{exam?.title}</strong> ({exam?.subject.name}) • Token: <strong className="font-mono text-gold-700 font-bold">{exam?.token}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={undefined}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* Proctor Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500">Total Peserta Terdaftar</div>
          <div className="text-3xl font-black text-navy-900 font-tabular">{totalSessions}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500">Sedang Mengerjakan</div>
          <div className="text-3xl font-black text-emerald-600 font-tabular">{activeSessions}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500">Terkunci (Pelanggaran Tab)</div>
          <div className="text-3xl font-black text-red-600 font-tabular">{lockedSessions}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500">Telah Mengumpulkan</div>
          <div className="text-3xl font-black text-blue-600 font-tabular">{submittedSessions}</div>
        </div>
      </div>

      {/* Live Student Monitor Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-base font-extrabold text-navy-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-gold-600" />
              <span>Daftar Siswa di Ruang Ujian</span>
            </h2>
            <p className="text-xs text-slate-500">Pantau progres butir soal terjawab dan riwayat pelanggaran pindah tab siswa</p>
          </div>
        </div>

        <div className="p-6">
          <ProctorClientActions sessions={sessions} totalQuestions={exam?._count.examQuestions || 4} />
        </div>
      </div>
    </div>
  );
}
