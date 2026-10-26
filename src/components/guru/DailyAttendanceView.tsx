"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Save, 
  Sparkles, 
  Users, 
  RefreshCw,
  FileCheck
} from "lucide-react";

interface StudentAttendanceItem {
  studentId: string;
  name: string;
  nisn: string;
  status: "HADIR" | "SAKIT" | "IZIN" | "DISPENSASI" | "ALPA";
  note: string;
}

interface DailyAttendanceViewProps {
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  initialStudents: { id: string; user: { name: string }; nisn: string }[];
}

export const DailyAttendanceView: React.FC<DailyAttendanceViewProps> = ({
  classId,
  className,
  teacherId,
  teacherName,
  initialStudents,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [students, setStudents] = useState<StudentAttendanceItem[]>(
    initialStudents.map((s) => ({
      studentId: s.id,
      name: s.user.name,
      nisn: s.nisn,
      status: "HADIR",
      note: "",
    }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load existing attendance on date change
  const loadAttendance = async (date: string) => {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/attendance/daily?classId=${classId}&date=${date}`);
      const data = await res.json();
      if (data.success && data.students && data.students.length > 0) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error("Gagal memuat absensi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance(selectedDate);
  }, [selectedDate]);

  // Set all students to HADIR
  const markAllHadir = () => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        status: "HADIR",
      }))
    );
    setMessage({
      type: "success",
      text: "Seluruh siswa telah ditandai HADIR. Jangan lupa klik 'Simpan Presensi Harian'.",
    });
  };

  // Change individual student status
  const updateStatus = (studentId: string, status: "HADIR" | "SAKIT" | "IZIN" | "DISPENSASI" | "ALPA") => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s))
    );
  };

  // Change individual note
  const updateNote = (studentId: string, note: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, note } : s))
    );
  };

  // Save to DB and trigger auto-sync to ReportCard
  const saveAttendance = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/attendance/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          date: selectedDate,
          recordedById: teacherId,
          records: students.map((s) => ({
            studentId: s.studentId,
            status: s.status,
            note: s.note,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({
          type: "success",
          text: data.message || "Presensi berhasil disimpan dan disinkronkan ke E-Raport!",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Gagal menyimpan presensi harian.",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan saat menyimpan." });
    } finally {
      setIsSaving(false);
    }
  };

  // Statistics
  const hadirCount = students.filter((s) => s.status === "HADIR").length;
  const sakitCount = students.filter((s) => s.status === "SAKIT").length;
  const izinCount = students.filter((s) => s.status === "IZIN").length;
  const dispensasiCount = students.filter((s) => s.status === "DISPENSASI").length;
  const alpaCount = students.filter((s) => s.status === "ALPA").length;

  return (
    <div className="space-y-6">
      {/* Control Bar: Tanggal & Aksi Cepat */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-navy-900" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-navy-900 focus:outline-none cursor-pointer"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Kelas: <strong className="text-navy-900">{className}</strong> • Wali: {teacherName}
          </span>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={markAllHadir}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>1-Klik Hadir Semua</span>
          </button>

          <button
            type="button"
            onClick={saveAttendance}
            disabled={isSaving || isLoading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-gold-400" />
            ) : (
              <Save className="w-4 h-4 text-gold-400" />
            )}
            <span>{isSaving ? "Menyimpan & Sync..." : "Simpan Presensi"}</span>
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-bold animate-in fade-in ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <span className="text-[10px] font-bold text-emerald-700 uppercase block">Hadir</span>
          <span className="text-xl font-black text-emerald-900 font-tabular">{hadirCount}</span>
        </div>
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-[10px] font-bold text-blue-700 uppercase block">Sakit (S)</span>
          <span className="text-xl font-black text-blue-900 font-tabular">{sakitCount}</span>
        </div>
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-[10px] font-bold text-amber-700 uppercase block">Izin (I)</span>
          <span className="text-xl font-black text-amber-900 font-tabular">{izinCount}</span>
        </div>
        <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl">
          <span className="text-[10px] font-bold text-purple-700 uppercase block">Dispensasi (D)</span>
          <span className="text-xl font-black text-purple-900 font-tabular">{dispensasiCount}</span>
        </div>
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-rose-700 uppercase block">Alpa (A)</span>
          <span className="text-xl font-black text-rose-900 font-tabular">{alpaCount}</span>
        </div>
      </div>

      {/* Tabel Siswa & Status Presensi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-navy-900" />
            <h3 className="font-extrabold text-xs text-navy-900 uppercase tracking-wider">
              Daftar Presensi Peserta Didik ({students.length} Siswa)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Tanggal: <strong className="text-navy-900">{selectedDate}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-navy-900 text-white uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa / NISN</th>
                <th className="py-3 px-4 text-center">Status Kehadiran</th>
                <th className="py-3 px-4">Keterangan / Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student, idx) => (
                <tr key={student.studentId} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-3 text-center font-tabular text-slate-400">{idx + 1}</td>
                  <td className="py-3.5 px-4 font-bold text-navy-900">
                    <div>{student.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono font-normal">{student.nisn}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {(["HADIR", "SAKIT", "IZIN", "DISPENSASI", "ALPA"] as const).map((st) => {
                        const isSelected = student.status === st;
                        const label = st === "HADIR" ? "Hadir" : st === "SAKIT" ? "S" : st === "IZIN" ? "I" : st === "DISPENSASI" ? "D" : "A";
                        const activeColors = 
                          st === "HADIR" ? "bg-emerald-600 text-white shadow-sm" :
                          st === "SAKIT" ? "bg-blue-600 text-white shadow-sm" :
                          st === "IZIN" ? "bg-amber-500 text-white shadow-sm" :
                          st === "DISPENSASI" ? "bg-purple-600 text-white shadow-sm" :
                          "bg-rose-600 text-white shadow-sm";

                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => updateStatus(student.studentId, st)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition ${
                              isSelected
                                ? activeColors
                                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <input
                      type="text"
                      placeholder="Catatan surat izin / alasan..."
                      value={student.note}
                      onChange={(e) => updateNote(student.studentId, e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-navy-900 bg-slate-50/50"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-gold-600" />
            <span>Setiap perubahan status Sakit, Izin, Dispensasi, dan Alpa otomatis tersinkron ke Rekap Rapor.</span>
          </p>
          <button
            type="button"
            onClick={saveAttendance}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition shadow-sm"
          >
            <Save className="w-4 h-4 text-gold-400" />
            <span>Simpan Presensi Harian</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyAttendanceView;
