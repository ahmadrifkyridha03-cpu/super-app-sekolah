import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { 
  Users, 
  School, 
  BookOpen, 
  FileSpreadsheet, 
  Download, 
  Plus, 
  ShieldCheck, 
  Search,
  CheckCircle2,
  Calendar,
  Layers
} from "lucide-react";

export const revalidate = 0; // Dynamic server component

export default async function AdminDashboardPage() {
  // Direct Prisma Queries
  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    totalSubjects,
    students,
    teachers,
    classes,
    subjects,
    activeYear,
  ] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.teacher.count({ where: { isArchived: false } }),
    prisma.classRoom.count({ where: { isArchived: false } }),
    prisma.subject.count({ where: { isArchived: false } }),
    prisma.student.findMany({
      include: {
        classRoom: true,
        user: true,
      },
      orderBy: { nisn: "asc" },
      take: 20,
    }),
    prisma.teacher.findMany({
      include: {
        user: true,
        homeroomClass: true,
      },
      orderBy: { nip: "asc" },
    }),
    prisma.classRoom.findMany({
      include: {
        homeroomTeacher: {
          include: { user: true },
        },
        _count: { select: { students: true } },
      },
    }),
    prisma.subject.findMany({
      orderBy: { code: "asc" },
    }),
    prisma.academicYear.findFirst({
      where: { isActive: true },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">
            Portal Tata Usaha & Staf Administrasi
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight mt-1">
            Manajemen Master Data Sekolah
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tahun Ajaran Aktif: <strong className="text-navy-900">{activeYear?.name || "2026/2027"}</strong> (Semester {activeYear?.semester === 1 ? "Ganjil" : "Genap"})
          </p>
        </div>

        {/* Excel Templates Download Hub */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/templates/template_siswa.xlsx"
            download
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Unduh Template Siswa (.xlsx)</span>
          </a>
          <a
            href="/templates/template_guru.xlsx"
            download
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 text-xs font-bold transition shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Unduh Template Guru (.xlsx)</span>
          </a>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-navy-50 text-navy-900 flex items-center justify-center font-bold shrink-0">
            <Users className="w-6 h-6 text-navy-800" />
          </div>
          <div>
            <div className="text-2xl font-black text-navy-900 font-tabular">{totalStudents}</div>
            <div className="text-xs font-semibold text-slate-500">Siswa Aktif</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center font-bold shrink-0">
            <School className="w-6 h-6 text-gold-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-navy-900 font-tabular">{totalTeachers}</div>
            <div className="text-xs font-semibold text-slate-500">Guru & Staf Pendidik</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <Layers className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-navy-900 font-tabular">{totalClasses}</div>
            <div className="text-xs font-semibold text-slate-500">Rombel Kelas</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-navy-900 font-tabular">{totalSubjects}</div>
            <div className="text-xs font-semibold text-slate-500">Mata Pelajaran</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: TABEL DATA SISWA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-extrabold text-navy-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-gold-600" />
              <span>Data Master Siswa Terdaftar (Dapodik)</span>
            </h2>
            <p className="text-xs text-slate-500">Menampilkan daftar siswa aktif beserta rombel dan identitas orang tua</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600">
            {students.length} Siswa Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-navy-900 text-white uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">NISN / NIS</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4 text-center">L/P</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Orang Tua / Wali</th>
                <th className="py-3 px-4">WhatsApp Ortu</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s, index) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-tabular text-slate-400">{index + 1}</td>
                  <td className="py-3 px-4 font-tabular font-bold text-navy-900">
                    <div>{s.nisn}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{s.nis || "-"}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{s.user.name}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-600">{s.gender || "-"}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-navy-50 text-navy-900 font-extrabold text-[11px] border border-navy-200">
                      {s.classRoom.name}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{s.parentName || "-"}</td>
                  <td className="py-3 px-4 font-tabular text-slate-600">{s.parentPhone || "-"}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      AKTIF
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: TABEL DATA GURU & WALI KELAS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-extrabold text-navy-900 flex items-center gap-2">
              <School className="w-4 h-4 text-gold-600" />
              <span>Data Guru & Wali Kelas</span>
            </h2>
            <p className="text-xs text-slate-500">Penugasan guru mata pelajaran dan pembina rombongan belajar</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600">
            {teachers.length} Guru
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-navy-900 text-white uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">NIP / NUPTK</th>
                <th className="py-3 px-4">Nama Guru & Gelar</th>
                <th className="py-3 px-4">Email Resmi</th>
                <th className="py-3 px-4">Mapel / Spesialisasi</th>
                <th className="py-3 px-4 text-center">Penugasan Wali Kelas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.map((t, index) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-tabular text-slate-400">{index + 1}</td>
                  <td className="py-3 px-4 font-tabular font-bold text-navy-900">{t.nip || "Non-PNS"}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{t.user.name}</td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{t.user.email || "-"}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      {t.specialty || "Umum"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {t.homeroomClass ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gold-100 text-gold-900 border border-gold-300">
                        Wali Kelas {t.homeroomClass.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: ROMBEL & MATA PELAJARAN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rombel Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <h3 className="font-extrabold text-sm text-navy-900 border-b pb-2 flex items-center justify-between">
            <span>Daftar Rombongan Belajar (Rombel)</span>
            <span className="text-xs font-semibold text-slate-500">{classes.length} Kelas</span>
          </h3>
          <div className="space-y-2">
            {classes.map((c) => (
              <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-navy-900 text-xs">Kelas {c.name}</div>
                  <div className="text-[11px] text-slate-500">
                    Wali Kelas: {c.homeroomTeacher?.user.name || "Belum Ditentukan"}
                  </div>
                </div>
                <div className="text-xs font-bold px-2.5 py-1 rounded-lg bg-navy-100 text-navy-800 font-tabular">
                  {c._count.students} Siswa
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mapel Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <h3 className="font-extrabold text-sm text-navy-900 border-b pb-2 flex items-center justify-between">
            <span>Daftar Mata Pelajaran & KKTP</span>
            <span className="text-xs font-semibold text-slate-500">{subjects.length} Mapel</span>
          </h3>
          <div className="space-y-2">
            {subjects.map((sub) => (
              <div key={sub.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-navy-900 text-xs">{sub.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">Kode: {sub.code}</div>
                </div>
                <div className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gold-50 text-gold-800 border border-gold-200 font-tabular">
                  KKTP: {sub.kktp}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
